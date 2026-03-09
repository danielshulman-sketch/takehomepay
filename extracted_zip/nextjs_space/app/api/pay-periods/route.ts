import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET current pay period
export async function GET() {
  try {
    const currentPeriod = await prisma.payPeriod.findFirst({
      where: { isCurrent: true },
      include: { shifts: true },
    });

    return NextResponse.json(currentPeriod);
  } catch (error) {
    console.error('Error fetching pay period:', error);
    return NextResponse.json({ error: 'Failed to fetch pay period' }, { status: 500 });
  }
}

// POST create new pay period
export async function POST() {
  try {
    // Get the current period to calculate next period dates
    const currentPeriod = await prisma.payPeriod.findFirst({
      where: { isCurrent: true },
    });

    // Set current period to not current (archive it)
    await prisma.payPeriod.updateMany({
      where: { isCurrent: true },
      data: { isCurrent: false },
    });

    // Calculate new period dates based on previous period
    let startDate: Date;
    let endDate: Date;

    if (currentPeriod?.endDate) {
      // Start the day after the previous period ends
      startDate = new Date(currentPeriod.endDate);
      startDate.setDate(startDate.getDate() + 1);
      startDate.setHours(0, 0, 0, 0);
      
      // End date is 27 days after start (total 28 days = 4 weeks)
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 27);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // Fallback: start today if no previous period exists
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 27);
      endDate.setHours(23, 59, 59, 999);
    }

    const newPeriod = await prisma.payPeriod.create({
      data: {
        startDate: startDate,
        endDate: endDate,
        isCurrent: true,
        pensionEnabled: true,
      },
      include: { shifts: true },
    });

    return NextResponse.json(newPeriod, { status: 201 });
  } catch (error) {
    console.error('Error creating pay period:', error);
    return NextResponse.json({ error: 'Failed to create pay period' }, { status: 500 });
  }
}
