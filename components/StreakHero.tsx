"use client";

import React, { useState } from "react";
import { 
  Flame, 
  Trophy, 
  Percent, 
  Calendar, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles,
  Zap
} from "lucide-react";
import { StreakStats, UserProfile } from "@/lib/types";
import { playSound } from "@/lib/soundEffects";

interface StreakHeroProps {
  stats: StreakStats;
  user: UserProfile;
  onOpenLogModal: () => void;
  onUseFreeze: () => void;
}

const QUOTES = [
  "You don't need motivation when discipline becomes your identity.",
  "Competition is with who you were yesterday. Beat your past self.",
  "Small daily disciplines repeated with consistency lead to monumental achievements.",
  "Don't break the chain. One missed day makes it twice as hard to return.",
  "Show up on the days you don't feel like it. That's where the real leveling happens.",
  "Proof beats promise. What did you build today?",
];

export const StreakHero: React.FC<StreakHeroProps> = ({
  stats,
  user,
  onOpenLogModal,
  onUseFreeze,
}) => {
  const [quoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));

  const handleFreezeClick = () => {
    if (user.freezeTokens > 0 && !stats.activeToday) {
      if (user.soundEnabled) playSound("freeze");
      onUseFreeze();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-strk-border bg-gradient-to-b from-[#161826] via-[#10121d] to-[#0a0b12] p-5 shadow-2xl sm:p-7">
      
      {/* Background Decorative Glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

      {/* Loss Aversion / Today's Status Banner */}
      <div className="mb-6">
        {stats.activeToday ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-4 py-3 text-emerald-300">
            <div className="flex items-center space-x-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-emerald-200">Streak Shielded for Today!</span>
                <p className="text-xs text-emerald-400/80">You've logged your daily proof of work. Flame is burning strong.</p>
              </div>
            </div>
            <div className="mt-2 sm:mt-0 flex items-center space-x-1.5 text-xs font-semibold bg-emerald-900/40 px-3 py-1 rounded-full border border-emerald-500/30">
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
              <span>+XP Banked</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-xl border border-amber-500/40 bg-amber-950/30 px-4 py-3 text-amber-200">
            <div className="flex items-center space-x-2.5">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 animate-bounce" />
              <div>
                <span className="font-bold text-amber-200">
                  {stats.currentStreak > 0 
                    ? `⚠️ Protect your ${stats.currentStreak}-day streak!` 
                    : "⚡ Start your daily streak today!"}
                </span>
                <p className="text-xs text-amber-300/80">
                  No proof logged yet for today. Don't let your flame die at midnight!
                </p>
              </div>
            </div>
            <div className="mt-3 sm:mt-0 flex items-center space-x-2">
              {user.freezeTokens > 0 && stats.currentStreak > 0 && (
                <button
                  onClick={handleFreezeClick}
                  className="rounded-lg border border-cyan-500/40 bg-cyan-950/50 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-900/60 transition"
                  title="Consume 1 Freeze Token to protect streak without logging"
                >
                  ❄️ Use Freeze ({user.freezeTokens})
                </button>
              )}
              <button
                onClick={onOpenLogModal}
                className="btn-flame rounded-lg px-4 py-1.5 text-xs font-bold shadow-flame-sm"
              >
                Log Proof Now
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Streak Flame + Key Metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-center">
        
        {/* Left: Burning Streak Flame Counter (lg: 5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center text-center p-4 rounded-xl bg-surface-200/50 border border-strk-border/50">
          <div className="relative mb-2">
            <div className="absolute inset-0 rounded-full bg-orange-500/25 blur-2xl animate-pulse" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 p-1 shadow-flame-md">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0d0f1a]">
                <Flame className="h-14 w-14 text-orange-500 animate-flame" />
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-baseline justify-center space-x-2">
            <span className="text-5xl sm:text-6xl font-black tracking-tight text-white">
              {stats.currentStreak}
            </span>
            <span className="text-lg font-bold text-orange-400">
              {stats.currentStreak === 1 ? "DAY STREAK" : "DAYS STREAK"}
            </span>
          </div>

          <div className="mt-2 flex items-center space-x-1.5 rounded-full bg-orange-950/50 border border-orange-500/40 px-3 py-0.5 text-xs font-bold text-orange-300">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>
              {stats.currentStreak >= 100
                ? "2.0x Double XP Boost Active! 🔥"
                : stats.currentStreak >= 30
                ? "1.5x Surge XP Boost Active! 🔥"
                : stats.currentStreak >= 7
                ? "1.2x Flame XP Boost Active! 🔥"
                : "1.0x Base XP (Reach 7d for 1.2x Boost)"}
            </span>
          </div>

          <p className="mt-1 text-xs text-strk-textMuted max-w-xs">
            {stats.currentStreak >= 30
              ? "🔥 Unstoppable discipline! You are in the top 1% of consistent builders."
              : stats.currentStreak >= 7
              ? "⚡ Solid momentum building. Keep the chain unbroken!"
              : stats.currentStreak > 0
              ? "🌱 The spark is lit. Compete against who you were yesterday."
              : "Start now. One post sets the entire momentum in motion."}
          </p>
        </div>

        {/* Right: Key Stats & Category Micro Streaks (lg: 7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          
          {/* Top Stat Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="glass-card rounded-xl p-2.5 sm:p-3.5 text-center">
              <div className="flex items-center justify-center space-x-1 text-amber-400 mb-1">
                <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Best Streak</span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-white">{stats.longestStreak}</span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 block">days record</span>
            </div>

            <div className="glass-card rounded-xl p-2.5 sm:p-3.5 text-center">
              <div className="flex items-center justify-center space-x-1 text-orange-400 mb-1">
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">Active</span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-white">{stats.totalActiveDays}</span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 block">{stats.totalLogs} logs</span>
            </div>

            <div className="glass-card rounded-xl p-2.5 sm:p-3.5 text-center">
              <div className="flex items-center justify-center space-x-1 text-cyan-400 mb-1">
                <Percent className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400">30d Score</span>
              </div>
              <span className="text-xl sm:text-2xl font-black text-cyan-300">{stats.consistencyRate}%</span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 block">consistency</span>
            </div>
          </div>

          {/* Category-wise Streaks Pill Row */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1">
                <Zap className="h-3.5 w-3.5 text-orange-400" />
                <span>Category Streaks</span>
              </span>
              <span className="text-[11px] text-strk-textMuted">Individual discipline</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.categoryStreaks).map(([cat, streak]) => (
                <div
                  key={cat}
                  className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border ${
                    streak > 0
                      ? "bg-surface-100 border-orange-500/30 text-orange-300"
                      : "bg-surface-300/60 border-strk-border/40 text-slate-500"
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`rounded px-1 text-[11px] font-bold ${
                    streak > 0 ? "bg-orange-500/20 text-orange-400" : "bg-slate-800 text-slate-600"
                  }`}>
                    {streak}d
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Philosophy / Motivational Quote */}
          <div className="rounded-xl bg-surface-300/70 border border-strk-border/60 p-3 text-xs italic text-slate-300 flex items-center space-x-2">
            <span className="text-orange-400 font-bold not-italic">"</span>
            <span>{QUOTES[quoteIndex]}</span>
            <span className="text-orange-400 font-bold not-italic">"</span>
          </div>

        </div>

      </div>

    </div>
  );
};
