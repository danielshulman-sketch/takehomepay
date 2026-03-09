'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar, TrendingUp, Wallet, RefreshCw, ChevronDown, ChevronUp, ShieldCheck, Printer } from 'lucide-react';
import { calculateTax } from '@/lib/tax-calculator';

interface PayPeriod {
  id: string;
  startDate: Date;
  endDate: Date;
  pensionEnabled: boolean;
  shifts: Array<{
    grossPay: number;
    tips: number;
    hoursWorked?: number;
  }>;
}

interface PaySummaryProps {
  payPeriod: PayPeriod;
}

export default function PaySummary({ payPeriod }: PaySummaryProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(true);

  const totalGrossPay = (payPeriod?.shifts ?? []).reduce((sum, shift) => sum + (shift?.grossPay ?? 0), 0);
  const totalTips = (payPeriod?.shifts ?? []).reduce((sum, shift) => sum + (shift?.tips ?? 0), 0);
  const totalHours = (payPeriod?.shifts ?? []).reduce((sum: number, shift: any) => sum + (shift?.hoursWorked ?? 0), 0);

  const taxCalc = calculateTax(totalGrossPay, payPeriod?.pensionEnabled ?? true);
  const takeHomePay = taxCalc.netPay + totalTips;

  const handleTogglePension = async () => {
    setLoading(true);
    try {
      await fetch(`/api/pay-periods/${payPeriod?.id ?? ''}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pensionEnabled: !payPeriod?.pensionEnabled }),
      });
      router.refresh();
    } catch (error) {
      console.error('Error toggling pension:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewPeriod = async () => {
    if (!confirm('Start a new pay period? This will save the current period to your history.')) return;

    setLoading(true);
    try {
      await fetch('/api/pay-periods', {
        method: 'POST',
      });
      router.refresh();
    } catch (error) {
      console.error('Error creating new period:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    // Isolate this section for printing
    document.body.classList.add('printing-section');
    const printArea = document.getElementById('current-period-print-area');
    if (printArea) printArea.classList.add('active-print');

    // Temporarily expand the breakdown if it's closed
    const wasClosed = !showBreakdown;
    if (wasClosed) setShowBreakdown(true);

    setTimeout(() => {
      window.print();

      // Cleanup
      document.body.classList.remove('printing-section');
      if (printArea) printArea.classList.remove('active-print');
      if (wasClosed) setShowBreakdown(false);
    }, 150);
  };

  const hasShifts = (payPeriod?.shifts?.length ?? 0) > 0;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-transparent print:border-none print:shadow-none">
      {/* Print Title (Hidden on screen) */}
      <div className="hidden print:block mb-6 pb-2 border-b-2 border-emerald-600">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">Take-Home Pay Tracker</h1>
        <p className="text-gray-500 font-medium">Pay Period Report</p>
      </div>

      {/* Period Dates */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600 print:text-gray-800" />
          <div>
            <p className="text-sm text-gray-500">Current Pay Period</p>
            <p className="font-semibold text-gray-800">
              {payPeriod?.startDate ? format(new Date(payPeriod.startDate), 'd MMM') : 'N/A'} –{' '}
              {payPeriod?.endDate ? format(new Date(payPeriod.endDate), 'd MMM yyyy') : 'N/A'}
            </p>
          </div>
        </div>
        <div className="flex gap-2 no-print">
          <button
            onClick={handlePrint}
            className="bg-white border hover:bg-gray-50 text-gray-700 border-gray-200 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-emerald-600" />
            Print Report
          </button>
          <button
            onClick={handleNewPeriod}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            New Period
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Total Hours</p>
          <p className="text-2xl font-bold text-blue-700">{totalHours?.toFixed?.(1) ?? '0.0'}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Gross Pay</p>
          <p className="text-2xl font-bold text-slate-700">£{totalGrossPay?.toFixed?.(2) ?? '0.00'}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Tips</p>
          <p className="text-2xl font-bold text-purple-700">£{totalTips?.toFixed?.(2) ?? '0.00'}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">Total Deducted</p>
          <p className="text-2xl font-bold text-red-600">-£{taxCalc?.totalDeductions?.toFixed?.(2) ?? '0.00'}</p>
        </div>
      </div>

      {/* Tax Breakdown */}
      <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden">
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-600" />
            <span className="font-semibold text-gray-800 text-sm">Deductions Breakdown</span>
            <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
              Tax · NI · Pension
            </span>
          </div>
          {showBreakdown ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </button>

        {showBreakdown && (
          <div className="p-4 space-y-3">
            {/* Gross Pay row */}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Gross Pay (before deductions)</span>
              <span className="font-semibold text-gray-800">£{totalGrossPay?.toFixed?.(2) ?? '0.00'}</span>
            </div>

            <div className="border-t border-dashed border-gray-200 pt-3 space-y-2.5">
              {/* Income Tax */}
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-gray-700">Income Tax</span>
                  <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">20% basic rate</span>
                </div>
                <span className="font-semibold text-red-600">-£{taxCalc?.incomeTax?.toFixed?.(2) ?? '0.00'}</span>
              </div>

              {/* National Insurance */}
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-gray-700">National Insurance</span>
                  <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Class 1 NI</span>
                </div>
                <span className="font-semibold text-red-600">-£{taxCalc?.nationalInsurance?.toFixed?.(2) ?? '0.00'}</span>
              </div>

              {/* Pension */}
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">Pension</span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">5% auto-enrolment</span>
                  <button
                    onClick={handleTogglePension}
                    disabled={loading}
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold transition-colors disabled:opacity-50 ${payPeriod?.pensionEnabled
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-300'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-300'
                      }`}
                  >
                    {payPeriod?.pensionEnabled ? '✓ ON' : 'OFF'}
                  </button>
                </div>
                <span className="font-semibold text-red-600">-£{taxCalc?.pension?.toFixed?.(2) ?? '0.00'}</span>
              </div>
            </div>

            {/* Total Deductions */}
            <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
              <span className="font-semibold text-gray-800 text-sm">Total Deductions</span>
              <span className="font-bold text-red-600">-£{taxCalc?.totalDeductions?.toFixed?.(2) ?? '0.00'}</span>
            </div>

            {/* Net Pay (before tips) */}
            <div className="flex justify-between items-center text-sm bg-slate-50 rounded-lg p-3">
              <span className="text-gray-600">Net Pay (after tax, NI & pension)</span>
              <span className="font-bold text-slate-700">£{taxCalc?.netPay?.toFixed?.(2) ?? '0.00'}</span>
            </div>

            {/* Tips */}
            {totalTips > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">+ Tips</span>
                <span className="font-semibold text-purple-600">+£{totalTips?.toFixed?.(2) ?? '0.00'}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Take-Home Pay — prominent final result */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-emerald-200" />
          <p className="text-emerald-100 text-sm font-medium uppercase tracking-wide">
            Estimated Take-Home Pay
          </p>
        </div>
        <div className="flex items-baseline gap-3 mb-3">
          <p className="text-5xl font-bold">£{takeHomePay?.toFixed?.(2) ?? '0.00'}</p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-emerald-200">
          <span>After Income Tax: <strong className="text-white">-£{taxCalc?.incomeTax?.toFixed?.(2)}</strong></span>
          <span>After NI: <strong className="text-white">-£{taxCalc?.nationalInsurance?.toFixed?.(2)}</strong></span>
          {payPeriod?.pensionEnabled && (
            <span>After Pension: <strong className="text-white">-£{taxCalc?.pension?.toFixed?.(2)}</strong></span>
          )}
          {totalTips > 0 && (
            <span>Incl. Tips: <strong className="text-white">+£{totalTips?.toFixed?.(2)}</strong></span>
          )}
        </div>
        {!hasShifts && (
          <p className="mt-3 text-emerald-300 text-xs italic">Add shifts to see your take-home pay calculation</p>
        )}
      </div>
    </div>
  );
}
