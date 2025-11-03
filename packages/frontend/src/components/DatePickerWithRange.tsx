import * as React from "react";
import {
  addMonths,
  format,
  startOfToday,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
} from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DatePickerWithRangeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onDateChange?: (dateRange: { from: Date | undefined; to: Date | undefined }) => void;
  value?: { from: Date | undefined; to: Date | undefined } | undefined;
}

const quickRanges = [
  {
    label: "Today",
    getRange: () => {
      const today = startOfToday();
      return { from: today, to: today };
    },
  },
  {
    label: "Yesterday",
    getRange: () => {
      const yest = subDays(startOfToday(), 1);
      return { from: yest, to: yest };
    },
  },
  {
    label: "This week",
    getRange: () => {
      const today = startOfToday();
      return { from: startOfWeek(today), to: today };
    },
  },
  {
    label: "Last week",
    getRange: () => {
      const today = startOfToday();
      const lastWeekStart = startOfWeek(subDays(today, 7));
      const lastWeekEnd = endOfWeek(subDays(today, 7));
      return { from: lastWeekStart, to: lastWeekEnd };
    },
  },
  {
    label: "Last 7 Days",
    getRange: () => {
      const today = startOfToday();
      return { from: subDays(today, 6), to: today };
    },
  },
  {
    label: "This Month",
    getRange: () => {
      const today = startOfToday();
      return { from: startOfMonth(today), to: today };
    },
  },
  {
    label: "Last Month",
    getRange: () => {
      const today = startOfToday();
      const lastMonth = subMonths(today, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    },
  },
  {
    label: "Last 30 Days",
    getRange: () => {
      const today = startOfToday();
      return { from: subDays(today, 29), to: today };
    },
  },
];

export function DatePickerWithRange({
  className,
  onDateChange,
  value,
  ...rest
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(undefined);
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const [currentMonth, setCurrentMonth] = React.useState<Date>(date?.from || startOfToday());

  // Sync from external value when provided
  React.useEffect(() => {
    if (value) {
      setDate(value as DateRange);
      if (value.from) setCurrentMonth(value.from);
    }
    if (value === undefined) {
      setDate(undefined);
      setCurrentMonth(startOfToday());
    }
  }, [value]);

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);
    if (onDateChange) {
      onDateChange({ from: range?.from, to: range?.to });
    }
  };

  const handleQuickRange = (getRange: () => { from: Date; to: Date }) => {
    const range = getRange();
    setDate(range);
    setCurrentMonth(range.from);
    if (onDateChange) {
      onDateChange(range);
    }
  };

  const handleOk = () => {
    setPopoverOpen(false);
  };

  // For showing current date
  const today = startOfToday();

  // For showing selection
  let selectionLabel = "Start Date ~ End Date";
  if (date?.from && date?.to) {
    selectionLabel = `${format(date.from, "LLL dd, y")} ~ ${format(date.to, "LLL dd, y")}`;
  } else if (date?.from) {
    selectionLabel = format(date.from, "LLL dd, y");
  }

  return (
    <div className={cn("grid w-full md:w-[332px]", className)} {...rest}>
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full h-[60px] p-0 justify-start text-left font-normal bg-gray-100 dark:bg-gray-800 ps-4 overflow-hidden",
              !date && "text-muted-foreground"
            )}
          >
            <div className="flex flex-col w-full">
              <span className="text-xs text-gray-400 dark:text-gray-500">Today: {format(today, "LLL dd, y")}</span>
              <span className="truncate text-base font-medium text-gray-700 dark:text-gray-200">
                {selectionLabel}
              </span>
            </div>
            <span className="ml-auto h-full min-w-[68px] bg-sf-prefix-btn flex items-center justify-center">
              <CalendarIcon className="" />
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex bg-white rounded-lg shadow-lg p-4 gap-4 min-w-[420px]">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-between w-full mb-2">
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}>
                  <ChevronLeft />
                </Button>
                <span className="font-semibold text-lg">
                  {format(currentMonth, "LLLL yyyy")}
                </span>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}>
                  <ChevronRight />
                </Button>
              </div>
              <Calendar
                initialFocus
                mode="range"
                month={currentMonth}
                onMonthChange={setCurrentMonth}
                selected={date}
                onSelect={handleSelect}
                numberOfMonths={2}
                className="sm:max-w-none max-w-[600px]"
                disabled={(d) => d > today}
                toMonth={today}
              />
            </div>
            <div className="flex flex-col gap-2 min-w-[150px]">
              <span className="text-xs text-gray-400 mb-2">Quick Select</span>
              {quickRanges.map((q) => (
                <Button
                  key={q.label}
                  variant="ghost"
                  className="justify-start w-full text-left px-2 py-1 text-[15px]"
                  onClick={() => handleQuickRange(q.getRange)}
                >
                  {q.label}
                </Button>
              ))}
              <Button
                className="mt-2 bg-sf-gray-600 text-white w-full"
                onClick={handleOk}
              >
                OK
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
