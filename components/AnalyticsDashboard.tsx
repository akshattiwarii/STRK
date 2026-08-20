"use client";

import React, { useMemo } from "react";
import { DailyLog, StreakStats } from "@/lib/types";
import { ALL_CATEGORIES } from "@/lib/streakEngine";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from "recharts";
import { 
  TrendingUp, 
  Flame, 
  PieChart as PieIcon, 
  Calendar, 
  Award, 
  Sparkles, 
  ArrowUpRight,
  Zap
} from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, subMonths } from "date-fns";

interface AnalyticsDashboardProps {
  logs: DailyLog[];
  stats: StreakStats;
}

const CATEGORY_COLORS: Record<string, string> = {
  DSA: "#FF5722",
  Gym: "#00F5D4",
  Coding: "#9D4EDD",
  Reading: "#FFB800",
  Project: "#00BBF9",
  Health: "#10B981",
  "Deep Work": "#F43F5E",
  Writing: "#A855F7",
};

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  logs,
  stats,
}) => {
  // 1. Last 14 days activity graph data
  const activityTrendData = useMemo(() => {
    const today = new Date();
    const data = [];
    for (let i = 13; i >= 0; i--) {
      const d = subDays(today, i);
      const dateStr = format(d, "yyyy-MM-dd");
      const dayLogs = logs.filter((l) => l.date === dateStr);
      data.push({
        date: format(d, "MMM d"),
        count: dayLogs.length,
        xp: dayLogs.reduce((acc, l) => acc + l.xpEarned, 0),
      });
    }
    return data;
  }, [logs]);

  // 2. Category distribution
  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach((log) => {
      log.categories.forEach((cat) => {
        counts[cat] = (counts[cat] || 0) + 1;
      });
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: CATEGORY_COLORS[name] || "#FF8A00",
    }));
  }, [logs]);

  // 3. Day of week heat breakdown (Mon - Sun)
  const dayOfWeekData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = [0, 0, 0, 0, 0, 0, 0];

    logs.forEach((log) => {
      const d = new Date(log.date);
      counts[d.getDay()] += 1;
    });

    return days.map((day, idx) => ({
      day,
      logs: counts[idx],
    }));
  }, [logs]);

  // 4. Month over Month comparison
  const momStats = useMemo(() => {
    const today = new Date();
    const lastMonth = subMonths(today, 1);

    const thisMonthLogs = logs.filter((l) => isSameMonth(new Date(l.date), today)).length;
    const lastMonthLogs = logs.filter((l) => isSameMonth(new Date(l.date), lastMonth)).length;

    const diff = thisMonthLogs - lastMonthLogs;
    const growth = lastMonthLogs > 0 ? Math.round((diff / lastMonthLogs) * 100) : 100;

    return {
      thisMonthLogs,
      lastMonthLogs,
      growth,
    };
  }, [logs]);

  return (
    <div className="space-y-6">
      
      {/* Top Metric Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-card rounded-2xl p-4 border border-strk-border">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Consistency Rate</span>
            <div className="rounded-lg bg-orange-500/10 p-1.5 text-orange-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{stats.consistencyRate}%</span>
            <span className="text-xs text-emerald-400 font-bold flex items-center">
              <ArrowUpRight className="h-3 w-3" /> 30-day window
            </span>
          </div>
          <p className="text-[11px] text-strk-textMuted mt-1">
            Active in {stats.totalActiveDays} days total
          </p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-strk-border">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Month vs Last Month</span>
            <div className="rounded-lg bg-cyan-500/10 p-1.5 text-cyan-400">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{momStats.thisMonthLogs}</span>
            <span className="text-xs text-slate-400 font-medium">vs {momStats.lastMonthLogs} logs</span>
          </div>
          <p className={`text-[11px] font-bold mt-1 ${momStats.growth >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {momStats.growth >= 0 ? `+${momStats.growth}% momentum growth` : `${momStats.growth}% decrease`}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-strk-border">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Top Focus Domain</span>
            <div className="rounded-lg bg-purple-500/10 p-1.5 text-purple-400">
              <Zap className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-white">
              {categoryData.sort((a, b) => b.value - a.value)[0]?.name || "N/A"}
            </span>
          </div>
          <p className="text-[11px] text-strk-textMuted mt-1">
            {categoryData[0]?.value || 0} proof entries recorded
          </p>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-strk-border">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Record Streak</span>
            <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-400">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-amber-300">{stats.longestStreak}</span>
            <span className="text-xs text-slate-400">days uninterrupted</span>
          </div>
          <p className="text-[11px] text-strk-textMuted mt-1">
            Current streak: {stats.currentStreak} days
          </p>
        </div>

      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Activity & XP Trend (8 cols) */}
        <div className="lg:col-span-8 glass-card rounded-2xl p-5 border border-strk-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>14-Day XP & Proof Activity</span>
              </h3>
              <p className="text-xs text-strk-textMuted">Daily earned XP and logged momentum</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff5722" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#ff5722" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#4a5568" fontSize={11} tickLine={false} />
                <YAxis stroke="#4a5568" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#12141f",
                    borderColor: "#23273a",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="xp"
                  stroke="#ff5722"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#xpGradient)"
                  name="XP Earned"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown (4 cols) */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-5 border border-strk-border flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2 mb-1">
              <PieIcon className="h-4 w-4 text-orange-400" />
              <span>Category Distribution</span>
            </h3>
            <p className="text-xs text-strk-textMuted mb-4">Where your efforts went</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#12141f",
                      borderColor: "#23273a",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-strk-border/60">
            {categoryData.slice(0, 5).map((cat) => (
              <div key={cat.name} className="flex items-center space-x-1.5 text-xs text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <span>{cat.name} ({cat.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Day of Week Consistency (12 cols) */}
        <div className="lg:col-span-12 glass-card rounded-2xl p-5 border border-strk-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Day of Week Activity Heat</h3>
              <p className="text-xs text-strk-textMuted">Identify which days you thrive or risk breaking streak</p>
            </div>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayOfWeekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#4a5568" fontSize={11} tickLine={false} />
                <YAxis stroke="#4a5568" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#12141f",
                    borderColor: "#23273a",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="logs" fill="#ff8a00" radius={[6, 6, 0, 0]} name="Proof Logs" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
