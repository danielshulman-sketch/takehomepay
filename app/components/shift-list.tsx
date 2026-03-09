'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { List, Pencil, Trash2, X, Save, AlertTriangle, Check } from 'lucide-react';
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
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const payRates = [
    { role: 'Team Coach', rate: 12.31 },
    { role: 'Shift Supervisor', rate: 12.71 },
    { role: 'Kitchen', rate: 12.86 },
  ];

  const handleEdit = (shift: Shift) => {
    setConfirmDeleteId(null);
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

  const handleDeleteConfirm = async (shiftId: string) => {
    setDeletingId(shiftId);
    try {
      const response = await fetch(`/api/shifts/${shiftId}`, {
        method: 'DELETE',
      });

      if (response?.ok) {
        setConfirmDeleteId(null);
        router.refresh();
      }
    } catch (error) {
      console.error('Error deleting shift:', error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <List className="w-6 h-6 text-emerald-600" />
          <h2 className="text-2xl font-bold text-gray-800">Shift History</h2>
        </div>
        {(shifts?.length ?? 0) > 0 && (
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {shifts.length} shift{shifts.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {(shifts?.length ?? 0) === 0 ? (
        <div className="text-center py-12">
          <List className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No shifts recorded yet</p>
          <p className="text-gray-400 text-sm mt-1">Add your first shift using the form on the left</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {(shifts ?? []).map((shift) => (
            <div
              key={shift?.id}
              className={`border rounded-lg p-4 transition-all ${
                confirmDeleteId === shift?.id
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-200 hover:shadow-md hover:border-emerald-200'
              }`}
            >
              {editingId === shift?.id ? (
                // Edit Mode
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-2">Editing Shift</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Date</label>
                      <input
                        type="date"
                        value={editData?.date ?? ''}
                        onChange={(e) => setEditData({ ...editData, date: e?.target?.value ?? '' })}
                        className="w-full px-3 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Pay Rate</label>
                      <select
                        value={editData?.payRate ?? ''}
                        onChange={(e) => setEditData({ ...editData, payRate: e?.target?.value ?? '' })}
                        className="w-full px-3 py-1.5 border rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      >
                        {payRates.map((option) => (
                          <option key={option.role} value={option.rate}>
                            {option.role} — £{option.rate.toFixed(2)}/hr
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Start Time</label>
                      <input
                        type="time"
                        value={editData?.startTime ?? ''}
                        onChange={(e) => setEditData({ ...editData, startTime: e?.target?.value ?? '' })}
                        className="w-full px-3 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">End Time</label>
                      <input
                        type="time"
                        value={editData?.endTime ?? ''}
                        onChange={(e) => setEditData({ ...editData, endTime: e?.target?.value ?? '' })}
                        className="w-full px-3 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 mb-1 block">Tips (£)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={editData?.tips ?? ''}
                        onChange={(e) => setEditData({ ...editData, tips: e?.target?.value ?? '' })}
                        className="w-full px-3 py-1.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleSave(shift?.id ?? '')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                    <button
                      onClick={() => { setEditingId(null); setEditData(null); }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : confirmDeleteId === shift?.id ? (
                // Delete Confirmation Mode
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Delete this shift?</p>
                      <p className="text-xs text-red-600">
                        {shift?.date ? format(new Date(shift.date), 'EEE, d MMM yyyy') : 'N/A'} &nbsp;·&nbsp;
                        {shift?.startTime} – {shift?.endTime} &nbsp;·&nbsp; £{shift?.grossPay?.toFixed?.(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDeleteConfirm(shift?.id ?? '')}
                      disabled={deletingId === shift?.id}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deletingId === shift?.id ? 'Deleting…' : 'Yes, Delete'}
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Keep Shift
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
                      <p className="text-sm text-gray-500">
                        {shift?.startTime ?? 'N/A'} – {shift?.endTime ?? 'N/A'}&nbsp;&nbsp;·&nbsp;&nbsp;
                        {shift?.hoursWorked?.toFixed?.(2) ?? '0.00'} hrs
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(shift)}
                        title="Edit shift"
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(shift?.id ?? '')}
                        title="Delete shift"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-gray-500 text-xs">Pay Rate</p>
                      <p className="font-semibold text-gray-800">£{shift?.payRate?.toFixed?.(2) ?? '0.00'}/hr</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-2">
                      <p className="text-gray-500 text-xs">Gross Pay</p>
                      <p className="font-semibold text-emerald-700">£{shift?.grossPay?.toFixed?.(2) ?? '0.00'}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2">
                      <p className="text-gray-500 text-xs">Tips</p>
                      <p className="font-semibold text-purple-700">£{shift?.tips?.toFixed?.(2) ?? '0.00'}</p>
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
