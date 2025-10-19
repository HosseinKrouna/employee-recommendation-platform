import { defineEventHandler, readMultipartFormData, createError, getHeaders } from 'h3'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export default defineEventHandler(async (event) => {
  try {
    console.log('=== CV Upload Debug ===')
    console.log('Headers:', getHeaders(event))
    console.log('Method:', event.method)
    
    const formData = await readMultipartFormData(event)
    
    console.log('FormData received:', formData)
    console.log('FormData items:', formData?.map(item => ({
      name: item.name,
      filename: item.filename,
      type: item.type,
      dataLength: item.data?.length
    })))
    
    if (!formData) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Keine Datei hochgeladen'
      })
    }

    const cvFile = formData.find(item => item.name === 'cv')
    
    console.log('CV File found:', cvFile ? 'YES' : 'NO')
    console.log('CV File details:', cvFile ? {
      name: cvFile.name,
      filename: cvFile.filename,
      type: cvFile.type
    } : 'NONE')
    
    if (!cvFile || !cvFile.filename) {
      throw createError({
        statusCode: 400,
        statusMessage: 'CV-Datei nicht gefunden'
      })
    }

    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(cvFile.type || '')) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nur PDF, DOC und DOCX Dateien sind erlaubt'
      })
    }

    if (cvFile.data.length > 10 * 1024 * 1024) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Datei ist zu groß (max. 10MB)'
      })
    }

    const uploadDir = path.join(process.cwd(), 'uploads', 'cv')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const ext = path.extname(cvFile.filename)
    const uniqueFilename = `cv-${uuidv4()}${ext}`
    const filePath = path.join(uploadDir, uniqueFilename)

    await writeFile(filePath, cvFile.data)

    return {
      success: true,
      file: {
        filename: uniqueFilename,
        originalname: cvFile.filename,
        mimetype: cvFile.type,
        size: cvFile.data.length,
        path: `/uploads/cv/${uniqueFilename}`
      }
    }
  } catch (error: any) {
    console.error('❌ Upload error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Fehler beim Hochladen der Datei'
    })
  }
})