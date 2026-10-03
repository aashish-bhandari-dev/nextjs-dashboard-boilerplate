"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "cn";

interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  disableFuture?: boolean;
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled = false,
  className,
  disableFuture = false,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Parse initial selected date
  const parsedDate = React.useMemo(() => {
    if (!value) return null;
    const [y, m, d] = value.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }, [value]);

  const [prevValue, setPrevValue] = React.useState(value);
  const [viewYear, setViewYear] = React.useState(() => {
    return parsedDate ? parsedDate.getFullYear() : new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = React.useState(() => {
    return parsedDate ? parsedDate.getMonth() : new Date().getMonth();
  });

  // Keep view aligned when value changes externally (React recommended state-from-props pattern)
  if (value !== prevValue) {
    setPrevValue(value);
    if (parsedDate) {
      setViewYear(parsedDate.getFullYear());
      setViewMonth(parsedDate.getMonth());
    }
  }

  const today = React.useMemo(() => new Date(), []);
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  // Generate Year options (1920 to todayYear)
  const currentYear = todayYear;
  const years = React.useMemo(() => {
    const list: number[] = [];
    const maxYear = disableFuture ? currentYear : currentYear + 10;
    for (let y = maxYear; y >= 1920; y--) {
      list.push(y);
    }
    return list;
  }, [currentYear, disableFuture]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Generate day grid cells
  const calendarDays = React.useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{
      day: number;
      month: number;
      year: number;
      isCurrentMonth: boolean;
      isSelected: boolean;
      isToday: boolean;
      isDisabled: boolean;
    }> = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = viewMonth === 0 ? 11 : viewMonth - 1;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      days.push({
        day: d,
        month: m,
        year: y,
        isCurrentMonth: false,
        isSelected: false,
        isToday: false,
        isDisabled: true,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const isSelected =
        parsedDate !== null &&
        parsedDate.getFullYear() === viewYear &&
        parsedDate.getMonth() === viewMonth &&
        parsedDate.getDate() === d;

      const isToday =
        viewYear === todayYear &&
        viewMonth === todayMonth &&
        d === todayDate;

      const isFuture =
        disableFuture &&
        (viewYear > todayYear ||
          (viewYear === todayYear &&
            (viewMonth > todayMonth ||
              (viewMonth === todayMonth && d > todayDate))));

      days.push({
        day: d,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
        isSelected,
        isToday,
        isDisabled: isFuture,
      });
    }

    // Next month padding to fill complete weeks (42 cells = 6 rows)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      days.push({
        day: d,
        month: m,
        year: y,
        isCurrentMonth: false,
        isSelected: false,
        isToday: false,
        isDisabled: true,
      });
    }

    return days;
  }, [viewYear, viewMonth, parsedDate, todayDate, todayMonth, todayYear, disableFuture]);

  const handleSelectDay = (cell: (typeof calendarDays)[0]) => {
    if (cell.isDisabled || !cell.isCurrentMonth) return;

    const y = cell.year;
    const m = String(cell.month + 1).padStart(2, "0");
    const d = String(cell.day).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onChange("");
  };

  // Format display string
  const formattedDisplay = React.useMemo(() => {
    if (!parsedDate) return null;
    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [parsedDate]);

  // Quick preset shortcuts
  const applyPresetYearsAgo = (yearsAgo: number) => {
    const target = new Date();
    target.setFullYear(todayYear - yearsAgo);
    const y = target.getFullYear();
    const m = String(target.getMonth() + 1).padStart(2, "0");
    const d = String(target.getDate()).padStart(2, "0");
    onChange(`${y}-${m}-${d}`);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <PopoverTrigger
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-xs shadow-xs transition-colors hover:bg-accent/40 focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
            formattedDisplay && "pr-8",
            !formattedDisplay && "text-muted-foreground"
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span>{formattedDisplay || placeholder}</span>
          </span>
        </PopoverTrigger>

        {formattedDisplay && !disabled ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
            title="Clear date"
            aria-label="Clear date"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}

        <PopoverContent
          align="start"
          sideOffset={4}
          className="w-auto p-3 shadow-xl rounded-xl border bg-popover"
        >
        <div className="space-y-3">
          {/* Header Controls: Month & Year Dropdowns + Chevrons */}
          <div className="flex items-center justify-between gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handlePrevMonth}
              className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer rounded-md"
              title="Previous Month"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>

            <div className="flex items-center gap-1.5">
              {/* Month Selector */}
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(Number(e.target.value))}
                className="h-7 appearance-none rounded-md border border-input bg-background px-2 text-xs font-semibold text-foreground outline-none hover:bg-accent/40 cursor-pointer"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx}>
                    {name}
                  </option>
                ))}
              </select>

              {/* Year Selector */}
              <select
                value={viewYear}
                onChange={(e) => setViewYear(Number(e.target.value))}
                className="h-7 appearance-none rounded-md border border-input bg-background px-2 text-xs font-semibold text-foreground outline-none hover:bg-accent/40 cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer rounded-md"
              title="Next Month"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Days of Week Row */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted-foreground">
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} className="h-6 flex items-center justify-center">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Days Matrix */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                return (
                  <div
                    key={idx}
                    className="h-7 w-7 flex items-center justify-center text-[11px] text-muted-foreground/30 pointer-events-none select-none"
                  >
                    {cell.day}
                  </div>
                );
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={cell.isDisabled}
                  onClick={() => handleSelectDay(cell)}
                  className={cn(
                    "h-7 w-7 rounded-md text-[11px] font-medium transition-colors flex items-center justify-center select-none cursor-pointer",
                    cell.isSelected
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "hover:bg-accent hover:text-accent-foreground text-foreground",
                    cell.isToday &&
                      !cell.isSelected &&
                      "border border-primary/50 font-bold text-primary",
                    cell.isDisabled &&
                      "opacity-30 cursor-not-allowed pointer-events-none"
                  )}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Quick Presets Footer */}
          <div className="flex items-center justify-between border-t pt-2.5 text-[10px] text-muted-foreground">
            <span className="font-medium">Presets:</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => applyPresetYearsAgo(18)}
                className="rounded px-1.5 py-0.5 border hover:bg-accent hover:text-foreground cursor-pointer transition-colors"
              >
                18y
              </button>
              <button
                type="button"
                onClick={() => applyPresetYearsAgo(25)}
                className="rounded px-1.5 py-0.5 border hover:bg-accent hover:text-foreground cursor-pointer transition-colors"
              >
                25y
              </button>
              <button
                type="button"
                onClick={() => applyPresetYearsAgo(30)}
                className="rounded px-1.5 py-0.5 border hover:bg-accent hover:text-foreground cursor-pointer transition-colors"
              >
                30y
              </button>
              {value ? (
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="rounded px-1.5 py-0.5 text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
    </div>
  );
}
