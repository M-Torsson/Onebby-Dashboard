/**
 * Script to upload category icons to Cloudinary
 * Usage: node upload-category-icons.js
 */

const fs = require('fs')
const path = require('path')
const https = require('https')

// Cloudinary configuration from .env
const CLOUDINARY_CLOUD_NAME = 'dadaxhbsf'
const CLOUDINARY_UPLOAD_PRESET = 'onebby_unsigned'
const API_BASE_URL = 'https://onebby-api.onrender.com'
const API_KEY = 'OnebbyAPIKey2025P9mK7xL4rT8nW2qF5vB3cH6jD9zYaXbRcGdTeUf1MwNyQsV'

// Category name mapping (filename to category name)
const categoryMapping = {
  'grandi-elettrodomestici.png': 'Grandi elettrodomestici',
  'elettrodomestici-incasso.png': 'Elettrodomestici incasso',
  'audio-video.png': 'Audio video',
  'clima.png': 'Clima',
  'elettrodomestici-cucina.png': 'Elettrodomestici cucina',
  'cura-della-persona.png': 'Cura della persona',
  'informatica.png': 'Informatica',
  'telefonia.png': 'Telefonia'
}

const logosPath = path.join(__dirname, 'public', 'images', 'logos')

// Upload image to Cloudinary
async function uploadToCloudinary(imagePath, filename) {
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
          console.log(`✅ Uploaded: ${filename} -> ${result.secure_url}`)
          resolve(result.secure_url)
        } else {
          console.error(`❌ Failed to upload ${filename}:`, data)
          reject(new Error(data))
        }
      })
    })

    req.on('error', error => {
      console.error(`❌ Error uploading ${filename}:`, error)
      reject(error)
    })

    req.write(body)
    req.end()
  })
}

// Get all categories from API
async function getAllCategories() {
  return new Promise((resolve, reject) => {
    https
      .get(`${API_BASE_URL}/api/v1/categories`, res => {
        let data = ''

        res.on('data', chunk => {
          data += chunk
        })

        res.on('end', () => {
          const result = JSON.parse(data)
          resolve(result.data || [])
        })
      })
      .on('error', reject)
  })
}

// Update category icon
async function updateCategoryIcon(categoryId, iconUrl) {
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
          console.log(`✅ Updated category ${categoryId} with icon`)
          resolve(true)
        } else {
          console.error(`❌ Failed to update category ${categoryId}:`, data)
          reject(new Error(data))
        }
      })
    })

    req.on('error', error => {
      console.error(`❌ Error updating category ${categoryId}:`, error)
      reject(error)
    })

    req.write(body)
    req.end()
  })
}

// Main function
async function main() {
  console.log('🚀 Starting category icons upload...\n')

  try {
    // Get all categories
    console.log('📋 Fetching categories from API...')
    const categories = await getAllCategories()
    console.log(`✅ Found ${categories.length} categories\n`)

    // Process each mapped icon
    for (const [filename, categoryName] of Object.entries(categoryMapping)) {
      const imagePath = path.join(logosPath, filename)

      if (!fs.existsSync(imagePath)) {
        console.log(`⚠️ File not found: ${filename}`)
        continue
      }

      // Find category by name
      const category = categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase())

      if (!category) {
        console.log(`⚠️ Category not found: ${categoryName}`)
        continue
      }

      console.log(`📤 Processing: ${categoryName} (ID: ${category.id})`)

      try {
        // Upload to Cloudinary
        const iconUrl = await uploadToCloudinary(imagePath, filename)

        // Update category
        await updateCategoryIcon(category.id, iconUrl)

        console.log(`✨ Successfully updated ${categoryName}\n`)

        // Wait a bit to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`❌ Error processing ${categoryName}:`, error.message, '\n')
      }
    }

    console.log('🎉 Done!')
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

main()
