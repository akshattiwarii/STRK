"use client";

import React, { useState, useMemo } from "react";
import { Badge, BadgeGroup, UserProfile, StreakStats } from "@/lib/types";
import { RANK_TIERS, getRankForXp } from "@/lib/gamification";
import { 
  Trophy, 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  Lock, 
  Crown, 
  Zap, 
  Code2, 
  Dumbbell, 
  Gem, 
  Swords, 
  ShieldAlert,
  FileText,
  Rocket,
  BookOpen,
  Scale,
  Target,
  Eye,
  Star,
  Moon,
  Sun,
  Calendar,
  RotateCcw,
  Search,
  CheckCircle,
  Tag
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface GamificationViewProps {
  user: UserProfile;
  badges: Badge[];
  stats: StreakStats;
}

const BADGE_ICONS: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="h-5 w-5 text-amber-400" />,
  Flame: <Flame className="h-5 w-5 text-orange-500 animate-flame" />,
  ShieldAlert: <ShieldAlert className="h-5 w-5 text-cyan-400" />,
  Swords: <Swords className="h-5 w-5 text-rose-400" />,
  Trophy: <Trophy className="h-5 w-5 text-yellow-400" />,
  Crown: <Crown className="h-5 w-5 text-purple-400" />,
  Code2: <Code2 className="h-5 w-5 text-blue-400" />,
  Dumbbell: <Dumbbell className="h-5 w-5 text-emerald-400" />,
  Zap: <Zap className="h-5 w-5 text-amber-400" />,
  Gem: <Gem className="h-5 w-5 text-fuchsia-400" />,
  FileText: <FileText className="h-5 w-5 text-indigo-400" />,
  Rocket: <Rocket className="h-5 w-5 text-orange-400" />,
  BookOpen: <BookOpen className="h-5 w-5 text-amber-300" />,
  Scale: <Scale className="h-5 w-5 text-teal-400" />,
  Target: <Target className="h-5 w-5 text-red-400" />,
  Eye: <Eye className="h-5 w-5 text-purple-300" />,
  Mirror: <Eye className="h-5 w-5 text-purple-300" />,
  Star: <Star className="h-5 w-5 text-yellow-300" />,
  Moon: <Moon className="h-5 w-5 text-indigo-300" />,
  Sun: <Sun className="h-5 w-5 text-amber-400" />,
  Calendar: <Calendar className="h-5 w-5 text-cyan-400" />,
  RotateCcw: <RotateCcw className="h-5 w-5 text-rose-400" />,
  CheckCircle: <CheckCircle className="h-5 w-5 text-emerald-400" />,
  Tag: <Tag className="h-5 w-5 text-teal-400" />,
};

const GROUPS: Array<{ key: string; label: string; icon: string }> = [
  { key: "all", label: "All Badges", icon: "🏆" },
  { key: "streak", label: "Streaks", icon: "🔥" },
  { key: "volume", label: "Volume & Logs", icon: "📝" },
  { key: "dsa", label: "DSA & Algos", icon: "🧠" },
  { key: "gym", label: "Gym & Fitness", icon: "💪" },
  { key: "project", label: "Project & Dev", icon: "💻" },
  { key: "cyber", label: "Cybersecurity", icon: "🛡️" },
  { key: "reading", label: "Reading", icon: "📚" },
  { key: "balance", label: "Balance", icon: "⚖️" },
  { key: "goals", label: "Goals", icon: "🎯" },
  { key: "reflection", label: "Reflections", icon: "🪞" },
  { key: "ranks", label: "Ranks", icon: "👑" },
  { key: "time", label: "Time Patterns", icon: "🌙" },
  { key: "meta", label: "Prestige", icon: "💎" },
];

