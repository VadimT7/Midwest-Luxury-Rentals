import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkImages() {
  const cars = await prisma.car.findMany({
    include: { CarImage: true },
    orderBy: { displayName: 'asc' }
  })

  console.log('\n📊 Image Association Report:')
  console.log('=' .repeat(60))
  console.log(`Total cars: ${cars.length}\n`)

  let totalImages = 0
  for (const car of cars) {
    const imageCount = car.CarImage.length
    totalImages += imageCount
    const status = imageCount > 0 ? '✅' : '❌'
    console.log(`${status} ${car.displayName}: ${imageCount} image(s)`)
    if (imageCount > 0) {
      car.CarImage.slice(0, 3).forEach((img, idx) => {
        console.log(`   ${idx + 1}. ${img.url}`)
      })
      if (imageCount > 3) {
        console.log(`   ... and ${imageCount - 3} more`)
      }
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`Total images in database: ${totalImages}`)
  console.log(`Cars with images: ${cars.filter(c => c.CarImage.length > 0).length}`)
  console.log(`Cars without images: ${cars.filter(c => c.CarImage.length === 0).length}`)
}

checkImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

