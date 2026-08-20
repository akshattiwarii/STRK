"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { HeatmapDay, generateHeatmapGrid } from "@/lib/streakEngine";
import { DailyLog } from "@/lib/types";
import { Flame, Calendar, Info, ChevronRight, ChevronLeft } from "lucide-react";
import { format, parseISO } from "date-fns";

interface HeatmapCalendarProps {
  logs: DailyLog[];
  freezeDates: string[];
  onSelectDate: (date: string, dayLogs: DailyLog[]) => void;
}

export const HeatmapCalendar: React.FC<HeatmapCalendarProps> = ({
  logs,
  freezeDates,
  onSelectDate,
}) => {
  const [viewScope, setViewScope] = useState<"180" | "365">("180");
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const daysCount = viewScope === "180" ? 182 : 364; // multiple of 7
  const heatmapData = useMemo(() => {
    return generateHeatmapGrid(logs, freezeDates, daysCount);
  }, [logs, freezeDates, daysCount]);

  // Auto-scroll to the rightmost (current date) on mobile/initial load
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [viewScope, heatmapData]);

  // Group into columns of 7 days (Sunday to Saturday or Monday to Sunday)
  const columns = useMemo(() => {
    const cols: HeatmapDay[][] = [];
    let currentWeek: HeatmapDay[] = [];

    heatmapData.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === heatmapData.length - 1) {
        cols.push(currentWeek);
        currentWeek = [];
      }
    });

    return cols;
  }, [heatmapData]);

  // Calculate quick stats
  const totalHeatLogs = useMemo(() => {
    return heatmapData.reduce((acc, d) => acc + d.count, 0);
  }, [heatmapData]);

  const activeDaysInGrid = useMemo(() => {
    return heatmapData.filter((d) => d.count > 0 || d.isFreeze).length;
  }, [heatmapData]);

  return (
    <div className="glass-card rounded-2xl p-5 border border-strk-border">
      
      {/* Header with Title and Scope Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="rounded-lg bg-orange-500/10 p-1.5 text-orange-400 border border-orange-500/20">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Proof Heatmap</span>
              <span className="text-xs font-normal text-slate-400">
                ({activeDaysInGrid} active days in view)
              </span>
            </h3>
            <p className="text-xs text-strk-textMuted">
              Visual consistency graph. Click any cell to inspect that day's logs.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex rounded-lg bg-surface-300 p-1 border border-strk-border text-xs">
            <button
              onClick={() => setViewScope("180")}
              className={`rounded-md px-2.5 py-1 font-semibold transition ${
                viewScope === "180"
                  ? "bg-orange-600 text-white shadow-flame-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              6 Months
            </button>
            <button
              onClick={() => setViewScope("365")}
              className={`rounded-md px-2.5 py-1 font-semibold transition ${
                viewScope === "365"
                  ? "bg-orange-600 text-white shadow-flame-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              1 Year
            </button>
          </div>
        </div>
      </div>

      {/* Heatmap Grid Container */}
      <div ref={scrollContainerRef} className="overflow-x-auto pb-2 scroll-smooth scrollbar-thin">
        <div className="inline-flex flex-col gap-1 min-w-full">
          
          {/* Day Grid Matrix */}
          <div className="flex gap-1">
            {/* Weekday indicator labels */}
            <div className="flex flex-col gap-1 pr-1 text-[9px] font-bold text-slate-500 select-none">
              <span className="h-3 flex items-center">M</span>
              <span className="h-3 flex items-center opacity-0">T</span>
              <span className="h-3 flex items-center">W</span>
              <span className="h-3 flex items-center opacity-0">T</span>
              <span className="h-3 flex items-center">F</span>
              <span className="h-3 flex items-center opacity-0">S</span>
              <span className="h-3 flex items-center">S</span>
            </div>

            {/* Weeks Columns */}
            {columns.map((week, wIndex) => (
              <div key={wIndex} className="flex flex-col gap-1">
                {week.map((day) => {
                  let cellClass = "heat-0";
                  if (day.isFreeze) cellClass = "heat-1";
                  else if (day.intensity === 2) cellClass = "heat-2";
                  else if (day.intensity === 3) cellClass = "heat-3";
                  else if (day.intensity === 4) cellClass = "heat-4";

                  const isTodayRing = day.isToday ? "ring-2 ring-orange-400 ring-offset-1 ring-offset-[#08090d]" : "";

                  return (
                    <button
                      key={day.date}
                      onClick={() => onSelectDate(day.date, day.logs)}
                      onMouseEnter={() => setHoveredDay(day)}
                      onMouseLeave={() => setHoveredDay(null)}
                      title={`${day.date}: ${day.count} posts`}
                      className={`h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-sm transition-all hover:scale-125 hover:z-20 cursor-pointer ${cellClass} ${isTodayRing}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Heatmap Legend & Hover Detail Bar */}
      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-strk-border/60 pt-3 text-xs gap-3">
        
        {/* Dynamic Hover Status */}
        <div className="flex items-center space-x-2 text-slate-300 min-h-[20px]">
          {hoveredDay ? (
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-semibold text-orange-400">
                {format(parseISO(hoveredDay.date), "MMMM d, yyyy")}:
              </span>
              <span>
                {hoveredDay.isFreeze
                  ? "❄️ Streak Shield Freeze Used"
                  : hoveredDay.count === 0
                  ? "No logs recorded"
                  : `${hoveredDay.count} proof log${hoveredDay.count > 1 ? "s" : ""} (${hoveredDay.logs
                      .flatMap((l) => l.categories)
                      .slice(0, 3)
                      .join(", ")})`}
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 text-slate-500 text-xs">
              <Info className="h-3.5 w-3.5" />
              <span>Hover over a block or click to view details</span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span>Less</span>
          <div className="flex items-center space-x-1">
            <div className="h-3 w-3 rounded-sm heat-0" title="No posts" />
            <div className="h-3 w-3 rounded-sm heat-1" title="Freeze shield used" />
            <div className="h-3 w-3 rounded-sm heat-2" title="1 proof post" />
            <div className="h-3 w-3 rounded-sm heat-3" title="2 proof posts" />
            <div className="h-3 w-3 rounded-sm heat-4" title="3+ high effort posts" />
          </div>
          <span>More Fire</span>
        </div>

      </div>

    </div>
  );
};
