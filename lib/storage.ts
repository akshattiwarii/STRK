import { DailyLog, Goal, Badge, WeeklyReflection, UserProfile } from "./types";
import { DEFAULT_BADGES, getRankForXp } from "./gamification";
import { format, subDays } from "date-fns";
import { 
  isSupabaseConfigured, 
  cloudSaveUserLog, 
  cloudDeleteUserLog, 
  cloudSaveUserGoal, 
  cloudDeleteUserGoal, 
  cloudSaveUserReflection, 
  cloudUpdateUserProfile 
} from "./supabaseClient";

export const STORAGE_KEYS = {
  LOGS: "strk_logs_v1",
  GOALS: "strk_goals_v1",
  BADGES: "strk_badges_v1",
  REFLECTIONS: "strk_reflections_v1",
  USER: "strk_user_v1",
  FREEZE_DATES: "strk_freeze_dates_v1",
};

export const INITIAL_USER: UserProfile = {
  id: "user_akshat",
  email: "akshat@strk.dev",
  password: "password123",
  name: "Akshat",
  handle: "akshat_dev",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  bio: "Solo Hunter • Building the future one streak at a time • Me vs Me ⚔️",
  isPublic: true,
  theme: "ember",
  freezeTokens: 2,
  autoFreezeEnabled: true,
  totalXp: 820,
  level: 2,
  rankTitle: "Apprentice",
  soundEnabled: true,
  focusCategories: ["DSA", "Gym", "Coding", "Project"],
  createdAt: "2026-01-01T00:00:00.000Z",
};

export function getInitialSeedLogs(): DailyLog[] {
  const today = new Date();
  const seedEntries: Array<{
    daysAgo: number;
    content: string;
    categories: Array<"DSA" | "Gym" | "Coding" | "Project" | "Cybersecurity" | "Reading" | "Health" | "Deep Work" | "Writing">;
    mood: "fire" | "high" | "good" | "neutral" | "drained";
    energyLevel: number;
    xpEarned: number;
  }> = [
    {
      daysAgo: 14,
      content: "Solved 3 Hard Dynamic Programming problems on LeetCode. DP state compression finally clicked! 🚀",
      categories: ["DSA", "Coding"],
      mood: "fire",
      energyLevel: 5,
      xpEarned: 25,
    },
    {
      daysAgo: 13,
      content: "Heavy Leg day at the Gym: Squats 120kg 4x5, Bulgarian split squats. Pain is just weakness leaving the body.",
      categories: ["Gym", "Health"],
      mood: "high",
      energyLevel: 4,
      xpEarned: 20,
    },
    {
      daysAgo: 12,
      content: "Built Supabase auth flow and realtime subscription listeners for the SaaS project.",
      categories: ["Project", "Coding"],
      mood: "good",
      energyLevel: 4,
      xpEarned: 25,
    },
    {
      daysAgo: 11,
      content: "Read 25 pages of 'Atomic Habits' chapter 4. 'You do not rise to the level of your goals. You fall to the level of your systems.'",
      categories: ["Reading"],
      mood: "good",
      energyLevel: 3,
      xpEarned: 15,
    },
    {
      daysAgo: 10,
      content: "Solved 4 Binary Search Tree & Graph problems. Clean BFS/DFS traversal implementations.",
      categories: ["DSA"],
      mood: "fire",
      energyLevel: 5,
      xpEarned: 25,
    },
    {
      daysAgo: 9,
      content: "Chest & Triceps workout + 20 min HIIT cardio. Crushed bench press PR 95kg!",
      categories: ["Gym"],
      mood: "high",
      energyLevel: 5,
      xpEarned: 20,
    },
    {
      daysAgo: 8,
      content: "Shipped the MVP landing page with glassmorphism UI & responsive dark mode.",
      categories: ["Project", "Coding"],
      mood: "fire",
      energyLevel: 5,
      xpEarned: 25,
    },
    {
      daysAgo: 7,
      content: "Deep work session: 4 hours of uninterrupted backend indexing and query optimization.",
      categories: ["Deep Work", "Coding"],
      mood: "high",
      energyLevel: 4,
      xpEarned: 25,
    },
    {
      daysAgo: 6,
      content: "Completed Weekly Contest 410 on LeetCode. Ranked in top 8%! Solved 3/4 questions.",
      categories: ["DSA"],
      mood: "fire",
      energyLevel: 5,
      xpEarned: 30,
    },
    {
      daysAgo: 5,
      content: "Back & Biceps workout + Deadlifts 140kg. Form felt rock solid.",
      categories: ["Gym", "Health"],
      mood: "good",
      energyLevel: 4,
      xpEarned: 20,
    },
    {
      daysAgo: 4,
      content: "Architected the Streak engine logic and state persistence layer. Clean TypeScript interfaces.",
      categories: ["Project", "Coding"],
      mood: "high",
      energyLevel: 4,
      xpEarned: 25,
    },
    {
      daysAgo: 3,
      content: "Read 30 pages of 'Designing Data-Intensive Applications'. Learned LSM-Trees vs B-Trees.",
      categories: ["Reading", "Deep Work"],
      mood: "good",
      energyLevel: 4,
      xpEarned: 20,
    },
    {
      daysAgo: 2,
      content: "Shoulders & Arms hypertrophy session. High volume, zero distractions.",
      categories: ["Gym"],
      mood: "high",
      energyLevel: 4,
      xpEarned: 20,
    },
    {
      daysAgo: 1,
      content: "Solved 2 Trie problems and 1 Segment Tree question on LeetCode. Algo streak holding strong at 14 days!",
      categories: ["DSA", "Coding"],
      mood: "fire",
      energyLevel: 5,
      xpEarned: 30,
    },
    {
      daysAgo: 0,
      content: "Launched STRK platform v1! Logged today's code sprint and gym workout. The only opponent is who I was yesterday.",
      categories: ["Project", "Coding", "Gym"],
      mood: "fire",
      energyLevel: 5,
      xpEarned: 30,
    },
  ];

  return seedEntries.map((e, idx) => {
    const dateStr = format(subDays(today, e.daysAgo), "yyyy-MM-dd");
    return {
      id: `seed_log_${idx + 1}`,
      date: dateStr,
      timestamp: subDays(today, e.daysAgo).getTime(),
      content: e.content,
      categories: e.categories,
      mood: e.mood,
      energyLevel: e.energyLevel,
      xpEarned: e.xpEarned,
      goalId: e.categories.includes("DSA") ? "goal_dsa_300" : e.categories.includes("Gym") ? "goal_gym_100" : undefined,
    };
  });
}

