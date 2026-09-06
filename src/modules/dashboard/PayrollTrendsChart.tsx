import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { PAYROLL_TRENDS } from '../../data/mockData';
import { formatCurrency } from '../../utils/utils';

export function PayrollTrendsChart() {
  const [timeRange, setTimeRange] = useState('6m');

  const tabs = [
    { id: '3m', label: 'Last 3M' },
    { id: '6m', label: 'Last 6M' },
    { id: 'ytd', label: 'YTD 2026' },
  ];

  // Custom clean tooltip matching light theme
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry: any) => sum + (entry.value || 0), 0);
      return (
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-dropdown text-xs min-w-44">
          <p className="font-bold text-slate-800 border-b border-slate-100 pb-1.5 mb-2">
            {label} 2026 Payroll Breakdown
          </p>
          <div className="space-y-1.5">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-slate-500 text-[11px]">{entry.name}:</span>
                </div>
                <span className="font-semibold text-slate-900">{formatCurrency(entry.value)}</span>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between font-bold text-slate-900">
              <span>Total Outflow:</span>
              <span className="text-brand-600">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const chartData = timeRange === '3m' ? PAYROLL_TRENDS.slice(-3) : PAYROLL_TRENDS;

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <CardTitle>Payroll Outflow Trends & Breakdown</CardTitle>
          <CardDescription>
            Gross salary, bonuses, overtime, and statutory employer contributions
          </CardDescription>
        </div>
        <Tabs tabs={tabs} activeTab={timeRange} onChange={setTimeRange} />
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 11 }}
                tickFormatter={(val) => `$${val / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '14px', fontSize: '11px', color: '#64748B' }}
              />
              <Bar dataKey="baseSalary" name="Base Salary" stackId="a" fill="#2563EB" radius={[0, 0, 0, 0]} />
              <Bar dataKey="overtime" name="Overtime" stackId="a" fill="#60A5FA" />
              <Bar dataKey="bonuses" name="Bonuses & Comm." stackId="a" fill="#818CF8" />
              <Bar dataKey="employerTaxes" name="Employer Taxes" stackId="a" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}