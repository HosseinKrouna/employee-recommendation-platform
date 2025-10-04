import { prisma } from '../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    
    const userCount = await prisma.user.count()
    const recommendationCount = await prisma.recommendation.count()
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true
      }
    })

    const recommendations = await prisma.recommendation.findMany({
      select: {
        id: true,
        candidateName: true,
        position: true,
        status: true,
        recommendedByUser: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    })
    
    return {
      success: true,
      message: 'Database connection and data retrieval successful',
      data: {
        counts: {
          users: userCount,
          recommendations: recommendationCount
        },
        sampleData: {
          users,
          recommendations
        },
        timestamp: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('Database error:', error)
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Database operation failed',
      data: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }
})