import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { UserProfile, DailyLog, Goal, Badge, WeeklyReflection } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith("https://") &&
    supabaseAnonKey.length > 20
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ==========================================
// CLOUD BACKEND DATA SERVICES (PostgreSQL)
// ==========================================

export async function cloudFetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email || "",
      name: data.name,
      handle: data.handle,
      avatarUrl: data.avatar_url,
      bio: data.bio || "",
      isPublic: data.is_public ?? true,
      theme: data.theme || "ember",
      freezeTokens: data.freeze_tokens ?? 2,
      autoFreezeEnabled: data.auto_freeze_enabled ?? true,
      totalXp: data.total_xp ?? 0,
      level: data.level ?? 1,
      rankTitle: data.rank_title ?? "Novice",
      soundEnabled: data.sound_enabled ?? true,
      focusCategories: data.focus_categories || ["DSA", "Gym", "Coding"],
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error("Cloud fetch profile error:", err);
    return null;
  }
}

export async function cloudRegisterProfile(user: UserProfile): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email,
      password: user.password,
      name: user.name,
      handle: user.handle,
      avatar_url: user.avatarUrl,
      bio: user.bio,
      is_public: user.isPublic,
      theme: user.theme,
      freeze_tokens: user.freezeTokens,
      auto_freeze_enabled: user.autoFreezeEnabled,
      total_xp: user.totalXp,
      level: user.level,
      rank_title: user.rankTitle,
      sound_enabled: user.soundEnabled,
      focus_categories: user.focusCategories,
      created_at: user.createdAt,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch (err) {
    console.error("Cloud register profile error:", err);
    return false;
  }
}

export async function cloudFindProfileByAuth(emailOrHandle: string): Promise<UserProfile | null> {
  if (!supabase) return null;
  try {
    const query = emailOrHandle.trim().toLowerCase().replace(/^@/, "");
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .or(`email.ilike.${query},handle.ilike.${query}`)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email || "",
      password: data.password || "",
      name: data.name,
      handle: data.handle,
      avatarUrl: data.avatar_url,
      bio: data.bio || "",
      isPublic: data.is_public ?? true,
      theme: data.theme || "ember",
      freezeTokens: data.freeze_tokens ?? 2,
      autoFreezeEnabled: data.auto_freeze_enabled ?? true,
      totalXp: data.total_xp ?? 0,
      level: data.level ?? 1,
      rankTitle: data.rank_title ?? "Novice",
      soundEnabled: data.sound_enabled ?? true,
      focusCategories: data.focus_categories || ["DSA", "Gym", "Coding"],
      createdAt: data.created_at,
    };
  } catch (err) {
    console.error("Cloud find profile error:", err);
    return null;
  }
}

export async function cloudUpdateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.handle !== undefined) payload.handle = updates.handle;
    if (updates.avatarUrl !== undefined) payload.avatar_url = updates.avatarUrl;
    if (updates.bio !== undefined) payload.bio = updates.bio;
    if (updates.theme !== undefined) payload.theme = updates.theme;
    if (updates.freezeTokens !== undefined) payload.freeze_tokens = updates.freezeTokens;
    if (updates.autoFreezeEnabled !== undefined) payload.auto_freeze_enabled = updates.autoFreezeEnabled;
    if (updates.totalXp !== undefined) payload.total_xp = updates.totalXp;
    if (updates.level !== undefined) payload.level = updates.level;
    if (updates.rankTitle !== undefined) payload.rank_title = updates.rankTitle;
    if (updates.soundEnabled !== undefined) payload.sound_enabled = updates.soundEnabled;
    if (updates.isPublic !== undefined) payload.is_public = updates.isPublic;
    if (updates.focusCategories !== undefined) payload.focus_categories = updates.focusCategories;

    const { error } = await supabase.from("profiles").update(payload).eq("id", userId);
    return !error;
  } catch (err) {
    console.error("Cloud update profile error:", err);
    return false;
  }
}

export async function cloudFetchUserLogs(userId: string): Promise<DailyLog[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("daily_logs")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false });

    if (error || !data) return [];

    return data.map((d: any) => ({
      id: d.id,
      date: d.date,
      timestamp: d.timestamp || new Date(d.date).getTime(),
      content: d.content,
      categories: d.categories || [],
      mood: d.mood || "fire",
      energyLevel: d.energy_level || 5,
      mediaUrl: d.media_url,
      goalId: d.goal_id,
      xpEarned: d.xp_earned || 10,
      isFreezeUsed: d.is_freeze_used || false,
    }));
  } catch (err) {
    console.error("Cloud fetch logs error:", err);
    return [];
  }
}

export async function cloudSaveUserLog(userId: string, log: DailyLog): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("daily_logs").upsert({
      id: log.id,
      user_id: userId,
      date: log.date,
      timestamp: log.timestamp,
      content: log.content,
      categories: log.categories,
      mood: log.mood,
      energy_level: log.energyLevel,
      media_url: log.mediaUrl,
      goal_id: log.goalId,
      xp_earned: log.xpEarned,
      is_freeze_used: log.isFreezeUsed,
    });
    return !error;
  } catch (err) {
    console.error("Cloud save log error:", err);
    return false;
  }
}

export async function cloudDeleteUserLog(userId: string, logId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from("daily_logs")
      .delete()
      .eq("id", logId)
      .eq("user_id", userId);
    return !error;
  } catch (err) {
    console.error("Cloud delete log error:", err);
    return false;
  }
}

export async function cloudFetchUserGoals(userId: string): Promise<Goal[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((d: any) => ({
      id: d.id,
      title: d.title,
      category: d.category,
      targetCount: d.target_count,
      currentCount: d.current_count,
      unit: d.unit,
      deadline: d.deadline,
      completed: d.completed,
      createdAt: d.created_at,
    }));
  } catch (err) {
    console.error("Cloud fetch goals error:", err);
    return [];
  }
}

export async function cloudSaveUserGoal(userId: string, goal: Goal): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("goals").upsert({
      id: goal.id,
      user_id: userId,
      title: goal.title,
      category: goal.category,
      target_count: goal.targetCount,
      current_count: goal.currentCount,
      unit: goal.unit,
      deadline: goal.deadline,
      completed: goal.completed,
    });
    return !error;
  } catch (err) {
    console.error("Cloud save goal error:", err);
    return false;
  }
}

export async function cloudDeleteUserGoal(userId: string, goalId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from("goals")
      .delete()
      .eq("id", goalId)
      .eq("user_id", userId);
    return !error;
  } catch (err) {
    console.error("Cloud delete goal error:", err);
    return false;
  }
}

export async function cloudFetchUserReflections(userId: string): Promise<WeeklyReflection[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("weekly_reflections")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((d: any) => ({
      id: d.id,
      weekStartDate: d.week_start_date,
      weekEndDate: d.week_end_date,
      score: d.score,
      highlight: d.highlight,
      slipUp: d.slip_up,
      nextWeekFocus: d.next_week_focus,
      createdAt: d.created_at,
    }));
  } catch (err) {
    console.error("Cloud fetch reflections error:", err);
    return [];
  }
}

export async function cloudSaveUserReflection(userId: string, refl: WeeklyReflection): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("weekly_reflections").upsert({
      id: refl.id,
      user_id: userId,
      week_start_date: refl.weekStartDate,
      week_end_date: refl.weekEndDate,
      score: refl.score,
      highlight: refl.highlight,
      slip_up: refl.slipUp,
      next_week_focus: refl.nextWeekFocus,
    });
    return !error;
  } catch (err) {
    console.error("Cloud save reflection error:", err);
    return false;
  }
}
