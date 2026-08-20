"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  Download, 
  Upload, 
  RotateCcw, 
  Database, 
  Cloud, 
  Check, 
  AlertTriangle 
} from "lucide-react";
import { exportAllData, importAllData, resetToSeedData } from "@/lib/storage";

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReload: () => void;
  userId?: string;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  onDataReload,
  userId = "user_akshat",
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);

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

  const handleExport = () => {
    exportAllData(userId);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const success = importAllData(content, userId);
        if (success) {
          setImportStatus("Data imported successfully! Reloading...");
          setTimeout(() => {
            onDataReload();
            onClose();
          }, 800);
        } else {
          setImportStatus("Failed to parse backup JSON. Please check file format.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetDemo = () => {
    if (confirm("Reset to full demo dataset? This will restore 15 days of active streaks, sample goals, and badges.")) {
      resetToSeedData(userId);
      onDataReload();
      onClose();
    }
  };

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
            <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400 border border-cyan-500/20">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">Data & Backup</h2>
              <p className="text-[11px] text-strk-textMuted">Local-first persistence & cloud sync readiness</p>
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
        <div className="overflow-y-auto p-5 space-y-3">

          {importStatus && (
            <div className="mb-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 p-3 text-xs text-cyan-200">
              {importStatus}
            </div>
          )}

          {/* Export JSON */}
          <div className="rounded-xl border border-strk-border bg-surface-200/60 p-3.5 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">Export Full Account Data</h4>
              <p className="text-[11px] text-strk-textMuted">Download all logs, streaks & badges as JSON.</p>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center space-x-1.5 rounded-lg border border-strk-border bg-surface-200 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white hover:border-cyan-500 transition shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
            </button>
          </div>

          {/* Import JSON */}
          <div className="rounded-xl border border-strk-border bg-surface-200/60 p-3.5 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">Import / Restore Backup</h4>
              <p className="text-[11px] text-strk-textMuted">Restore your database from an existing file.</p>
            </div>
            <label className="flex items-center space-x-1.5 rounded-lg border border-strk-border bg-surface-200 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white hover:border-cyan-500 transition cursor-pointer shrink-0">
              <Upload className="h-3.5 w-3.5" />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

          {/* Reset Demo Data */}
          <div className="rounded-xl border border-strk-border bg-surface-200/60 p-3.5 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-amber-300">Reset to Demo Dataset</h4>
              <p className="text-[11px] text-strk-textMuted">Populate 15 days of active sample logs & goals.</p>
            </div>
            <button
              onClick={handleResetDemo}
              className="flex items-center space-x-1 rounded-lg border border-amber-500/40 bg-amber-950/40 px-3 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-900/60 shrink-0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>

          {/* Cloud Sync Supabase Status */}
          <div className="rounded-xl border border-strk-border/50 bg-[#07080d] p-3 text-xs text-slate-400">
            <div className="flex items-center space-x-1.5 font-bold text-slate-300 mb-1">
              <Cloud className="h-3.5 w-3.5 text-cyan-400" />
              <span>Cloud Sync Engine</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Local-first mode is active. PostgreSQL schema and Supabase Auth connector are pre-bundled in <code className="text-slate-300">/supabase/schema.sql</code>.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-auto p-4 border-t border-strk-border/60 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-strk-border bg-surface-200 px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
