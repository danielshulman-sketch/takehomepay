const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function fix() {
    // The anchor is 22 Feb 2026, periods are 28 days each
    // Today is 9 Mar 2026 → still in period 1: 22 Feb – 21 Mar 2026

    const startDate = new Date('2026-02-22T00:00:00.000Z');
    const endDate = new Date('2026-03-21T23:59:59.999Z');

    // Update the current period with the correct dates
    const result = await p.payPeriod.updateMany({
        where: { isCurrent: true },
        data: { startDate, endDate },
    });

    console.log(`Updated ${result.count} period(s) to 22 Feb – 21 Mar 2026`);
    await p.$disconnect();
}

fix();
