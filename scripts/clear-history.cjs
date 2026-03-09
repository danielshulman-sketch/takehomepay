const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.payPeriod.deleteMany({ where: { isCurrent: false } })
    .then(r => {
        console.log('Deleted', r.count, 'old pay period(s).');
        return prisma.$disconnect();
    });
