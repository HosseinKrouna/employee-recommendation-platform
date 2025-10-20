import { prisma } from '../../../utils/prisma'
import jwt from 'jsonwebtoken'
import { sendEmail, generateStatusUpdateEmail } from '../../../utils/email'

export default defineEventHandler(async (event) => {
  const recommendationId = getRouterParam(event, 'id')
  
  if (!recommendationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Empfehlungs-ID erforderlich'
    })
  }

  // Auth check
  const token = getCookie(event, 'auth-token')
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Nicht authentifiziert'
    })
  }

  let userId: string
  let userRole: string
  let userDepartment: string
  
  try {
    const config = useRuntimeConfig()
    const payload = jwt.verify(token, config.jwtSecret) as any
    userId = payload.userId
    userRole = payload.role
    userDepartment = payload.department
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Ungültiger Token'
    })
  }

  const body = await readBody(event)
  const { status } = body

  const validStatuses = ['SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN']
  if (!status || !validStatuses.includes(status)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ungültiger Status'
    })
  }

  try {
    // Get recommendation first to check permissions
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
        statusMessage: 'Empfehlung nicht gefunden'
      })
    }

    // Permission logic
    const isHR = userRole === 'HR' || userRole === 'ADMIN' || userDepartment === 'HR' || userDepartment === 'Human Resources'
    const isOwner = recommendation.recommendedById === userId

    // Check permissions based on status change
    if (status === 'WITHDRAWN') {
      // Only owner can withdraw their own recommendation
      if (!isOwner) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Nur der Ersteller kann die Empfehlung zurückziehen'
        })
      }
      // Can only withdraw if status is SUBMITTED
      if (recommendation.status !== 'SUBMITTED') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Empfehlung kann nur im Status "Eingereicht" zurückgezogen werden'
        })
      }
    } else {
      // For other status changes (IN_REVIEW, APPROVED, REJECTED), only HR is allowed
      if (!isHR) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Keine Berechtigung'
        })
      }
    }

    // Update status
    const updatedRecommendation = await prisma.recommendation.update({
      where: { id: recommendationId },
      data: { status },
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

    // Send email notification only for HR status changes (not for WITHDRAWN by employee)
    if (['IN_REVIEW', 'APPROVED', 'REJECTED'].includes(status) && isHR) {
      try {
        const emailContent = generateStatusUpdateEmail({
          candidateName: updatedRecommendation.candidateName,
          status: status,
          employeeName: updatedRecommendation.recommendedByUser.firstName
        })

        await sendEmail({
          to: updatedRecommendation.recommendedByUser.email,
          subject: emailContent.subject,
          html: emailContent.html
        })

        console.log(`✅ Status update email sent to ${updatedRecommendation.recommendedByUser.email}`)
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return {
      success: true,
      recommendation: updatedRecommendation
    }
  } catch (error: any) {
    console.error('Status update error:', error)
    
    // Re-throw if it's already a createError
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Aktualisieren des Status'
    })
  }
})