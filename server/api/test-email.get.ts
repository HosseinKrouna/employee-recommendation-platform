import { sendEmail, generateNewRecommendationEmail } from '~/server/utils/email'

export default defineEventHandler(async (event) => {
  const testEmail = generateNewRecommendationEmail({
    candidateName: 'Test Kandidat',
    position: 'Software Engineer',
    department: 'Engineering',
    recommendedBy: 'Max Mustermann',
    recommendationId: 'test-id'
  })
  
  const result = await sendEmail({
    to: 'test@example.com',
    subject: testEmail.subject,
    html: testEmail.html
  })
  
  return result
})