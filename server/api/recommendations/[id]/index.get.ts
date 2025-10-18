import { prisma } from '../../../utils/prisma'
import jwt from 'jsonwebtoken'

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
      include: {
        recommendedByUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            department: true
          }
        }
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
        statusMessage: 'No permission to view this recommendation'
      })
    }

    return {
      success: true,
      recommendation
    }
  } catch (error) {
    console.error('Fetch recommendation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error loading recommendation'
    })
  }
})