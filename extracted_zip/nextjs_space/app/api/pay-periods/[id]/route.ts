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
