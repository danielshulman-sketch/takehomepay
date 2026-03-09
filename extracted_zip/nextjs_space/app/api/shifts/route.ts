import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateHoursWorked } from '@/lib/tax-calculator';

export const dynamic = 'force-dynamic';

// GET all shifts
export async function GET() {
  try {
    const shifts = await prisma.shift.findMany({
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(shifts);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    return NextResponse.json({ error: 'Failed to fetch shifts' }, { status: 500 });
  }
}

// POST new shift
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { date, startTime, endTime, payRate, tips, payPeriodId } = body ?? {};

    const hoursWorked = calculateHoursWorked(startTime ?? '00:00', endTime ?? '00:00');
    const grossPay = hoursWorked * (payRate ?? 0);

    const shift = await prisma.shift.create({
      data: {
        date: new Date(date ?? new Date()),
        startTime: startTime ?? '00:00',
        endTime: endTime ?? '00:00',
        hoursWorked,
        payRate: payRate ?? 0,
        grossPay,
        tips: tips ?? 0,
        payPeriodId: payPeriodId ?? '',
      },
    });

    return NextResponse.json(shift, { status: 201 });
  } catch (error) {
    console.error('Error creating shift:', error);
    return NextResponse.json({ error: 'Failed to create shift' }, { status: 500 });
  }
}
