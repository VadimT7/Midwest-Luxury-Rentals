import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPrimaryImages() {
  const cars = await prisma.car.findMany({
    orderBy: { displayName: 'asc' }
  })

  console.log('\n🔍 Primary Image URLs Check:')
  console.log('='.repeat(80))
  
  const issues = []
  for (const car of cars) {
    if (!car.primaryImageUrl || car.primaryImageUrl === '/placeholder-car.jpg') {
      const carImages = await prisma.carImage.findMany({
        where: { carId: car.id },
        orderBy: { order: 'asc' }
      })
      
      if (carImages.length > 0 && carImages[0].url !== '/placeholder-car.jpg') {
        issues.push({
          car: car.displayName,
          currentPrimary: car.primaryImageUrl,
          shouldBe: carImages[0].url
        })
      }
    }
  }

  if (issues.length === 0) {
    console.log('✅ All primary images are correctly set!\n')
    cars.forEach(c => {
      console.log(`  ${c.displayName}: ${c.primaryImageUrl}`)
    })
  } else {
    console.log(`⚠️  Found ${issues.length} cars with primary image issues:\n`)
    issues.forEach(issue => {
      console.log(`  ${issue.car}:`)
      console.log(`    Current: ${issue.currentPrimary}`)
      console.log(`    Should be: ${issue.shouldBe}`)
    })
  }
}

checkPrimaryImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

