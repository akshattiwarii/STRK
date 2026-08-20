"use client";

import React, { useState, useEffect } from "react";
import { UserProfile, StreakStats, Category } from "@/lib/types";
import { ALL_CATEGORIES } from "@/lib/streakEngine";
import { DEFAULT_AVATARS, updateUserInRegistry, deleteUserAccount } from "@/lib/auth";
import { exportAllData } from "@/lib/storage";
import { cloudUpdateUserProfile } from "@/lib/supabaseClient";
import { 
  X, 
  User, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Eye, 
  EyeOff, 
  LogOut, 
  Check, 
  Link as LinkIcon,
  Upload,
  Download,
  Trash2,
  AlertTriangle,
  Image as ImageIcon
} from "lucide-react";
import { playSound } from "@/lib/soundEffects";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  stats: StreakStats;
  badgesCount: number;
  onUpdateUser: (updated: UserProfile) => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  stats,
  badgesCount,
  onUpdateUser,
  onLogout,
}) => {
  const [name, setName] = useState(user.name);
  const [handle, setHandle] = useState(user.handle);
  const [bio, setBio] = useState(user.bio);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [isCustomAvatar, setIsCustomAvatar] = useState(false);
  const [customAvatarInput, setCustomAvatarInput] = useState(user.avatarUrl);
  const [theme, setTheme] = useState(user.theme);
  const [autoFreeze, setAutoFreeze] = useState(user.autoFreezeEnabled);
  const [soundEnabled, setSoundEnabled] = useState(user.soundEnabled);
  const [isPublic, setIsPublic] = useState(user.isPublic);
  const [focusCategories, setFocusCategories] = useState<Category[]>(user.focusCategories || ["DSA", "Gym"]);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [avatarError, setAvatarError] = useState("");

  // Sync state whenever modal opens or user prop updates
  useEffect(() => {
    if (isOpen && user) {
      setName(user.name);
      setHandle(user.handle);
      setBio(user.bio);
      setAvatarUrl(user.avatarUrl);
      setCustomAvatarInput(user.avatarUrl);
      setTheme(user.theme);
      setAutoFreeze(user.autoFreezeEnabled);
      setSoundEnabled(user.soundEnabled);
      setIsPublic(user.isPublic);
      setFocusCategories(user.focusCategories || ["DSA", "Gym"]);
      setAvatarError("");
    }
  }, [isOpen, user]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleFocus = (cat: Category) => {
    if (focusCategories.includes(cat)) {
      if (focusCategories.length > 1) {
        setFocusCategories(focusCategories.filter((c) => c !== cat));
      }
    } else {
      setFocusCategories([...focusCategories, cat]);
    }
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setAvatarError("Avatar image must be smaller than 3MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        setAvatarUrl(base64Url);
        setCustomAvatarInput(base64Url);
        setIsCustomAvatar(false);
        setAvatarError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAvatar = isCustomAvatar && customAvatarInput.trim() ? customAvatarInput.trim() : avatarUrl;
    const updated = updateUserInRegistry(user.id, {
      name: name.trim(),
      handle: handle.trim().replace(/^@/, ""),
      bio: bio.trim(),
      avatarUrl: finalAvatar,
      theme,
      autoFreezeEnabled: autoFreeze,
      soundEnabled,
      isPublic,
      focusCategories,
    });

    // Also trigger cloud update if Supabase is active
    cloudUpdateUserProfile(user.id, {
      name: name.trim(),
      handle: handle.trim().replace(/^@/, ""),
      bio: bio.trim(),
      avatarUrl: finalAvatar,
      theme,
      autoFreezeEnabled: autoFreeze,
      soundEnabled,
      isPublic,
      focusCategories,
    }).catch(() => {});

    if (soundEnabled) playSound("click");
    onUpdateUser(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleDeleteAccount = () => {
    deleteUserAccount(user.id);
    onLogout();
    onClose();
  };

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
          <div className="flex items-center space-x-2">
            <div className="rounded-xl bg-purple-500/10 p-2 text-purple-400 border border-purple-500/20">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">Hunter Profile & Settings</h2>
              <p className="text-[11px] text-strk-textMuted">Permanent profile & avatar customization</p>
            </div>
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

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto p-5 space-y-4">
          
          {/* Profile Card & Stats Snapshot */}
          <div className="rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-950/30 to-[#121422] p-4">
            <div className="flex items-center space-x-3.5">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border-2 border-purple-500 p-0.5 shadow-purple-glow">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={isCustomAvatar && customAvatarInput.trim() ? customAvatarInput.trim() : avatarUrl} alt={name} className="h-full w-full object-cover rounded-[14px]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-base font-black text-white">{name}</span>
                  <span className="text-xs text-slate-400">@{handle}</span>
                </div>
                <div className="flex items-center space-x-2 mt-0.5 text-xs">
                  <span className="font-bold text-purple-300">Lv.{user.level} {user.rankTitle}</span>
                  <span>•</span>
                  <span className="text-amber-400 font-bold">{user.totalXp.toLocaleString()} XP</span>
                </div>
              </div>
            </div>

            {/* Mini Stats Bar */}
            <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-purple-500/20 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Streak</span>
                <span className="font-black text-orange-400">{stats.currentStreak}d</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Record</span>
                <span className="font-black text-amber-300">{stats.longestStreak}d</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Active</span>
                <span className="font-black text-cyan-300">{stats.totalActiveDays}d</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Badges</span>
                <span className="font-black text-purple-300">{badgesCount}</span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSave} className="space-y-4">
            
            {/* Avatar Selection: Presets, Upload File, or Custom URL */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                  <ImageIcon className="h-3.5 w-3.5 text-purple-400" />
                  <span>Profile Avatar</span>
                </label>
                
                <div className="flex items-center space-x-2">
                  <label className="text-[11px] text-purple-300 hover:text-white flex items-center space-x-1 cursor-pointer bg-surface-200 px-2 py-0.5 rounded-lg border border-strk-border hover:border-purple-400 transition">
                    <Upload className="h-3 w-3" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsCustomAvatar(!isCustomAvatar)}
                    className="text-[11px] text-orange-400 hover:underline flex items-center space-x-1"
                  >
                    <LinkIcon className="h-3 w-3" />
                    <span>{isCustomAvatar ? "Presets" : "URL"}</span>
                  </button>
                </div>
              </div>

              {avatarError && (
                <p className="text-[11px] text-rose-400 mb-1.5">{avatarError}</p>
              )}

              {isCustomAvatar ? (
                <input
                  type="url"
                  value={customAvatarInput}
                  onChange={(e) => setCustomAvatarInput(e.target.value)}
                  placeholder="https://example.com/your-avatar.jpg"
                  className="w-full rounded-xl border border-strk-border bg-surface-200 p-2 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
                />
              ) : (
                <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                  {DEFAULT_AVATARS.map((av, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setAvatarUrl(av);
                        setIsCustomAvatar(false);
                      }}
                      className={`h-9 w-9 shrink-0 overflow-hidden rounded-full border-2 transition ${
                        avatarUrl === av && !isCustomAvatar
                          ? "border-purple-500 scale-110 shadow-purple-glow"
                          : "border-strk-border opacity-60 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={av} alt="Avatar option" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-strk-border bg-surface-200 p-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Handle
                </label>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  required
                  className="w-full rounded-xl border border-strk-border bg-surface-200 p-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Bio / Philosophy Statement
              </label>
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="e.g. Solo Hunter • Me vs Me ⚔️"
                className="w-full rounded-xl border border-strk-border bg-surface-200 p-2 text-xs text-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            {/* Focus Categories */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Active Focus Domains
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ALL_CATEGORIES.map((cat) => {
                  const isSel = focusCategories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleFocus(cat)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                        isSel
                          ? "bg-purple-600 text-white shadow-sm border border-purple-400"
                          : "bg-surface-200 text-slate-400 border border-strk-border"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Preferences Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
              
              {/* Auto Freeze */}
              <button
                type="button"
                onClick={() => setAutoFreeze(!autoFreeze)}
                className={`flex items-center justify-between rounded-xl p-2.5 border transition ${
                  autoFreeze
                    ? "border-cyan-500/40 bg-cyan-950/30 text-cyan-200"
                    : "border-strk-border bg-surface-200 text-slate-400"
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <ShieldAlert className="h-4 w-4 text-cyan-400" />
                  <span className="font-bold">Auto-Freeze</span>
                </div>
                <span className="text-[10px] font-bold">{autoFreeze ? "ON" : "OFF"}</span>
              </button>

              {/* Sound Effects */}
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex items-center justify-between rounded-xl p-2.5 border transition ${
                  soundEnabled
                    ? "border-amber-500/40 bg-amber-950/30 text-amber-200"
                    : "border-strk-border bg-surface-200 text-slate-400"
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  {soundEnabled ? <Volume2 className="h-4 w-4 text-amber-400" /> : <VolumeX className="h-4 w-4" />}
                  <span className="font-bold">Audio Cues</span>
                </div>
                <span className="text-[10px] font-bold">{soundEnabled ? "ON" : "OFF"}</span>
              </button>

              {/* Public Profile */}
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`flex items-center justify-between rounded-xl p-2.5 border transition ${
                  isPublic
                    ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-200"
                    : "border-strk-border bg-surface-200 text-slate-400"
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  {isPublic ? <Eye className="h-4 w-4 text-emerald-400" /> : <EyeOff className="h-4 w-4" />}
                  <span className="font-bold">Public Card</span>
                </div>
                <span className="text-[10px] font-bold">{isPublic ? "YES" : "NO"}</span>
              </button>

            </div>

            {/* Account Management & Save Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-strk-border/60 pt-4">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => exportAllData(user.id)}
                  title="Download My Personal Backup"
                  className="flex items-center space-x-1.5 rounded-xl border border-strk-border bg-surface-200 px-3 py-2 text-xs font-bold text-slate-300 hover:text-cyan-400"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Backup</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="flex items-center space-x-1.5 rounded-xl border border-rose-500/30 bg-rose-950/30 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-900/40"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log Out</span>
                </button>
              </div>

              <button
                type="submit"
                className="btn-flame flex items-center space-x-1.5 rounded-xl px-5 py-2 text-xs font-bold w-full sm:w-auto justify-center"
              >
                {savedSuccess ? <Check className="h-4 w-4" /> : null}
                <span>{savedSuccess ? "Saved Permanently!" : "Save Profile Changes"}</span>
              </button>
            </div>

            {/* Danger Zone: Delete Account */}
            <div className="pt-2 border-t border-strk-border/30">
              {showDeleteConfirm ? (
                <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2 text-rose-300">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>Permanently delete this account and all its logs?</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="rounded-lg bg-surface-200 px-2.5 py-1 text-slate-300 hover:text-white text-[11px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      className="rounded-lg bg-rose-600 px-2.5 py-1 font-bold text-white hover:bg-rose-500 text-[11px]"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-[11px] text-slate-500 hover:text-rose-400 flex items-center space-x-1 transition"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete Account</span>
                  </button>
                </div>
              )}
            </div>

          </form>

        </div>

      </div>
    </div>
  );
};
