import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as typeof globalThis & {
  prisma?: PrismaClient
}

export const db =
  globalForPrisma.prisma ?? new PrismaClient({ log: ['query', 'error'] })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}
