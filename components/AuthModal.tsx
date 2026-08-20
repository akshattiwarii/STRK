"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Flame, 
  LogIn, 
  UserPlus, 
  Lock, 
  Mail, 
  AtSign, 
  User, 
  AlertCircle,
  Tag,
  Eye,
  EyeOff,
  Link as LinkIcon
} from "lucide-react";
import { Category, UserProfile } from "@/lib/types";
import { ALL_CATEGORIES } from "@/lib/streakEngine";
import { 
  DEFAULT_AVATARS, 
  registerUser, 
  loginUser, 
  isHandleAvailable 
} from "@/lib/auth";
import { playSound } from "@/lib/soundEffects";
import confetti from "canvas-confetti";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
  soundEnabled: boolean;
  initialMode?: "login" | "signup";
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  soundEnabled,
  initialMode = "login",
}) => {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  
  // Login Form
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [handle, setHandle] = useState("");
  const [password, setPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [bio, setBio] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATARS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [isCustomAvatar, setIsCustomAvatar] = useState(false);
  const [selectedFocus, setSelectedFocus] = useState<Category[]>(["DSA", "Gym"]);

  const [error, setError] = useState("");

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode || "login");
      setError("");
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const toggleFocusCategory = (cat: Category) => {
    if (selectedFocus.includes(cat)) {
      if (selectedFocus.length > 1) {
        setSelectedFocus(selectedFocus.filter((c) => c !== cat));
      }
    } else {
      setSelectedFocus([...selectedFocus, cat]);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!loginIdentifier.trim() || !loginPassword) {
      setError("Please enter both email/handle and password.");
      return;
    }

    const res = loginUser(loginIdentifier, loginPassword);
    if (res.success && res.user) {
      if (soundEnabled) playSound("streak");
      onAuthSuccess(res.user);
      onClose();
    } else {
      setError(res.error || "Invalid credentials. Please check your password.");
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !handle.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters long.");
      return;
    }

    const activeAvatar = isCustomAvatar && customAvatarUrl.trim() ? customAvatarUrl.trim() : selectedAvatar;

    const res = registerUser({
      name: name.trim(),
      email: email.trim(),
      handle: handle.trim(),
      password,
      avatarUrl: activeAvatar,
      bio: bio.trim() || undefined,
      focusCategories: selectedFocus,
    });

    if (res.success && res.user) {
      if (soundEnabled) playSound("levelup");
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {}
      onAuthSuccess(res.user);
      onClose();
    } else {
      setError(res.error || "Could not create account.");
    }
  };

  const handleValidation = handle.trim() ? isHandleAvailable(handle) : null;

  return (
    <div 
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 p-3 sm:p-4 backdrop-blur-md animate-in fade-in flex items-center justify-center min-h-screen"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-strk-border bg-[#0d0f18] shadow-2xl my-auto max-h-[92vh] flex flex-col">
        
        {/* Sticky Header with Permanent Close Button */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-strk-border/60 bg-[#0d0f18]/95 backdrop-blur-md px-5 py-3.5 shrink-0">
          <div className="flex items-center space-x-2">
            <div className="rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 p-1.5 shadow-flame-sm text-black">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">STRK Account System</h2>
              <p className="text-[11px] text-strk-textMuted">Private, secure personal accountability</p>
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

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5">
          
          {/* Tab Toggle (Strictly Login & Sign Up only) */}
          <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface-300 p-1 border border-strk-border text-xs mb-4">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`flex items-center justify-center space-x-1.5 rounded-lg py-2 font-bold transition ${
                mode === "login"
                  ? "bg-orange-600 text-white shadow-flame-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
              }}
              className={`flex items-center justify-center space-x-1.5 rounded-lg py-2 font-bold transition ${
                mode === "signup"
                  ? "bg-orange-600 text-white shadow-flame-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <UserPlus className="h-4 w-4" />
              <span>Create Account</span>
            </button>
          </div>

          {error && (
            <div className="mb-4 flex items-center space-x-2 rounded-xl bg-rose-950/40 border border-rose-500/40 p-2.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* MODE 1: LOGIN */}
          {mode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email or @Handle
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="your_email@domain.com or @handle"
                    required
                    className="w-full rounded-xl border border-strk-border bg-surface-200 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full rounded-xl border border-strk-border bg-surface-200 pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-flame w-full rounded-xl py-2.5 text-xs font-bold shadow-flame-sm mt-2"
              >
                Sign In to Your Dashboard
              </button>
            </form>
          )}

          {/* MODE 2: SIGN UP */}
          {mode === "signup" && (
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Maya Sharma"
                      required
                      className="w-full rounded-xl border border-strk-border bg-surface-200 pl-8 pr-2.5 py-2 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Handle</span>
                    {handle.trim() && (
                      <span className={`text-[10px] font-bold ${handleValidation ? "text-emerald-400" : "text-rose-400"}`}>
                        {handleValidation ? "✓ Available" : "✗ Taken"}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <AtSign className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={handle}
                      onChange={(e) => setHandle(e.target.value)}
                      placeholder="maya_codes"
                      required
                      className="w-full rounded-xl border border-strk-border bg-surface-200 pl-8 pr-2.5 py-2 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="maya@example.com"
                    required
                    className="w-full rounded-xl border border-strk-border bg-surface-200 pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type={showSignupPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="w-full rounded-xl border border-strk-border bg-surface-200 pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Avatar Selector / Custom URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Avatar
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCustomAvatar(!isCustomAvatar)}
                    className="text-[11px] text-orange-400 hover:underline flex items-center space-x-1"
                  >
                    <LinkIcon className="h-3 w-3" />
                    <span>{isCustomAvatar ? "Pick Preset" : "Custom URL"}</span>
                  </button>
                </div>

                {isCustomAvatar ? (
                  <input
                    type="url"
                    value={customAvatarUrl}
                    onChange={(e) => setCustomAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full rounded-xl border border-strk-border bg-surface-200 p-2 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                  />
                ) : (
                  <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                    {DEFAULT_AVATARS.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAvatar(av)}
                        className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-full border-2 transition ${
                          selectedAvatar === av
                            ? "border-orange-500 scale-110 shadow-flame-sm"
                            : "border-strk-border opacity-60 hover:opacity-100"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={av} alt="Avatar" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Focus Categories */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center space-x-1">
                  <Tag className="h-3.5 w-3.5 text-orange-400" />
                  <span>Primary Disciplines</span>
                </label>
                <div className="flex flex-wrap gap-1">
                  {ALL_CATEGORIES.slice(0, 6).map((cat) => {
                    const isSel = selectedFocus.includes(cat);
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleFocusCategory(cat)}
                        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold transition ${
                          isSel
                            ? "bg-orange-600 text-white border border-orange-400"
                            : "bg-surface-200 text-slate-400 border border-strk-border"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="btn-flame w-full rounded-xl py-2.5 text-xs font-bold shadow-flame-sm mt-3"
              >
                Create STRK Profile & Begin Streak
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