export const INITIAL_GOALS: Goal[] = [
  {
    id: "goal_dsa_300",
    title: "Master 300 LeetCode Problems",
    category: "DSA",
    targetCount: 300,
    currentCount: 142,
    unit: "Problems",
    deadline: "2026-12-31",
    completed: false,
    createdAt: "2026-01-01",
  },
  {
    id: "goal_gym_100",
    title: "100 High-Intensity Gym Sessions",
    category: "Gym",
    targetCount: 100,
    currentCount: 48,
    unit: "Workouts",
    deadline: "2026-10-30",
    completed: false,
    createdAt: "2026-01-01",
  },
  {
    id: "goal_ship_saas",
    title: "Ship 3 Full-Stack SaaS Products",
    category: "Project",
    targetCount: 3,
    currentCount: 1,
    unit: "Projects",
    deadline: "2026-11-15",
    completed: false,
    createdAt: "2026-02-01",
  },
];

export const INITIAL_REFLECTIONS: WeeklyReflection[] = [
  {
    id: "refl_1",
    weekStartDate: format(subDays(new Date(), 14), "yyyy-MM-dd"),
    weekEndDate: format(subDays(new Date(), 8), "yyyy-MM-dd"),
    score: 9,
    highlight: "Maintained 100% streak, smashed bench press PR, and solved all LeetCode DP targets without skipping a single day.",
    slipUp: "Stayed up too late on Thursday scrolling Twitter. Need to enforce 11 PM screen cutoff.",
    nextWeekFocus: "Focus heavily on Graph algorithms and shipping the core UI components for STRK.",
    createdAt: subDays(new Date(), 7).toISOString(),
  },
];

// Helper functions for LocalStorage
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error loading key ${key} from storage:`, err);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving key ${key} to storage:`, err);
  }
}

// User-scoped storage helpers
export function getUserKey(baseKey: string, userId: string): string {
  return `${baseKey}_${userId}`;
}

export function loadUserLogs(userId: string): DailyLog[] {
  return loadFromStorage<DailyLog[]>(getUserKey(STORAGE_KEYS.LOGS, userId), userId === "user_akshat" ? getInitialSeedLogs() : []);
}

