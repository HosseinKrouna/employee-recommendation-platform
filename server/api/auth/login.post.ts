import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event)

  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email und Passwort sind erforderlich'
    })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email, isActive: true }
    })

    if (!user || !await bcrypt.compare(password, user.password)) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Ungültige Anmeldedaten'
      })
    }

    const config = useRuntimeConfig()
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department
      },
      config.jwtSecret,
      { expiresIn: '30d' }
    )

setCookie(event, 'auth-token', token, {
  maxAge: 30 * 24 * 60 * 60, 
  httpOnly: true,
  secure: false, 
  sameSite: 'lax',
  path: '/' 
})

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department
      }
    }
  } catch (error) {
    console.error('Auth error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Authentifizierungsfehler'
    })
  }
})

