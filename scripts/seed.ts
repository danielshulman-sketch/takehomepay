import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const currentPeriod = await prisma.payPeriod.findFirst({
    where: { isCurrent: true },
  });

  if (currentPeriod) {
    return;
  }

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 27);
  endDate.setHours(23, 59, 59, 999);

  await prisma.payPeriod.create({
    data: {
      startDate,
      endDate,
      isCurrent: true,
      pensionEnabled: true,
    },
  });
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
