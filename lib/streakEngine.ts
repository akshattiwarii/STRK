import { DailyLog, Category, StreakStats } from "./types";
import { format, subDays, differenceInCalendarDays, parseISO, isSameDay } from "date-fns";

export const ALL_CATEGORIES: Category[] = [
  "DSA",
  "Gym",
  "Coding",
  "Project",
  "Cybersecurity",
  "Reading",
  "Health",
  "Deep Work",
  "Writing",
];

export function calculateStreakStats(logs: DailyLog[], freezeDates: string[] = []): StreakStats {
  if (!logs || logs.length === 0) {
    const emptyCategoryStreaks = ALL_CATEGORIES.reduce((acc, cat) => {
      acc[cat] = 0;
      return acc;
    }, {} as Record<Category, number>);

    return {
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
      totalLogs: 0,
      consistencyRate: 0,
      categoryStreaks: emptyCategoryStreaks,
      activeToday: false,
      freezeDaysUsed: freezeDates,
    };
  }

  // Unique sorted dates
  const logDatesSet = new Set(logs.map((l) => l.date));
  const freezeDatesSet = new Set(freezeDates);
  const activeAndFreezeDates = new Set([...Array.from(logDatesSet), ...freezeDates]);
  const sortedDates = Array.from(activeAndFreezeDates).sort().reverse(); // newest to oldest

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const yesterdayStr = format(subDays(new Date(), 1), "yyyy-MM-dd");

  const activeToday = logDatesSet.has(todayStr);

  // Calculate current streak
  let currentStreak = 0;
  let checkDate = new Date();

  // If not logged today, check if yesterday was logged
  if (!activeAndFreezeDates.has(todayStr)) {
    checkDate = subDays(new Date(), 1);
  }

  while (true) {
    const dateKey = format(checkDate, "yyyy-MM-dd");
    if (activeAndFreezeDates.has(dateKey)) {
      currentStreak++;
      checkDate = subDays(checkDate, 1);
    } else {
      break;
    }
  }

  // Calculate longest streak historically
  let longestStreak = 0;
  let tempStreak = 0;
  const ascendingDates = Array.from(activeAndFreezeDates).sort();

  for (let i = 0; i < ascendingDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prevDate = parseISO(ascendingDates[i - 1]);
      const currDate = parseISO(ascendingDates[i]);
      const diff = differenceInCalendarDays(currDate, prevDate);

      if (diff === 1) {
        tempStreak++;
      } else if (diff > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // Category-wise streaks
  const categoryStreaks = ALL_CATEGORIES.reduce((acc, cat) => {
    const catLogs = logs.filter((l) => l.categories.includes(cat));
    const catDates = new Set(catLogs.map((l) => l.date));

    let catStreak = 0;
    let catCheckDate = new Date();
    const catToday = format(catCheckDate, "yyyy-MM-dd");

    if (!catDates.has(catToday)) {
      catCheckDate = subDays(new Date(), 1);
    }

    while (true) {
      const dateKey = format(catCheckDate, "yyyy-MM-dd");
      if (catDates.has(dateKey)) {
        catStreak++;
        catCheckDate = subDays(catCheckDate, 1);
      } else {
        break;
      }
    }
    acc[cat] = catStreak;
    return acc;
  }, {} as Record<Category, number>);

  // Consistency rate (over the last 60 days or total active days span)
  const totalActiveDays = logDatesSet.size;
  const daysInScope = 30;
  let daysActiveInScope = 0;
  for (let d = 0; d < daysInScope; d++) {
    const dStr = format(subDays(new Date(), d), "yyyy-MM-dd");
    if (logDatesSet.has(dStr)) {
      daysActiveInScope++;
    }
  }
  const consistencyRate = Math.round((daysActiveInScope / daysInScope) * 100);

  return {
    currentStreak,
    longestStreak,
    totalActiveDays,
    totalLogs: logs.length,
    consistencyRate,
    categoryStreaks,
    activeToday,
    freezeDaysUsed: freezeDates,
  };
}

export interface HeatmapDay {
  date: string;
  count: number;
  intensity: 0 | 1 | 2 | 3 | 4;
  isToday: boolean;
  isFreeze: boolean;
  logs: DailyLog[];
}

export function generateHeatmapGrid(logs: DailyLog[], freezeDates: string[] = [], totalDays = 180): HeatmapDay[] {
  const logMap = new Map<string, DailyLog[]>();
  logs.forEach((log) => {
    const existing = logMap.get(log.date) || [];
    existing.push(log);
    logMap.set(log.date, existing);
  });

  const freezeSet = new Set(freezeDates);
  const today = new Date();
  const grid: HeatmapDay[] = [];

  for (let i = totalDays - 1; i >= 0; i--) {
    const dateObj = subDays(today, i);
    const dateStr = format(dateObj, "yyyy-MM-dd");
    const dayLogs = logMap.get(dateStr) || [];
    const count = dayLogs.length;
    const isFreeze = freezeSet.has(dateStr);

    let intensity: 0 | 1 | 2 | 3 | 4 = 0;
    if (isFreeze) {
      intensity = 1;
    } else if (count === 1) {
      intensity = 2;
    } else if (count === 2) {
      intensity = 3;
    } else if (count >= 3) {
      intensity = 4;
    }

    grid.push({
      date: dateStr,
      count,
      intensity,
      isToday: isSameDay(dateObj, today),
      isFreeze,
      logs: dayLogs,
    });
  }

  return grid;
}
