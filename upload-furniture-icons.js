/**
 * Script to upload furniture category icons to Cloudinary
 * Usage: node upload-furniture-icons.js
 */

const fs = require('fs')
const path = require('path')
const https = require('https')

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dadaxhbsf'
const CLOUDINARY_UPLOAD_PRESET = 'onebby_unsigned'
const API_BASE_URL = 'https://onebby-api.onrender.com'
const API_KEY = 'OnebbyAPIKey2025P9mK7xL4rT8nW2qF5vB3cH6jD9zYaXbRcGdTeUf1MwNyQsV'

// Category name mapping (filename to category name)
const categoryMapping = {
  'letti.png': 'Letti',
  'tavoli.png': 'Tavoli',
  'poltrone.png': 'Divani e Poltrone',
  'divani-e-poltrone.png': 'Divani e Poltrone',
  'cassettiere.png': 'Cassettiere, comò e comodini',
  'cassettiere-comò-e-comodini.png': 'Cassettiere, comò e comodini',
  'rubinetteria.png': 'Rubinetteria',
  'sedie.png': 'Sedie',
  'armadi.png': 'Armadi',
  'copridivani.png': 'Copridivani',
  'armadi-grandi.png': 'Armadi',
  'comodini.png': 'Cassettiere, comò e comodini',
  'scrivanie.png': 'Scrivanie',
  'arredo-bagno.png': 'Arredo Bagno',
  'ferramenta-e-componenti.png': 'Ferramenta e componenti'
}

const logosPath = path.join(__dirname, 'public', 'images', 'logos')

// Upload image to Cloudinary
async function uploadToCloudinary(imagePath, filename) {
  return new Promise((resolve, reject) => {
    const FormData = require('form-data')
    const form = new FormData()

    form.append('file', fs.createReadStream(imagePath))
    form.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

    const options = {
      hostname: 'api.cloudinary.com',
      port: 443,
      path: `/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      method: 'POST',
      headers: form.getHeaders()
    }

    const req = https.request(options, res => {
      let data = ''

      res.on('data', chunk => {
        data += chunk
      })

      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data)

          console.log(`✓ Uploaded ${filename}: ${response.secure_url}`)
          resolve(response.secure_url)
        } else {
          console.error(`✗ Failed to upload ${filename}: ${res.statusCode} ${data}`)
          reject(new Error(`Upload failed: ${res.statusCode}`))
        }
      })
    })

    req.on('error', error => {
      console.error(`✗ Error uploading ${filename}:`, error)
      reject(error)
    })

    form.pipe(req)
  })
}

// Get all categories from API
async function getAllCategories() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'onebby-api.onrender.com',
      port: 443,
      path: '/api/v1/categories?per_page=200',
      method: 'GET',
      headers: {
        'X-API-Key': API_KEY
      }
    }

    const req = https.request(options, res => {
      let data = ''

      res.on('data', chunk => {
        data += chunk
      })

      res.on('end', () => {
        if (res.statusCode === 200) {
          const response = JSON.parse(data)

          resolve(response.data)
        } else {
          reject(new Error(`Failed to get categories: ${res.statusCode}`))
        }
      })
    })

    req.on('error', reject)
    req.end()
  })
}

// Update category icon
async function updateCategoryIcon(category, iconUrl) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      name: category.name,
      slug: category.slug,
      icon: iconUrl,
      is_active: category.is_active,
      sort_order: category.sort_order
    })

    const options = {
      hostname: 'onebby-api.onrender.com',
      port: 443,
      path: `/api/v1/categories/${category.id}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    const req = https.request(options, res => {
      let data = ''

      res.on('data', chunk => {
        data += chunk
      })

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve()
        } else {
          reject(new Error(`Failed to update category: ${res.statusCode} ${data}`))
        }
      })
    })

    req.on('error', reject)
    req.write(postData)
    req.end()
  })
}

// Main function
async function main() {
  try {
    console.log('🔍 Getting all categories...')
    const categories = await getAllCategories()

    console.log(`📋 Found ${categories.length} categories\n`)

    // Get all PNG files in logos directory
    const files = fs.readdirSync(logosPath).filter(file => file.endsWith('.png'))

    for (const filename of files) {
      const categoryName = categoryMapping[filename]

      if (!categoryName) {
        console.log(`⊘ Skipping ${filename} - no mapping found`)
        continue
      }

      // Find category by name (case insensitive)
      const category = categories.find(cat => cat.name.toLowerCase() === categoryName.toLowerCase() && !cat.parent_id)

      if (!category) {
        console.log(`⊘ Category "${categoryName}" not found for ${filename}`)
        continue
      }

      console.log(`\n📤 Processing: ${filename} → ${category.name} (ID: ${category.id})`)

      // Upload to Cloudinary
      const imagePath = path.join(logosPath, filename)
      const iconUrl = await uploadToCloudinary(imagePath, filename)

      // Update category with icon URL
      await updateCategoryIcon(category, iconUrl)
      console.log(`✓ Updated category "${category.name}" with icon`)

      // Wait a bit between uploads
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log('\n✨ All icons uploaded successfully!')
  } catch (error) {
    console.error('❌ Error:', error.message)
    process.exit(1)
  }
}

main()
