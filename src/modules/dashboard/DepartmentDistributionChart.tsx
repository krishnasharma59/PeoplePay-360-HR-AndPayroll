import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { DEPARTMENT_DISTRIBUTIONS } from '../../data/mockData';
import { formatCurrency, formatNumber } from '../../utils/utils';

export function DepartmentDistributionChart() {
  const totalCost = DEPARTMENT_DISTRIBUTIONS.reduce((acc, curr) => acc + curr.totalCost, 0);
  const totalHeadcount = DEPARTMENT_DISTRIBUTIONS.reduce((acc, curr) => acc + curr.headcount, 0);

  return (
    <Card className="col-span-1">
      <CardHeader>
        <div>
          <CardTitle>Department Allocation</CardTitle>
          <CardDescription>Monthly payroll expense and staffing share</CardDescription>
        </div>
        <div className="text-right">
          <span className="text-xs font-semibold text-slate-900">{formatNumber(totalHeadcount)} People</span>
          <p className="text-[10px] text-slate-400">Total Headcount</p>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress Bar Distribution Header */}
        <div className="w-full h-3 bg-slate-100 rounded-full flex overflow-hidden mb-6">
          {DEPARTMENT_DISTRIBUTIONS.map((dept, index) => {
            const percentage = (dept.totalCost / totalCost) * 100;
            return (
              <div
                key={index}
                style={{ width: `${percentage}%`, backgroundColor: dept.color }}
                title={`${dept.department}: ${percentage.toFixed(1)}%`}
                className="h-full transition-all"
              />
            );
          })}
        </div>

        {/* Detailed Breakdown List */}
        <div className="space-y-3.5">
          {DEPARTMENT_DISTRIBUTIONS.map((dept) => {
            const costPct = ((dept.totalCost / totalCost) * 100).toFixed(1);
            return (
              <div key={dept.department} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: dept.color }}
                  />
                  <div>
                    <p className="font-semibold text-slate-800">{dept.department}</p>
                    <p className="text-[11px] text-slate-400">{dept.headcount} employees</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-slate-900">{formatCurrency(dept.totalCost)}</p>
                  <p className="text-[11px] text-slate-400 font-medium">{costPct}% of total</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}