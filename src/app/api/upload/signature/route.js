// Author: Muthana
// © 2026 Muthana. All rights reserved.
// Unauthorized copying or distribution is prohibited.

import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const folder = formData.get('folder') || 'categories'

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ detail: 'Cloudinary configuration is missing' }, { status: 500 })
    }

    const timestamp = Math.round(Date.now() / 1000)

    const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`

    const signature = crypto.createHash('sha1').update(signatureString).digest('hex')

    return NextResponse.json({
      signature,
      timestamp,
      api_key: apiKey,
      cloud_name: cloudName,
      folder
    })
  } catch (error) {
    return NextResponse.json({ detail: error.message || 'Failed to generate signature' }, { status: 500 })
  }
}
