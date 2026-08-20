"use client";

import React, { useState } from "react";
import { WeeklyReflection } from "@/lib/types";
import { 
  X, 
  Sparkles, 
  Calendar, 
  Star, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb 
} from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { playSound } from "@/lib/soundEffects";

interface WeeklyReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveReflection: (reflection: Omit<WeeklyReflection, "id" | "createdAt">) => void;
  soundEnabled: boolean;
}

export const WeeklyReflectionModal: React.FC<WeeklyReflectionModalProps> = ({
  isOpen,
  onClose,
  onSaveReflection,
  soundEnabled,
}) => {
  const today = new Date();
  const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");

  const [score, setScore] = useState(8);
  const [highlight, setHighlight] = useState("");
  const [slipUp, setSlipUp] = useState("");
  const [nextWeekFocus, setNextWeekFocus] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!highlight.trim()) {
      setError("Please write at least one highlight from this week.");
      return;
    }

    onSaveReflection({
      weekStartDate: weekStart,
      weekEndDate: weekEnd,
      score,
      highlight: highlight.trim(),
      slipUp: slipUp.trim(),
      nextWeekFocus: nextWeekFocus.trim(),
    });

    if (soundEnabled) playSound("levelup");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-strk-border bg-[#0d0f18] p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-strk-border/60 pb-4">
          <div className="flex items-center space-x-2">
            <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400 border border-purple-500/20">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Weekly Reflection & Review</h2>
              <p className="text-xs text-strk-textMuted">
                Week of {format(new Date(weekStart), "MMM d")} - {format(new Date(weekEnd), "MMM d")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-surface-200 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center space-x-2 rounded-lg bg-rose-950/40 border border-rose-500/40 p-2.5 text-xs text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          
          {/* Self-Rating (1-10) */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
              <Star className="h-3.5 w-3.5 text-amber-400" />
              <span>Self-Discipline Score this Week: <b className="text-amber-400">{score} / 10</b></span>
            </label>
            <div className="flex items-center justify-between gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setScore(num)}
                  className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
                    score === num
                      ? "bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-flame-sm scale-110"
                      : "bg-surface-200 text-slate-400 border border-strk-border hover:text-slate-200"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Highlight */}
          <div>
            <label className="block text-xs font-semibold text-emerald-400 mb-1 flex items-center space-x-1">
              <CheckCircle className="h-3.5 w-3.5" />
              <span>What went exceptionally well? (Victories / Breakthroughs)</span>
            </label>
            <textarea
              value={highlight}
              onChange={(e) => setHighlight(e.target.value)}
              rows={2}
              placeholder="e.g. Hit all LeetCode DP questions, kept morning gym schedule 100% on point..."
              className="w-full rounded-xl border border-strk-border bg-surface-200 p-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Slip Up */}
          <div>
            <label className="block text-xs font-semibold text-rose-400 mb-1 flex items-center space-x-1">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Where did you slip or lose focus? (Self-honesty is key)</span>
            </label>
            <textarea
              value={slipUp}
              onChange={(e) => setSlipUp(e.target.value)}
              rows={2}
              placeholder="e.g. Spent too much time doomscrolling on Thursday night..."
              className="w-full rounded-xl border border-strk-border bg-surface-200 p-2.5 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
            />
          </div>

          {/* Next Week Focus */}
          <div>
            <label className="block text-xs font-semibold text-cyan-400 mb-1 flex items-center space-x-1">
              <Lightbulb className="h-3.5 w-3.5" />
              <span>Priority Focus for Next Week</span>
            </label>
            <input
              type="text"
              value={nextWeekFocus}
              onChange={(e) => setNextWeekFocus(e.target.value)}
              placeholder="e.g. Ship STRK v1 demo and maintain full 7-day gym streak"
              className="w-full rounded-xl border border-strk-border bg-surface-200 p-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between border-t border-strk-border/60 pt-4">
            <div className="flex items-center space-x-1.5 text-xs text-purple-400">
              <Sparkles className="h-4 w-4" />
              <span>+20 Reflection XP Bonus</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-strk-border bg-surface-200 px-4 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-flame rounded-xl px-5 py-1.5 text-xs font-bold"
              >
                Complete Review
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
