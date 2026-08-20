"use client";

import React from "react";
import { 
  Flame, 
  ShieldAlert, 
  Plus, 
  Share2, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Database,
  BarChart3,
  CalendarDays,
  Target,
  Trophy,
  LogIn,
  UserPlus
} from "lucide-react";
import { UserProfile, StreakStats } from "@/lib/types";
import { playSound } from "@/lib/soundEffects";

interface NavbarProps {
  user: UserProfile | null;
  stats: StreakStats;
  onOpenLogModal: () => void;
  onOpenShareModal: () => void;
  onOpenDataModal: () => void;
  onOpenProfileModal: () => void;
  onOpenAuthModal: (mode: "login" | "signup") => void;
  onToggleSound: () => void;
  activeTab: "dashboard" | "analytics" | "goals" | "gamification";
  setActiveTab: (tab: "dashboard" | "analytics" | "goals" | "gamification") => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  stats,
  onOpenLogModal,
  onOpenShareModal,
  onOpenDataModal,
  onOpenProfileModal,
  onOpenAuthModal,
  onToggleSound,
  activeTab,
  setActiveTab,
}) => {
  const handleTabChange = (tab: "dashboard" | "analytics" | "goals" | "gamification") => {
    if (user?.soundEnabled) playSound("click");
    setActiveTab(tab);
  };

  return (
    <>
      {/* Top Sticky Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-strk-border/70 bg-[#08090d]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer" onClick={() => handleTabChange("dashboard")}>
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 p-[2px] shadow-flame-sm shrink-0">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#08090d]">
                <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500 animate-flame" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="text-lg sm:text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200">
                  STRK
                </span>
                <span className="rounded-full bg-orange-500/10 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-orange-400 border border-orange-500/20">
                  ME VS ME
                </span>
              </div>
              <p className="hidden text-[11px] font-medium text-strk-textMuted sm:block">
                Daily Proof-of-Work Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          {user && (
            <nav className="hidden md:flex items-center space-x-1 rounded-xl bg-surface-200/80 p-1 border border-strk-border/60">
              <button
                onClick={() => handleTabChange("dashboard")}
                className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === "dashboard"
                    ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-flame-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-surface-100"
                }`}
              >
                <CalendarDays className="h-4 w-4" />
                <span>Heatmap & Feed</span>
              </button>

              <button
                onClick={() => handleTabChange("analytics")}
                className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === "analytics"
                    ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-flame-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-surface-100"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </button>

              <button
                onClick={() => handleTabChange("goals")}
                className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === "goals"
                    ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-flame-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-surface-100"
                }`}
              >
                <Target className="h-4 w-4" />
                <span>Goals</span>
              </button>

              <button
                onClick={() => handleTabChange("gamification")}
                className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  activeTab === "gamification"
                    ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-flame-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-surface-100"
                }`}
              >
                <Trophy className="h-4 w-4" />
                <span>Rank & Badges</span>
              </button>
            </nav>
          )}

          {/* Right Actions */}
          {user ? (
            <div className="flex items-center space-x-1.5 sm:space-x-2.5">
              {/* Streak Flame Pill */}
              <div className="flex items-center space-x-1 rounded-xl bg-orange-950/40 border border-orange-500/30 px-2 sm:px-3 py-1 sm:py-1.5 shadow-flame-sm">
                <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-400 animate-pulse" />
                <span className="text-xs sm:text-sm font-extrabold text-orange-300">
                  {stats.currentStreak}
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium text-orange-400/80">d</span>
              </div>

              {/* Freeze Shield Pill */}
              <div 
                title={`${user.freezeTokens} Streak Freeze Shields available`}
                className="hidden sm:flex items-center space-x-1 rounded-xl bg-cyan-950/40 border border-cyan-500/30 px-2.5 py-1.5 text-xs font-semibold text-cyan-300"
              >
                <ShieldAlert className="h-3.5 w-3.5 text-cyan-400" />
                <span>{user.freezeTokens}</span>
              </div>

              {/* Level / XP Pill */}
              <div className="hidden lg:flex items-center space-x-1.5 rounded-xl bg-purple-950/40 border border-purple-500/30 px-2.5 py-1.5 text-xs font-semibold text-purple-300">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                <span>Lv.{user.level}</span>
              </div>

              {/* Sound Toggle */}
              <button
                onClick={onToggleSound}
                title={user.soundEnabled ? "Mute sound cues" : "Unmute sound cues"}
                className="hidden md:flex rounded-xl border border-strk-border bg-surface-200 p-2 text-slate-400 hover:text-slate-200 hover:border-slate-600 transition"
              >
                {user.soundEnabled ? <Volume2 className="h-4 w-4 text-amber-400" /> : <VolumeX className="h-4 w-4" />}
              </button>

              {/* Share Streak Card */}
              <button
                onClick={onOpenShareModal}
                title="Generate Shareable Streak Card"
                className="hidden sm:flex rounded-xl border border-strk-border bg-surface-200 p-2 text-slate-400 hover:text-orange-400 hover:border-orange-500/40 transition"
              >
                <Share2 className="h-4 w-4" />
              </button>

              {/* Backup / Data Management */}
              <button
                onClick={onOpenDataModal}
                title="Data & Backup Management"
                className="hidden sm:flex rounded-xl border border-strk-border bg-surface-200 p-2 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition"
              >
                <Database className="h-4 w-4" />
              </button>

              {/* User Profile Button */}
              <button
                onClick={onOpenProfileModal}
                title={`${user.name} (@${user.handle}) • Profile & Settings`}
                className="flex items-center space-x-1.5 sm:space-x-2 rounded-xl border border-strk-border bg-surface-200/90 p-1 sm:pl-1.5 sm:pr-2.5 hover:border-purple-500/50 hover:bg-surface-100 transition group"
              >
                <div className="relative h-7 w-7 overflow-hidden rounded-full border border-purple-500/60 group-hover:scale-105 transition shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                </div>
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-tight group-hover:text-purple-300 transition">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-none">
                    Lv.{user.level} {user.rankTitle}
                  </span>
                </div>
              </button>

              {/* "+ New Proof" CTA */}
              <button
                onClick={onOpenLogModal}
                className="btn-flame flex items-center space-x-1 sm:space-x-1.5 rounded-xl px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold shrink-0"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[3]" />
                <span className="hidden sm:inline">Log Today</span>
                <span className="sm:hidden text-[11px]">Log</span>
              </button>
            </div>
          ) : (
            /* Unauthenticated Guest Actions */
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <button
                onClick={() => onOpenAuthModal("login")}
                className="flex items-center space-x-1 sm:space-x-1.5 rounded-xl border border-strk-border bg-surface-200 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-slate-200 hover:bg-surface-100 hover:text-white transition"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => onOpenAuthModal("signup")}
                className="btn-flame flex items-center space-x-1 sm:space-x-1.5 rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold shadow-flame-sm"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Sign Up</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Fixed Sticky Bottom Navigation Bar on Mobile */}
      {user && (
        <div className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden items-center justify-around border-t border-strk-border/80 bg-[#090b14]/95 backdrop-blur-xl px-2 py-2 shadow-2xl">
          <button
            onClick={() => handleTabChange("dashboard")}
            className={`flex flex-col items-center justify-center space-y-0.5 rounded-xl px-3 py-1 text-[11px] font-bold transition-all ${
              activeTab === "dashboard"
                ? "text-orange-400 bg-orange-950/40 border border-orange-500/40 shadow-flame-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            <span>Feed</span>
          </button>

          <button
            onClick={() => handleTabChange("analytics")}
            className={`flex flex-col items-center justify-center space-y-0.5 rounded-xl px-3 py-1 text-[11px] font-bold transition-all ${
              activeTab === "analytics"
                ? "text-orange-400 bg-orange-950/40 border border-orange-500/40 shadow-flame-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Stats</span>
          </button>

          <button
            onClick={() => handleTabChange("goals")}
            className={`flex flex-col items-center justify-center space-y-0.5 rounded-xl px-3 py-1 text-[11px] font-bold transition-all ${
              activeTab === "goals"
                ? "text-orange-400 bg-orange-950/40 border border-orange-500/40 shadow-flame-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Target className="h-4 w-4" />
            <span>Goals</span>
          </button>

          <button
            onClick={() => handleTabChange("gamification")}
            className={`flex flex-col items-center justify-center space-y-0.5 rounded-xl px-3 py-1 text-[11px] font-bold transition-all ${
              activeTab === "gamification"
                ? "text-orange-400 bg-orange-950/40 border border-orange-500/40 shadow-flame-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Trophy className="h-4 w-4" />
            <span>Ranks</span>
          </button>
        </div>
      )}
    </>
  );
};
