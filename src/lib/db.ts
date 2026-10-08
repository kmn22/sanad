import { Prisma, PrismaClient } from '@prisma/client'

// Money columns are DECIMAL in Postgres (exact) — but JSON APIs keep emitting
// plain numbers so every existing client contract is unchanged. Prisma's
// Decimal serializes to a string by default; override it once here.
;(Prisma.Decimal.prototype as unknown as { toJSON: () => number }).toJSON = function (this: Prisma.Decimal) {
  return this.toNumber()
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
