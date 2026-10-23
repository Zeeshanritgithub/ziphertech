"use client";

import { useEffect, useState } from "react";
import {
  Coffee,
  Siren,
  Cookie,
  GlassWater,
  MoonStar,
  CircleCheck,
  TriangleAlert,
  Wifi,
  Users,
  Presentation,
  Server,
  Play,
  Square,
  Utensils,
  Bell,
  Footprints,
  Settings,
  LogOut,
  MonitorCog,
  Sandwich,
  X,
  Clock,
  Check,
} from "lucide-react";

const STORAGE_KEY = "zipher_selected_schedule";

const scheduleOptions = [
  { label: "Break time", icon: Coffee, color: "#BDE5FF", iconColor: "#174A7E" },
  { label: "Emergency", icon: Siren, color: "#FFB9B9", iconColor: "#B71930" },
  { label: "Snacks break", icon: Cookie, color: "#FFF0AD", iconColor: "#E99400" },
  { label: "Drink break", icon: GlassWater, color: "#A9F0DD", iconColor: "#075A79" },
  { label: "Prayer time", icon: MoonStar, color: "#D4C2FF", iconColor: "#32158E" },
  { label: "Ready time", icon: CircleCheck, color: "#A1F0F0", iconColor: "#07516B" },
  { label: "Error time", icon: TriangleAlert, color: "#FFD0A8", iconColor: "#D51F37" },
  { label: "Network issues", icon: Wifi, color: "#A8E3FF", iconColor: "#064B91" },
  { label: "Meeting time", icon: Users, color: "#F7B4DF", iconColor: "#113B7A" },
  { label: "Training time", icon: Presentation, color: "#D3C1FF", iconColor: "#29168D" },
  { label: "Server issues", icon: Server, color: "#9CEDEF", iconColor: "#07516B" },
  { label: "Start time", icon: Play, color: "#B6F0BD", iconColor: "#078A58" },
  { label: "End time", icon: Square, color: "#B5DEFF", iconColor: "#D31D36" },
  { label: "Dinner break", icon: Utensils, color: "#FFF0AD", iconColor: "#123B68" },
  { label: "Lunch break", icon: Bell, color: "#F7B4DF", iconColor: "#A20F50" },
  { label: "Running time", icon: Footprints, color: "#B6F0BD", iconColor: "#07516B" },
  { label: "In Process", icon: Settings, color: "#D3C1FF", iconColor: "#35158F" },
  { label: "Out Process", icon: LogOut, color: "#B5DEFF", iconColor: "#103C81" },
  { label: "System Issues", icon: MonitorCog, color: "#FFD0A8", iconColor: "#174A69" },
  { label: "Food break", icon: Sandwich, color: "#9CEDEF", iconColor: "#E99400" },
  { label: "Tea break", icon: Coffee, color: "#D3C1FF", iconColor: "#35158F" },
];

export default function ScheduleSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("");
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved && scheduleOptions.some((item) => item.label === saved)) {
      setSelected(saved);
    }
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;

    if (selected) {
      sessionStorage.setItem(STORAGE_KEY, selected);
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [selected, initialized]);

  // Close popup when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("#schedule-container")) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (label: string) => {
    setSelected(label);
    setIsOpen(false);
  };

  const activeOption = scheduleOptions.find(
    (item) => item.label === selected
  );

  return (
    <div id="schedule-container" className="fixed bottom-25 right-5 z-50 flex flex-col items-end">
      {/* Attached Popover Menu */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="schedule-title"
          className="absolute bottom-20 right-0 mb-1 w-72 flex flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-950 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-3 py-2">
            <h2 id="schedule-title" className="text-xs font-bold text-white">
              <span className="text-cyan-400">Zipher</span> Schedule
            </h2>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close schedule popup"
              className="cursor-pointer rounded-md border border-slate-700 p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X size={12} />
            </button>
          </div>

          {/* Current Selection & Clear Bar */}
          <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 px-3 py-1.5">
            <span className="text-[10px] text-slate-300">
              Status: <span className="font-semibold text-cyan-400">{selected || "None"}</span>
            </span>
            {selected && (
              <button
                type="button"
                onClick={() => setSelected("")}
                className="cursor-pointer text-[10px] text-slate-400 underline hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Scrollable options grid */}
          <div className="max-h-[50vh] overflow-y-auto p-2">
            <div className="grid grid-cols-2 gap-1.5">
              {scheduleOptions.map((item) => {
                const Icon = item.icon;
                const isSelected = selected === item.label;

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleSelect(item.label)}
                    aria-pressed={isSelected}
                    className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-left transition hover:brightness-95 ${
                      isSelected
                        ? "border-cyan-400 ring-1 ring-cyan-400/40"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: item.color }}
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white/30"
                      style={{ color: item.iconColor }}
                    >
                      <Icon size={12} strokeWidth={2.5} />
                    </span>

                    <span className="flex-1 truncate text-[10px] font-bold text-slate-950">
                      {item.label}
                    </span>

                    {isSelected && (
                      <Check
                        size={11}
                        className="shrink-0 text-emerald-800"
                        strokeWidth={3}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Button Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open schedule selector"
        title={selected ? `Current status: ${selected}` : "Zipher Aux"}
        className="group flex cursor-pointer items-center gap-2.5 rounded-full border border-cyan-400 bg-slate-950 p-2 text-cyan-300 shadow-lg shadow-cyan-500/20 transition duration-200 hover:scale-105 hover:bg-slate-900"
      >
        {/* Circular icon container */}
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 transition group-hover:border-cyan-300">
          {activeOption ? (
            <activeOption.icon size={20} className="shrink-0" />
          ) : (
            <Clock size={20} className="shrink-0" />
          )}
        </span>

        {/* Text area */}
        <div className="flex flex-col text-left pr-2">
          <span className="text-xs font-black tracking-wide uppercase text-cyan-400">
            Zipher Aux
          </span>
          <span className="max-w-[120px] truncate text-xs font-semibold text-slate-300">
            {selected || "Select status"}
          </span>
        </div>

        {/* Counter/Status indicator badge */}
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400 text-[10px] font-bold text-slate-950">
          {selected ? <Check size={12} strokeWidth={3} /> : "+"}
        </span>
      </button>
    </div>
  );
}