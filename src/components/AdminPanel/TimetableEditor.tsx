import React, { useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  Edit,
  Plus,
  Trash2,
  X,
  BookOpen,
  MapPin,
  Clock,
  User
} from 'lucide-react';
import {
  Branch,
  BranchId,
  ClassType,
  DayOfWeek,
  Period,
  Room,
  TimetableSlot
} from '../../types';
import { DAYS_OF_WEEK } from '../../utils/timeEngine';

interface TimetableEditorProps {
  branches: Branch[];
  rooms: Room[];
  periods: Period[];
  timetable: TimetableSlot[];
  onSaveTimetable: (updated: TimetableSlot[]) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const TimetableEditor: React.FC<TimetableEditorProps> = ({
  branches,
  rooms,
  periods,
  timetable,
  onSaveTimetable,
  onShowToast
}) => {
  const [selectedBranchId, setSelectedBranchId] = useState<BranchId>('CSE');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');

  // Modal State for Add / Edit
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [targetPeriod, setTargetPeriod] = useState<Period | null>(null);
  const [modalSubject, setModalSubject] = useState('');
  const [modalTeacher, setModalTeacher] = useState('');
  const [modalRoomId, setModalRoomId] = useState('');
  const [modalType, setModalType] = useState<ClassType>('Lecture');
  const [modalNotes, setModalNotes] = useState('');

  // Copy routine modal
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyTargetBranch, setCopyTargetBranch] = useState<BranchId>(selectedBranchId);
  const [copyTargetDay, setCopyTargetDay] = useState<DayOfWeek>('Tuesday');

  const selectedBranch = branches.find((b) => b.id === selectedBranchId) || branches[0];

  // Slots for active branch and day
  const currentSlots = timetable.filter(
    (s) => s.branch === selectedBranchId && s.day === selectedDay
  );

  const openSlotEditor = (period: Period, existingSlot?: TimetableSlot) => {
    setTargetPeriod(period);
    if (existingSlot) {
      setEditingSlot(existingSlot);
      setModalSubject(existingSlot.subject);
      setModalTeacher(existingSlot.teacher);
      setModalRoomId(existingSlot.roomId);
      setModalType(existingSlot.type);
      setModalNotes(existingSlot.notes || '');
    } else {
      setEditingSlot(null);
      setModalSubject('');
      setModalTeacher('');
      // Default to first room
      setModalRoomId(rooms[0]?.id || '');
      setModalType('Lecture');
      setModalNotes('');
    }
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPeriod || !modalSubject.trim() || !modalRoomId) return;

    // Check clash: Is this room occupied by another branch on this day and period?
    const clash = timetable.find(
      (s) =>
        s.day === selectedDay &&
        s.periodId === targetPeriod.id &&
        s.roomId === modalRoomId &&
        s.id !== editingSlot?.id
    );

    if (clash) {
      onShowToast(
        `Clash detected! Room ${modalRoomId} is already booked by ${clash.branch} (${clash.subject})`,
        'error'
      );
      return;
    }

    if (editingSlot) {
      // Update
      const updated = timetable.map((s) =>
        s.id === editingSlot.id
          ? {
              ...s,
              subject: modalSubject.trim(),
              teacher: modalTeacher.trim() || 'Faculty',
              roomId: modalRoomId,
              type: modalType,
              notes: modalNotes
            }
          : s
      );
      onSaveTimetable(updated);
      onShowToast('Class updated successfully', 'success');
    } else {
      // Insert
      const newSlot: TimetableSlot = {
        id: `slot-${Date.now()}`,
        branch: selectedBranchId,
        day: selectedDay,
        periodId: targetPeriod.id,
        subject: modalSubject.trim(),
        teacher: modalTeacher.trim() || 'Faculty',
        roomId: modalRoomId,
        type: modalType,
        notes: modalNotes
      };
      onSaveTimetable([...timetable, newSlot]);
      onShowToast('New class scheduled successfully', 'success');
    }

