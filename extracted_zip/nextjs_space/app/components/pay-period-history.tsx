'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { History, ChevronDown, ChevronUp, Calendar, Wallet, TrendingUp } from 'lucide-react';
import { calculateTax } from '@/lib/tax-calculator';

interface Shift {
  grossPay: number;
  tips: number;
  hoursWorked: number;
}

interface PayPeriod {
  id: string;
  startDate: Date;
  endDate: Date;
  pensionEnabled: boolean;
  shifts: Shift[];
}

interface PayPeriodHistoryProps {
  periods: PayPeriod[];
}

export default function PayPeriodHistory({ periods }: PayPeriodHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if ((periods?.length ?? 0) === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-6 h-6 text-gray-600" />
          <h2 className="text-2xl font-bold text-gray-800">Pay Period History</h2>
        </div>
        <p className="text-gray-500 text-center py-8">No previous pay periods</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <History className="w-6 h-6 text-gray-600" />
        <h2 className="text-2xl font-bold text-gray-800">Pay Period History</h2>
        <span className="text-sm text-gray-500 ml-2">({periods?.length ?? 0} periods)</span>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {(periods ?? []).map((period) => {
          const totalGrossPay = (period?.shifts ?? []).reduce((sum, shift) => sum + (shift?.grossPay ?? 0), 0);
          const totalTips = (period?.shifts ?? []).reduce((sum, shift) => sum + (shift?.tips ?? 0), 0);
          const totalHours = (period?.shifts ?? []).reduce((sum, shift) => sum + (shift?.hoursWorked ?? 0), 0);
          const taxCalc = calculateTax(totalGrossPay, period?.pensionEnabled ?? true);
          const isExpanded = expandedId === period?.id;

          return (
            <div
              key={period?.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Header - Always Visible */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : (period?.id ?? null))}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">
                      {period?.startDate ? format(new Date(period.startDate), 'd MMM') : 'N/A'} -{' '}
                      {period?.endDate ? format(new Date(period.endDate), 'd MMM yyyy') : 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(period?.shifts?.length ?? 0)} shifts · {totalHours?.toFixed?.(1) ?? '0.0'} hrs
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Take-Home</p>
                    <p className="font-bold text-emerald-700">£{(taxCalc?.netPay + totalTips)?.toFixed?.(2) ?? '0.00'}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="p-4 border-t border-gray-200">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-emerald-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Gross Pay</p>
                      <p className="text-lg font-bold text-emerald-700">£{totalGrossPay?.toFixed?.(2) ?? '0.00'}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Tips</p>
                      <p className="text-lg font-bold text-purple-700">£{totalTips?.toFixed?.(2) ?? '0.00'}</p>
                    </div>
                  </div>

                  {/* Tax Breakdown */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-gray-600" />
                      <h4 className="text-sm font-semibold text-gray-800">Deductions</h4>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Income Tax</span>
                        <span className="font-semibold text-red-600">-£{taxCalc?.incomeTax?.toFixed?.(2) ?? '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">National Insurance</span>
                        <span className="font-semibold text-red-600">-£{taxCalc?.nationalInsurance?.toFixed?.(2) ?? '0.00'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pension (5%)</span>
                        <span className="font-semibold text-red-600">-£{taxCalc?.pension?.toFixed?.(2) ?? '0.00'}</span>
                      </div>
                      <div className="border-t pt-1 mt-1 flex justify-between">
                        <span className="text-gray-700 font-medium">Total Deductions</span>
                        <span className="font-bold text-red-600">-£{taxCalc?.totalDeductions?.toFixed?.(2) ?? '0.00'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Pay */}
                  <div className="mt-3 bg-emerald-100 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-emerald-700" />
                        <span className="text-sm font-semibold text-emerald-900">Take-Home Pay</span>
                      </div>
                      <span className="text-xl font-bold text-emerald-700">£{(taxCalc?.netPay + totalTips)?.toFixed?.(2) ?? '0.00'}</span>
                    </div>
                    <p className="text-xs text-emerald-700 mt-1">
                      Net: £{taxCalc?.netPay?.toFixed?.(2) ?? '0.00'} + Tips: £{totalTips?.toFixed?.(2) ?? '0.00'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
