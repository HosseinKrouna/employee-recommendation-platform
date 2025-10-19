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

  // Auth check
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  const token = authHeader.substring(7)
  let userId: string
  let userDepartment: string

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any
    userId = decoded.userId
    userDepartment = decoded.department
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token'
    })
  }

  try {    
    // Get recommendation
    const recommendation = await prisma.recommendation.findUnique({
      where: { id: recommendationId },
      select: {
        cvFilePath: true,
        cvFileName: true,
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

    // Check permissions
    const isHR = userDepartment === 'HR' || userDepartment === 'Human Resources'
    const isOwner = recommendation.recommendedById === userId
    
    if (!isHR && !isOwner) {
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

    let relativePath = recommendation.cvFilePath
    if (relativePath.startsWith('/uploads/')) {
      relativePath = relativePath.substring('/uploads/'.length)
    } else if (relativePath.startsWith('uploads/')) {
      relativePath = relativePath.substring('uploads/'.length)
    }
    
    const filePath = join(process.cwd(), 'uploads', relativePath)

    // Check if file exists
    try {
      await access(filePath)
    } catch {
      console.log('❌ File not found at:', filePath)
      throw createError({
        statusCode: 404,
        statusMessage: 'CV file not found on server'
      })
    }

    // Read file
    const fileBuffer = await readFile(filePath)    
    const fileName = recommendation.cvFileName || basename(recommendation.cvFilePath)
    const fileExt = extname(fileName).toLowerCase()

    // Set content type
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
    setHeader(event, 'Cache-Control', 'no-cache')
    
    return fileBuffer

  } catch (error: any) {
    console.error('❌ CV download error:', error)
    
    // If it's already a createError, throw it
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error loading CV'
    })
  }
})