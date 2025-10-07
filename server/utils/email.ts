import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

let transporter: Transporter | null = null

async function getTransporter() {
  if (transporter) return transporter

  const config = useRuntimeConfig()
  
  if (process.env.NODE_ENV === 'development' && !config.smtpUser) {
    console.log('📧 Creating Ethereal test account...')
    const testAccount = await nodemailer.createTestAccount()
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    })
    
    console.log(' Ethereal test account created')
    console.log('Test emails will be logged with preview URL')
  } else {
    
    transporter = nodemailer.createTransport({
      host: String(config.smtpHost),
      port: Number(config.smtpPort),
      secure: false,
      auth: {
        user: String(config.smtpUser),
        pass: String(config.smtpPass)
      }
    })
  }
  
  return transporter
}

export async function sendEmail(options: {
  to: string
  subject: string
  html: string
  text?: string
}) {
  try {
    const config = useRuntimeConfig()
    const transporter = await getTransporter()
    
    const mailOptions = {
      from: `"${String(config.emailFromName || 'Employee Recommendation Platform')}" <${String(config.emailFrom || 'noreply@company.com')}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, '')
    }
    
    const info = await transporter.sendMail(mailOptions)
    
   
    if (process.env.NODE_ENV === 'development') {
      const previewUrl = nodemailer.getTestMessageUrl(info)
      if (previewUrl) {
        console.log('Email sent! Preview URL:', previewUrl)
      }
    }
    
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info) || undefined
    }
  } catch (error) {
    console.error('Email sending failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export function generateNewRecommendationEmail(data: {
  candidateName: string
  position: string
  department: string
  recommendedBy: string
  recommendationId: string
}) {
  return {
    subject: `Neue Empfehlung: ${data.candidateName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Neue Mitarbeiterempfehlung</h1>
          </div>
          
          <div class="content">
            <h2>Kandidat: ${data.candidateName}</h2>
            <p><strong>Position:</strong> ${data.position}</p>
            <p><strong>Abteilung:</strong> ${data.department}</p>
            <p><strong>Empfohlen von:</strong> ${data.recommendedBy}</p>
            
            <p>Eine neue Empfehlung wurde eingereicht und wartet auf deine Überprüfung.</p>
            
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/hr/dashboard" class="button">
              Zum HR Dashboard
            </a>
          </div>
          
          <div class="footer">
            <p>Employee Recommendation Platform</p>
            <p>Diese Email wurde automatisch generiert.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

export function generateStatusUpdateEmail(data: {
  candidateName: string
  status: string
  employeeName: string
}) {
  const statusText = {
    'IN_REVIEW': 'in Prüfung',
    'APPROVED': 'genehmigt',
    'REJECTED': 'abgelehnt'
  }[data.status] || data.status
  
  return {
    subject: `Status-Update: Empfehlung für ${data.candidateName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .status { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
          .status-approved { background: #10b981; color: white; }
          .status-review { background: #f59e0b; color: white; }
          .status-rejected { background: #ef4444; color: white; }
          .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Status-Update Deiner Empfehlung</h1>
          </div>
          
          <div class="content">
            <p>Hallo ${data.employeeName},</p>
            
            <p>Der Status deiner Empfehlung für <strong>${data.candidateName}</strong> wurde aktualisiert:</p>
            
            <div class="status status-${data.status === 'APPROVED' ? 'approved' : data.status === 'IN_REVIEW' ? 'review' : 'rejected'}">
              ${statusText.toUpperCase()}
            </div>
            
            <p>Du kannst alle Details in deinem Dashboard einsehen.</p>
            
            <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/recommendations" class="button">
              Zu meinen Empfehlungen
            </a>
          </div>
          
          <div class="footer">
            <p>Employee Recommendation Platform</p>
            <p>Diese Email wurde automatisch generiert.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}