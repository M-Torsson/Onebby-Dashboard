const fs = require('fs')
const path = require('path')
const https = require('https')

const CLOUDINARY_CLOUD_NAME = 'dadaxhbsf'
const CLOUDINARY_UPLOAD_PRESET = 'onebby_unsigned'
const API_BASE_URL = 'https://onebby-api.onrender.com'
const API_KEY = 'OnebbyAPIKey2025P9mK7xL4rT8nW2qF5vB3cH6jD9zYaXbRcGdTeUf1MwNyQsV'

const imagePath = path.join(__dirname, 'public', 'images', 'logos', 'preparazione-cibi.png')
const categoryId = 8501
const categoryName = 'Cottura cibi'

console.log('🚀 Uploading icon for:', categoryName)

// Upload to Cloudinary
function uploadToCloudinary() {
  return new Promise((resolve, reject) => {
    const imageBuffer = fs.readFileSync(imagePath)
    const base64Image = imageBuffer.toString('base64')
    const dataURI = `data:image/png;base64,${base64Image}`

    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2)
    const body = [
      `--${boundary}`,
      `Content-Disposition: form-data; name="file"`,
      '',
      dataURI,
      `--${boundary}`,
      `Content-Disposition: form-data; name="upload_preset"`,
      '',
      CLOUDINARY_UPLOAD_PRESET,
      `--${boundary}`,
      `Content-Disposition: form-data; name="folder"`,
      '',
      'categories',
      `--${boundary}--`
    ].join('\r\n')

    const options = {
      hostname: 'api.cloudinary.com',
      port: 443,
      path: `/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': Buffer.byteLength(body)
      }
    }

    const req = https.request(options, res => {
      let data = ''

      res.on('data', chunk => {
        data += chunk
      })

      res.on('end', () => {
        if (res.statusCode === 200) {
          const result = JSON.parse(data)
          console.log('✅ Uploaded to Cloudinary:', result.secure_url)
          resolve(result.secure_url)
        } else {
          console.error('❌ Failed to upload:', data)
          reject(new Error(data))
        }
      })
    })

    req.on('error', error => {
      console.error('❌ Error:', error)
      reject(error)
    })

    req.write(body)
    req.end()
  })
}

// Update category
function updateCategory(iconUrl) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ icon: iconUrl })

    const options = {
      hostname: 'onebby-api.onrender.com',
      port: 443,
      path: `/api/v1/categories/${categoryId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
        'Content-Length': Buffer.byteLength(body)
      }
    }

    const req = https.request(options, res => {
      let data = ''

      res.on('data', chunk => {
        data += chunk
      })

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Updated category successfully!')
          resolve(true)
        } else {
          console.error('❌ Failed to update category:', data)
          reject(new Error(data))
        }
      })
    })

    req.on('error', error => {
      console.error('❌ Error:', error)
      reject(error)
    })

    req.write(body)
    req.end()
  })
}

// Main
async function main() {
  try {
    const iconUrl = await uploadToCloudinary()
    await updateCategory(iconUrl)
    console.log('🎉 Done!')
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()
