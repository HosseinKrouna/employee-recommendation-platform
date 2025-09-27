export default defineEventHandler(async (event) => {
  return {
    tables: {
      users: {
        fields: ['id', 'email', 'firstName', 'lastName', 'password', 'role', 'department', 'isActive'],
        relations: ['recommendations (1:n)']
      },
      recommendations: {
        fields: ['id', 'candidateName', 'candidateEmail', 'position', 'department', 'skills', 'experience', 'status'],
        relations: ['recommendedByUser (n:1)']
      }
    },
    enums: {
      UserRole: ['EMPLOYEE', 'HR', 'ADMIN'],
      RecommendationStatus: ['SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN']
    }
  }
})