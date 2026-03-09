import { prisma } from '@/lib/prisma';
import ShiftForm from './components/shift-form';
import ShiftList from './components/shift-list';
import PaySummary from './components/pay-summary';
import PayPeriodHistory from './components/pay-period-history';
import { Wallet, TrendingUp } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getCurrentPayPeriod() {
  try {
    const currentPeriod = await prisma.payPeriod.findFirst({
      where: { isCurrent: true },
      include: { shifts: { orderBy: { date: 'desc' } } },
    });

    if (currentPeriod) {
      return currentPeriod;
    }

    // Create initial pay period starting on 22nd February 2026
    // This period runs for 4 weeks: 22 Feb - 21 March 2026
    const startDate = new Date('2026-02-22T00:00:00');
    const endDate = new Date('2026-03-21T23:59:59');

    const newPeriod = await prisma.payPeriod.create({
      data: {
        startDate: startDate,
        endDate: endDate,
        isCurrent: true,
        pensionEnabled: true,
      },
      include: { shifts: true },
    });

    return newPeriod;
  } catch (error) {
    console.error('Error fetching pay period:', error);
    return null;
  }
}

async function getPreviousPayPeriods() {
  try {
    const previousPeriods = await prisma.payPeriod.findMany({
      where: { isCurrent: false },
      include: { shifts: true },
      orderBy: { startDate: 'desc' },
    });
    return previousPeriods;
  } catch (error) {
    console.error('Error fetching previous pay periods:', error);
    return [];
  }
}

export default async function Home() {
  const payPeriod = await getCurrentPayPeriod();
  const previousPeriods = await getPreviousPayPeriods();

  if (!payPeriod) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Error loading pay period. Please refresh.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-16">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Take-Home Pay Tracker</h1>
          </div>
          <p className="text-emerald-100 ml-11">
            Track your shifts and calculate your earnings with accurate UK tax deductions
          </p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Pay Period Summary - Top */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <h2 className="text-2xl font-bold text-gray-800">Pay Period Summary</h2>
          </div>
          <PaySummary payPeriod={payPeriod} />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Shift Entry */}
          <div>
            <ShiftForm payPeriodId={payPeriod.id} />
          </div>

          {/* Right Column - Shift History */}
          <div>
            <ShiftList shifts={payPeriod.shifts ?? []} />
          </div>
        </div>

        {/* Pay Period History */}
        {(previousPeriods?.length ?? 0) > 0 && (
          <div className="mt-8">
            <PayPeriodHistory periods={previousPeriods} />
          </div>
        )}
      </div>
    </main>
  );
}
