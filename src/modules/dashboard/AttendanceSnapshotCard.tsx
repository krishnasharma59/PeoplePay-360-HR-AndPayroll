import React from 'react';
import { Users, Building, Laptop, CalendarOff } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { ATTENDANCE_METRICS } from '../../data/mockData';

export function AttendanceSnapshotCard() {
  const { totalEligible, presentTotal, inOffice, remote, onLeave } = ATTENDANCE_METRICS;
  const attendanceRate = ((presentTotal / totalEligible) * 100).toFixed(1);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <div>
          <CardTitle>Attendance & Leave Today</CardTitle>
          <CardDescription>Live workforce distribution snapshot</CardDescription>
        </div>
        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          {attendanceRate}% Present
        </span>
      </CardHeader>
      <CardContent>
        {/* Attendance Ratio Bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full flex overflow-hidden mb-5">
          <div
            style={{ width: `${(inOffice / totalEligible) * 100}%` }}
            className="bg-brand-600 h-full"
            title="In Office"
          />
          <div
            style={{ width: `${(remote / totalEligible) * 100}%` }}
            className="bg-sky-400 h-full"
            title="Remote"
          />
          <div
            style={{ width: `${(onLeave / totalEligible) * 100}%` }}
            className="bg-amber-400 h-full"
            title="On Leave"
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center justify-center text-brand-600 mb-1">
              <Building className="w-4 h-4" />
            </div>
            <p className="text-base font-bold text-slate-900">{inOffice}</p>
            <p className="text-[11px] text-slate-500 font-medium">In Office</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center justify-center text-sky-600 mb-1">
              <Laptop className="w-4 h-4" />
            </div>
            <p className="text-base font-bold text-slate-900">{remote}</p>
            <p className="text-[11px] text-slate-500 font-medium">Remote</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center justify-center text-amber-600 mb-1">
              <CalendarOff className="w-4 h-4" />
            </div>
            <p className="text-base font-bold text-slate-900">{onLeave}</p>
            <p className="text-[11px] text-slate-500 font-medium">On Leave</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Clock-in compliance: 98.4%</span>
          <button className="text-brand-600 font-medium hover:underline">
            View Live Roster →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}