import { Badge, BadgeGroup, Category, DailyLog, Goal, StreakStats, UserProfile, WeeklyReflection } from "./types";
import { parseISO, getHours, getDay, differenceInDays } from "date-fns";

export interface RankTier {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  badge: string;
  color: string;
}

// 4. Rank Progression (Solo Leveling vibe)
export const RANK_TIERS: RankTier[] = [
  { level: 1, title: "Novice", minXp: 0, maxXp: 500, badge: "🌱", color: "#8892B0" },
  { level: 2, title: "Apprentice", minXp: 500, maxXp: 1500, badge: "⚡", color: "#00F5D4" },
  { level: 3, title: "Hunter", minXp: 1500, maxXp: 3500, badge: "🏹", color: "#FFB800" },
  { level: 4, title: "Specialist", minXp: 3500, maxXp: 7000, badge: "⚔️", color: "#FF5722" },
  { level: 5, title: "Elite", minXp: 7000, maxXp: 15000, badge: "💎", color: "#9D4EDD" },
  { level: 6, title: "Architect", minXp: 15000, maxXp: 30000, badge: "👑", color: "#FFD700" },
  { level: 7, title: "Monarch", minXp: 30000, maxXp: 999999, badge: "🌌", color: "#FF0080" },
];

export function getRankForXp(xp: number): RankTier {
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (xp >= RANK_TIERS[i].minXp) {
      return RANK_TIERS[i];
    }
  }
  return RANK_TIERS[0];
}

// 2. Streak Multiplier Helper
export function getStreakMultiplier(currentStreak: number): number {
  if (currentStreak >= 100) return 2.0;
  if (currentStreak >= 30) return 1.5;
  if (currentStreak >= 7) return 1.2;
  return 1.0;
}

// 1. & 3. Base XP & Diminishing Returns Calculator
export interface LogXpCalculationParams {
  content: string;
  hasCategories: boolean;
  hasProofMedia: boolean;
  currentStreak: number;
  isFirstLogToday: boolean;
}

export interface LogXpBreakdown {
  baseXp: number;
  tagBonus: number;
  proofBonus: number;
  wordBonus: number;
  totalBaseXp: number;
  streakMultiplier: number;
  diminishingMultiplier: number;
  finalXp: number;
  wordCount: number;
}

export function calculateLogXpBreakdown(params: LogXpCalculationParams): LogXpBreakdown {
  const { content, hasCategories, hasProofMedia, currentStreak, isFirstLogToday } = params;

  const words = content.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const baseXp = 10;
  const tagBonus = hasCategories ? 5 : 0;
  const proofBonus = hasProofMedia ? 5 : 0;
  const wordBonus = wordCount >= 50 ? 5 : 0;

  const totalBaseXp = baseXp + tagBonus + proofBonus + wordBonus;
  const streakMultiplier = getStreakMultiplier(currentStreak);
  const diminishingMultiplier = isFirstLogToday ? 1.0 : 0.5;

  const rawFinalXp = totalBaseXp * streakMultiplier * diminishingMultiplier;
  const finalXp = Math.round(rawFinalXp);

  return {
    baseXp,
    tagBonus,
    proofBonus,
    wordBonus,
    totalBaseXp,
    streakMultiplier,
    diminishingMultiplier,
    finalXp,
    wordCount,
  };
}

export const XP_REWARDS = {
  WEEKLY_REFLECTION: 20,
  GOAL_MILESTONE: 30,
};

// ==========================================
// MASTER BADGE LIST (90+ Badges)
// ==========================================