export function saveUserLogs(userId: string, logs: DailyLog[]): void {
  saveToStorage(getUserKey(STORAGE_KEYS.LOGS, userId), logs);
  if (isSupabaseConfigured() && logs.length > 0) {
    // Background cloud sync
    cloudSaveUserLog(userId, logs[0]).catch(() => {});
  }
}

export function loadUserGoals(userId: string): Goal[] {
  return loadFromStorage<Goal[]>(getUserKey(STORAGE_KEYS.GOALS, userId), INITIAL_GOALS);
}

export function saveUserGoals(userId: string, goals: Goal[]): void {
  saveToStorage(getUserKey(STORAGE_KEYS.GOALS, userId), goals);
  if (isSupabaseConfigured() && goals.length > 0) {
    cloudSaveUserGoal(userId, goals[0]).catch(() => {});
  }
}

export function loadUserReflections(userId: string): WeeklyReflection[] {
  return loadFromStorage<WeeklyReflection[]>(getUserKey(STORAGE_KEYS.REFLECTIONS, userId), INITIAL_REFLECTIONS);
}

export function saveUserReflections(userId: string, reflections: WeeklyReflection[]): void {
  saveToStorage(getUserKey(STORAGE_KEYS.REFLECTIONS, userId), reflections);
  if (isSupabaseConfigured() && reflections.length > 0) {
    cloudSaveUserReflection(userId, reflections[0]).catch(() => {});
  }
}

export function loadUserFreezeDates(userId: string): string[] {
  return loadFromStorage<string[]>(getUserKey(STORAGE_KEYS.FREEZE_DATES, userId), []);
}

export function saveUserFreezeDates(userId: string, dates: string[]): void {
  saveToStorage(getUserKey(STORAGE_KEYS.FREEZE_DATES, userId), dates);
}

export function loadBadgesFromStorage(userId?: string): Badge[] {
  if (typeof window === "undefined") return DEFAULT_BADGES;
  try {
    const key = userId ? getUserKey(STORAGE_KEYS.BADGES, userId) : STORAGE_KEYS.BADGES;
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(DEFAULT_BADGES));
      return DEFAULT_BADGES;
    }
    const storedBadges: Badge[] = JSON.parse(item);
    const unlockMap = new Map(
      storedBadges
        .filter((b) => Boolean(b.unlockedAt))
        .map((b) => [b.id, b.unlockedAt])
    );

    return DEFAULT_BADGES.map((badge) => ({
      ...badge,
      unlockedAt: unlockMap.get(badge.id) || badge.unlockedAt,
    }));
  } catch (err) {
    console.error("Error loading badges:", err);
    return DEFAULT_BADGES;
  }
}

export function saveUserBadges(userId: string, badges: Badge[]): void {
  saveToStorage(getUserKey(STORAGE_KEYS.BADGES, userId), badges);
}

export function exportAllData(userId = "user_akshat") {
  const data = {
    userId,
    logs: loadUserLogs(userId),
    goals: loadUserGoals(userId),
    badges: loadBadgesFromStorage(userId),
    reflections: loadUserReflections(userId),
    freezeDates: loadUserFreezeDates(userId),
    exportedAt: new Date().toISOString(),
    version: "1.0",
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `strk-backup-${userId}-${format(new Date(), "yyyy-MM-dd-HHmm")}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importAllData(jsonData: string, userId = "user_akshat"): boolean {
  try {
    const parsed = JSON.parse(jsonData);
    if (parsed.logs) saveUserLogs(userId, parsed.logs);
    if (parsed.goals) saveUserGoals(userId, parsed.goals);
    if (parsed.badges) saveUserBadges(userId, parsed.badges);
    if (parsed.reflections) saveUserReflections(userId, parsed.reflections);
    if (parsed.freezeDates) saveUserFreezeDates(userId, parsed.freezeDates);
    return true;
  } catch (err) {
    console.error("Failed to import data:", err);
    return false;
  }
}

export function resetToSeedData(userId = "user_akshat") {
  saveUserLogs(userId, getInitialSeedLogs());
  saveUserGoals(userId, INITIAL_GOALS);
  saveUserBadges(userId, DEFAULT_BADGES);
  saveUserReflections(userId, INITIAL_REFLECTIONS);
  saveUserFreezeDates(userId, []);
}
