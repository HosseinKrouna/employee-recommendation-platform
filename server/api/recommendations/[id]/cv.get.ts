import { prisma } from '../../../utils/prisma'
import jwt from 'jsonwebtoken'
import { readFile, access } from 'fs/promises'
import { join, basename, extname } from 'path'

export default defineEventHandler(async (event) => {
  const recommendationId = getRouterParam(event, 'id')
  
  if (!recommendationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Recommendation ID required'
    })
  }

  
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const token = authHeader.substring(7)
  let userId: string
  let userRole: string

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    userId = decoded.userId
    userRole = decoded.role
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token'
    })
  }

  try {
    
    const recommendation = await prisma.recommendation.findUnique({
      where: { id: recommendationId },
      select: {
        cvFilePath: true,
        candidateName: true,
        recommendedById: true
      }
    })

    if (!recommendation) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Recommendation not found'
      })
    }

    
    if (userRole !== 'HR' && recommendation.recommendedById !== userId) {
      throw createError({
        statusCode: 403,
        statusMessage: 'No permission to access this CV'
      })
    }

    if (!recommendation.cvFilePath) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No CV available'
      })
    }

   
    const uploadsDir = join(process.cwd(), 'uploads', 'cv')
    const filePath = join(uploadsDir, basename(recommendation.cvFilePath))

    
    try {
      await access(filePath)
    } catch {
      throw createError({
        statusCode: 404,
        statusMessage: 'CV file not found'
      })
    }

   
    const fileBuffer = await readFile(filePath)
    const fileName = basename(recommendation.cvFilePath)
    const fileExt = extname(fileName).toLowerCase()

   
    let contentType = 'application/octet-stream'
    if (fileExt === '.pdf') {
      contentType = 'application/pdf'
    } else if (['.doc', '.docx'].includes(fileExt)) {
      contentType = 'application/msword'
    } else if (['.jpg', '.jpeg'].includes(fileExt)) {
      contentType = 'image/jpeg'
    } else if (fileExt === '.png') {
      contentType = 'image/png'
    }
    
    setHeader(event, 'Content-Type', contentType)
    setHeader(event, 'Content-Disposition', `inline; filename="${fileName}"`)
    setHeader(event, 'Content-Length', fileBuffer.length)
    
    return fileBuffer

  } catch (error) {
    console.error('CV download error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error loading CV'
    })
  }
})