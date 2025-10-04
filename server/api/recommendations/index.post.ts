import { prisma } from '~/server/utils/prisma'
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
  try {
    const config = useRuntimeConfig()
    const payload = jwt.verify(token, config.jwtSecret) as any
    userId = payload.userId
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Ungültiger Token'
    })
  }

  const body = await readBody(event)
  const {
    candidateName,
    candidateEmail,
    candidatePhone,
    position,
    department,
    skills,
    experience,
    notes,
    cvFileName,
    cvFilePath
  } = body

  
  if (!candidateName || !candidateEmail || !position || !department || !skills || !experience) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Pflichtfelder fehlen'
    })
  }

  try {
    const recommendation = await prisma.recommendation.create({
      data: {
        candidateName,
        candidateEmail,
        candidatePhone: candidatePhone || null,
        position,
        department,
        skills: Array.isArray(skills) ? skills : [],
        experience,
        notes: notes || null,
        cvFileName: cvFileName || null,
        cvFilePath: cvFilePath || null,
        recommendedById: userId,
        status: 'SUBMITTED'
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
      }
    })

    return {
      success: true,
      recommendation
    }
  } catch (error) {
    console.error('Recommendation creation error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Erstellen der Empfehlung'
    })
  }
})