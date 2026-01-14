import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const folder = formData.get('folder') || 'categories'

    // Get Cloudinary credentials from environment variables
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('❌ Cloudinary credentials missing')
      return NextResponse.json({ detail: 'Cloudinary configuration is missing' }, { status: 500 })
    }

    // Generate timestamp
    const timestamp = Math.round(Date.now() / 1000)

    // Create signature string (alphabetically sorted parameters)
    const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`

    // Generate SHA-1 signature (Cloudinary uses SHA-1, not SHA-256)
    const signature = crypto.createHash('sha1').update(signatureString).digest('hex')

    console.log('✅ Signature generated successfully')

    return NextResponse.json({
      signature,
      timestamp,
      api_key: apiKey,
      cloud_name: cloudName,
      folder
    })
  } catch (error) {
    console.error('❌ Error generating signature:', error)
    return NextResponse.json({ detail: error.message || 'Failed to generate signature' }, { status: 500 })
  }
}
