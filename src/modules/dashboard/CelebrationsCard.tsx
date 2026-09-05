import React from 'react';
import { Cake, Award, Sparkles, Gift } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { CELEBRATIONS } from '../../data/mockData';

export function CelebrationsCard() {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-brand-600" />
          <CardTitle>Milestones & Celebrations</CardTitle>
        </div>
        <CardDescription>Upcoming birthdays & work anniversaries</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100">
          {CELEBRATIONS.map((c) => {
            const isAnniversary = c.type === 'anniversary';
            return (
              <div
                key={c.id}
                className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={c.employeeName} src={c.avatarUrl} size="md" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {c.employeeName}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{c.department}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      {isAnniversary ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-1.5 py-0.2 rounded-md">
                          <Award className="w-3 h-3 text-indigo-600 shrink-0" />
                          <span>{c.years} yr Anniversary</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-1.5 py-0.2 rounded-md">
                          <Cake className="w-3 h-3 text-amber-600 shrink-0" />
                          <span>Birthday</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                    {c.date}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-3 bg-slate-50/60 border-t border-slate-100 text-center">
          <button className="text-[11px] font-medium text-brand-600 hover:text-brand-700 transition-colors inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Send automated team congratulations</span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
