import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import { ReactNode } from "react";

type StatProps = {
  title: string;
  value: number | string;
  icon: ReactNode;
  iconBg: string;
  percentage: string;
  subtitle: string;
  trend?: "up" | "down";
};

function Stat({
  title,
  value,
  icon,
  iconBg,
  percentage,
  subtitle,
  trend = "up",
}: StatProps) {
  const isUp = trend === "up";

  return (
    <Card>
      <CardContent className="flex flex-col">
        <div className="flex justify-between">
          <div className="">
            <p className="text-xs lg:text-sm text-gray-600 mb-2 font-semibold">
              {title}
            </p>
            <p className="text-xl lg:text-3xl font-bold text-gray-900">
              {value}
            </p>
          </div>
          <div
            className={cn(
              "p-1 lg:p-3 rounded-xl h-[40px] w-[40px] lg:h-[60px] lg:w-[60px] flex items-center justify-center",
              iconBg
            )}
          >
            {icon}
          </div>
        </div>

        <div className="flex items-center gap-1 mt-7 text-sm font-semibold col-span-2">
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
      </CardContent>
    </Card>
  );
}

export default Stat;