    setTargetPeriod(null);
  };

  const handleDeleteSlot = (id: string) => {
    onSaveTimetable(timetable.filter((s) => s.id !== id));
    onShowToast('Class removed from schedule', 'info');
    setTargetPeriod(null);
  };

  const handleExecuteCopy = () => {
    // Copy currentSlots to copyTargetBranch and copyTargetDay
    if (currentSlots.length === 0) {
      onShowToast('No classes to copy from this day', 'error');
      return;
    }

    // Filter out target existing slots for that branch & day
    const filtered = timetable.filter(
      (s) => !(s.branch === copyTargetBranch && s.day === copyTargetDay)
    );

    const cloned = currentSlots.map((s, idx) => ({
      ...s,
      id: `slot-copy-${Date.now()}-${idx}`,
      branch: copyTargetBranch,
      day: copyTargetDay
    }));

    onSaveTimetable([...filtered, ...cloned]);
    onShowToast(`Copied routine to ${copyTargetBranch} (${copyTargetDay})!`, 'success');
    setShowCopyModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Selector Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Branch Picker */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Select Branch
            </label>
            <select
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value as BranchId)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          {/* Day Picker */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Day of Week
            </label>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 1-Click Copy Routine Button */}
        <button
          onClick={() => setShowCopyModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition self-start sm:self-auto"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy Routine to Another Day/Branch</span>
        </button>
      </div>

      {/* Editable Periods Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {periods.map((p) => {
          if (p.isBreak) {
            return (
              <div
                key={p.id}
                className="col-span-full py-2.5 px-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-between text-xs font-bold"
              >
                <span>☕ {p.label}</span>
                <span className="font-mono">{p.start} - {p.end}</span>
              </div>
            );
          }

          const slot = currentSlots.find((s) => s.periodId === p.id);

          return (
            <div
              key={p.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:border-indigo-400 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                    {p.label}
                  </span>
                  <span className="font-mono text-xs text-slate-400">
                    {p.start} - {p.end}
                  </span>
                </div>

                {slot ? (
                  <div className="space-y-1.5 my-2">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {slot.subject}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Faculty: {slot.teacher}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300">
                        {slot.roomId}
                      </span>
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {slot.type}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400 italic">
                    Unassigned slot
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                {slot && (
                  <button
                    onClick={() => handleDeleteSlot(slot.id)}
                    title="Remove class"
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => openSlotEditor(p, slot)}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 transition"
                >
                  {slot ? <Edit className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>{slot ? 'Edit' : 'Schedule'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Class Modal */}
      {targetPeriod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingSlot ? 'Edit Class' : 'Schedule New Class'} – {targetPeriod.label}
              </h3>
              <button
                onClick={() => setTargetPeriod(null)}
                aria-label="Close"
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="space-y-4 my-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject / Course Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Operating Systems"
                  value={modalSubject}
                  onChange={(e) => setModalSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Teacher / Professor
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Ramesh Sharma"
                  value={modalTeacher}
                  onChange={(e) => setModalTeacher(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Room *
                  </label>
                  <select
                    value={modalRoomId}
                    onChange={(e) => setModalRoomId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {rooms.map((r) => {
                      // Check if room has clash in this slot
                      const isBooked = timetable.some(
                        (s) =>
                          s.day === selectedDay &&
                          s.periodId === targetPeriod.id &&
                          s.roomId === r.id &&
                          s.id !== editingSlot?.id
                      );

                      return (
                        <option
                          key={r.id}
                          value={r.id}
                          disabled={r.isMaintenance || isBooked}
                        >
                          {r.name} {isBooked ? '(Occupied)' : r.isMaintenance ? '(Maint)' : '(Free)'}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Class Type
                  </label>
                  <select
                    value={modalType}
                    onChange={(e) => setModalType(e.target.value as ClassType)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Lab Experiment</option>
                    <option value="Tutorial">Tutorial / Seminar</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTargetPeriod(null)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow"
                >
                  Save Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Copy Routine Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Copy Routine from {selectedBranch.name} ({selectedDay})
            </h3>
            <p className="text-xs text-slate-500">
              Duplicate all {currentSlots.length} classes to another target branch and day:
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Destination Branch</label>
                <select
                  value={copyTargetBranch}
                  onChange={(e) => setCopyTargetBranch(e.target.value as BranchId)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Destination Day</label>
                <select
                  value={copyTargetDay}
                  onChange={(e) => setCopyTargetDay(e.target.value as DayOfWeek)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowCopyModal(false)}
                className="px-3 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteCopy}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow"
              >
                Execute Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
