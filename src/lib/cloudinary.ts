import { v2 as cloudinary } from 'cloudinary'
import { Readable } from 'node:stream'

export function isCloudinaryConfigured(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  )
}

function applyConfig(): void {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

/**
 * Upload gambar input ke Cloudinary (server-only).
 * Mengembalikan secure_url untuk disimpan di `input_image_url` dan dikirim ke n8n sebagai `imageUrl`.
 */
export async function uploadInputImage(
  buffer: Buffer,
  opts: { userId: string }
): Promise<string> {
  if (!isCloudinaryConfigured()) {
    throw new Error('CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET belum diset')
  }
  applyConfig()

  const folder =
    (process.env.CLOUDINARY_UPLOAD_FOLDER || 'rephot/uploads').replace(
      /^\/+|\/+$/g,
      ''
    )
  const publicId = `${opts.userId.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}`

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'image',
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(error)
          return
        }
        if (!result?.secure_url) {
          reject(new Error('Cloudinary: respons tanpa secure_url'))
          return
        }
        resolve(result.secure_url)
      }
    )

    Readable.from(buffer).pipe(stream)
  })
}
