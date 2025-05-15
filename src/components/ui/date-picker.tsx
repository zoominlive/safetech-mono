import { format } from "date-fns";
import DatePickerReact from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string;
}

export function DatePicker({ date, setDate, className }: DatePickerProps) {
  return (
    <div className={cn("relative", className)}>
      <DatePickerReact
        selected={date}
        onChange={(date: Date | null) => setDate(date || undefined)}
        dateFormat="yyyy-MM-dd"
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        wrapperClassName="w-full"
        customInput={
          <Button variant="outline" className="w-full justify-start text-left font-normal">
            {date ? format(date, "PPP") : <span>Pick a date</span>}
            <Calendar className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        }
      />
    </div>
  );
}