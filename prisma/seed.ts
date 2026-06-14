import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const plans = [
  {
    slug: 'free',
    name: 'Free',
    price: 0,
    ram: '6 GB',
    cpu: '4 vCPU',
    storage: '30 GB SSD',
    icon: 'dirt',
    featured: false,
    sortOrder: 0,
  },
  {
    slug: 'zombie',
    name: 'Zombie',
    price: 600,
    ram: '12 GB',
    cpu: '6 vCPU',
    storage: '75 GB NVMe',
    icon: 'zombie',
    featured: false,
    sortOrder: 1,
  },
  {
    slug: 'wither',
    name: 'Wither',
    price: 1000,
    ram: '16 GB',
    cpu: '8 vCPU',
    storage: '100 GB NVMe',
    icon: 'wither',
    featured: false,
    sortOrder: 2,
  },
  {
    slug: 'ender-dragon',
    name: 'Ender Dragon',
    price: 1400,
    ram: '24 GB',
    cpu: '8 vCPU',
    storage: '150 GB NVMe',
    icon: 'ender-dragon',
    featured: true,
    sortOrder: 3,
  },
  {
    slug: 'diamond',
    name: 'Diamond',
    price: 2600,
    ram: '48 GB',
    cpu: '12 vCPU',
    storage: '300 GB NVMe',
    icon: 'diamond',
    featured: false,
    sortOrder: 4,
  },
]

async function main() {
  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    })
  }
  console.log('Seeded plan catalog')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
