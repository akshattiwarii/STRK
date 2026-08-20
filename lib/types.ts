export type Category = 
  | "DSA" 
  | "Gym" 
  | "Coding" 
  | "Project" 
  | "Cybersecurity"
  | "Reading" 
  | "Health" 
  | "Deep Work"
  | "Writing";

export type Mood = "fire" | "high" | "good" | "neutral" | "drained";

export interface DailyLog {
  id: string;
  date: string; // ISO format 'YYYY-MM-DD'
  timestamp: number;
  content: string; // Tweet style micro-log
  categories: Category[];
  mood: Mood;
  energyLevel: number; // 1 to 5
  mediaUrl?: string; // Optional image / screenshot base64 or URL
  goalId?: string; // Optional linked goal
  xpEarned: number;
  isFreezeUsed?: boolean;
}

export interface Goal {
  id: string;
  userId?: string;
  title: string;
  category: Category;
  targetCount: number;
  currentCount: number;
  unit: string; // e.g. "Problems", "Hours", "Days", "Commits"
  deadline?: string;
  completed: boolean;
  createdAt: string;
}

export type BadgeGroup =
  | "streak"
  | "volume"
  | "dsa"
  | "gym"
  | "project"
  | "cyber"
  | "reading"
  | "balance"
  | "goals"
  | "reflection"
  | "ranks"
  | "time"
  | "meta";

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name or emoji
  category?: Category | "GENERAL";
  group: BadgeGroup;
  unlockedAt?: string;
  tier: "bronze" | "silver" | "gold" | "diamond" | "monarch";
  reqStreak?: number;
  reqLogs?: number;
  reqXp?: number;
  reqGoalsCompleted?: number;
  reqPerfectMonth?: boolean;
  reqPerfectWeek?: boolean;
  reqCategoryLogs?: { count: number; category?: Category };
  reqCategoryStreak?: { streak: number; category: Category };
  reqMultiCategoryInDay?: number; // e.g. 3+ categories in single day
  reqWordCountInLog?: number; // e.g. 100+ words
  reqKeywordCount?: { keyword: string; count: number }; // e.g. "bug fix", "DP", "trees"
  reqReflectionsCount?: number;
  isSecret?: boolean;
  progressCurrent?: number;
  progressTarget?: number;
}

export interface WeeklyReflection {
  id: string;
  weekStartDate: string; // YYYY-MM-DD (Monday)
  weekEndDate: string; // YYYY-MM-DD (Sunday)
  score: number; // 1 to 10
  highlight: string;
  slipUp: string;
  nextWeekFocus: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  password?: string;
  name: string;
  handle: string;
  avatarUrl: string;
  bio: string;
  isPublic: boolean;
  theme: "cyber" | "ember" | "neon" | "midnight";
  freezeTokens: number; // Max 3
  autoFreezeEnabled: boolean;
  totalXp: number;
  level: number;
  rankTitle: string;
  soundEnabled: boolean;
  focusCategories?: Category[];
  createdAt: string;
}

export interface AuthSession {
  user: UserProfile | null;
  isAuthenticated: boolean;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  totalLogs: number;
  consistencyRate: number; // Percentage
  categoryStreaks: Record<Category, number>;
  activeToday: boolean;
  freezeDaysUsed: string[];
}
