"use client";

import React, { useState, useMemo } from "react";
import { 
  DailyLog, 
  Category 
} from "@/lib/types";
import { ALL_CATEGORIES } from "@/lib/streakEngine";
import { 
  Calendar, 
  Clock, 
  Lock, 
  Trash2, 
  Edit3, 
  Search, 
  Sparkles, 
  Filter,
  Image as ImageIcon,
  CheckCircle,
  Zap
} from "lucide-react";
import { format, parseISO, isToday } from "date-fns";

interface LogFeedProps {
  logs: DailyLog[];
  onDeleteLog: (id: string) => void;
  onEditLog: (log: DailyLog) => void;
}

const MOOD_EMOJIS = {
  fire: "🔥",
  high: "⚡",
  good: "😊",
  neutral: "😐",
  drained: "😩",
};

export const LogFeed: React.FC<LogFeedProps> = ({
  logs,
  onDeleteLog,
  onEditLog,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [expandedMediaId, setExpandedMediaId] = useState<string | null>(null);

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs
      .filter((log) => {
        const matchesCategory =
          selectedCategory === "ALL" || log.categories.includes(selectedCategory as Category);
        const matchesSearch =
          log.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.categories.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
          log.date.includes(searchQuery);
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [logs, searchQuery, selectedCategory]);

  return (
    <div className="space-y-4">
      
      {/* Search & Filter Header */}
      <div className="glass-card rounded-2xl p-4 border border-strk-border flex flex-col sm:flex-row items-center justify-between gap-3">
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search proof logs..."
            className="w-full rounded-xl border border-strk-border bg-surface-200 pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-orange-500 focus:outline-none"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedCategory("ALL")}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === "ALL"
                ? "bg-orange-600 text-white shadow-flame-sm"
                : "bg-surface-200 text-slate-400 hover:text-slate-200"
            }`}
          >
            All Logs ({logs.length})
          </button>
          {ALL_CATEGORIES.map((cat) => {
            const count = logs.filter((l) => l.categories.includes(cat)).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? "bg-orange-600 text-white shadow-flame-sm"
                    : "bg-surface-200 text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

      </div>

      {/* Feed List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center border border-strk-border">
            <Sparkles className="mx-auto h-8 w-8 text-slate-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-300">No proof entries found</h4>
            <p className="text-xs text-strk-textMuted mt-1">
              Try adjusting your search filter or log today's proof of work!
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const dateObj = parseISO(log.date);
            const isLogToday = isToday(dateObj);

            return (
              <div
                key={log.id}
                className="glass-card glass-card-hover rounded-2xl p-4 sm:p-5 border border-strk-border"
              >
                {/* Top Row: Date, Categories, Mood, Integrity Status */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  
                  {/* Left: Date + Tags */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center space-x-1.5 rounded-lg bg-surface-300 px-2.5 py-1 text-xs font-bold text-slate-300 border border-strk-border">
                      <Calendar className="h-3.5 w-3.5 text-orange-400" />
                      <span>{format(dateObj, "EEE, MMM d, yyyy")}</span>
                    </div>

                    {log.categories.map((cat) => (
                      <span
                        key={cat}
                        className="rounded-md bg-orange-950/40 border border-orange-500/30 px-2 py-0.5 text-[11px] font-semibold text-orange-300"
                      >
                        #{cat}
                      </span>
                    ))}

                    <span className="rounded-md bg-surface-300 px-2 py-0.5 text-xs text-amber-300 border border-strk-border">
                      {MOOD_EMOJIS[log.mood] || "🔥"} Energy {log.energyLevel}/5
                    </span>
                  </div>

                  {/* Right: XP Earned & Integrity Lock Status */}
                  <div className="flex items-center space-x-2 shrink-0">
                    <span className="flex items-center space-x-1 rounded-md bg-purple-950/40 border border-purple-500/30 px-2 py-0.5 text-[11px] font-bold text-purple-300">
                      <Sparkles className="h-3 w-3" />
                      <span>+{log.xpEarned} XP</span>
                    </span>

                    {isLogToday ? (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onDeleteLog(log.id)}
                          title="Delete today's log"
                          className="rounded-md p-1 text-slate-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        title="Integrity Locked: Historical logs cannot be altered"
                        className="flex items-center space-x-1 rounded-md bg-slate-900 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 border border-slate-800"
                      >
                        <Lock className="h-3 w-3 text-slate-500" />
                        <span className="hidden sm:inline">Locked</span>
                      </div>
                    )}
                  </div>

                </div>

                {/* Content text */}
                <p className="text-sm font-normal text-slate-200 leading-relaxed whitespace-pre-line">
                  {log.content}
                </p>

                {/* Optional Media Attachment */}
                {log.mediaUrl && (
                  <div className="mt-3">
                    <button
                      onClick={() => setExpandedMediaId(expandedMediaId === log.id ? null : log.id)}
                      className="group relative overflow-hidden rounded-xl border border-strk-border max-h-48 w-full max-w-sm block"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={log.mediaUrl}
                        alt="Proof Attachment"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </button>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
