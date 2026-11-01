import React, { useState } from 'react';
import { BookOpen, Building, DoorOpen, GraduationCap, Plus, Trash2, Users, Wrench, X } from 'lucide-react';
import { Branch, Room, Semester, Professor, Subject } from '../../types';
import { RoomManager } from './RoomManager';

interface MasterDataManagerProps {
  rooms: Room[];
  branches: Branch[];
  onSaveRooms: (rooms: Room[]) => void;
  onSaveBranches: (branches: Branch[]) => void;
  onShowToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const MasterDataManager: React.FC<MasterDataManagerProps> = ({
  rooms,
  branches,
  onSaveRooms,
  onSaveBranches,
  onShowToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'rooms' | 'branches' | 'professors' | 'subjects'>('rooms');

  // Local sample professors & subjects state
  const [professors, setProfessors] = useState<Professor[]>([
    { id: 'prof_sharma', name: 'Dr. Ramesh Sharma', email: 'r.sharma@collegeconnect.edu.in', department: 'CSE' },
    { id: 'prof_verma', name: 'Prof. Anjali Verma', email: 'a.verma@collegeconnect.edu.in', department: 'CSE' },
    { id: 'prof_rao', name: 'Dr. Arvind Rao', email: 'a.rao@collegeconnect.edu.in', department: 'CSE-AI' },
    { id: 'prof_joshi', name: 'Dr. H. P. Joshi', email: 'h.joshi@collegeconnect.edu.in', department: 'Civil' },
    { id: 'prof_bansal', name: 'Dr. V. K. Bansal', email: 'v.bansal@collegeconnect.edu.in', department: 'Mechanical' }
  ]);

  const [subjects, setSubjects] = useState<Subject[]>([
    { id: 'CS501', code: 'CS501', name: 'Distributed Systems', branch_id: 'CSE', semester_id: 'SEM5' },
    { id: 'CS502', code: 'CS502', name: 'Compiler Design', branch_id: 'CSE', semester_id: 'SEM5' },
    { id: 'AI501', code: 'AI501', name: 'Deep Learning & PyTorch', branch_id: 'CSE-AI', semester_id: 'SEM5' },
    { id: 'CE501', code: 'CE501', name: 'Structural Analysis II', branch_id: 'Civil', semester_id: 'SEM5' },
    { id: 'ME501', code: 'ME501', name: 'Thermodynamics & Heat Transfer', branch_id: 'Mechanical', semester_id: 'SEM5' }
  ]);

  return (
    <div className="space-y-6">
      {/* Sub-Tabs Selector */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('rooms')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeSubTab === 'rooms'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <DoorOpen className="w-3.5 h-3.5" />
          <span>Classrooms &amp; Facilities ({rooms.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('branches')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeSubTab === 'branches'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Branches ({branches.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('professors')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeSubTab === 'professors'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Faculty &amp; Professors ({professors.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('subjects')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeSubTab === 'subjects'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Courses &amp; Subjects ({subjects.length})</span>
        </button>
      </div>

      {/* Sub-tab Views */}
      {activeSubTab === 'rooms' && (
        <RoomManager
          rooms={rooms}
          onSaveRooms={onSaveRooms}
          onShowToast={onShowToast}
        />
      )}

      {activeSubTab === 'branches' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Engineering Branches &amp; Departments
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {branches.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{b.name}</span>
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: b.color || '#4F46E5' }}
                  />
                </div>
                <div className="text-xs text-slate-500 font-mono">
                  Code: {b.code} · ID: {b.id}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'professors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Faculty Directory
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {professors.map((p) => (
              <div
                key={p.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1 shadow-sm"
              >
                <div className="font-bold text-sm text-slate-900 dark:text-white">{p.name}</div>
                <div className="text-xs text-slate-500">{p.email || 'No email provided'}</div>
                <div className="text-[11px] font-semibold text-indigo-500 pt-1">
                  Department: {p.department}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'subjects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Academic Course Catalog
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {subjects.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs font-mono text-indigo-500">{s.code}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">{s.branch_id}</span>
                </div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">{s.name}</div>
                <div className="text-[11px] text-slate-500">{s.semester_id}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
