import React from 'react';
import { Clock, RotateCcw, X, Zap } from 'lucide-react';

interface TimeMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulatedDate: Date;
  onUpdateSimulatedDate: (newDate: Date) => void;
  onResetToRealTime: () => void;
  isSimulated: boolean;
}

export const TimeMachineModal: React.FC<TimeMachineModalProps> = ({
  isOpen,
  onClose,
  simulatedDate,
  onUpdateSimulatedDate,
  onResetToRealTime,
  isSimulated
}) => {
  if (!isOpen) return null;

  // Format inputs
  const year = simulatedDate.getFullYear();
  const month = (simulatedDate.getMonth() + 1).toString().padStart(2, '0');
  const day = simulatedDate.getDate().toString().padStart(2, '0');
  const hours = simulatedDate.getHours().toString().padStart(2, '0');
  const minutes = simulatedDate.getMinutes().toString().padStart(2, '0');

  const currentDateInput = `${year}-${month}-${day}`;
  const currentTimeInput = `${hours}:${minutes}`;

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const [y, m, d] = val.split('-').map(Number);
    const updated = new Date(simulatedDate);
    updated.setFullYear(y, m - 1, d);
    onUpdateSimulatedDate(updated);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    const [h, m] = val.split(':').map(Number);
    const updated = new Date(simulatedDate);
    updated.setHours(h, m, 0, 0);
    onUpdateSimulatedDate(updated);
  };

  const setPreset = (targetDateStr: string, hour: number, minute: number) => {
    const [y, m, d] = targetDateStr.split('-').map(Number);
    const newDate = new Date();
    newDate.setFullYear(y, m - 1, d);
    newDate.setHours(hour, minute, 0, 0);
    onUpdateSimulatedDate(newDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Campus Time Machine
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Test timetable, room occupancy &amp; holidays for any day and hour
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Date & Time Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Simulated Date
            </label>
            <input
              type="date"
              value={currentDateInput}
              onChange={handleDateChange}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Simulated Time
            </label>
            <input
              type="time"
              value={currentTimeInput}
              onChange={handleTimeChange}
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>One-Click Test Scenarios</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => setPreset('2026-11-02', 10, 15)} // Monday 10:15 AM
              className="px-2.5 py-2 text-left rounded-xl text-xs bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition"
            >
              <div className="font-semibold text-indigo-600 dark:text-indigo-400">Mon 10:15 AM</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Period 2 (Active)</div>
            </button>

            <button
              onClick={() => setPreset('2026-11-02', 13, 15)} // Monday 1:15 PM
              className="px-2.5 py-2 text-left rounded-xl text-xs bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition"
            >
              <div className="font-semibold text-teal-600 dark:text-teal-400">Mon 01:15 PM</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Lunch Break</div>
            </button>

            <button
              onClick={() => setPreset('2026-11-02', 14, 30)} // Monday 2:30 PM
              className="px-2.5 py-2 text-left rounded-xl text-xs bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition"
            >
              <div className="font-semibold text-indigo-600 dark:text-indigo-400">Mon 02:30 PM</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Labs / Period 5</div>
            </button>

            <button
              onClick={() => setPreset('2026-11-02', 18, 0)} // Monday 6:00 PM
              className="px-2.5 py-2 text-left rounded-xl text-xs bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition"
            >
              <div className="font-semibold text-rose-600 dark:text-rose-400">06:00 PM (Off-Hrs)</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">College Closed</div>
            </button>

            <button
              onClick={() => setPreset('2026-11-08', 11, 0)} // Sunday
              className="px-2.5 py-2 text-left rounded-xl text-xs bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition"
            >
              <div className="font-semibold text-rose-600 dark:text-rose-400">Sunday</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Weekend Closed</div>
            </button>

            <button
              onClick={() => setPreset('2026-11-10', 11, 0)} // Diwali
              className="px-2.5 py-2 text-left rounded-xl text-xs bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition"
            >
              <div className="font-semibold text-amber-600 dark:text-amber-400">Diwali Break</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Vacation Mode</div>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              onResetToRealTime();
              onClose();
            }}
            disabled={!isSimulated}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition ${
              isSimulated
                ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer'
                : 'text-slate-400 cursor-not-allowed opacity-50'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Real Clock</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow transition"
          >
            Apply &amp; View
          </button>
        </div>
      </div>
    </div>
  );
};