export const GamificationView: React.FC<GamificationViewProps> = ({
  user,
  badges,
  stats,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "unlocked" | "in_progress" | "locked">("all");

  const currentRank = getRankForXp(user.totalXp);
  const nextRank = RANK_TIERS[currentRank.level] || null;

  const xpInTier = user.totalXp - currentRank.minXp;
  const totalTierSpan = (nextRank ? nextRank.minXp : currentRank.maxXp) - currentRank.minXp;
  const progressPercent = Math.min(100, Math.round((xpInTier / totalTierSpan) * 100));

  // Count states
  const unlockedBadges = useMemo(() => badges.filter((b) => Boolean(b.unlockedAt)), [badges]);
  const inProgressBadges = useMemo(() => badges.filter((b) => !b.unlockedAt && (b.progressCurrent || 0) > 0), [badges]);
  const lockedBadges = useMemo(() => badges.filter((b) => !b.unlockedAt && (!b.progressCurrent || b.progressCurrent === 0)), [badges]);

  // Filtered badges
  const filteredBadges = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return badges.filter((badge) => {
      // Group filter
      const matchesGroup = selectedGroup === "all" || (badge.group && badge.group === selectedGroup);

      // Status filter
      let matchesStatus = true;
      if (statusFilter === "unlocked") matchesStatus = Boolean(badge.unlockedAt);
      if (statusFilter === "in_progress") matchesStatus = !badge.unlockedAt && (badge.progressCurrent || 0) > 0;
      if (statusFilter === "locked") matchesStatus = !badge.unlockedAt && (!badge.progressCurrent || badge.progressCurrent === 0);

      // Search filter
      const matchesSearch =
        !q ||
        (badge.title || "").toLowerCase().includes(q) ||
        (badge.description || "").toLowerCase().includes(q) ||
        (badge.group || "").toLowerCase().includes(q) ||
        (badge.category || "").toLowerCase().includes(q);

      return matchesGroup && matchesStatus && matchesSearch;
    });
  }, [badges, selectedGroup, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Hunter / Rank Status Card */}
      <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-[#131522] to-slate-900 p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-4">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-1 shadow-purple-glow">
              <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0c0e18] text-3xl">
                {currentRank.badge}
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-black text-white">{user.name}</span>
                <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-bold text-purple-300 border border-purple-500/40">
                  Lv.{currentRank.level}
                </span>
              </div>
              <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">
                {currentRank.title}
              </h3>
              <p className="text-xs text-strk-textMuted max-w-sm mt-0.5">
                {user.bio}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center sm:items-end text-center sm:text-right">
            <span className="text-3xl font-black text-white">{user.totalXp.toLocaleString()}</span>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Total Power XP</span>
            <span className="text-[11px] text-strk-textMuted mt-0.5">
              {nextRank ? `${(nextRank.minXp - user.totalXp).toLocaleString()} XP to ${nextRank.title}` : "Max Apex Rank Achieved"}
            </span>
          </div>

        </div>

        {/* Level Progression Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex justify-between text-xs font-bold">
            <span className="text-purple-300">{currentRank.title}</span>
            <span className="text-purple-200">{progressPercent}%</span>
            <span className="text-slate-400">{nextRank ? nextRank.title : "Apex"}</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-surface-300 border border-purple-500/30">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 shadow-purple-glow transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

      </div>

      {/* Rank Ladder Progression View */}
      <div className="glass-card rounded-2xl p-5 border border-strk-border">
        <h3 className="text-base font-bold text-white mb-1 flex items-center space-x-2">
          <Crown className="h-4 w-4 text-yellow-400" />
          <span>Solo Leveling Rank Ladder</span>
        </h3>
        <p className="text-xs text-strk-textMuted mb-4">
          Ascend the ranks by maintaining continuous streaks, logging proof, and completing weekly reviews.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {RANK_TIERS.map((tier) => {
            const isUnlocked = user.totalXp >= tier.minXp;
            const isCurrent = currentRank.level === tier.level;

            return (
              <div
                key={tier.level}
                className={`rounded-xl p-3 border transition-all ${
                  isCurrent
                    ? "border-purple-500 bg-purple-950/40 shadow-purple-glow"
                    : isUnlocked
                    ? "border-strk-border bg-surface-200 text-slate-300"
                    : "border-strk-border/40 bg-surface-300/40 opacity-40"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xl">{tier.badge}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Lv.{tier.level}
                  </span>
                </div>
                <div className="text-xs font-bold text-white truncate">{tier.title}</div>
                <div className="text-[10px] text-strk-textMuted mt-0.5">{tier.minXp.toLocaleString()} XP</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Master Badge System & Explorer */}
      <div className="glass-card rounded-2xl p-5 border border-strk-border space-y-4">
        
        {/* Header & Stats Overview */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-white flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-amber-400" />
              <span>Master Achievements & Badges</span>
              <span className="text-xs font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-500/30">
                {unlockedBadges.length} / {badges.length} Unlocked
              </span>
            </h3>
            <p className="text-xs text-strk-textMuted mt-0.5">
              90+ badges across 13 disciplines. Track your progress from Novice to Deity.
            </p>
          </div>

          {/* Quick status filter pills */}
          <div className="flex overflow-x-auto scrollbar-none rounded-xl bg-surface-300 p-1 border border-strk-border text-xs shrink-0 max-w-full">
            <button
              onClick={() => setStatusFilter("all")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition shrink-0 whitespace-nowrap ${
                statusFilter === "all" ? "bg-orange-600 text-white shadow-flame-sm" : "text-slate-400"
              }`}
            >
              All ({badges.length})
            </button>
            <button
              onClick={() => setStatusFilter("unlocked")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition shrink-0 whitespace-nowrap ${
                statusFilter === "unlocked" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-400"
              }`}
            >
              Unlocked ({unlockedBadges.length})
            </button>
            <button
              onClick={() => setStatusFilter("in_progress")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition shrink-0 whitespace-nowrap ${
                statusFilter === "in_progress" ? "bg-amber-600 text-white shadow-sm" : "text-slate-400"
              }`}
            >
              In Progress ({inProgressBadges.length})
            </button>
            <button
              onClick={() => setStatusFilter("locked")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition shrink-0 whitespace-nowrap ${
                statusFilter === "locked" ? "bg-slate-700 text-white shadow-sm" : "text-slate-400"
              }`}
            >
              Locked ({lockedBadges.length})
            </button>
          </div>
        </div>

        {/* Search & Category Pills Bar */}
        <div className="space-y-2.5 pt-1">
          
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across all 90+ badges (e.g. 'Streak', 'DSA', 'Gym', 'Shipper', 'Diamond')..."
              className="w-full rounded-xl border border-strk-border bg-surface-200 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
            />
          </div>

          {/* Group Tabs */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
            {GROUPS.map((g) => {
              const countInGroup = badges.filter((b) => g.key === "all" || b.group === g.key).length;
              const isSelected = selectedGroup === g.key;

              return (
                <button
                  key={g.key}
                  onClick={() => setSelectedGroup(g.key)}
                  className={`flex items-center space-x-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-flame-sm"
                      : "bg-surface-200 text-slate-400 hover:text-slate-200 border border-strk-border/60"
                  }`}
                >
                  <span>{g.icon}</span>
                  <span>{g.label}</span>
                  <span className="text-[10px] opacity-70">({countInGroup})</span>
                </button>
              );
            })}
          </div>

        </div>

        {/* 3 Visual States Grid: Locked / In Progress / Unlocked */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
          {filteredBadges.map((badge) => {
            const isUnlocked = Boolean(badge.unlockedAt);
            const currentProg = badge.progressCurrent || 0;
            const targetProg = badge.progressTarget || 0;
            const hasProgress = !isUnlocked && targetProg > 0 && currentProg > 0;
            const progressPercent = targetProg > 0 ? Math.min(100, Math.round((currentProg / targetProg) * 100)) : 0;

            // Visual State Classes
            let cardBorder = "border-strk-border/40 bg-surface-300/30 opacity-60"; // Locked
            let iconContainer = "border-strk-border bg-surface-300 text-slate-600 grayscale";

            if (isUnlocked) {
              cardBorder = "border-amber-500/50 bg-gradient-to-br from-amber-950/20 via-[#161824] to-[#0f101a] shadow-flame-sm";
              iconContainer = "border-amber-500/60 bg-surface-100 shadow-md";
            } else if (hasProgress) {
              cardBorder = "border-orange-500/40 bg-surface-200/90 shadow-sm";
              iconContainer = "border-orange-500/40 bg-surface-200 text-orange-400";
            }

            return (
              <div
                key={badge.id}
                className={`rounded-2xl p-4 border transition-all ${cardBorder}`}
              >
                <div className="flex items-start space-x-3">
                  
                  {/* Badge Icon */}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${iconContainer}`}
                  >
                    {isUnlocked ? (
                      BADGE_ICONS[badge.icon] || <Sparkles className="h-5 w-5 text-amber-400" />
                    ) : hasProgress ? (
                      BADGE_ICONS[badge.icon] || <Sparkles className="h-5 w-5 text-orange-400" />
                    ) : (
                      <Lock className="h-5 w-5 text-slate-600" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-sm font-bold truncate ${isUnlocked ? "text-white" : hasProgress ? "text-slate-200" : "text-slate-400"}`}>
                        {badge.isSecret && !isUnlocked ? "???" : badge.title}
                      </h4>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-extrabold uppercase ${
                          badge.tier === "monarch"
                            ? "bg-purple-900/50 text-purple-300"
                            : badge.tier === "diamond"
                            ? "bg-cyan-900/50 text-cyan-300"
                            : badge.tier === "gold"
                            ? "bg-amber-900/50 text-amber-300"
                            : badge.tier === "silver"
                            ? "bg-slate-700 text-slate-300"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {badge.tier}
                      </span>
                    </div>

                    <p className="text-xs text-strk-textMuted mt-0.5 leading-snug">
                      {badge.isSecret && !isUnlocked ? "Secret milestone. Keep pushing your limits to discover." : badge.description}
                    </p>

                    {/* In Progress State Progress Bar */}
                    {hasProgress && (
                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-orange-300">
                          <span>Progress</span>
                          <span>{currentProg} / {targetProg} ({progressPercent}%)</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-300">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Unlocked / Locked footer indicator */}
                    <div className="mt-2 text-[10px]">
                      {isUnlocked ? (
                        <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                          <ShieldCheck className="h-3 w-3" />
                          <span>Unlocked {format(parseISO(badge.unlockedAt!), "MMM d")}</span>
                        </span>
                      ) : !hasProgress ? (
                        <span className="text-slate-500">
                          {badge.isSecret ? "Mystery Condition" : "Locked"}
                        </span>
                      ) : null}
                    </div>

                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {filteredBadges.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-xs">
            No badges found matching your search and filter criteria.
          </div>
        )}

      </div>

    </div>
  );
};
