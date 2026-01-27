// Author: Muthana
// © 2026 Muthana. All rights reserved.
// Unauthorized copying or distribution is prohibited.

import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const folder = formData.get('folder') || 'categories'

    if (!file) {
      return NextResponse.json({ detail: 'No file provided' }, { status: 400 })
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
      return NextResponse.json({ detail: 'Cloudinary configuration is missing' }, { status: 500 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')

    const uploadData = new FormData()
    uploadData.append('file', `data:${file.type};base64,${base64}`)
    uploadData.append('upload_preset', uploadPreset)
    uploadData.append('folder', folder)

    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: uploadData
    })

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json()
      return NextResponse.json(
        { detail: errorData.error?.message || 'Upload failed' },
        { status: uploadResponse.status }
      )
    }

    const result = await uploadResponse.json()

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id
    })
  } catch (error) {
    return NextResponse.json({ detail: error.message || 'Failed to upload image' }, { status: 500 })
  }
}
