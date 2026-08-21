"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  DailyLog, 
  Goal, 
  Badge, 
  WeeklyReflection, 
  UserProfile, 
  StreakStats 
} from "@/lib/types";
import { 
  loadUserLogs,
  saveUserLogs,
  loadUserGoals,
  saveUserGoals,
  loadUserReflections,
  saveUserReflections,
  loadUserFreezeDates,
  saveUserFreezeDates,
  loadBadgesFromStorage,
  saveUserBadges
} from "@/lib/storage";
import { 
  getCurrentSessionUser, 
  updateUserInRegistry, 
  logoutUser
} from "@/lib/auth";
import { calculateStreakStats } from "@/lib/streakEngine";
import { DEFAULT_BADGES, checkUnlockedBadges, getRankForXp } from "@/lib/gamification";
import { Navbar } from "@/components/Navbar";
import { StreakHero } from "@/components/StreakHero";
import { HeatmapCalendar } from "@/components/HeatmapCalendar";
import { LogFeed } from "@/components/LogFeed";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { GoalsTracker } from "@/components/GoalsTracker";
import { GamificationView } from "@/components/GamificationView";
import { QuickLogModal } from "@/components/QuickLogModal";
import { WeeklyReflectionModal } from "@/components/WeeklyReflectionModal";
import { ShareCardModal } from "@/components/ShareCardModal";
import { DayDetailModal } from "@/components/DayDetailModal";
import { DataManagementModal } from "@/components/DataManagementModal";
import { AuthModal } from "@/components/AuthModal";
import { ProfileModal } from "@/components/ProfileModal";
import { LandingHero } from "@/components/LandingHero";
import { format } from "date-fns";
import { Calendar, Plus, Flame } from "lucide-react";
import { playSound } from "@/lib/soundEffects";

