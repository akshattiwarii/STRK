"use client";

import React, { useRef, useState } from "react";
import { UserProfile, StreakStats } from "@/lib/types";
import { 
  X, 
  Download, 
  Flame, 
  Sparkles, 
  Trophy, 
  Check, 
  Share2,
  Copy,
  ShieldAlert
} from "lucide-react";
import { toPng } from "html-to-image";
import { format } from "date-fns";

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  stats: StreakStats;
}

type CardTheme = "ember" | "cyber" | "monarch" | "gold";

export const ShareCardModal: React.FC<ShareCardModalProps> = ({
  isOpen,
  onClose,
  user,
  stats,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [selectedTheme, setSelectedTheme] = useState<CardTheme>("ember");
  const [isExporting, setIsExporting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsExporting(true);

    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `strk-proof-${user.handle}-${format(new Date(), "yyyy-MM-dd")}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyLink = () => {
    const text = `🔥 ${stats.currentStreak}-Day Streak Secured on STRK ("Me vs Me")!\n\nConsistency: ${stats.consistencyRate}%\nRank: ${user.rankTitle} (Lv.${user.level})\n\nProof beats promise. Compete against who you were yesterday.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const themeStyles = {
    ember: {
      bg: "from-[#1a0c06] via-[#100703] to-[#080402]",
      border: "border-orange-500/40",
      flameText: "text-orange-400",
      accentPill: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    },
    cyber: {
      bg: "from-[#03191e] via-[#050f14] to-[#02070a]",
      border: "border-cyan-500/40",
      flameText: "text-cyan-400",
      accentPill: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    },
    monarch: {
      bg: "from-[#1a0826] via-[#0f0417] to-[#08020d]",
      border: "border-purple-500/40",
      flameText: "text-purple-400",
      accentPill: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    },
    gold: {
      bg: "from-[#211a05] via-[#120e02] to-[#080601]",
      border: "border-yellow-500/40",
      flameText: "text-yellow-400",
      accentPill: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    },
  };

  const currentStyle = themeStyles[selectedTheme];

  // Close on Escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 p-3 sm:p-4 backdrop-blur-md animate-in fade-in flex items-center justify-center min-h-screen"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-strk-border bg-[#0d0f18] shadow-2xl my-auto max-h-[92vh] flex flex-col">
        
        {/* Sticky Header with Permanent Close Button */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-strk-border/60 bg-[#0d0f18]/95 backdrop-blur-md px-5 py-3.5 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center space-x-2">
              <Share2 className="h-5 w-5 text-orange-400" />
              <span>Shareable Proof Card</span>
            </h2>
            <p className="text-[11px] text-strk-textMuted">Flex your consistency on Twitter/X, LinkedIn, or Instagram Stories.</p>
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

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 space-y-4">

        {/* Theme Picker */}
        <div className="flex items-center space-x-2 mb-4">
          <span className="text-xs font-semibold text-slate-400">Card Vibe:</span>
          {(["ember", "cyber", "monarch", "gold"] as CardTheme[]).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTheme(t)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold capitalize transition ${
                selectedTheme === t
                  ? "bg-surface-100 text-white border border-slate-400 shadow-sm"
                  : "bg-surface-300 text-slate-500 hover:text-slate-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Share Card Canvas */}
        <div
          ref={cardRef}
          className={`relative overflow-hidden rounded-2xl border ${currentStyle.border} bg-gradient-to-br ${currentStyle.bg} p-6 shadow-2xl text-slate-100`}
        >
          {/* Card Brand Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center space-x-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600/30 p-1 border border-orange-500/40">
                <Flame className="h-5 w-5 text-orange-400 animate-flame" />
              </div>
              <div>
                <span className="text-sm font-black tracking-wider text-white">STRK</span>
                <span className="ml-1 text-[10px] text-slate-400 font-medium">ME VS ME</span>
              </div>
            </div>

            <div className="text-[11px] font-bold text-slate-400">
              {format(new Date(), "MMM d, yyyy")}
            </div>
          </div>

          {/* Centerpiece Flame Counter */}
          <div className="flex flex-col items-center justify-center text-center my-4 py-4 rounded-2xl bg-black/30 border border-white/5 backdrop-blur-sm">
            <div className="relative mb-2">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-orange-500 via-amber-400 to-yellow-300 p-1 shadow-flame-md">
                <div className="flex h-full w-full items-center justify-center rounded-full bg-[#0d0f18]">
                  <Flame className="h-10 w-10 text-orange-400 animate-flame" />
                </div>
              </div>
            </div>

            <div className="text-5xl font-black text-white tracking-tight">
              {stats.currentStreak}
            </div>
            <div className={`text-xs font-black uppercase tracking-widest ${currentStyle.flameText} mt-1`}>
              Day Continuous Streak
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 my-4 text-center">
            <div className="rounded-xl bg-white/5 p-2 border border-white/5">
              <div className="text-[10px] uppercase font-bold text-slate-400">Longest</div>
              <div className="text-lg font-black text-white">{stats.longestStreak}d</div>
            </div>
            <div className="rounded-xl bg-white/5 p-2 border border-white/5">
              <div className="text-[10px] uppercase font-bold text-slate-400">Consistency</div>
              <div className="text-lg font-black text-cyan-300">{stats.consistencyRate}%</div>
            </div>
            <div className="rounded-xl bg-white/5 p-2 border border-white/5">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Proofs</div>
              <div className="text-lg font-black text-purple-300">{stats.totalLogs}</div>
            </div>
          </div>

          {/* User Profile & Rank Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
            <div className="flex items-center space-x-2">
              <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold border border-white/10">
                {user.name.slice(0, 1)}
              </div>
              <div>
                <span className="font-bold text-white block leading-tight">@{user.handle}</span>
                <span className="text-[10px] text-slate-400">{user.rankTitle}</span>
              </div>
            </div>

            <div className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${currentStyle.accentPill}`}>
              Proof-of-Work Verified
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-5 pt-3 border-t border-strk-border/60">
          <button
            onClick={handleCopyLink}
            className="flex items-center space-x-1.5 rounded-xl border border-strk-border bg-surface-200 px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white transition"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? "Copied Text!" : "Copy Post Text"}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="btn-flame flex items-center space-x-1.5 rounded-xl px-5 py-2 text-xs font-bold"
          >
            <Download className="h-4 w-4" />
            <span>{isExporting ? "Rendering PNG..." : "Download HD Card"}</span>
          </button>
        </div>

        </div>

      </div>
    </div>
  );
};
