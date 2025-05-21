import { format } from "date-fns";
import DatePickerReact from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { KeyboardEvent } from "react";

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string;
}

export function DatePicker({ date, setDate, className }: DatePickerProps) {
  // Prevent Enter key from submitting the form
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  return (
    <div className={cn("relative", className)}>
      <DatePickerReact
        selected={date}
        onChange={(date: Date | null) => setDate(date || undefined)}
        dateFormat="yyyy-MM-dd"
        minDate={new Date()}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        wrapperClassName="w-full"
        onKeyDown={handleKeyDown}
        customInput={
          <div className="w-full flex items-center justify-between border border-input rounded-md px-3 py-2 bg-background cursor-pointer">
            <span>{date ? format(date, "PPP") : <span>Pick a date</span>}</span>
            <Calendar className="ml-auto h-4 w-4 opacity-50" />
          </div>
        }
      />
    </div>
  );
}