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


  const token = getCookie(event, 'auth-token')
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Nicht authentifiziert'
    })
  }

  let userRole: string
  try {
    const config = useRuntimeConfig()
    const payload = jwt.verify(token, config.jwtSecret) as any
    userRole = payload.role
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Ungültiger Token'
    })
  }


  if (userRole !== 'HR' && userRole !== 'ADMIN') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Keine Berechtigung'
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
    const recommendation = await prisma.recommendation.update({
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

    if (['IN_REVIEW', 'APPROVED', 'REJECTED'].includes(status)) {
      try {
        const emailContent = generateStatusUpdateEmail({
          candidateName: recommendation.candidateName,
          status: status,
          employeeName: recommendation.recommendedByUser.firstName
        })

        await sendEmail({
          to: recommendation.recommendedByUser.email,
          subject: emailContent.subject,
          html: emailContent.html
        })

        console.log(`✅ Status update email sent to ${recommendation.recommendedByUser.email}`)
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError)
      }
    }


    return {
      success: true,
      recommendation
    }
  } catch (error) {
    console.error('Status update error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Aktualisieren des Status'
    })
  }
})