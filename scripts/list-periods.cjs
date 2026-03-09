const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.payPeriod.findMany({ orderBy: { startDate: 'asc' } }).then(r => {
    r.forEach(period => {
        console.log(`ID: ${period.id}`);
        console.log(`  Start: ${period.startDate.toISOString()}`);
        console.log(`  End:   ${period.endDate.toISOString()}`);
        console.log(`  Current: ${period.isCurrent}`);
        console.log('');
    });
    p.$disconnect();
});
