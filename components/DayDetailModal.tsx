"use client";

import React from "react";
import { DailyLog } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { Calendar, Sparkles, Trash2, X } from "lucide-react";

interface DayDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string | null;
  dayLogs: DailyLog[];
  onDeleteLog?: (id: string) => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isOpen,
  onClose,
  date,
  dayLogs,
  onDeleteLog,
}) => {
  if (!isOpen || !date) return null;

  const dateObj = parseISO(date);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-strk-border bg-[#0d0f18] p-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-strk-border/60 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <div className="rounded-lg bg-orange-500/10 p-2 text-orange-400 border border-orange-500/20">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                {format(dateObj, "MMMM d, yyyy")}
              </h2>
              <p className="text-xs text-strk-textMuted">
                {format(dateObj, "EEEE")} • {dayLogs.length} Proof {dayLogs.length === 1 ? "Entry" : "Entries"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-surface-200 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Logs on this day */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {dayLogs.length === 0 ? (
            <div className="rounded-xl border border-strk-border bg-surface-200/50 p-8 text-center">
              <p className="text-sm font-semibold text-slate-400">No proof was logged on this date.</p>
              <p className="text-xs text-slate-600 mt-1">Every day is a fresh opportunity to build your streak.</p>
            </div>
          ) : (
            dayLogs.map((log, index) => (
              <div
                key={log.id || index}
                className="rounded-xl border border-strk-border bg-surface-200/70 p-4 space-y-2.5 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {log.categories.map((cat) => (
                      <span
                        key={cat}
                        className="rounded-md bg-orange-950/40 border border-orange-500/30 px-2 py-0.5 text-[10px] font-bold text-orange-300"
                      >
                        #{cat}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="flex items-center space-x-1 text-xs font-bold text-purple-300">
                      <Sparkles className="h-3 w-3" />
                      <span>+{log.xpEarned} XP</span>
                    </span>

                    {onDeleteLog && (
                      <button
                        onClick={() => {
                          if (confirm("Delete this log and remove its earned XP?")) {
                            onDeleteLog(log.id);
                            onClose();
                          }
                        }}
                        className="rounded-md p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
                        title="Delete log & remove XP"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-200 whitespace-pre-line leading-relaxed">
                  {log.content}
                </p>

                {log.mediaUrl && (
                  <div className="mt-2 overflow-hidden rounded-lg border border-strk-border max-h-40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={log.mediaUrl}
                      alt="Proof"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-strk-border/60 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-strk-border bg-surface-200 px-4 py-1.5 text-xs font-bold text-slate-300 hover:text-white"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
