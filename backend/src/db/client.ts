import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const prismaClientSingleton = () => {
  let connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn("DATABASE_URL is not set. Returning a mock db proxy.");
    return new Proxy({}, {
      get(target, prop) {
        return () => {
          throw new Error("DATABASE_URL is not configured in environment variables.");
        };
      }
    }) as unknown as PrismaClient;
  }
  
  if (connectionString.includes('sslmode=require') || connectionString.includes('sslmode=prefer') || connectionString.includes('sslmode=verify-ca')) {
    connectionString = connectionString.replace(/sslmode=(require|prefer|verify-ca)/g, 'sslmode=verify-full');
  }

  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
