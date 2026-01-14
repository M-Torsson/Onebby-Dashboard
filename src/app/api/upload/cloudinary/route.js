import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const folder = formData.get('folder') || 'categories'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const CLOUDINARY_API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
    const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return NextResponse.json({ error: 'Cloudinary configuration missing' }, { status: 500 })
    }

    // Create FormData for Cloudinary
    const cloudinaryFormData = new FormData()
    cloudinaryFormData.append('file', file)
    cloudinaryFormData.append('folder', folder)
    cloudinaryFormData.append('api_key', CLOUDINARY_API_KEY)

    // Generate timestamp
    const timestamp = Math.round(Date.now() / 1000)
    cloudinaryFormData.append('timestamp', timestamp)

    // Generate signature - correct format for Cloudinary
    const crypto = require('crypto')
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`
    const stringToSign = `${paramsToSign}${CLOUDINARY_API_SECRET}`
    const signature = crypto.createHash('sha1').update(stringToSign).digest('hex')
    cloudinaryFormData.append('signature', signature)

    // Upload to Cloudinary
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: cloudinaryFormData
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.error?.message || 'Upload failed' }, { status: response.status })
    }

    const result = await response.json()

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
