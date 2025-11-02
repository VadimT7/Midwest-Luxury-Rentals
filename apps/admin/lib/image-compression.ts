/**
 * Client-side image compression utilities
 * Compress images before uploading to avoid payload size limits
 */

export interface CompressImageOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'webp'
}

/**
 * Compress an image file on the client side
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Promise<File> - The compressed image file
 */
export async function compressImage(
  file: File,
  options: CompressImageOptions = {}
): Promise<File> {
  const {
    maxWidth = 2048,
    maxHeight = 2048,
    quality = 0.85,
    format = 'jpeg'
  } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height
          if (width > height) {
            width = maxWidth
            height = width / aspectRatio
          } else {
            height = maxHeight
            width = height * aspectRatio
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }

        // Draw the resized image
        ctx.drawImage(img, 0, 0, width, height)

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }

            // Create a new File object with the compressed blob
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, `.${format}`),
              { type: `image/${format}` }
            )

            console.log(`📸 Image compressed: ${file.size} bytes → ${compressedFile.size} bytes (${Math.round((1 - compressedFile.size / file.size) * 100)}% reduction)`)
            
            resolve(compressedFile)
          },
          `image/${format}`,
          quality
        )
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}

/**
 * Check if a file needs compression based on size
 * @param file - The file to check
 * @param maxSizeInMB - Maximum size in megabytes (default 2MB)
 * @returns boolean - Whether the file needs compression
 */
export function needsCompression(file: File, maxSizeInMB: number = 2): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return file.size > maxSizeInBytes
}

/**
 * Compress multiple images
 * @param files - Array of image files to compress
 * @param options - Compression options
 * @returns Promise<File[]> - Array of compressed image files
 */
export async function compressImages(
  files: File[],
  options: CompressImageOptions = {}
): Promise<File[]> {
  const compressionPromises = files.map(file => {
    if (needsCompression(file)) {
      return compressImage(file, options)
    }
    return Promise.resolve(file)
  })

  return Promise.all(compressionPromises)
}
