import { prisma } from '../../utils/prisma'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth-token')
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Nicht authentifiziert'
    })
  }

  let userId: string
  let userRole: string
  try {
    const config = useRuntimeConfig()
    const payload = jwt.verify(token, config.jwtSecret) as any
    userId = payload.userId
    userRole = payload.role
    
    console.log('=== GET Recommendations ===')
    console.log('User ID:', userId)
    console.log('User Role:', userRole)
    console.log('Is HR or Admin:', userRole === 'HR' || userRole === 'ADMIN')
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Ungültiger Token'
    })
  }

  try {
    let recommendations

    if (userRole === 'HR' || userRole === 'ADMIN') {
      console.log('Fetching ALL recommendations (HR/Admin)')
      recommendations = await prisma.recommendation.findMany({
        include: {
          recommendedByUser: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              department: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    } else {
      console.log('Fetching ONLY OWN recommendations (Employee)')
      recommendations = await prisma.recommendation.findMany({
        where: {
          recommendedById: userId
        },
        include: {
          recommendedByUser: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              department: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    }

    console.log('Found recommendations:', recommendations.length)  
    console.log('Found recommendations:', recommendations.length)
     if (recommendations.length > 0) {
     console.log('First recommendation recommendedById:', recommendations[0].recommendedById)
     console.log('Comparison - User ID:', userId)
     console.log('IDs match:', recommendations[0].recommendedById === userId)
     }

    return {
      success: true,
      recommendations
    }
  } catch (error) {
    console.error('Fetch recommendations error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Laden der Empfehlungen'
    })
  }
})