export const MASTER_BADGES: Badge[] = [
  // 1. STREAK BADGES
  { id: "strk_1", title: "First Spark", description: "Complete your 1st day log", icon: "Flame", group: "streak", tier: "bronze", reqStreak: 1 },
  { id: "strk_3", title: "Spark Keeper", description: "Maintain a 3-day streak", icon: "Flame", group: "streak", tier: "bronze", reqStreak: 3 },
  { id: "strk_7", title: "Igniter", description: "7-day continuous streak (1.2x Boost unlocked)", icon: "Flame", group: "streak", tier: "bronze", reqStreak: 7 },
  { id: "strk_14", title: "Two Weeks Strong", description: "14-day continuous streak (+1 Freeze Token)", icon: "ShieldAlert", group: "streak", tier: "silver", reqStreak: 14 },
  { id: "strk_30", title: "Momentum", description: "30-day continuous streak (1.5x Surge Boost)", icon: "ShieldAlert", group: "streak", tier: "silver", reqStreak: 30 },
  { id: "strk_60", title: "Two Month Fire", description: "60-day unstoppable streak", icon: "Zap", group: "streak", tier: "silver", reqStreak: 60 },
  { id: "strk_100", title: "100 Club", description: "100-day streak milestone (2.0x Double XP!)", icon: "Crown", group: "streak", tier: "gold", reqStreak: 100 },
  { id: "strk_200", title: "200 Club", description: "200 days of relentless proof", icon: "Crown", group: "streak", tier: "gold", reqStreak: 200 },
  { id: "strk_300", title: "Unstoppable", description: "300-day streak achievement", icon: "Gem", group: "streak", tier: "diamond", reqStreak: 300 },
  { id: "strk_365", title: "Legend", description: "365-day streak — 1 Full Year of Consistency", icon: "Gem", group: "streak", tier: "monarch", reqStreak: 365 },
  { id: "strk_500", title: "One With The Grind", description: "500 days of unbroken proof", icon: "Trophy", group: "streak", tier: "monarch", reqStreak: 500 },
  { id: "strk_1000", title: "Immortal", description: "1,000-day legendary streak", icon: "Sparkles", group: "streak", tier: "monarch", reqStreak: 1000 },
  { id: "strk_comeback", title: "Comeback Kid", description: "Rebuilt a 7-day streak after a break", icon: "RotateCcw", group: "streak", tier: "silver", reqStreak: 7 },
  { id: "strk_phoenix", title: "Phoenix", description: "Rebuilt a 30+ day streak after multiple resets", icon: "Flame", group: "streak", tier: "gold", reqStreak: 30 },
  { id: "strk_weekend_warrior", title: "Weekend Warrior", description: "Logged 10 consecutive weekends without fail", icon: "Calendar", group: "streak", tier: "silver", reqStreak: 10 },
  { id: "strk_diamond_hands", title: "Diamond Hands", description: "365-day streak without using any freeze tokens", icon: "Gem", group: "streak", tier: "monarch", reqStreak: 365, isSecret: true },

  // 2. VOLUME / TOTAL LOGS BADGES
  { id: "vol_1", title: "First Proof", description: "Created your first log entry ever", icon: "FileText", group: "volume", tier: "bronze", reqLogs: 1 },
  { id: "vol_50", title: "Half Century", description: "Accumulated 50 total proof logs", icon: "FileText", group: "volume", tier: "silver", reqLogs: 50 },
  { id: "vol_100", title: "Century Club", description: "Accumulated 100 total proof logs", icon: "FileText", group: "volume", tier: "silver", reqLogs: 100 },
  { id: "vol_500", title: "Grinder", description: "Accumulated 500 total proof logs", icon: "Trophy", group: "volume", tier: "gold", reqLogs: 500 },
  { id: "vol_1000", title: "1000 Logs", description: "Accumulated 1,000 total proof logs", icon: "Crown", group: "volume", tier: "monarch", reqLogs: 1000 },
  { id: "vol_perf_week", title: "Perfect Week", description: "Logged all 7 out of 7 days in a week", icon: "CheckCircle", group: "volume", tier: "bronze", reqPerfectWeek: true },
  { id: "vol_perf_month", title: "Perfect Month", description: "Logged 30 out of 30 days active in the month", icon: "CheckCircle", group: "volume", tier: "gold", reqPerfectMonth: true },
  { id: "vol_perf_quarter", title: "Perfect Quarter", description: "90 continuous active days logged", icon: "Trophy", group: "volume", tier: "diamond", reqStreak: 90 },
  { id: "vol_wave_rider", title: "Wave Rider", description: "Logged 3+ different categories on a single day", icon: "Zap", group: "volume", tier: "silver", reqMultiCategoryInDay: 3 },
  { id: "vol_deep_diver", title: "Deep Diver", description: "Logged a detailed proof with 100+ words", icon: "FileText", group: "volume", tier: "silver", reqWordCountInLog: 100 },

  // 3. DSA / CODING PRACTICE BADGES
  { id: "dsa_1", title: "First Problem", description: "Logged your 1st DSA session", icon: "Code2", group: "dsa", category: "DSA", tier: "bronze", reqCategoryLogs: { count: 1, category: "DSA" } },
  { id: "dsa_25", title: "Pattern Seeker", description: "Recorded 25 DSA problem logs", icon: "Code2", group: "dsa", category: "DSA", tier: "bronze", reqCategoryLogs: { count: 25, category: "DSA" } },
  { id: "dsa_50", title: "DSA Grinder", description: "Recorded 50 DSA problem logs", icon: "Code2", group: "dsa", category: "DSA", tier: "silver", reqCategoryLogs: { count: 50, category: "DSA" } },
  { id: "dsa_100", title: "Algorithm Adept", description: "Recorded 100 DSA problem logs", icon: "Code2", group: "dsa", category: "DSA", tier: "gold", reqCategoryLogs: { count: 100, category: "DSA" } },
  { id: "dsa_300", title: "The 300", description: "Recorded 300 DSA problem logs (NeetCode 150/250)", icon: "Crown", group: "dsa", category: "DSA", tier: "diamond", reqCategoryLogs: { count: 300, category: "DSA" } },
  { id: "dsa_500", title: "Big-O Master", description: "Recorded 500 DSA problem logs", icon: "Gem", group: "dsa", category: "DSA", tier: "monarch", reqCategoryLogs: { count: 500, category: "DSA" } },
  { id: "dsa_trees", title: "Tree Whisperer", description: "Logged 20 sessions tagged with trees/graphs", icon: "Code2", group: "dsa", category: "DSA", tier: "silver", reqKeywordCount: { keyword: "tree", count: 20 } },
  { id: "dsa_dp", title: "DP Survivor", description: "Logged 20 sessions tagged with Dynamic Programming", icon: "Code2", group: "dsa", category: "DSA", tier: "silver", reqKeywordCount: { keyword: "DP", count: 20 } },
  { id: "dsa_streak_30", title: "Consistency > Grind", description: "Achieved a 30-day DSA-specific streak", icon: "Flame", group: "dsa", category: "DSA", tier: "gold", reqCategoryStreak: { streak: 30, category: "DSA" } },

  // 4. GYM / FITNESS BADGES
  { id: "gym_1", title: "First Rep", description: "Logged your 1st Gym workout proof", icon: "Dumbbell", group: "gym", category: "Gym", tier: "bronze", reqCategoryLogs: { count: 1, category: "Gym" } },
  { id: "gym_10", title: "Getting Started", description: "Logged 10 Gym workout proofs", icon: "Dumbbell", group: "gym", category: "Gym", tier: "bronze", reqCategoryLogs: { count: 10, category: "Gym" } },
  { id: "gym_50", title: "Iron Will", description: "Logged 50 Gym workout proofs", icon: "Dumbbell", group: "gym", category: "Gym", tier: "silver", reqCategoryLogs: { count: 50, category: "Gym" } },
  { id: "gym_100", title: "Gym Rat", description: "Logged 100 Gym workout proofs", icon: "Dumbbell", group: "gym", category: "Gym", tier: "gold", reqCategoryLogs: { count: 100, category: "Gym" } },
  { id: "gym_250", title: "Beast Mode", description: "Logged 250 Gym workout proofs", icon: "Crown", group: "gym", category: "Gym", tier: "diamond", reqCategoryLogs: { count: 250, category: "Gym" } },
  { id: "gym_streak_14", title: "No Off Days", description: "14-day Gym-specific consistency streak", icon: "Flame", group: "gym", category: "Gym", tier: "silver", reqCategoryStreak: { streak: 14, category: "Gym" } },
  { id: "gym_streak_30", title: "30-Day Shred", description: "30-day Gym-specific consistency streak", icon: "Flame", group: "gym", category: "Gym", tier: "gold", reqCategoryStreak: { streak: 30, category: "Gym" } },
  { id: "gym_bulk", title: "Bulk Season", description: "Logged 20+ Gym workouts in a single month", icon: "Dumbbell", group: "gym", category: "Gym", tier: "silver", reqCategoryLogs: { count: 20, category: "Gym" } },
  { id: "gym_legs", title: "Leg Day Loyalist", description: "Logged 10 leg-day specific workout sessions", icon: "Dumbbell", group: "gym", category: "Gym", tier: "bronze", reqKeywordCount: { keyword: "leg", count: 10 } },

  // 5. PROJECT / DEV WORK BADGES
  { id: "dev_1", title: "First Commit", description: "Logged your 1st Project/Dev work proof", icon: "Code2", group: "project", category: "Project", tier: "bronze", reqCategoryLogs: { count: 1, category: "Project" } },
  { id: "dev_25", title: "Builder", description: "Logged 25 Dev / Project sessions", icon: "Code2", group: "project", category: "Project", tier: "bronze", reqCategoryLogs: { count: 25, category: "Project" } },
  { id: "dev_50", title: "Shipper", description: "Logged 50 Dev / Project sessions", icon: "Rocket", group: "project", category: "Project", tier: "silver", reqCategoryLogs: { count: 50, category: "Project" } },
  { id: "dev_100", title: "Full Stack Grinder", description: "Logged 100 Dev / Project sessions", icon: "Crown", group: "project", category: "Project", tier: "gold", reqCategoryLogs: { count: 100, category: "Project" } },
  { id: "dev_launch", title: "Launch Day", description: "Marked a project completed & shipped", icon: "Rocket", group: "project", category: "Project", tier: "gold", reqGoalsCompleted: 1 },
  { id: "dev_serial", title: "Serial Shipper", description: "Successfully shipped 5 projects/targets", icon: "Crown", group: "project", category: "Project", tier: "diamond", reqGoalsCompleted: 5 },
  { id: "dev_debug", title: "Debug Warrior", description: "Logged 20 entries mentioning bug fixing/debugging", icon: "Code2", group: "project", category: "Project", tier: "silver", reqKeywordCount: { keyword: "fix", count: 20 } },

  // 6. CYBERSECURITY BADGES
  { id: "cyber_1", title: "First Scan", description: "Logged your 1st Cybersecurity proof", icon: "ShieldAlert", group: "cyber", category: "Cybersecurity", tier: "bronze", reqCategoryLogs: { count: 1, category: "Cybersecurity" } },
  { id: "cyber_25", title: "White Hat", description: "Logged 25 Cybersecurity sessions", icon: "ShieldAlert", group: "cyber", category: "Cybersecurity", tier: "silver", reqCategoryLogs: { count: 25, category: "Cybersecurity" } },
  { id: "cyber_50", title: "Bug Hunter", description: "Logged 50 Cybersecurity sessions", icon: "ShieldAlert", group: "cyber", category: "Cybersecurity", tier: "gold", reqCategoryLogs: { count: 50, category: "Cybersecurity" } },
  { id: "cyber_ctf", title: "CTF Grinder", description: "Logged 10 CTF / bug bounty sessions", icon: "Lock", group: "cyber", category: "Cybersecurity", tier: "silver", reqKeywordCount: { keyword: "CTF", count: 10 } },
  { id: "cyber_vuln", title: "Vuln Finder", description: "Logged a vulnerability discovered or reported", icon: "ShieldAlert", group: "cyber", category: "Cybersecurity", tier: "gold", reqKeywordCount: { keyword: "vuln", count: 1 } },

  // 7. READING / LEARNING BADGES
  { id: "read_1", title: "First Page", description: "Logged your 1st Reading proof", icon: "BookOpen", group: "reading", category: "Reading", tier: "bronze", reqCategoryLogs: { count: 1, category: "Reading" } },
  { id: "read_50", title: "Bookworm", description: "Logged 50 Reading sessions", icon: "BookOpen", group: "reading", category: "Reading", tier: "silver", reqCategoryLogs: { count: 50, category: "Reading" } },
  { id: "read_100", title: "Knowledge Seeker", description: "Logged 100 Reading sessions", icon: "Crown", group: "reading", category: "Reading", tier: "gold", reqCategoryLogs: { count: 100, category: "Reading" } },
  { id: "read_course", title: "Course Crusher", description: "Completed an online course/tutorial series", icon: "Trophy", group: "reading", category: "Reading", tier: "silver", reqKeywordCount: { keyword: "course", count: 5 } },

  // 8. BALANCE / MULTI-CATEGORY BADGES
  { id: "bal_week", title: "Balanced", description: "Touched 4+ different categories in a single week", icon: "Scale", group: "balance", tier: "silver", reqMultiCategoryInDay: 2 },
  { id: "bal_renaissance", title: "Renaissance Man", description: "Accumulated 10+ logs across at least 4 active categories", icon: "Crown", group: "balance", tier: "gold", reqLogs: 40 },
  { id: "bal_switch", title: "Switch Hitter", description: "Logged both DSA + Gym on the same day 20 times", icon: "Zap", group: "balance", tier: "gold", reqLogs: 30 },
  { id: "bal_allrounder", title: "All-Rounder", description: "Achieved 30-day streak in 3+ individual categories", icon: "Gem", group: "balance", tier: "monarch", reqStreak: 30 },

  // 9. GOAL-BASED BADGES
  { id: "goal_setter", title: "Goal Setter", description: "Created your first consistency target", icon: "Target", group: "goals", tier: "bronze", reqGoalsCompleted: 0 },
  { id: "goal_finisher", title: "Finisher", description: "Successfully completed your first goal", icon: "CheckCircle", group: "goals", tier: "bronze", reqGoalsCompleted: 1 },
  { id: "goal_crusher", title: "Goal Crusher", description: "Conquered 5 major targets", icon: "Swords", group: "goals", tier: "silver", reqGoalsCompleted: 5 },
  { id: "goal_serial", title: "Serial Achiever", description: "Conquered 10 major targets", icon: "Crown", group: "goals", tier: "gold", reqGoalsCompleted: 10 },
  { id: "goal_overachiever", title: "Overachiever", description: "Completed a goal before its target deadline", icon: "Sparkles", group: "goals", tier: "gold", reqGoalsCompleted: 2 },
  { id: "goal_sniper", title: "Sniper", description: "Conquered 20 targets with razor-sharp discipline", icon: "Gem", group: "goals", tier: "monarch", reqGoalsCompleted: 20 },

  // 10. REFLECTION / SELF-AWARENESS BADGES
  { id: "refl_1", title: "First Reflection", description: "Completed your 1st weekly review", icon: "Mirror", group: "reflection", tier: "bronze", reqReflectionsCount: 1 },
  { id: "refl_10", title: "Consistent Reviewer", description: "Completed 10 weekly reviews", icon: "Calendar", group: "reflection", tier: "silver", reqReflectionsCount: 10 },
  { id: "refl_25", title: "Deep Thinker", description: "Completed 25 weekly reviews", icon: "Crown", group: "reflection", tier: "gold", reqReflectionsCount: 25 },
  { id: "refl_high_scorer", title: "High Scorer", description: "Scored 8+/10 self-rating for 3 consecutive weeks", icon: "Star", group: "reflection", tier: "silver", reqReflectionsCount: 3 },
  { id: "refl_zen", title: "Zen Master", description: "Completed 50 weekly reviews with high discipline", icon: "Sparkles", group: "reflection", tier: "monarch", reqReflectionsCount: 50 },

  // 11. RANK / XP MILESTONE BADGES
  { id: "rank_novice", title: "Novice", description: "Initiated into the STRK System (0 XP)", icon: "Sparkles", group: "ranks", tier: "bronze", reqXp: 0 },
  { id: "rank_apprentice", title: "Apprentice", description: "Reached Level 2 Apprentice (500 XP)", icon: "Zap", group: "ranks", tier: "bronze", reqXp: 500 },
  { id: "rank_hunter", title: "Hunter", description: "Reached Level 3 Hunter (1,500 XP)", icon: "Swords", group: "ranks", tier: "silver", reqXp: 1500 },
  { id: "rank_specialist", title: "Specialist", description: "Reached Level 4 Specialist (3,500 XP)", icon: "ShieldAlert", group: "ranks", tier: "silver", reqXp: 3500 },
  { id: "rank_elite", title: "Elite", description: "Reached Level 5 Elite (7,000 XP)", icon: "Gem", group: "ranks", tier: "gold", reqXp: 7000 },
  { id: "rank_architect", title: "Architect", description: "Reached Level 6 Architect (15,000 XP)", icon: "Crown", group: "ranks", tier: "diamond", reqXp: 15000 },
  { id: "rank_monarch", title: "Monarch", description: "Reached Level 7 Monarch (30,000 XP)", icon: "Gem", group: "ranks", tier: "monarch", reqXp: 30000 },

  // 12. TIME / PATTERN-BASED BADGES
  { id: "time_night_owl", title: "Night Owl", description: "Logged 10 proofs between 11 PM and 3 AM", icon: "Moon", group: "time", tier: "silver", reqKeywordCount: { keyword: "night", count: 10 } },
  { id: "time_5am_club", title: "5AM Club", description: "Logged 10 proofs between 5 AM and 7 AM", icon: "Sun", group: "time", tier: "silver", reqKeywordCount: { keyword: "morning", count: 10 } },
  { id: "time_monday", title: "Monday Starter", description: "Logged 10 consecutive Mondays without slipping", icon: "Calendar", group: "time", tier: "bronze", reqLogs: 10 },
  { id: "time_birthday", title: "Birthday Grind", description: "Stayed disciplined on your birthday", icon: "Trophy", group: "time", tier: "gold", reqLogs: 1, isSecret: true },
  { id: "time_new_year", title: "New Year Streak", description: "Logged on both Dec 31 and Jan 1", icon: "Sparkles", group: "time", tier: "silver", reqLogs: 2 },
  { id: "time_festival", title: "Festival Fighter", description: "Logged proof during major holidays/festivals", icon: "Flame", group: "time", tier: "silver", reqLogs: 5 },

  // 13. META / RARE / PRESTIGE BADGES
  { id: "meta_the_monarch", title: "The Monarch", description: "Reached Max Rank + 500-day streak together", icon: "Crown", group: "meta", tier: "monarch", reqStreak: 500, reqXp: 30000 },
  { id: "meta_lucky", title: "Lucky Streak", description: "Mystery drop rewarded for an exceptional week", icon: "Sparkles", group: "meta", tier: "diamond", reqStreak: 14, isSecret: true },
  { id: "meta_one_year", title: "One Year In", description: "365 days of membership on the platform", icon: "Gem", group: "meta", tier: "monarch", reqLogs: 100 },
];

