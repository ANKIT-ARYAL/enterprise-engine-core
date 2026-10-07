'use client';

import React from 'react';
import { 
  Megaphone, BookOpen, Plus, Info, ChevronRight, 
  MoreHorizontal, Calendar, ArrowUpRight
} from 'lucide-react';

export default function AcademyDashboard() {
  return (
    <div className="animate-in fade-in duration-500 max-w-[1200px] mx-auto space-y-6">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Academy Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Good morning, Teacher. Here's a quick overview of today's activity.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-btn-bg text-btn-text text-xs font-medium rounded-btn hover:bg-btn-hover hover:text-btn-hover-text transition-colors shadow-sm">
            <Megaphone size={14} /> New Announcement
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-card-bg border border-card-border text-surface-text opacity-90 text-xs font-medium rounded-btn hover:bg-card-hover transition-colors shadow-sm">
            <BookOpen size={14} /> Gradebook
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-card-bg border border-card-border text-surface-text opacity-90 text-xs font-medium rounded-btn hover:bg-card-hover transition-colors shadow-sm">
            <Plus size={14} /> Add Assignment
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Stat 1 */}
        <div className="bg-card-bg border border-card-border rounded-card p-4 shadow-sm flex flex-col justify-between h-[120px] hover:bg-card-hover transition-colors">
          <div className="flex justify-between items-start">
            <h3 className="text-[13px] font-semibold text-slate-700">Students Taught</h3>
            <Info size={14} className="text-slate-400" />
          </div>
          <div className="mt-auto">
            <div className="flex items-end gap-3 mb-1">
              <span className="text-3xl font-light text-slate-900 tracking-tight">128</span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 mb-1">
                <ArrowUpRight size={10} /> 2.8%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 text-right">across 5 Grade 11 sections</p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-card-bg border border-card-border rounded-card p-4 shadow-sm flex flex-col justify-between h-[120px] hover:bg-card-hover transition-colors">
          <div className="flex justify-between items-start">
            <h3 className="text-[13px] font-semibold text-slate-700">Avg. Attendance</h3>
            <Info size={14} className="text-slate-400" />
          </div>
          <div className="mt-auto">
            <div className="flex items-end gap-3 mb-1">
              <span className="text-3xl font-light text-slate-900 tracking-tight">94.2%</span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 mb-1">
                <ArrowUpRight size={10} /> 1.1%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 text-right">vs last month</p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-card-bg border border-card-border rounded-card p-4 shadow-sm flex flex-col justify-between h-[120px] hover:bg-card-hover transition-colors">
          <div className="flex justify-between items-start">
            <h3 className="text-[13px] font-semibold text-slate-700">Assignments</h3>
            <Info size={14} className="text-slate-400" />
          </div>
          <div className="mt-auto">
            <div className="flex items-end gap-3 mb-1">
              <span className="text-3xl font-light text-slate-900 tracking-tight">81</span>
            </div>
            <p className="text-[11px] text-slate-500 text-right">63 pending · 18 overdue</p>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-card-bg border border-card-border rounded-card p-4 shadow-sm flex flex-col justify-between h-[120px] hover:bg-card-hover transition-colors">
          <div className="flex justify-between items-start">
            <h3 className="text-[13px] font-semibold text-slate-700">Classes Today</h3>
            <Info size={14} className="text-slate-400" />
          </div>
          <div className="mt-auto">
            <div className="flex items-end gap-3 mb-1">
              <span className="text-3xl font-light text-slate-900 tracking-tight">5</span>
            </div>
            <p className="text-[11px] text-slate-500 text-right">1 in progress · 3 upcoming · 1 cancelled</p>
          </div>
        </div>

      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Class Schedule */}
        <div className="bg-card-bg border border-card-border rounded-card p-5 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800">Class Schedule</h3>
            <button className="text-[11px] font-medium text-slate-500 flex items-center gap-1 hover:text-slate-900 transition-colors">
              View Full Schedule <ChevronRight size={12} />
            </button>
          </div>

          <div className="space-y-4">
            {[
              { time: '08:00 - 08:45', date: 'Wednesday, 7 October', title: 'Pure Mathematics', meta: 'Grade 11A · Room 2.14', status: 'In Progress', statusColor: 'text-emerald-600 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
              { time: '09:00 - 09:45', date: 'Wednesday, 7 October', title: 'English Literature', meta: 'Grade 11B · Seminar Room 3', status: 'Upcoming', statusColor: 'text-amber-600 bg-amber-50 border-amber-200', dot: 'bg-amber-400' },
              { time: '10:00 - 10:45', date: 'Wednesday, 7 October', title: 'Physics', meta: 'Grade 11C · Physics Lab', status: 'Upcoming', statusColor: 'text-amber-600 bg-amber-50 border-amber-200', dot: 'bg-amber-400' },
              { time: '11:00 - 11:45', date: 'Wednesday, 7 October', title: 'Modern European History', meta: 'Grade 11A · Room 1.08', status: 'Cancelled', statusColor: 'text-rose-600 bg-rose-50 border-rose-200', dot: 'bg-rose-500' },
              { time: '12:00 - 12:45', date: 'Wednesday, 7 October', title: 'Computer Science', meta: 'Grade 11B · Computing Lab', status: 'Upcoming', statusColor: 'text-amber-600 bg-amber-50 border-amber-200', dot: 'bg-amber-400' },
            ].map((cls, i) => (
              <div key={i} className="flex gap-4 items-start group">
                <div className={`w-1 shrink-0 h-10 rounded-full mt-1 ${cls.dot}`}></div>
                <div className="w-[120px] shrink-0 pt-0.5">
                  <div className="text-[12px] font-bold text-slate-700">{cls.time}</div>
                  <div className="text-[10px] text-slate-400">{cls.date}</div>
                </div>
                <div className="flex-1 pt-0.5 min-w-0">
                  <div className="text-[13px] font-bold text-slate-800 truncate">{cls.title}</div>
                  <div className="text-[11px] text-slate-500 truncate">{cls.meta}</div>
                </div>
                <div className="shrink-0 pt-1">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border ${cls.statusColor}`}>
                    {cls.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assignment Status (Chart Mockup) */}
        <div className="bg-card-bg border border-card-border rounded-card p-5 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800">Assignment Status</h3>
            <button className="text-[11px] font-medium text-slate-500 flex items-center gap-1 hover:text-slate-900 transition-colors">
              View Report <ChevronRight size={12} />
            </button>
          </div>
          
          <div className="flex gap-4 text-[10px] font-bold text-slate-600 mb-6">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-rose-500"></div> Overdue</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-400"></div> Pending</div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-700"></div> Submitted</div>
          </div>

          <div className="flex-1 flex items-end justify-between px-2 pb-6 relative h-[200px]">
            {/* Chart Bars - Simplified visual rep */}
            {[
              { label: 'G11A', sub: 40, pend: 60, over: 10 },
              { label: 'G11B', sub: 70, pend: 30, over: 15 },
              { label: 'G11C', sub: 50, pend: 40, over: 25 },
              { label: 'G11D', sub: 45, pend: 80, over: 20 },
              { label: 'G11E', sub: 30, pend: 15, over: 5 },
            ].map((col, i) => (
              <div key={i} className="flex gap-1.5 items-end h-full relative group">
                <div className="w-6 bg-slate-700 rounded-t-sm" style={{ height: `${col.sub}%` }}></div>
                <div className="w-6 bg-slate-400 rounded-t-sm" style={{ height: `${col.pend}%` }}></div>
                <div className="w-6 bg-rose-500 rounded-t-sm" style={{ height: `${col.over}%` }}></div>
                
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-medium text-slate-500">
                  {col.label}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-12">
        
        {/* Performance Highlights */}
        <div className="bg-card-bg border border-card-border rounded-card p-5 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800">Performance Highlights</h3>
            <button className="text-[11px] font-medium text-slate-500 flex items-center gap-1 hover:text-slate-900 transition-colors">
              View Insights <ChevronRight size={12} />
            </button>
          </div>

          <div className="relative pt-4 pb-8 space-y-8">
            {/* Grid lines */}
            <div className="absolute inset-0 flex justify-between px-12 pointer-events-none">
              <div className="w-px h-full bg-slate-100"></div>
              <div className="w-px h-full bg-slate-100"></div>
              <div className="w-px h-full bg-slate-100"></div>
              <div className="w-px h-full bg-slate-100"></div>
              <div className="w-px h-full bg-slate-100"></div>
            </div>

            {/* Rows */}
            {[
              { label: 'G11A', title: 'Pure Math', left: '20%', width: '40%', score: '84%', users: ['AI', 'EN', 'SW'] },
              { label: 'G11B', title: 'Literature', left: '10%', width: '35%', score: '78%', users: ['IA'] },
              { label: 'G11C', title: 'Physics', left: '35%', width: '35%', score: '80%', users: ['AI', 'MN', 'NM'] },
              { label: 'G11D', title: 'History', left: '45%', width: '30%', score: '73%', users: ['EJ', 'WJ'] },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-4 relative z-10">
                <div className="w-8 shrink-0 text-[11px] font-medium text-slate-500">{row.label}</div>
                <div className="flex-1 relative h-7">
                  <div 
                    className="absolute top-0 h-full bg-slate-700 rounded-full flex items-center pr-3 shadow-sm"
                    style={{ left: row.left, width: row.width }}
                  >
                    <div className="flex -space-x-1.5 ml-1 bg-white p-0.5 rounded-full border border-slate-200">
                      {row.users.map((u, ui) => (
                        <div key={ui} className="w-5 h-5 rounded-full bg-slate-200 border border-white flex items-center justify-center text-[8px] font-bold text-slate-600">
                          {u}
                        </div>
                      ))}
                    </div>
                    <span className="text-[11px] text-white font-medium ml-2 truncate">{row.title}</span>
                  </div>
                  <div 
                    className="absolute top-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded"
                    style={{ left: `calc(${row.left} + ${row.width} + 8px)` }}
                  >
                    {row.score}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Bottom Labels */}
            <div className="absolute bottom-0 left-0 w-full flex justify-between px-12 text-[10px] font-medium text-slate-400">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span>
            </div>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-card-bg border border-card-border rounded-card p-5 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-slate-800">Upcoming Events</h3>
            <button className="text-[11px] font-medium text-slate-500 flex items-center gap-1 hover:text-slate-900 transition-colors">
              View Calendar <ChevronRight size={12} />
            </button>
          </div>

          <div className="space-y-4">
            {[
              { date: '13', month: 'OCT', title: 'Science Exhibition', time: '08:30 AM - 12:30 PM', badge: 'On Campus' },
              { date: '16', month: 'OCT', title: "Parents' Evening", time: '02:00 PM - 05:00 PM', badge: 'Meeting' },
              { date: '19', month: 'OCT', title: 'Inter-House Sports Day', time: '09:00 AM - 04:00 PM', badge: 'Sports' },
              { date: '22', month: 'OCT', title: 'Grade 11 Mock Exam', time: '09:00 AM - 12:00 PM', badge: 'Exam' },
              { date: '25', month: 'OCT', title: 'Department Planning', time: '03:30 PM - 04:30 PM', badge: 'Meeting' },
            ].map((ev, i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-11 h-12 shrink-0 border border-[#ececec] rounded-lg flex flex-col items-center justify-center bg-slate-50">
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">{ev.month}</span>
                  <span className="text-[15px] font-bold text-slate-700 leading-none mt-0.5">{ev.date}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[13px] font-bold text-slate-800 truncate">{ev.title}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{ev.time}</p>
                </div>
                <div className="shrink-0">
                  <span className="text-[9px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md border border-slate-200">
                    {ev.badge}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
