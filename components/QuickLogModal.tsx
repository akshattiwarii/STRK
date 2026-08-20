"use client";

import React, { useState, useMemo } from "react";
import { 
  X, 
  Flame, 
  Sparkles, 
  Image as ImageIcon, 
  Tag, 
  Smile, 
  Target, 
  AlertCircle,
  Check,
  Zap,
  FileText
} from "lucide-react";
import { Category, Mood, Goal, DailyLog } from "@/lib/types";
import { ALL_CATEGORIES } from "@/lib/streakEngine";
import { calculateLogXpBreakdown, getStreakMultiplier } from "@/lib/gamification";
import confetti from "canvas-confetti";
import { playSound } from "@/lib/soundEffects";
import { format } from "date-fns";

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLog: (log: Omit<DailyLog, "id" | "timestamp">) => void;
  goals: Goal[];
  currentStreak: number;
  isFirstLogToday: boolean;
  soundEnabled: boolean;
}

const MOODS: Array<{ value: Mood; label: string; icon: string; energy: number }> = [
  { value: "fire", label: "On Fire", icon: "🔥", energy: 5 },
  { value: "high", label: "High Energy", icon: "⚡", energy: 4 },
  { value: "good", label: "Good", icon: "😊", energy: 3 },
  { value: "neutral", label: "Neutral", icon: "😐", energy: 2 },
  { value: "drained", label: "Drained", icon: "😩", energy: 1 },
];

