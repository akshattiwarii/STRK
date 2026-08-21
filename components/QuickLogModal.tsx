"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import { calculateLogXpBreakdown } from "@/lib/gamification";
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

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Image must be smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setMediaPreview(event.target?.result as string);
        setError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError("Please write what you accomplished today.");
      return;
    }

    if (content.length > charLimit) {
      setError(`Content exceeds ${charLimit} characters.`);
      return;
    }

    const todayDate = format(new Date(), "yyyy-MM-dd");

    onSaveLog({
      date: todayDate,
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
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 p-3 sm:p-4 backdrop-blur-md animate-in fade-in flex items-center justify-center min-h-screen"
    >
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-strk-border bg-[#0d0f18] shadow-2xl my-auto max-h-[92vh] flex flex-col">
        
        {/* Sticky Header with Permanent Close Button */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-strk-border/60 bg-[#0d0f18]/95 backdrop-blur-md px-5 py-3.5 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="rounded-lg bg-orange-500/10 p-2 text-orange-400 border border-orange-500/20">
              <Flame className="h-5 w-5 animate-flame" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">Daily Proof of Work</h2>
              <p className="text-[11px] text-strk-textMuted">Micro-log what you did today. Beat your past self.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-surface-200 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-5 space-y-4">

          {error && (
            <div className="flex items-center space-x-2 rounded-lg bg-rose-950/40 border border-rose-500/40 p-2.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Micro-Journal Textarea (280 chars) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                  <FileText className="h-3.5 w-3.5 text-orange-400" />
                  <span>Proof Log (Short & Punchy)</span>
                </label>
                <span
                  className={`text-[11px] font-mono font-bold ${
                    remainingChars < 20 ? "text-rose-400" : "text-slate-400"
                  }`}
                >
                  {remainingChars} left
                </span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What did you execute today? Solved LeetCode DP? Hit gym leg day? Deployed STRK v1?"
                rows={3}
                className="w-full rounded-xl border border-strk-border bg-surface-200 p-3 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Category Tags Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                <Tag className="h-3.5 w-3.5 text-orange-400" />
                <span>Categories (+5 XP Bonus)</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_CATEGORIES.map((cat) => {
                  const isSelected = selectedCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                        isSelected
                          ? "bg-orange-600 text-white shadow-flame-sm border border-orange-400"
                          : "bg-surface-200 text-slate-400 border border-strk-border hover:border-slate-600"
                      }`}
                    >
                      #{cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mood & Energy Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                  <Smile className="h-3.5 w-3.5 text-orange-400" />
                  <span>Vibe / Mood</span>
                </label>
                <div className="grid grid-cols-5 gap-1">
                  {MOODS.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => {
                        setSelectedMood(m.value);
                        setEnergyLevel(m.energy);
                      }}
                      title={m.label}
                      className={`flex flex-col items-center justify-center rounded-xl p-1.5 text-sm transition border ${
                        selectedMood === m.value
                          ? "bg-orange-950/40 border-orange-500/80 shadow-flame-sm scale-105"
                          : "bg-surface-200 border-strk-border opacity-70 hover:opacity-100"
                      }`}
                    >
                      <span>{m.icon}</span>
                      <span className="text-[9px] text-slate-300 mt-0.5 truncate w-full text-center">
                        {m.label.split(" ")[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Linked Goal */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                  <Target className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Link to Goal (+30 XP Milestone)</span>
                </label>
                <select
                  value={selectedGoalId}
                  onChange={(e) => setSelectedGoalId(e.target.value)}
                  className="w-full rounded-xl border border-strk-border bg-surface-200 p-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="">-- Optional: Select Target --</option>
                  {goals
                    .filter((g) => !g.completed)
                    .map((goal) => (
                      <option key={goal.id} value={goal.id}>
                        {goal.title} ({goal.currentCount}/{goal.targetCount} {goal.unit})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Proof of Work Screenshot / Photo Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1">
                <ImageIcon className="h-3.5 w-3.5 text-orange-400" />
                <span>Proof Image / Screenshot (+5 XP Bonus)</span>
              </label>
              
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-1.5 rounded-xl border border-strk-border bg-surface-200 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:border-orange-500 hover:text-white cursor-pointer transition">
                  <ImageIcon className="h-4 w-4" />
                  <span>{mediaPreview ? "Change Proof" : "Attach Screenshot"}</span>
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

            {/* Media Preview Box */}
            {mediaPreview && (
              <div className="relative overflow-hidden rounded-xl border border-orange-500/30 max-h-36 bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaPreview}
                  alt="Proof preview"
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
    </div>
  );
};
