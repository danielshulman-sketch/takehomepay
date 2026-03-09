import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const result = await prisma.payPeriod.deleteMany({ where: { isCurrent: false } });
console.log(`Deleted ${result.count} old pay period(s).`);
await prisma.$disconnect();
