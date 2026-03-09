'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Calendar, TrendingUp, Wallet, RefreshCw } from 'lucide-react';
import { calculateTax } from '@/lib/tax-calculator';

interface PayPeriod {
  id: string;
  startDate: Date;
  endDate: Date;
  pensionEnabled: boolean;
  shifts: Array<{
    grossPay: number;
    tips: number;
  }>;
}

interface PaySummaryProps {
  payPeriod: PayPeriod;
}

export default function PaySummary({ payPeriod }: PaySummaryProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const totalGrossPay = (payPeriod?.shifts ?? []).reduce((sum, shift) => sum + (shift?.grossPay ?? 0), 0);
  const totalTips = (payPeriod?.shifts ?? []).reduce((sum, shift) => sum + (shift?.tips ?? 0), 0);
  const totalHours = (payPeriod?.shifts ?? []).length > 0
    ? (payPeriod?.shifts ?? []).reduce((sum: number, shift: any) => sum + (shift?.hoursWorked ?? 0), 0)
    : 0;

  const taxCalc = calculateTax(totalGrossPay, payPeriod?.pensionEnabled ?? true);

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

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Period Dates */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="text-sm text-gray-500">Current Pay Period</p>
            <p className="font-semibold text-gray-800">
              {payPeriod?.startDate ? format(new Date(payPeriod.startDate), 'd MMM') : 'N/A'} -{' '}
              {payPeriod?.endDate ? format(new Date(payPeriod.endDate), 'd MMM yyyy') : 'N/A'}
            </p>
          </div>
        </div>
        <button
          onClick={handleNewPeriod}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className="w-4 h-4" />
          New Period
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Hours</p>
          <p className="text-2xl font-bold text-blue-700">{totalHours?.toFixed?.(1) ?? '0.0'}</p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Gross Pay</p>
          <p className="text-2xl font-bold text-emerald-700">£{totalGrossPay?.toFixed?.(2) ?? '0.00'}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Tips</p>
          <p className="text-2xl font-bold text-purple-700">£{totalTips?.toFixed?.(2) ?? '0.00'}</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Earned</p>
          <p className="text-2xl font-bold text-amber-700">£{(totalGrossPay + totalTips)?.toFixed?.(2) ?? '0.00'}</p>
        </div>
      </div>

      {/* Tax Breakdown */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Tax Deductions</h3>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Income Tax (20%)</span>
            <span className="font-semibold text-red-600">-£{taxCalc?.incomeTax?.toFixed?.(2) ?? '0.00'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">National Insurance</span>
            <span className="font-semibold text-red-600">-£{taxCalc?.nationalInsurance?.toFixed?.(2) ?? '0.00'}</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Pension (5%)</span>
              <button
                onClick={handleTogglePension}
                disabled={loading}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  payPeriod?.pensionEnabled
                    ? 'bg-emerald-200 text-emerald-800 hover:bg-emerald-300'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {payPeriod?.pensionEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            <span className="font-semibold text-red-600">-£{taxCalc?.pension?.toFixed?.(2) ?? '0.00'}</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between">
              <span className="text-gray-700 font-medium">Total Deductions</span>
              <span className="font-bold text-red-600">-£{taxCalc?.totalDeductions?.toFixed?.(2) ?? '0.00'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Take-Home Pay */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Wallet className="w-6 h-6" />
          <h3 className="text-lg font-semibold">Estimated Take-Home Pay</h3>
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-4xl font-bold">£{(taxCalc?.netPay + totalTips)?.toFixed?.(2) ?? '0.00'}</p>
          <p className="text-emerald-200 text-sm">(incl. tips)</p>
        </div>
        <p className="text-emerald-100 text-sm mt-2">
          Net pay: £{taxCalc?.netPay?.toFixed?.(2) ?? '0.00'} + Tips: £{totalTips?.toFixed?.(2) ?? '0.00'}
        </p>
      </div>
    </div>
  );
}
