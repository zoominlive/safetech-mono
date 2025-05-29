import * as React from "react";
import { addDays, format } from "date-fns";
import { CalendarIcon } from "lucide-react";
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
}

export function DatePickerWithRange({
  className,
  onDateChange,
  ...rest
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2022, 0, 20),
    to: addDays(new Date(2022, 0, 20), 20),
  });

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);
    if (onDateChange) {
      onDateChange({ from: range?.from, to: range?.to });
    }
  };

  return (
    <div className={cn("grid w-full md:w-[332px]", className)} {...rest}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full h-[60px] p-0 justify-start text-left font-normal bg-safetech-gray ps-4 overflow-hidden",
              !date && "text-muted-foreground"
            )}
          >
            <span className="truncate">
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} ~{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </span>
            <span className="ml-auto h-full min-w-[68px] bg-sf-prefix-btn flex items-center justify-center">
              <CalendarIcon className="" />
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            className="sm:max-w-none max-w-[300px] overflow-x-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
