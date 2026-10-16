let prismaInstance = null;

try {
  // Dynamically load PrismaClient if installed
  const { PrismaClient } = require('@prisma/client');
  const globalForPrisma = globalThis;

  prismaInstance =
    globalForPrisma.prisma ||
    new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });

  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prismaInstance;
  }
} catch (err) {
  // Fallback if Prisma binary is generating
  prismaInstance = null;
}

export const prisma = prismaInstance;
export default prismaInstance;
