'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  History, ChevronDown, ChevronUp, Calendar, Wallet,
  TrendingUp, Trash2, AlertTriangle, X, Clock, Briefcase,
  ShieldCheck,
} from 'lucide-react';
import { calculateTax } from '@/lib/tax-calculator';

interface Shift {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  hoursWorked: number;
  payRate: number;
  grossPay: number;
  tips: number;
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
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showShiftsId, setShowShiftsId] = useState<string | null>(null);

  const handleDeletePeriod = async (periodId: string) => {
    setDeletingId(periodId);
    try {
      const res = await fetch(`/api/pay-periods/${periodId}`, { method: 'DELETE' });
      if (res.ok) {
        setConfirmDeleteId(null);
        setExpandedId(null);
        router.refresh();
      }
    } catch (err) {
      console.error('Error deleting pay period:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if ((periods?.length ?? 0) === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-700 mb-1">No Previous Pay Periods</h2>
        <p className="text-gray-400 text-sm">
          When you start a new pay period, the current one will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <History className="w-6 h-6 text-gray-600" />
        <h2 className="text-2xl font-bold text-gray-800">Pay Period History</h2>
        <span className="ml-1 text-sm text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
          {periods?.length ?? 0} period{(periods?.length ?? 0) !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-4">
        {(periods ?? []).map((period) => {
          const totalGrossPay = (period?.shifts ?? []).reduce((sum, s) => sum + (s?.grossPay ?? 0), 0);
          const totalTips = (period?.shifts ?? []).reduce((sum, s) => sum + (s?.tips ?? 0), 0);
          const totalHours = (period?.shifts ?? []).reduce((sum, s) => sum + (s?.hoursWorked ?? 0), 0);
          const taxCalc = calculateTax(totalGrossPay, period?.pensionEnabled ?? true);
          const takeHome = (taxCalc?.netPay ?? 0) + totalTips;
          const isExpanded = expandedId === period?.id;
          const isConfirmingDelete = confirmDeleteId === period?.id;
          const shiftsVisible = showShiftsId === period?.id;

          return (
            <div
              key={period?.id}
              className={`border rounded-xl overflow-hidden transition-all ${isConfirmingDelete
                  ? 'border-red-300'
                  : isExpanded
                    ? 'border-emerald-300 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
            >
              {/* ── Period Header ── */}
              <button
                onClick={() => {
                  setExpandedId(isExpanded ? null : (period?.id ?? null));
                  setConfirmDeleteId(null);
                  setShowShiftsId(null);
                }}
                className={`w-full px-5 py-4 flex items-center justify-between transition-colors ${isExpanded ? 'bg-emerald-50' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Calendar className={`w-5 h-5 ${isExpanded ? 'text-emerald-600' : 'text-gray-500'}`} />
                  <div className="text-left">
                    <p className="font-semibold text-gray-800">
                      {period?.startDate ? format(new Date(period.startDate), 'd MMM') : '?'} –{' '}
                      {period?.endDate ? format(new Date(period.endDate), 'd MMM yyyy') : '?'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {period?.shifts?.length ?? 0} shift{(period?.shifts?.length ?? 0) !== 1 ? 's' : ''} · {totalHours.toFixed(1)} hrs
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-0.5">Take-Home</p>
                    <p className="font-bold text-emerald-700 text-lg">£{takeHome.toFixed(2)}</p>
                  </div>
                  {isExpanded
                    ? <ChevronUp className="w-5 h-5 text-emerald-500" />
                    : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
              </button>

              {/* ── Expanded Detail Panel ── */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-4 border-t border-gray-100">

                  {/* Delete Confirmation */}
                  {isConfirmingDelete ? (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-3 mb-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-800 text-sm">Delete this pay period?</p>
                          <p className="text-xs text-red-600 mt-0.5">
                            This will permanently remove {period?.shifts?.length ?? 0} shift{(period?.shifts?.length ?? 0) !== 1 ? 's' : ''} and all associated data.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeletePeriod(period?.id ?? '')}
                          disabled={deletingId === period?.id}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          {deletingId === period?.id ? 'Deleting…' : 'Yes, Delete Period'}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-2 rounded-lg font-medium flex items-center justify-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Keep It
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Stats Row */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500 mb-1">Hours</p>
                      <p className="font-bold text-blue-700">{totalHours.toFixed(1)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500 mb-1">Gross</p>
                      <p className="font-bold text-slate-700">£{totalGrossPay.toFixed(2)}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500 mb-1">Deductions</p>
                      <p className="font-bold text-red-600">-£{taxCalc.totalDeductions.toFixed(2)}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-500 mb-1">Tips</p>
                      <p className="font-bold text-purple-700">£{totalTips.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Deductions Breakdown */}
                  <div className="border border-gray-100 rounded-lg overflow-hidden mb-4">
                    <div className="bg-gray-50 px-4 py-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Deductions Breakdown</span>
                    </div>
                    <div className="p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Income Tax <span className="text-xs text-gray-400">(20%)</span></span>
                        <span className="font-semibold text-red-600">-£{taxCalc.incomeTax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">National Insurance <span className="text-xs text-gray-400">(Class 1)</span></span>
                        <span className="font-semibold text-red-600">-£{taxCalc.nationalInsurance.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Pension <span className="text-xs text-gray-400">(5%)</span>
                          {!period.pensionEnabled && <span className="ml-1 text-xs text-gray-400 bg-gray-100 px-1 rounded">OFF</span>}
                        </span>
                        <span className="font-semibold text-red-600">-£{taxCalc.pension.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span className="text-gray-700">Total Deductions</span>
                        <span className="text-red-600">-£{taxCalc.totalDeductions.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Take-Home Banner */}
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg p-4 text-white mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-200" />
                        <span className="text-sm font-medium text-emerald-100">Take-Home Pay</span>
                      </div>
                      <span className="text-2xl font-bold">£{takeHome.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-emerald-200 mt-1">
                      Net pay £{taxCalc.netPay.toFixed(2)}{totalTips > 0 ? ` + Tips £${totalTips.toFixed(2)}` : ''}
                    </p>
                  </div>

                  {/* Shift List Toggle */}
                  {(period?.shifts?.length ?? 0) > 0 && (
                    <div>
                      <button
                        onClick={() => setShowShiftsId(shiftsVisible ? null : (period?.id ?? null))}
                        className="w-full text-left text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center justify-between py-2 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors mb-3"
                      >
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4" />
                          <span>Individual Shifts ({period?.shifts?.length ?? 0})</span>
                        </div>
                        {shiftsVisible ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {shiftsVisible && (
                        <div className="space-y-2 mb-3">
                          {(period?.shifts ?? []).map((shift) => (
                            <div key={shift.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-4 py-3 text-sm">
                              <div>
                                <p className="font-medium text-gray-800">
                                  {shift?.date ? format(new Date(shift.date), 'EEE, d MMM') : 'N/A'}
                                </p>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                  <Clock className="w-3 h-3" />
                                  {shift.startTime} – {shift.endTime} &nbsp;·&nbsp; {shift.hoursWorked.toFixed(2)} hrs
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-emerald-700">£{shift.grossPay.toFixed(2)}</p>
                                {(shift.tips ?? 0) > 0 && (
                                  <p className="text-xs text-purple-600">+£{shift.tips.toFixed(2)} tips</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Delete Period Button */}
                  {!isConfirmingDelete && (
                    <button
                      onClick={() => setConfirmDeleteId(period?.id ?? null)}
                      className="w-full mt-1 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete This Pay Period
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
