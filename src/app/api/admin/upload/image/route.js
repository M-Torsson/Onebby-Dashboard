import { NextResponse } from 'next/server'

export async function POST(request) {
  console.log('🚀 API Route /api/admin/upload/image called')

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const folder = formData.get('folder') || 'categories'

    console.log('📦 File received:', file?.name, 'Size:', file?.size)

    if (!file) {
      return NextResponse.json({ detail: 'No file provided' }, { status: 400 })
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

    console.log('☁️ Cloud:', cloudName)
    console.log('📋 Upload Preset:', uploadPreset)

    if (!cloudName || !uploadPreset) {
      return NextResponse.json({ detail: 'Cloudinary configuration is missing' }, { status: 500 })
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')

    console.log('📤 Uploading to Cloudinary with unsigned preset...')

    // Use unsigned upload with preset
    const uploadData = new FormData()
    uploadData.append('file', `data:${file.type};base64,${base64}`)
    uploadData.append('upload_preset', uploadPreset)
    uploadData.append('folder', folder)

    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: uploadData
    })

    console.log('📡 Response status:', uploadResponse.status)

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json()
      console.error('❌ Cloudinary error:', errorData)
      return NextResponse.json(
        { detail: errorData.error?.message || 'Upload failed' },
        { status: uploadResponse.status }
      )
    }

    const result = await uploadResponse.json()
    console.log('✅ Upload successful!')
    console.log('🖼️ Image URL:', result.secure_url)

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id
    })
  } catch (error) {
    console.error('❌ Error uploading image:', error)
    return NextResponse.json({ detail: error.message || 'Failed to upload image' }, { status: 500 })
  }
}
