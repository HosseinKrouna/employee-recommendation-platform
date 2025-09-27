import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const UserRole = {
  EMPLOYEE: 'EMPLOYEE',
  HR: 'HR',
  ADMIN: 'ADMIN'
} as const

const RecommendationStatus = {
  SUBMITTED: 'SUBMITTED',
  IN_REVIEW: 'IN_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  WITHDRAWN: 'WITHDRAWN'
} as const

const prisma = new PrismaClient()

async function main() {

  const passwordHash = await bcrypt.hash('TestPass123!', 12)

  const hrUser = await prisma.user.upsert({
    where: { email: 'hr@testcompany.com' },
    update: {},
    create: {
      email: 'hr@testcompany.com',
      firstName: 'Hannah',
      lastName: 'HR-Manager',
      password: passwordHash,
      role: UserRole.HR,
      department: 'Human Resources'
    }
  })

  const employee = await prisma.user.upsert({
    where: { email: 'employee@testcompany.com' },
    update: {},
    create: {
      email: 'employee@testcompany.com',
      firstName: 'Max',
      lastName: 'Mustermann',
      password: passwordHash,
      role: UserRole.EMPLOYEE,
      department: 'Engineering'
    }
  })

  const admin = await prisma.user.upsert({
    where: { email: 'admin@testcompany.com' },
    update: {},
    create: {
      email: 'admin@testcompany.com',
      firstName: 'Admin',
      lastName: 'Administrator',
      password: passwordHash,
      role: UserRole.ADMIN,
      department: 'IT'
    }
  })

  const recommendation1 = await prisma.recommendation.create({
    data: {
      candidateName: 'Anna Kandidatin',
      candidateEmail: 'anna@example.com',
      candidatePhone: '+49 123 456789',
      position: 'Full-Stack Developer',
      department: 'Engineering',
      skills: ['JavaScript', 'Vue.js', 'Node.js', 'PostgreSQL'],
      experience: 'Anna hat 3 Jahre Erfahrung in der Webentwicklung und war bei zwei Startups tätig. Sie hat mehrere Vue.js Anwendungen von Grund auf entwickelt.',
      notes: 'Sehr kommunikativ und teamorientiert. Hat in meinem vorherigen Unternehmen exzellente Arbeit geleistet.',
      status: RecommendationStatus.IN_REVIEW,
      recommendedById: employee.id
    }
  })

  const recommendation2 = await prisma.recommendation.create({
    data: {
      candidateName: 'Tom Developer',
      candidateEmail: 'tom@example.com',
      candidatePhone: '+49 987 654321',
      position: 'Backend Developer',
      department: 'Engineering',
      skills: ['Python', 'Django', 'PostgreSQL', 'Docker'],
      experience: 'Tom ist ein erfahrener Backend-Entwickler mit 5 Jahren Erfahrung in Python und Django.',
      notes: 'Sehr strukturiert und zuverlässig. Perfekt für komplexe Backend-Systeme.',
      status: RecommendationStatus.SUBMITTED,
      recommendedById: employee.id
    }
  })

  console.log('Seed completed successfully!')
  console.log('Created:')
  console.log(`- HR User: ${hrUser.email}`)
  console.log(`- Employee: ${employee.email}`) 
  console.log(`- Admin: ${admin.email}`)
  console.log(`- Recommendations: ${recommendation1.candidateName}, ${recommendation2.candidateName}`)
  console.log('\n Login credentials:')
  console.log('HR: hr@testcompany.com / TestPass123!')
  console.log('Employee: employee@testcompany.com / TestPass123!')
  console.log('Admin: admin@testcompany.com / TestPass123!')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })