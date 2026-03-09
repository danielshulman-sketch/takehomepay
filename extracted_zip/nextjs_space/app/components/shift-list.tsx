'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { List, Pencil, Trash2, X, Save } from 'lucide-react';
import { calculateHoursWorked } from '@/lib/tax-calculator';

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

interface ShiftListProps {
  shifts: Shift[];
}

export default function ShiftList({ shifts }: ShiftListProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);

  // Pay rate options based on job roles
  const payRates = [
    { role: 'Team Coach', rate: 12.31 },
    { role: 'Shift Supervisor', rate: 12.71 },
    { role: 'Kitchen', rate: 12.86 },
  ];

  const handleEdit = (shift: Shift) => {
    setEditingId(shift?.id ?? null);
    setEditData({
      date: format(new Date(shift?.date ?? new Date()), 'yyyy-MM-dd'),
      startTime: shift?.startTime ?? '09:00',
      endTime: shift?.endTime ?? '17:00',
      payRate: shift?.payRate?.toString() ?? '0',
      tips: shift?.tips?.toString() ?? '0',
    });
  };

  const handleSave = async (shiftId: string) => {
    try {
      const hoursWorked = calculateHoursWorked(editData?.startTime ?? '09:00', editData?.endTime ?? '17:00');
      const grossPay = hoursWorked * parseFloat(editData?.payRate ?? '0');

      const response = await fetch(`/api/shifts/${shiftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: editData?.date,
          startTime: editData?.startTime,
          endTime: editData?.endTime,
          hoursWorked,
          payRate: parseFloat(editData?.payRate ?? '0'),
          grossPay,
          tips: parseFloat(editData?.tips ?? '0'),
        }),
      });

      if (response?.ok) {
        setEditingId(null);
        setEditData(null);
        router.refresh();
      }
    } catch (error) {
      console.error('Error updating shift:', error);
    }
  };

  const handleDelete = async (shiftId: string) => {
    if (!confirm('Are you sure you want to delete this shift?')) return;

    try {
      const response = await fetch(`/api/shifts/${shiftId}`, {
        method: 'DELETE',
      });

      if (response?.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting shift:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <List className="w-6 h-6 text-emerald-600" />
        <h2 className="text-2xl font-bold text-gray-800">Shift History</h2>
      </div>

      {(shifts?.length ?? 0) === 0 ? (
        <p className="text-gray-500 text-center py-8">No shifts recorded yet</p>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto">
          {(shifts ?? []).map((shift) => (
            <div
              key={shift?.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {editingId === shift?.id ? (
                // Edit Mode
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={editData?.date ?? ''}
                      onChange={(e) => setEditData({ ...editData, date: e?.target?.value ?? '' })}
                      className="px-3 py-1 border rounded text-sm"
                    />
                    <input
                      type="time"
                      value={editData?.startTime ?? ''}
                      onChange={(e) => setEditData({ ...editData, startTime: e?.target?.value ?? '' })}
                      className="px-3 py-1 border rounded text-sm"
                    />
                    <input
                      type="time"
                      value={editData?.endTime ?? ''}
                      onChange={(e) => setEditData({ ...editData, endTime: e?.target?.value ?? '' })}
                      className="px-3 py-1 border rounded text-sm"
                    />
                    <select
                      value={editData?.payRate ?? ''}
                      onChange={(e) => setEditData({ ...editData, payRate: e?.target?.value ?? '' })}
                      className="px-3 py-1 border rounded text-sm bg-white"
                    >
                      {payRates.map((option) => (
                        <option key={option.role} value={option.rate}>
                          {option.role} - £{option.rate.toFixed(2)}/hr
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Tips (£)"
                      value={editData?.tips ?? ''}
                      onChange={(e) => setEditData({ ...editData, tips: e?.target?.value ?? '' })}
                      className="px-3 py-1 border rounded text-sm col-span-2"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(shift?.id ?? '')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded flex items-center justify-center gap-2 text-sm"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-2 rounded flex items-center justify-center gap-2 text-sm"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {shift?.date ? format(new Date(shift.date), 'EEE, d MMM yyyy') : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {shift?.startTime ?? 'N/A'} - {shift?.endTime ?? 'N/A'} ({shift?.hoursWorked?.toFixed?.(2) ?? '0.00'} hrs)
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(shift)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(shift?.id ?? '')}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Pay Rate</p>
                      <p className="font-semibold">£{shift?.payRate?.toFixed?.(2) ?? '0.00'}/hr</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Gross Pay</p>
                      <p className="font-semibold text-emerald-600">£{shift?.grossPay?.toFixed?.(2) ?? '0.00'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Tips</p>
                      <p className="font-semibold">£{shift?.tips?.toFixed?.(2) ?? '0.00'}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