import { 
  isSupabaseConfigured,
  cloudFetchUserLogs,
  cloudFetchUserGoals,
  cloudFetchUserReflections
} from "@/lib/supabaseClient";

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "analytics" | "goals" | "gamification">("dashboard");

  // Core App State (Null if unauthenticated)
  const [user, setUser] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [badges, setBadges] = useState<Badge[]>(DEFAULT_BADGES);
  const [reflections, setReflections] = useState<WeeklyReflection[]>([]);
  const [freezeDates, setFreezeDates] = useState<string[]>([]);

  // Modals state
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isReflectionModalOpen, setIsReflectionModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "signup">("login");
  
  // Day detail modal
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null);
  const [selectedDayLogs, setSelectedDayLogs] = useState<DailyLog[]>([]);
  const [isDayDetailOpen, setIsDayDetailOpen] = useState(false);

  // Load state scoped strictly to the authenticated user
  const loadUserState = useCallback((currentUser: UserProfile | null) => {
    if (!currentUser) {
      setUser(null);
      setLogs([]);
      setGoals([]);
      setBadges(DEFAULT_BADGES);
      setReflections([]);
      setFreezeDates([]);
      return;
    }

    const loadedLogs = loadUserLogs(currentUser.id);
    const loadedGoals = loadUserGoals(currentUser.id);
    const loadedBadges = loadBadgesFromStorage(currentUser.id);
    const loadedReflections = loadUserReflections(currentUser.id);
    const loadedFreeze = loadUserFreezeDates(currentUser.id);

    setUser(currentUser);
    setLogs(loadedLogs);
    setGoals(loadedGoals);
    setBadges(loadedBadges);
    setReflections(loadedReflections);
    setFreezeDates(loadedFreeze);

    // Multi-device real-time sync with Supabase PostgreSQL cloud
    if (isSupabaseConfigured()) {
      cloudFetchUserLogs(currentUser.id).then((cloudLogs) => {
        if (cloudLogs && cloudLogs.length > 0) {
          setLogs((prev) => {
            const map = new Map<string, DailyLog>();
            cloudLogs.forEach((l) => map.set(l.id, l));
            prev.forEach((l) => map.set(l.id, l));
            const merged = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
            saveUserLogs(currentUser.id, merged);
            return merged;
          });
        }
      }).catch(() => {});

      cloudFetchUserGoals(currentUser.id).then((cloudGoals) => {
        if (cloudGoals && cloudGoals.length > 0) {
          setGoals((prev) => {
            const map = new Map<string, Goal>();
            cloudGoals.forEach((g) => map.set(g.id, g));
            prev.forEach((g) => map.set(g.id, g));
            const merged = Array.from(map.values());
            saveUserGoals(currentUser.id, merged);
            return merged;
          });
        }
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    setIsClient(true);
    const sessionUser = getCurrentSessionUser();
    loadUserState(sessionUser);
  }, [loadUserState]);

  // Derived stats
  const stats: StreakStats = calculateStreakStats(logs, freezeDates);

  // Check badges whenever stats, logs, goals, or reflections change for active user
  useEffect(() => {
    if (!isClient || !user) return;
    const updatedBadges = checkUnlockedBadges(logs, stats, user, goals, badges, reflections);
    const hasNewUnlock = updatedBadges.some((b, i) => !badges[i]?.unlockedAt && b.unlockedAt);
    if (hasNewUnlock) {
      setBadges(updatedBadges);
      saveUserBadges(user.id, updatedBadges);
      if (user.soundEnabled) playSound("badge");
    }
  }, [logs, stats, user, goals, badges, reflections, isClient]);

  // Handlers
  const handleSaveLog = (newLogData: Omit<DailyLog, "id" | "timestamp">) => {
    if (!user) return;

    const newLog: DailyLog = {
      ...newLogData,
      id: `log_${Date.now()}`,
      timestamp: Date.now(),
    };

    const existingIndex = logs.findIndex((l) => l.date === newLog.date);
    let updatedLogs: DailyLog[];

    if (existingIndex >= 0) {
      updatedLogs = [...logs, newLog];
    } else {
      updatedLogs = [newLog, ...logs];
    }

    setLogs(updatedLogs);
    saveUserLogs(user.id, updatedLogs);

    // Update linked goal if selected
    let goalBonusXp = 0;
    if (newLog.goalId) {
      const updatedGoals = goals.map((g) => {
        if (g.id === newLog.goalId) {
          const nextCount = g.currentCount + 1;
          const justCompleted = !g.completed && nextCount >= g.targetCount;
          if (justCompleted) goalBonusXp += 30; // +30 XP Goal Milestone bonus

          return {
            ...g,
            currentCount: nextCount,
            completed: nextCount >= g.targetCount,
          };
        }
        return g;
      });
      setGoals(updatedGoals);
      saveUserGoals(user.id, updatedGoals);
    }

    // Recalculate streak & 14-day freeze token reward
    const newStats = calculateStreakStats(updatedLogs, freezeDates);
    let newFreezeTokens = user.freezeTokens;
    if (newStats.currentStreak > 0 && newStats.currentStreak % 14 === 0 && stats.currentStreak % 14 !== 0) {
      newFreezeTokens = Math.min(3, newFreezeTokens + 1);
      if (user.soundEnabled) playSound("freeze");
    }

    // Award XP and recalculate Solo Leveling rank
    const nextTotalXp = user.totalXp + newLog.xpEarned + goalBonusXp;
    const nextRank = getRankForXp(nextTotalXp);
    const updatedUser = updateUserInRegistry(user.id, {
      freezeTokens: newFreezeTokens,
      totalXp: nextTotalXp,
      level: nextRank.level,
      rankTitle: nextRank.title,
    });
    setUser(updatedUser);
  };

  const handleDeleteLog = (id: string) => {
    if (!user) return;
    const targetLog = logs.find((l) => l.id === id);
    const updated = logs.filter((l) => l.id !== id);
    setLogs(updated);
    saveUserLogs(user.id, updated);

    // If log is found, deduct its earned XP and recalculate rank tier
    if (targetLog) {
      const nextTotalXp = Math.max(0, user.totalXp - (targetLog.xpEarned || 0));
      const nextRank = getRankForXp(nextTotalXp);
      const updatedUser = updateUserInRegistry(user.id, {
        totalXp: nextTotalXp,
        level: nextRank.level,
        rankTitle: nextRank.title,
      });
      setUser(updatedUser);

      // If this log was linked to a goal, decrement the goal count
      if (targetLog.goalId) {
        const updatedGoals = goals.map((g) => {
          if (g.id === targetLog.goalId) {
            const nextCount = Math.max(0, g.currentCount - 1);
            return {
              ...g,
              currentCount: nextCount,
              completed: nextCount >= g.targetCount,
            };
          }
          return g;
        });
        setGoals(updatedGoals);
        saveUserGoals(user.id, updatedGoals);
      }
    }
  };

  const handleUseFreeze = () => {
    if (!user || user.freezeTokens <= 0) return;
    const todayStr = format(new Date(), "yyyy-MM-dd");
    if (freezeDates.includes(todayStr)) return;

    const updatedFreeze = [...freezeDates, todayStr];
    const updatedUser = updateUserInRegistry(user.id, {
      freezeTokens: user.freezeTokens - 1,
    });

    setFreezeDates(updatedFreeze);
    setUser(updatedUser);
    saveUserFreezeDates(user.id, updatedFreeze);
  };

  const handleToggleSound = () => {
    if (!user) return;
    const updatedUser = updateUserInRegistry(user.id, {
      soundEnabled: !user.soundEnabled,
    });
    setUser(updatedUser);
  };

  const handleAddGoal = (goalData: Omit<Goal, "id" | "createdAt">) => {
    if (!user) return;
    const newGoal: Goal = {
      ...goalData,
      id: `goal_${Date.now()}`,
      createdAt: format(new Date(), "yyyy-MM-dd"),
    };
    const updatedGoals = [newGoal, ...goals];
    setGoals(updatedGoals);
    saveUserGoals(user.id, updatedGoals);
  };

  const handleUpdateGoalProgress = (goalId: string, delta: number) => {
    if (!user) return;
    let bonusXp = 0;
    const updated = goals.map((g) => {
      if (g.id === goalId) {
        const nextCount = Math.max(0, g.currentCount + delta);
        const justCompleted = !g.completed && nextCount >= g.targetCount;
        if (justCompleted) {
          bonusXp += 30;
          if (user.soundEnabled) playSound("levelup");
        }
        return {
          ...g,
          currentCount: nextCount,
          completed: nextCount >= g.targetCount,
        };
      }
      return g;
    });
    setGoals(updated);
    saveUserGoals(user.id, updated);

    if (bonusXp > 0) {
      const nextTotalXp = user.totalXp + bonusXp;
      const updatedUser = updateUserInRegistry(user.id, {
        totalXp: nextTotalXp,
      });
      setUser(updatedUser);
    }
  };

  const handleDeleteGoal = (goalId: string) => {
    if (!user) return;
    const updated = goals.filter((g) => g.id !== goalId);
    setGoals(updated);
    saveUserGoals(user.id, updated);
  };

  const handleSaveReflection = (reflectionData: Omit<WeeklyReflection, "id" | "createdAt">) => {
    if (!user) return;
    const newRefl: WeeklyReflection = {
      ...reflectionData,
      id: `refl_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newRefl, ...reflections];
    setReflections(updated);
    saveUserReflections(user.id, updated);

    // Reward +20 XP for weekly reflection
    const nextTotalXp = user.totalXp + 20;
    const updatedUser = updateUserInRegistry(user.id, {
      totalXp: nextTotalXp,
    });
    setUser(updatedUser);
  };

  const handleCalendarDateSelect = (dateStr: string, dayLogs: DailyLog[]) => {
    setSelectedCalendarDate(dateStr);
    setSelectedDayLogs(dayLogs);
    setIsDayDetailOpen(true);
  };

  const handleAuthSuccess = (authenticatedUser: UserProfile) => {
    loadUserState(authenticatedUser);
  };

  const handleLogout = () => {
    logoutUser();
    loadUserState(null);
  };

  const handleOpenAuth = (mode: "login" | "signup") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col justify-between">
      
      <div>
        {/* Navbar */}
        <Navbar
          user={user}
          stats={stats}
          onOpenLogModal={() => setIsLogModalOpen(true)}
          onOpenShareModal={() => setIsShareModalOpen(true)}
          onOpenDataModal={() => setIsDataModalOpen(true)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onOpenAuthModal={handleOpenAuth}
          onToggleSound={handleToggleSound}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Main Content Area */}
        <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8 pb-28 md:pb-12">
          
          {/* If NOT logged in: Show Privacy-First Landing Hero */}
          {!user ? (
            <LandingHero onOpenAuthModal={handleOpenAuth} />
          ) : (
            /* Authenticated User Dashboard */
            <>
              {/* TAB 1: DASHBOARD (Feed + Heatmap + Hero) */}
              {activeTab === "dashboard" && (
                <div className="space-y-6">
                  
                  {/* Streak Centerpiece */}
                  <StreakHero
                    stats={stats}
                    user={user}
                    onOpenLogModal={() => setIsLogModalOpen(true)}
                    onUseFreeze={handleUseFreeze}
                  />

                  {/* Heatmap Contribution Calendar */}
                  <HeatmapCalendar
                    logs={logs}
                    freezeDates={freezeDates}
                    onSelectDate={handleCalendarDateSelect}
                  />

                  {/* Sunday Reflection Nudge */}
                  <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 text-center sm:text-left">
                      <div className="rounded-xl bg-purple-600/20 p-2 text-purple-400 border border-purple-500/30">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Weekly Discipline Reflection</h4>
                        <p className="text-xs text-strk-textMuted">
                          Review what went right, what slipped, and calibrate your next week's focus (+20 XP bonus).
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsReflectionModalOpen(true)}
                      className="rounded-xl border border-purple-500/40 bg-purple-900/40 px-4 py-2 text-xs font-bold text-purple-200 hover:bg-purple-800/50 transition shrink-0"
                    >
                      Write Weekly Review
                    </button>
                  </div>

                  {/* Proof of Work Timeline Feed */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-black text-white flex items-center space-x-2">
                          <Flame className="h-5 w-5 text-orange-500" />
                          <span>Daily Proof-of-Work Stream</span>
                        </h3>
                        <p className="text-xs text-strk-textMuted">Your authentic timeline of daily effort and discipline.</p>
                      </div>

                      <button
                        onClick={() => setIsLogModalOpen(true)}
                        className="btn-flame hidden sm:flex items-center space-x-1 rounded-xl px-3.5 py-1.5 text-xs font-bold"
                      >
                        <Plus className="h-4 w-4 stroke-[3]" />
                        <span>Post Proof</span>
                      </button>
                    </div>

                    <LogFeed
                      logs={logs}
                      onDeleteLog={handleDeleteLog}
                      onEditLog={() => {}}
                    />
                  </div>

                </div>
              )}

              {/* TAB 2: ANALYTICS */}
              {activeTab === "analytics" && (
                <AnalyticsDashboard logs={logs} stats={stats} />
              )}

              {/* TAB 3: GOALS */}
              {activeTab === "goals" && (
                <GoalsTracker
                  goals={goals}
                  onAddGoal={handleAddGoal}
                  onUpdateGoalProgress={handleUpdateGoalProgress}
                  onDeleteGoal={handleDeleteGoal}
                />
              )}

              {/* TAB 4: GAMIFICATION / RANKS & BADGES */}
              {activeTab === "gamification" && (
                <GamificationView user={user} badges={badges} stats={stats} />
              )}
            </>
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-strk-border/60 bg-[#06070a] py-6 text-center text-xs text-strk-textMuted">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-white">STRK</span>
            <span>— "Me vs Me" Consistency Engine</span>
          </div>
          <div>
            <span>Discipline beats talent. Competition with yourself only.</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {user && (
        <>
          <QuickLogModal
            isOpen={isLogModalOpen}
            onClose={() => setIsLogModalOpen(false)}
            onSaveLog={handleSaveLog}
            goals={goals}
            currentStreak={stats.currentStreak}
            isFirstLogToday={!stats.activeToday}
            soundEnabled={user.soundEnabled}
          />

          <WeeklyReflectionModal
            isOpen={isReflectionModalOpen}
            onClose={() => setIsReflectionModalOpen(false)}
            onSaveReflection={handleSaveReflection}
            soundEnabled={user.soundEnabled}
          />

          <ShareCardModal
            isOpen={isShareModalOpen}
            onClose={() => setIsShareModalOpen(false)}
            user={user}
            stats={stats}
          />

          <DayDetailModal
            isOpen={isDayDetailOpen}
            onClose={() => setIsDayDetailOpen(false)}
            date={selectedCalendarDate}
            dayLogs={selectedDayLogs}
            onDeleteLog={handleDeleteLog}
          />

          <DataManagementModal
            isOpen={isDataModalOpen}
            onClose={() => setIsDataModalOpen(false)}
            onDataReload={() => loadUserState(user)}
            userId={user.id}
          />

          <ProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            user={user}
            stats={stats}
            badgesCount={badges.filter((b) => Boolean(b.unlockedAt)).length}
            onUpdateUser={setUser}
            onLogout={handleLogout}
          />
        </>
      )}

      {/* Auth Modal (Available for login & account creation) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        soundEnabled={user ? user.soundEnabled : true}
        initialMode={authModalMode}
      />

    </div>
  );
}
