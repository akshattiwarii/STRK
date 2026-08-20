import { UserProfile, Category } from "./types";
import { getRankForXp } from "./gamification";
import { saveToStorage, loadFromStorage } from "./storage";

const AUTH_USERS_KEY = "strk_registered_users_v1";
const AUTH_SESSION_KEY = "strk_current_session_v1";

export const DEFAULT_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80",
];

export const INITIAL_SEEDED_USERS: UserProfile[] = [
  {
    id: "user_akshat",
    email: "akshat@strk.dev",
    password: "password123",
    name: "Akshat",
    handle: "akshat_dev",
    avatarUrl: DEFAULT_AVATARS[0],
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
  },
];

export function getRegisteredUsers(): UserProfile[] {
  if (typeof window === "undefined") return INITIAL_SEEDED_USERS;
  return loadFromStorage<UserProfile[]>(AUTH_USERS_KEY, INITIAL_SEEDED_USERS);
}

export function saveRegisteredUsers(users: UserProfile[]): void {
  saveToStorage(AUTH_USERS_KEY, users);
}

export function getCurrentSessionUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw || raw === "null" || raw === '""' || raw === 'null') return null;
    let currentUserId: string | null = null;
    try {
      currentUserId = JSON.parse(raw);
    } catch {
      currentUserId = raw;
    }
    if (!currentUserId || currentUserId === "null") return null;
    const users = getRegisteredUsers();
    const found = users.find((u) => u.id === currentUserId);
    return found || null;
  } catch {
    return null;
  }
}

export function setCurrentSessionUser(user: UserProfile | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!user) {
      localStorage.removeItem(AUTH_SESSION_KEY);
    } else {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user.id));
    }
  } catch {}
}

export interface SignupInput {
  name: string;
  email: string;
  password?: string;
  handle: string;
  avatarUrl?: string;
  bio?: string;
  focusCategories?: Category[];
}

import { cloudRegisterProfile, cloudFindProfileByAuth } from "./supabaseClient";

export async function registerUserAsync(input: SignupInput): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const cleanEmail = input.email.trim().toLowerCase();
  const cleanHandle = input.handle.trim().replace(/^@/, "").toLowerCase();

  const users = getRegisteredUsers();
  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, error: "An account with this email already exists." };
  }

  if (users.some((u) => u.handle.toLowerCase() === cleanHandle)) {
    return { success: false, error: "This @handle is already taken. Please choose another." };
  }

  if (!input.password || input.password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  const newUser: UserProfile = {
    id: `user_${Date.now()}`,
    email: cleanEmail,
    password: input.password,
    name: input.name.trim(),
    handle: cleanHandle,
    avatarUrl: input.avatarUrl || DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)],
    bio: input.bio?.trim() || "Consistency Hunter on STRK • Me vs Me ⚔️",
    isPublic: true,
    theme: "ember",
    freezeTokens: 2,
    autoFreezeEnabled: true,
    totalXp: 0,
    level: 1,
    rankTitle: "Novice",
    soundEnabled: true,
    focusCategories: input.focusCategories || ["DSA", "Gym", "Coding"],
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [...users, newUser];
  saveRegisteredUsers(updatedUsers);
  setCurrentSessionUser(newUser);

  // Sync to Supabase PostgreSQL Cloud
  cloudRegisterProfile(newUser).catch(() => {});

  return { success: true, user: newUser };
}

