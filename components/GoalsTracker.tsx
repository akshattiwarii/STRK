"use client";

import React, { useState } from "react";
import { Goal, Category } from "@/lib/types";
import { ALL_CATEGORIES } from "@/lib/streakEngine";
import { 
  Target, 
  Plus, 
  CheckCircle2, 
  Calendar, 
  Trash2, 
  Edit3, 
  ChevronRight, 
  Sparkles,
  Award
} from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";

interface GoalsTrackerProps {
  goals: Goal[];
  onAddGoal: (goal: Omit<Goal, "id" | "createdAt">) => void;
  onUpdateGoalProgress: (goalId: string, delta: number) => void;
  onDeleteGoal: (goalId: string) => void;
}

export const GoalsTracker: React.FC<GoalsTrackerProps> = ({
  goals,
  onAddGoal,
  onUpdateGoalProgress,
  onDeleteGoal,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("DSA");
  const [targetCount, setTargetCount] = useState(100);
  const [unit, setUnit] = useState("Problems");
  const [deadline, setDeadline] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || targetCount <= 0) return;

    onAddGoal({
      title: title.trim(),
      category,
      targetCount,
      currentCount: 0,
      unit: unit.trim() || "Items",
      deadline: deadline || undefined,
      completed: false,
    });

    setTitle("");
    setTargetCount(100);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center space-x-2">
            <Target className="h-5 w-5 text-cyan-400" />
            <span>Long-Term Targets & Milestones</span>
          </h2>
          <p className="text-xs text-strk-textMuted">
            Connect daily micro-efforts into massive long-term victories.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="btn-flame flex items-center space-x-1.5 rounded-xl px-4 py-2 text-xs font-bold"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          <span>New Target</span>
        </button>
      </div>

      {/* New Goal Modal/Form inline */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="glass-card rounded-2xl p-5 border border-cyan-500/40 bg-cyan-950/20 space-y-4 animate-in fade-in"
        >
          <h3 className="text-sm font-bold text-cyan-300 flex items-center space-x-2">
            <Sparkles className="h-4 w-4" />
            <span>Create New Consistency Goal</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Goal Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master 300 LeetCode Problems"
                required
                className="w-full rounded-xl border border-strk-border bg-surface-200 p-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full rounded-xl border border-strk-border bg-surface-200 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              >
                {ALL_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Metric & Unit
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  min="1"
                  value={targetCount}
                  onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
                  className="w-28 rounded-xl border border-strk-border bg-surface-200 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  placeholder="Problems / Workouts / Days"
                  className="flex-1 rounded-xl border border-strk-border bg-surface-200 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Deadline (Optional)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl border border-strk-border bg-surface-200 p-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="rounded-xl border border-strk-border bg-surface-200 px-4 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-flame rounded-xl px-5 py-1.5 text-xs font-bold"
            >
              Save Goal
            </button>
          </div>
        </form>
      )}

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.currentCount / goal.targetCount) * 100));
          const isDone = goal.completed || goal.currentCount >= goal.targetCount;

          let daysRemaining = null;
          if (goal.deadline) {
            daysRemaining = differenceInDays(parseISO(goal.deadline), new Date());
          }

          return (
            <div
              key={goal.id}
              className={`glass-card rounded-2xl p-5 border transition-all ${
                isDone
                  ? "border-emerald-500/40 bg-emerald-950/20"
                  : "border-strk-border hover:border-cyan-500/40"
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="rounded-md bg-cyan-950/50 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                    {goal.category}
                  </span>
                  <h4 className="text-base font-bold text-white mt-1.5 flex items-center space-x-1.5">
                    {isDone && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
                    <span>{goal.title}</span>
                  </h4>
                </div>

                <button
                  onClick={() => onDeleteGoal(goal.id)}
                  className="rounded-lg p-1 text-slate-600 hover:text-rose-400 transition"
                  title="Delete goal"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Progress Bar & Numbers */}
              <div className="space-y-2 mb-4">
                <div className="flex items-baseline justify-between text-xs">
                  <span className="font-extrabold text-slate-200">
                    {goal.currentCount} / {goal.targetCount} {goal.unit}
                  </span>
                  <span className="font-black text-cyan-400">{percent}%</span>
                </div>

                <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-300 border border-strk-border">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDone
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                        : "bg-gradient-to-r from-orange-500 via-amber-400 to-cyan-400 shadow-neon-glow"
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              {/* Footer & Progress Quick Action Buttons */}
              <div className="flex items-center justify-between border-t border-strk-border/60 pt-3 text-xs">
                <div className="text-slate-400 text-[11px] flex items-center space-x-1">
                  {daysRemaining !== null && (
                    <>
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      <span>
                        {daysRemaining > 0
                          ? `${daysRemaining} days left`
                          : daysRemaining === 0
                          ? "Due today!"
                          : "Past deadline"}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => onUpdateGoalProgress(goal.id, -1)}
                    disabled={goal.currentCount <= 0}
                    className="rounded-lg border border-strk-border bg-surface-200 px-2 py-0.5 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30"
                  >
                    -1
                  </button>
                  <button
                    onClick={() => onUpdateGoalProgress(goal.id, 1)}
                    className="rounded-lg border border-cyan-500/40 bg-cyan-950/40 px-2.5 py-0.5 text-xs font-bold text-cyan-300 hover:bg-cyan-900/60 transition"
                  >
                    +1 {goal.unit.slice(0, 4)}
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