export const DEFAULT_BADGES: Badge[] = MASTER_BADGES;

// Dynamic custom tag badge ladder generator
export function generateBadgesForCategory(category: Category): Badge[] {
  return [
    {
      id: `custom_${category}_1`,
      title: `${category} Pioneer`,
      description: `Logged your first ${category} session`,
      icon: "Tag",
      category,
      group: "balance",
      tier: "bronze",
      reqCategoryLogs: { count: 1, category },
    },
    {
      id: `custom_${category}_25`,
      title: `${category} Practitioner`,
      description: `Logged 25 ${category} sessions`,
      icon: "Tag",
      category,
      group: "balance",
      tier: "silver",
      reqCategoryLogs: { count: 25, category },
    },
    {
      id: `custom_${category}_50`,
      title: `${category} Specialist`,
      description: `Logged 50 ${category} sessions`,
      icon: "Tag",
      category,
      group: "balance",
      tier: "gold",
      reqCategoryLogs: { count: 50, category },
    },
    {
      id: `custom_${category}_100`,
      title: `${category} Master`,
      description: `Logged 100 ${category} sessions`,
      icon: "Crown",
      category,
      group: "balance",
      tier: "diamond",
      reqCategoryLogs: { count: 100, category },
    },
  ];
}

// Master Badge unlock and progress evaluator
export function checkUnlockedBadges(
  logs: DailyLog[],
  stats: StreakStats,
  user: UserProfile,
  goals: Goal[],
  existingBadges: Badge[],
  reflections: WeeklyReflection[] = []
): Badge[] {
  const completedGoalsCount = goals.filter((g) => g.completed).length;
  const reflectionsCount = reflections.length;

  return existingBadges.map((badge) => {
    let progressCurrent = 0;
    let progressTarget = 0;
    let shouldUnlock = Boolean(badge.unlockedAt);

    // Streak Check
    if (badge.reqStreak) {
      progressTarget = badge.reqStreak;
      progressCurrent = stats.currentStreak;
      if (stats.currentStreak >= badge.reqStreak) shouldUnlock = true;
    }

    // Total Logs Check
    if (badge.reqLogs) {
      progressTarget = badge.reqLogs;
      progressCurrent = logs.length;
      if (logs.length >= badge.reqLogs) shouldUnlock = true;
    }

    // Category Logs Check
    if (badge.reqCategoryLogs) {
      const cat = badge.reqCategoryLogs.category;
      progressTarget = badge.reqCategoryLogs.count;
      if (cat) {
        progressCurrent = logs.filter((l) => l.categories.includes(cat)).length;
      } else {
        const catCounts: Record<string, number> = {};
        logs.forEach((l) => l.categories.forEach((c) => (catCounts[c] = (catCounts[c] || 0) + 1)));
        progressCurrent = Math.max(0, ...Object.values(catCounts));
      }
      if (progressCurrent >= progressTarget) shouldUnlock = true;
    }

    // Category Streak Check
    if (badge.reqCategoryStreak) {
      const cat = badge.reqCategoryStreak.category;
      progressTarget = badge.reqCategoryStreak.streak;
      progressCurrent = stats.categoryStreaks[cat] || 0;
      if (progressCurrent >= progressTarget) shouldUnlock = true;
    }

    // Goal Completed Check
    if (badge.reqGoalsCompleted !== undefined) {
      progressTarget = badge.reqGoalsCompleted;
      progressCurrent = completedGoalsCount;
      if (completedGoalsCount >= badge.reqGoalsCompleted) shouldUnlock = true;
    }

    // Reflections Count
    if (badge.reqReflectionsCount) {
      progressTarget = badge.reqReflectionsCount;
      progressCurrent = reflectionsCount;
      if (reflectionsCount >= badge.reqReflectionsCount) shouldUnlock = true;
    }

    // Perfect Month / Week Check
    if (badge.reqPerfectMonth) {
      progressTarget = 30;
      progressCurrent = stats.totalActiveDays >= 30 && stats.consistencyRate >= 95 ? 30 : stats.totalActiveDays;
      if (stats.consistencyRate >= 100 && stats.totalActiveDays >= 30) shouldUnlock = true;
    }
    if (badge.reqPerfectWeek) {
      progressTarget = 7;
      progressCurrent = Math.min(7, stats.currentStreak);
      if (stats.currentStreak >= 7) shouldUnlock = true;
    }

    // Total XP Check
    if (badge.reqXp !== undefined) {
      progressTarget = badge.reqXp;
      progressCurrent = user.totalXp;
      if (user.totalXp >= badge.reqXp) shouldUnlock = true;
    }

    // Keyword in Logs (e.g. DP, trees, bug fixes)
    if (badge.reqKeywordCount) {
      const kw = badge.reqKeywordCount.keyword.toLowerCase();
      progressTarget = badge.reqKeywordCount.count;
      progressCurrent = logs.filter((l) => l.content.toLowerCase().includes(kw)).length;
      if (progressCurrent >= progressTarget) shouldUnlock = true;
    }

    // Multi-category in Day
    if (badge.reqMultiCategoryInDay) {
      progressTarget = badge.reqMultiCategoryInDay;
      const maxCatsInSingleDay = Math.max(
        0,
        ...logs.map((l) => l.categories.length)
      );
      progressCurrent = maxCatsInSingleDay;
      if (maxCatsInSingleDay >= badge.reqMultiCategoryInDay) shouldUnlock = true;
    }

    // Return updated badge object
    return {
      ...badge,
      progressCurrent,
      progressTarget: progressTarget > 0 ? progressTarget : undefined,
      unlockedAt: shouldUnlock ? badge.unlockedAt || new Date().toISOString() : undefined,
    };
  });
}