export const QuickLogModal: React.FC<QuickLogModalProps> = ({
  isOpen,
  onClose,
  onSaveLog,
  goals,
  currentStreak,
  isFirstLogToday,
  soundEnabled,
}) => {
  const [content, setContent] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>(["DSA"]);
  const [selectedMood, setSelectedMood] = useState<Mood>("fire");
  const [energyLevel, setEnergyLevel] = useState<number>(5);
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [error, setError] = useState("");

  const charLimit = 280;
  const remainingChars = charLimit - content.length;

  // Real-time dynamic XP calculation
  const xpBreakdown = useMemo(() => {
    return calculateLogXpBreakdown({
      content,
      hasCategories: selectedCategories.length > 0,
      hasProofMedia: Boolean(mediaPreview),
      currentStreak,
      isFirstLogToday,
    });
  }, [content, selectedCategories, mediaPreview, currentStreak, isFirstLogToday]);

  if (!isOpen) return null;

  const toggleCategory = (cat: Category) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleMoodSelect = (mood: Mood, energy: number) => {
    setSelectedMood(mood);
    setEnergyLevel(energy);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setError("Image size must be under 3MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Please describe what you accomplished today.");
      return;
    }

    if (selectedCategories.length === 0) {
      setError("Please select at least one category tag.");
      return;
    }

    onSaveLog({
      date: format(new Date(), "yyyy-MM-dd"),
      content: content.trim(),
      categories: selectedCategories,
      mood: selectedMood,
      energyLevel,
      mediaUrl: mediaPreview || undefined,
      goalId: selectedGoalId || undefined,
      xpEarned: xpBreakdown.finalXp,
    });

    if (soundEnabled) {
      playSound("streak");
    }

    // Fire celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#ff4500", "#ff8c00", "#ffd700", "#00f5d4"],
      });
    } catch {
      // ignore
    }

    // Reset and close
    setContent("");
    setMediaPreview(null);
    setError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-strk-border bg-[#0d0f18] p-6 shadow-2xl my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-strk-border/60 pb-3">
          <div className="flex items-center space-x-2">
            <div className="rounded-lg bg-orange-500/10 p-2 text-orange-400 border border-orange-500/20">
              <Flame className="h-5 w-5 animate-flame" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Daily Proof of Work</h2>
              <p className="text-xs text-strk-textMuted">Micro-log what you did today. Beat your past self.</p>
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
          
          {/* Micro-Journal Textarea (280 chars) */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">
                What did you conquer today?
              </label>
              <div className="text-[11px] text-slate-400 flex items-center space-x-2">
                <span className={xpBreakdown.wordCount >= 50 ? "text-emerald-400 font-bold" : "text-slate-500"}>
                  {xpBreakdown.wordCount} words {xpBreakdown.wordCount >= 50 ? "(+5 XP Bonus)" : "(50 for bonus)"}
                </span>
                <span>•</span>
                <span className={remainingChars < 20 ? "text-amber-400 font-bold" : "text-slate-500"}>
                  {remainingChars} chars
                </span>
              </div>
            </div>
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => {
                  if (e.target.value.length <= charLimit) {
                    setContent(e.target.value);
                    if (error) setError("");
                  }
                }}
                rows={4}
                placeholder="e.g. Solved 3 LeetCode Tree problems, completed 1hr heavy deadlifts, and pushed new API routes..."
                className="w-full rounded-xl border border-strk-border bg-surface-200/80 p-3 text-sm text-slate-100 placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition resize-none"
              />
            </div>
          </div>

          {/* Category Selectors */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                <Tag className="h-3.5 w-3.5 text-orange-400" />
                <span>Categories</span>
              </label>
              <span className="text-[10px] text-emerald-400 font-semibold">+5 XP Tagging Bonus</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_CATEGORIES.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-orange-600 text-white shadow-flame-sm border border-orange-400"
                        : "bg-surface-200 text-slate-400 border border-strk-border hover:text-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mood & Energy Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
              <Smile className="h-3.5 w-3.5 text-yellow-400" />
              <span>Energy & Focus State</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {MOODS.map((m) => {
                const isActive = selectedMood === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => handleMoodSelect(m.value, m.energy)}
                    className={`flex flex-col items-center justify-center rounded-xl p-2 border transition-all ${
                      isActive
                        ? "border-amber-500/80 bg-amber-950/30 text-amber-300 shadow-sm"
                        : "border-strk-border bg-surface-200 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <span className="text-xl mb-0.5">{m.icon}</span>
                    <span className="text-[10px] font-medium">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Link to Goal & Attach Proof row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            
            {/* Goal Link */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
                <Target className="h-3.5 w-3.5 text-cyan-400" />
                <span>Link to Goal</span>
              </label>
              <select
                value={selectedGoalId}
                onChange={(e) => setSelectedGoalId(e.target.value)}
                className="w-full rounded-xl border border-strk-border bg-surface-200 p-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
              >
                <option value="">No linked goal</option>
                {goals
                  .filter((g) => !g.completed)
                  .map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title} ({g.currentCount}/{g.targetCount})
                    </option>
                  ))}
              </select>
            </div>

            {/* Media Upload */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                  <ImageIcon className="h-3.5 w-3.5 text-purple-400" />
                  <span>Proof Screenshot</span>
                </label>
                <span className="text-[10px] text-purple-400 font-semibold">+5 XP Proof Bonus</span>
              </div>
              <div className="flex items-center space-x-2">
                <label className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-strk-border bg-surface-200/60 px-3 py-2 text-xs text-slate-400 hover:border-purple-500/50 hover:text-purple-300 cursor-pointer transition">
                  <span>{mediaPreview ? "Change Image" : "Attach Image"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {mediaPreview && (
                  <button
                    type="button"
                    onClick={() => setMediaPreview(null)}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Media Preview thumbnail */}
          {mediaPreview && (
            <div className="relative overflow-hidden rounded-xl border border-strk-border max-h-32">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaPreview}
                alt="Proof attachment"
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Dynamic XP Breakdown Card */}
          <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-3 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-bold text-white">
              <span className="flex items-center space-x-1 text-purple-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Calculated XP Reward:</span>
              </span>
              <span className="text-sm font-black text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-500/30">
                +{xpBreakdown.finalXp} XP
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 pt-1 border-t border-purple-500/20">
              <span>Base: <b className="text-slate-200">+{xpBreakdown.baseXp}</b></span>
              <span>Tags: <b className="text-slate-200">+{xpBreakdown.tagBonus}</b></span>
              <span>Proof: <b className="text-slate-200">+{xpBreakdown.proofBonus}</b></span>
              <span>50+ Words: <b className="text-slate-200">+{xpBreakdown.wordBonus}</b></span>
              <span>Streak: <b className="text-orange-400">{xpBreakdown.streakMultiplier}x</b></span>
              {!isFirstLogToday && (
                <span className="text-rose-400 font-semibold">(2nd+ log: 50% anti-spam)</span>
              )}
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end space-x-2 border-t border-strk-border/60 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-strk-border bg-surface-200 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-flame flex items-center space-x-1.5 rounded-xl px-5 py-2 text-xs font-bold"
            >
              <Flame className="h-4 w-4" />
              <span>Save Proof (+{xpBreakdown.finalXp} XP)</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
