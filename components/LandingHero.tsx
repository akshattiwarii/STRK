"use client";

import React from "react";
import { 
  Flame, 
  Sparkles, 
  ShieldCheck, 
  Lock, 
  TrendingUp, 
  Trophy, 
  Calendar, 
  UserPlus, 
  LogIn,
  CheckCircle2,
  Zap,
  Target
} from "lucide-react";

interface LandingHeroProps {
  onOpenAuthModal: (mode: "login" | "signup") => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({ onOpenAuthModal }) => {
  return (
    <div className="relative overflow-hidden pt-6 pb-16">
      
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-orange-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 h-80 w-80 rounded-full bg-purple-600/10 blur-[100px] pointer-events-none" />

      {/* Main Hero Header */}
      <div className="relative mx-auto max-w-4xl text-center space-y-6">
        
        {/* Philosophy Badge */}
        <div className="inline-flex items-center space-x-2 rounded-full border border-orange-500/30 bg-orange-950/30 px-4 py-1.5 shadow-flame-sm animate-fade-in">
          <Flame className="h-4 w-4 text-orange-400 animate-pulse" />
          <span className="text-xs font-black tracking-wide text-orange-300 uppercase">
            The "Me vs Me" Consistency Platform
          </span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Win the battle against{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-200">
            who you were yesterday.
          </span>
        </h1>

        {/* Hero Description */}
        <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
          No toxic vanity comparison. No distraction. Just authentic daily proof-of-work, fiery consistency streaks, Solo Leveling ranks, and loss aversion psychology designed to make you unstoppable.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onOpenAuthModal("signup")}
            className="btn-flame flex items-center justify-center space-x-2 rounded-xl px-7 py-3.5 text-sm font-black shadow-flame-lg w-full sm:w-auto"
          >
            <UserPlus className="h-4 w-4" />
            <span>Create Your Free Profile</span>
          </button>

          <button
            onClick={() => onOpenAuthModal("login")}
            className="flex items-center justify-center space-x-2 rounded-xl border border-strk-border bg-surface-200 px-6 py-3.5 text-sm font-bold text-slate-200 hover:bg-surface-100 hover:text-white transition w-full sm:w-auto"
          >
            <LogIn className="h-4 w-4" />
            <span>Sign In to Dashboard</span>
          </button>
        </div>

        {/* Privacy Highlight */}
        <div className="flex items-center justify-center space-x-2 text-xs text-slate-400 pt-2">
          <Lock className="h-3.5 w-3.5 text-emerald-400" />
          <span>Private by default. Your logs and streaks are strictly your own.</span>
        </div>

      </div>

      {/* Feature Showcase Grid */}
      <div className="mx-auto max-w-5xl mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="rounded-2xl border border-strk-border/70 bg-[#0e101b]/90 p-5 shadow-xl hover:border-orange-500/40 transition">
          <div className="rounded-xl bg-orange-500/10 p-2.5 w-fit text-orange-400 mb-3 border border-orange-500/20">
            <Flame className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-black text-white mb-1">Fiery Streaks & Heatmap</h3>
          <p className="text-xs text-strk-textMuted leading-relaxed">
            GitHub-style fiery activity matrix with 5 intensity levels, active flame multiplier, and streak shield freeze protection.
          </p>
        </div>

        <div className="rounded-2xl border border-strk-border/70 bg-[#0e101b]/90 p-5 shadow-xl hover:border-purple-500/40 transition">
          <div className="rounded-xl bg-purple-500/10 p-2.5 w-fit text-purple-400 mb-3 border border-purple-500/20">
            <Trophy className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-black text-white mb-1">Solo Leveling Ranks</h3>
          <p className="text-xs text-strk-textMuted leading-relaxed">
            Progress from Novice 🌱 to Monarch 🌌. Earn base XP, 50+ word bonuses, and tag multipliers for authentic daily effort.
          </p>
        </div>

        <div className="rounded-2xl border border-strk-border/70 bg-[#0e101b]/90 p-5 shadow-xl hover:border-cyan-500/40 transition">
          <div className="rounded-xl bg-cyan-500/10 p-2.5 w-fit text-cyan-400 mb-3 border border-cyan-500/20">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-black text-white mb-1">90+ Master Badges</h3>
          <p className="text-xs text-strk-textMuted leading-relaxed">
            Unlock achievements across DSA, Gym, Dev, Cyber, Reading, and Life balance with live progress tracking and secret mystery tiers.
          </p>
        </div>

        <div className="rounded-2xl border border-strk-border/70 bg-[#0e101b]/90 p-5 shadow-xl hover:border-emerald-500/40 transition">
          <div className="rounded-xl bg-emerald-500/10 p-2.5 w-fit text-emerald-400 mb-3 border border-emerald-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-black text-white mb-1">Discipline Engine</h3>
          <p className="text-xs text-strk-textMuted leading-relaxed">
            Weekly Sunday self-reflections, target milestone goals, and beautiful downloadable proof cards to record your journey.
          </p>
        </div>

      </div>

    </div>
  );
};
