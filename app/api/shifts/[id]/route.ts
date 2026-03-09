import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// PUT update shift
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { date, startTime, endTime, hoursWorked, payRate, grossPay, tips } = body ?? {};

    const shift = await prisma.shift.update({
      where: { id: params?.id ?? '' },
      data: {
        date: new Date(date ?? new Date()),
        startTime: startTime ?? '00:00',
        endTime: endTime ?? '00:00',
        hoursWorked: hoursWorked ?? 0,
        payRate: payRate ?? 0,
        grossPay: grossPay ?? 0,
        tips: tips ?? 0,
      },
    });

    return NextResponse.json(shift);
  } catch (error) {
    console.error('Error updating shift:', error);
    return NextResponse.json({ error: 'Failed to update shift' }, { status: 500 });
  }
}

// DELETE shift
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.shift.delete({
      where: { id: params?.id ?? '' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting shift:', error);
    return NextResponse.json({ error: 'Failed to delete shift' }, { status: 500 });
  }
}
