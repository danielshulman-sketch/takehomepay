import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// PATCH toggle pension
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { pensionEnabled } = body ?? {};

    const period = await prisma.payPeriod.update({
      where: { id: params?.id ?? '' },
      data: { pensionEnabled: pensionEnabled ?? false },
    });

    return NextResponse.json(period);
  } catch (error) {
    console.error('Error updating pay period:', error);
    return NextResponse.json({ error: 'Failed to update pay period' }, { status: 500 });
  }
}

// DELETE a past pay period (cascades to its shifts)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.payPeriod.delete({
      where: { id: params?.id ?? '' },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pay period:', error);
    return NextResponse.json({ error: 'Failed to delete pay period' }, { status: 500 });
  }
}