export function registerUser(input: SignupInput): { success: boolean; user?: UserProfile; error?: string } {
  const users = getRegisteredUsers();
  const cleanEmail = input.email.trim().toLowerCase();
  const cleanHandle = input.handle.trim().replace(/^@/, "").toLowerCase();

  if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, error: "An account with this email already exists." };
  }

  if (users.some((u) => u.handle.toLowerCase() === cleanHandle)) {
    return { success: false, error: "This @handle is already taken. Please choose another." };
  }

  if (!input.password || input.password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." };
  }

  const newUser: UserProfile = {
    id: `user_${Date.now()}`,
    email: cleanEmail,
    password: input.password,
    name: input.name.trim(),
    handle: cleanHandle,
    avatarUrl: input.avatarUrl || DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)],
    bio: input.bio?.trim() || "Consistency Hunter on STRK • Me vs Me ⚔️",
    isPublic: true,
    theme: "ember",
    freezeTokens: 2,
    autoFreezeEnabled: true,
    totalXp: 0,
    level: 1,
    rankTitle: "Novice",
    soundEnabled: true,
    focusCategories: input.focusCategories || ["DSA", "Gym", "Coding"],
    createdAt: new Date().toISOString(),
  };

  const updatedUsers = [...users, newUser];
  saveRegisteredUsers(updatedUsers);
  setCurrentSessionUser(newUser);

  cloudRegisterProfile(newUser).catch(() => {});

  return { success: true, user: newUser };
}

export async function loginUserAsync(emailOrHandle: string, password?: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const query = emailOrHandle.trim().toLowerCase().replace(/^@/, "");
  const users = getRegisteredUsers();

  let user = users.find(
    (u) => u.email.toLowerCase() === query || u.handle.toLowerCase() === query
  );

  // If not found in this device's local registry, query Supabase Cloud Database!
  if (!user) {
    const cloudUser = await cloudFindProfileByAuth(query);
    if (cloudUser) {
      user = cloudUser;
      // Cache this profile to local registry on this device (PC/laptop)
      const existing = users.filter((u) => u.id !== cloudUser.id);
      saveRegisteredUsers([...existing, cloudUser]);
    }
  }

  if (!user) {
    return { success: false, error: "No account found matching this email or handle." };
  }

  if (!password || user.password !== password) {
    return { success: false, error: "Incorrect password. Please try again." };
  }

  setCurrentSessionUser(user);
  return { success: true, user };
}

export function loginUser(emailOrHandle: string, password?: string): { success: boolean; user?: UserProfile; error?: string } {
  const users = getRegisteredUsers();
  const query = emailOrHandle.trim().toLowerCase().replace(/^@/, "");

  const user = users.find(
    (u) => u.email.toLowerCase() === query || u.handle.toLowerCase() === query
  );

  if (!user) {
    return { success: false, error: "No account found matching this email or handle." };
  }

  if (!password || user.password !== password) {
    return { success: false, error: "Incorrect password. Please try again." };
  }

  setCurrentSessionUser(user);
  return { success: true, user };
}

export function updateUserInRegistry(userId: string, updates: Partial<UserProfile>): UserProfile {
  const users = getRegisteredUsers();
  let updatedUser: UserProfile = users[0];

  const nextUsers = users.map((u) => {
    if (u.id === userId) {
      updatedUser = {
        ...u,
        ...updates,
      };
      if (updates.totalXp !== undefined) {
        const rank = getRankForXp(updates.totalXp);
        updatedUser.level = rank.level;
        updatedUser.rankTitle = rank.title;
      }
      return updatedUser;
    }
    return u;
  });

  saveRegisteredUsers(nextUsers);
  return updatedUser;
}

export function deleteUserAccount(userId: string): { success: boolean } {
  const users = getRegisteredUsers();
  const filtered = users.filter((u) => u.id !== userId);

  saveRegisteredUsers(filtered);

  // Clean up user-specific keys in localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(`strk_logs_v1_${userId}`);
      localStorage.removeItem(`strk_goals_v1_${userId}`);
      localStorage.removeItem(`strk_badges_v1_${userId}`);
      localStorage.removeItem(`strk_reflections_v1_${userId}`);
      localStorage.removeItem(`strk_freeze_dates_v1_${userId}`);
    } catch {}
  }

  setCurrentSessionUser(null);
  return { success: true };
}

export function isHandleAvailable(handle: string, currentUserId?: string): boolean {
  const clean = handle.trim().replace(/^@/, "").toLowerCase();
  if (!clean) return false;
  const users = getRegisteredUsers();
  return !users.some((u) => u.handle.toLowerCase() === clean && u.id !== currentUserId);
}

export function logoutUser(): void {
  setCurrentSessionUser(null);
}
