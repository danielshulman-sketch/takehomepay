'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PlusCircle, Clock, PoundSterling, Briefcase } from 'lucide-react';
import { calculateHoursWorked } from '@/lib/tax-calculator';

interface ShiftFormProps {
  payPeriodId: string;
}

export default function ShiftForm({ payPeriodId }: ShiftFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    payRate: '12.31', // Default to Team Coach
    tips: '0',
  });

  // Pay rate options based on job roles
  const payRates = [
    { role: 'Team Coach', rate: 12.31 },
    { role: 'Shift Supervisor', rate: 12.71 },
    { role: 'Kitchen', rate: 12.86 },
  ];

  const hoursWorked = calculateHoursWorked(formData?.startTime ?? '09:00', formData?.endTime ?? '17:00');
  const grossPay = hoursWorked * parseFloat(formData?.payRate ?? '0');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: formData?.date,
          startTime: formData?.startTime,
          endTime: formData?.endTime,
          payRate: parseFloat(formData?.payRate ?? '0'),
          tips: parseFloat(formData?.tips ?? '0'),
          payPeriodId,
        }),
      });

      if (response?.ok) {
        // Reset form (keep the pay rate)
        setFormData({
          date: new Date().toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '17:00',
          payRate: formData?.payRate ?? '12.31',
          tips: '0',
        });
        router.refresh();
      } else {
        alert('Failed to save shift');
      }
    } catch (error) {
      console.error('Error saving shift:', error);
      alert('Error saving shift');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <PlusCircle className="w-6 h-6 text-emerald-600" />
        <h2 className="text-2xl font-bold text-gray-800">Add New Shift</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Shift Date
          </label>
          <input
            type="date"
            required
            value={formData?.date ?? ''}
            onChange={(e) => setFormData({ ...formData, date: e?.target?.value ?? '' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        {/* Time Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="time"
                required
                value={formData?.startTime ?? ''}
                onChange={(e) => setFormData({ ...formData, startTime: e?.target?.value ?? '' })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Finish Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="time"
                required
                value={formData?.endTime ?? ''}
                onChange={(e) => setFormData({ ...formData, endTime: e?.target?.value ?? '' })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Pay Rate and Tips */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Role
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              <select
                required
                value={formData?.payRate ?? ''}
                onChange={(e) => setFormData({ ...formData, payRate: e?.target?.value ?? '' })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent appearance-none bg-white cursor-pointer"
              >
                {payRates.map((option) => (
                  <option key={option.role} value={option.rate}>
                    {option.role} - £{option.rate.toFixed(2)}/hr
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tips (£)
            </label>
            <div className="relative">
              <PoundSterling className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={formData?.tips ?? ''}
                onChange={(e) => setFormData({ ...formData, tips: e?.target?.value ?? '' })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Calculated Values */}
        <div className="bg-emerald-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Hours Worked:</span>
            <span className="font-semibold text-gray-800">
              {hoursWorked?.toFixed?.(2) ?? '0.00'} hrs
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Gross Pay:</span>
            <span className="font-bold text-emerald-700 text-lg">
              £{grossPay?.toFixed?.(2) ?? '0.00'}
            </span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Add Shift'}
        </button>
      </form>
    </div>
  );
}
