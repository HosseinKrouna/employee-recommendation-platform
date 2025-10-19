import { prisma } from '~/server/utils/prisma'
import puppeteer from 'puppeteer'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  // Auth Check
  const token = getCookie(event, 'auth-token')
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Nicht authentifiziert'
    })
  }

  try {
    const config = useRuntimeConfig()
    jwt.verify(token, config.jwtSecret)
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Ungültiger Token'
    })
  }

  const recommendationId = getRouterParam(event, 'id')
  
  if (!recommendationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Empfehlungs-ID erforderlich'
    })
  }

  try {
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

    const htmlContent = generatePDFHTML(recommendation)

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    
    const page = await browser.newPage()
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' })
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    })
    
    await browser.close()

    setHeader(event, 'Content-Type', 'application/pdf')
    setHeader(event, 'Content-Disposition', `attachment; filename="Empfehlung_${recommendation.candidateName.replace(/\s+/g, '_')}.pdf"`)
    
    return pdfBuffer
  } catch (error: any) {
    console.error('PDF generation error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler bei der PDF-Generierung'
    })
  }
})

function generatePDFHTML(recommendation: any) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date))
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      SUBMITTED: 'Eingereicht',
      IN_REVIEW: 'In Prüfung',
      APPROVED: 'Genehmigt',
      REJECTED: 'Abgelehnt',
      WITHDRAWN: 'Zurückgezogen'
    }
    return texts[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SUBMITTED: '#3B82F6',
      IN_REVIEW: '#F59E0B',
      APPROVED: '#10B981',
      REJECTED: '#EF4444',
      WITHDRAWN: '#6B7280'
    }
    return colors[status] || '#6B7280'
  }

  // Parse skills - sie sind als JSON gespeichert
  let skillsHTML = ''
  if (recommendation.skills) {
    try {
      const skills = typeof recommendation.skills === 'string' 
        ? JSON.parse(recommendation.skills) 
        : recommendation.skills
      
      if (Array.isArray(skills) && skills.length > 0) {
        skillsHTML = skills.map((skill: any) => {
          if (typeof skill === 'object' && skill.name && skill.level) {
            return `
              <div class="skill-item">
                <div class="skill-header">
                  <span class="skill-name">${skill.name}</span>
                  <span class="skill-level">${skill.level}%</span>
                </div>
                <div class="skill-bar">
                  <div class="skill-bar-fill" style="width: ${skill.level}%"></div>
                </div>
              </div>
            `
          } else {
            return `<span class="skill-tag">${skill}</span>`
          }
        }).join('')
      } else {
        skillsHTML = '<p style="color: #666;">Keine Fähigkeiten angegeben</p>'
      }
    } catch (e) {
      skillsHTML = '<p style="color: #666;">Fehler beim Laden der Fähigkeiten</p>'
    }
  } else {
    skillsHTML = '<p style="color: #666;">Keine Fähigkeiten angegeben</p>'
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Mitarbeiterempfehlung - ${recommendation.candidateName}</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                padding: 20px;
                background: #f9fafb;
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #4F46E5;
                padding-bottom: 20px;
                margin-bottom: 30px;
                background: white;
                padding: 30px;
                border-radius: 10px;
            }
            .header h1 {
                color: #4F46E5;
                font-size: 28px;
                margin-bottom: 5px;
            }
            .header p {
                color: #666;
                font-size: 14px;
            }
            .section {
                margin-bottom: 25px;
                padding: 20px;
                background: white;
                border-radius: 10px;
                border-left: 4px solid #4F46E5;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .section h2 {
                color: #4F46E5;
                font-size: 18px;
                margin-bottom: 15px;
                border-bottom: 2px solid #f3f4f6;
                padding-bottom: 10px;
            }
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            .info-item {
                background: #f9fafb;
                padding: 12px;
                border-radius: 5px;
                border: 1px solid #e5e7eb;
            }
            .info-item strong {
                color: #4F46E5;
                display: block;
                margin-bottom: 5px;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .info-item span {
                font-size: 14px;
                color: #333;
            }
            .status-badge {
                display: inline-block;
                padding: 6px 16px;
                border-radius: 20px;
                font-weight: bold;
                font-size: 14px;
                color: white;
                background-color: ${getStatusColor(recommendation.status)};
            }
            .skill-item {
                margin-bottom: 15px;
            }
            .skill-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
            }
            .skill-name {
                font-weight: bold;
                color: #333;
            }
            .skill-level {
                color: #4F46E5;
                font-weight: bold;
            }
            .skill-bar {
                height: 10px;
                background: #e5e7eb;
                border-radius: 5px;
                overflow: hidden;
            }
            .skill-bar-fill {
                height: 100%;
                background: linear-gradient(to right, #4F46E5, #818CF8);
                border-radius: 5px;
            }
            .skill-tag {
                display: inline-block;
                background: #4F46E5;
                color: white;
                padding: 5px 12px;
                border-radius: 15px;
                font-size: 13px;
                margin: 4px;
            }
            .text-content {
                background: #f9fafb;
                padding: 15px;
                border-radius: 5px;
                border: 1px solid #e5e7eb;
                white-space: pre-wrap;
                line-height: 1.8;
            }
            .footer {
                margin-top: 40px;
                text-align: center;
                color: #666;
                font-size: 12px;
                border-top: 1px solid #e5e7eb;
                padding-top: 20px;
            }
            .recommender-card {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 10px;
                margin-top: 10px;
            }
            .recommender-card .info-item {
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.2);
                color: white;
            }
            .recommender-card .info-item strong {
                color: white;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Mitarbeiterempfehlung</h1>
            <p>Employee Recommendation Platform</p>
        </div>

        <div class="section">
            <h2>Kandidaten-Information</h2>
            <div class="info-grid">
                <div class="info-item">
                    <strong>Name</strong>
                    <span>${recommendation.candidateName}</span>
                </div>
                <div class="info-item">
                    <strong>E-Mail</strong>
                    <span>${recommendation.candidateEmail}</span>
                </div>
                <div class="info-item">
                    <strong>Telefon</strong>
                    <span>${recommendation.candidatePhone || 'Nicht angegeben'}</span>
                </div>
                <div class="info-item">
                    <strong>Position</strong>
                    <span>${recommendation.position}</span>
                </div>
                <div class="info-item">
                    <strong>Abteilung</strong>
                    <span>${recommendation.department || 'Nicht angegeben'}</span>
                </div>
                <div class="info-item">
                    <strong>Status</strong>
                    <span class="status-badge">${getStatusText(recommendation.status)}</span>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Fähigkeiten & Expertise</h2>
            ${skillsHTML}
        </div>

        ${recommendation.experience ? `
        <div class="section">
            <h2>Berufserfahrung</h2>
            <div class="text-content">${recommendation.experience}</div>
        </div>
        ` : ''}

        ${recommendation.notes ? `
        <div class="section">
            <h2>Zusätzliche Notizen</h2>
            <div class="text-content">${recommendation.notes}</div>
        </div>
        ` : ''}

        <div class="section">
            <h2>Empfohlen durch</h2>
            <div class="recommender-card">
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Name</strong>
                        <span>${recommendation.recommendedByUser.firstName} ${recommendation.recommendedByUser.lastName}</span>
                    </div>
                    <div class="info-item">
                        <strong>E-Mail</strong>
                        <span>${recommendation.recommendedByUser.email}</span>
                    </div>
                    <div class="info-item">
                        <strong>Abteilung</strong>
                        <span>${recommendation.recommendedByUser.department || 'Nicht angegeben'}</span>
                    </div>
                    <div class="info-item">
                        <strong>Eingereicht am</strong>
                        <span>${formatDate(recommendation.createdAt)}</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="footer">
            <p>Erstellt am ${formatDate(new Date())} | Employee Recommendation Platform</p>
        </div>
    </body>
    </html>
  `
}