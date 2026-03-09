const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
    // Create a past pay period (Feb 22 – Mar 21 2026) with a couple of shifts
    const period = await prisma.payPeriod.create({
        data: {
            startDate: new Date('2026-01-25T00:00:00'),
            endDate: new Date('2026-02-21T23:59:59'),
            isCurrent: false,
            pensionEnabled: true,
            shifts: {
                create: [
                    {
                        date: new Date('2026-01-27'),
                        startTime: '09:00',
                        endTime: '17:00',
                        hoursWorked: 8,
                        payRate: 12.31,
                        grossPay: 98.48,
                        tips: 5.00,
                    },
                    {
                        date: new Date('2026-02-03'),
                        startTime: '10:00',
                        endTime: '18:30',
                        hoursWorked: 8.5,
                        payRate: 12.71,
                        grossPay: 108.035,
                        tips: 0,
                    },
                    {
                        date: new Date('2026-02-10'),
                        startTime: '09:00',
                        endTime: '16:00',
                        hoursWorked: 7,
                        payRate: 12.86,
                        grossPay: 90.02,
                        tips: 3.50,
                    },
                ],
            },
        },
    });
    console.log('Created past pay period:', period.id);
    await prisma.$disconnect();
}

seed();
