import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { ReactNode } from "react";

type StatProps = {
  title: string;
  value: number | string;
  icon: ReactNode;
  percentage: string;
  subtitle: string;
  trend?: "up" | "down";
};

function Stat({
  title,
  value,
  icon,
  percentage,
  subtitle,
  trend = "up",
}: StatProps) {
  const isUp = trend === "up";

  return (
    <div className="flex justify-between items-start p-6 bg-white rounded-2xl shadow-sm w-full max-w-md">
      <div className="font-nunito-sans">
        <p className="text-sm text-gray-600 mb-2 font-semibold">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <div className="flex items-center gap-1 mt-7 text-sm font-semibold">
          {isUp ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          )}
          <span
            className={cn(
              "font-medium",
              isUp ? "text-green-600" : "text-red-600"
            )}
          >
            {percentage}
          </span>
          <span className="text-gray-600">{subtitle}</span>
        </div>
      </div>
      <div className="bg-indigo-100 p-3 rounded-xl">{icon}</div>
    </div>
  );
}

export default Stat;
