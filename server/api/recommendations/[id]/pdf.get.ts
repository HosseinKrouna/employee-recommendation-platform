import { prisma } from '~/server/utils/prisma'
import puppeteer from 'puppeteer'

export default defineEventHandler(async (event) => {
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
    setHeader(event, 'Content-Disposition', `attachment; filename="empfehlung-${recommendation.candidateName.replace(/\s+/g, '-')}.pdf"`)
    
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
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #4F46E5;
                padding-bottom: 20px;
                margin-bottom: 30px;
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
                padding: 15px;
                border-left: 4px solid #4F46E5;
                background: #f8f9ff;
            }
            .section h2 {
                color: #4F46E5;
                font-size: 18px;
                margin-bottom: 15px;
            }
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-bottom: 20px;
            }
            .info-item {
                background: white;
                padding: 10px;
                border-radius: 5px;
                border: 1px solid #e5e7eb;
            }
            .info-item strong {
                color: #4F46E5;
                display: block;
                margin-bottom: 5px;
            }
            .skills {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 10px;
            }
            .skill-tag {
                background: #4F46E5;
                color: white;
                padding: 5px 12px;
                border-radius: 15px;
                font-size: 13px;
            }
            .text-content {
                background: white;
                padding: 15px;
                border-radius: 5px;
                border: 1px solid #e5e7eb;
                white-space: pre-wrap;
            }
            .footer {
                margin-top: 40px;
                text-align: center;
                color: #666;
                font-size: 12px;
                border-top: 1px solid #e5e7eb;
                padding-top: 20px;
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
                    ${recommendation.candidateName}
                </div>
                <div class="info-item">
                    <strong>E-Mail</strong>
                    ${recommendation.candidateEmail}
                </div>
                <div class="info-item">
                    <strong>Telefon</strong>
                    ${recommendation.candidatePhone || 'Nicht angegeben'}
                </div>
                <div class="info-item">
                    <strong>Position</strong>
                    ${recommendation.position}
                </div>
                <div class="info-item">
                    <strong>Abteilung</strong>
                    ${recommendation.department}
                </div>
                <div class="info-item">
                    <strong>Status</strong>
                    ${recommendation.status}
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Fähigkeiten</h2>
            <div class="skills">
                ${recommendation.skills.map((skill: string) => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
        </div>

        <div class="section">
            <h2>Berufserfahrung</h2>
            <div class="text-content">${recommendation.experience}</div>
        </div>

        ${recommendation.notes ? `
        <div class="section">
            <h2>Zusätzliche Notizen</h2>
            <div class="text-content">${recommendation.notes}</div>
        </div>
        ` : ''}

        <div class="section">
            <h2>Empfohlen durch</h2>
            <div class="info-grid">
                <div class="info-item">
                    <strong>Name</strong>
                    ${recommendation.recommendedByUser.firstName} ${recommendation.recommendedByUser.lastName}
                </div>
                <div class="info-item">
                    <strong>E-Mail</strong>
                    ${recommendation.recommendedByUser.email}
                </div>
                <div class="info-item">
                    <strong>Abteilung</strong>
                    ${recommendation.recommendedByUser.department || 'Nicht angegeben'}
                </div>
                <div class="info-item">
                    <strong>Eingereicht am</strong>
                    ${formatDate(recommendation.createdAt)}
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