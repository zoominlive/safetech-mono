import { ReactNode } from "react";

type StatProps = {
  title: string;
  value: string;
  change: string;
  changeLabel: string;
  icon: ReactNode;
  iconBg?: string;
};

function Stat({
  title,
  value,
  change,
  changeLabel,
  icon,
  iconBg = "bg-indigo-100",
}: StatProps) {
  return (
    <div className="flex justify-between items-center p-6 bg-white rounded-2xl shadow-sm w-full">
      <div>
        <p className="text-gray-600 text-sm mb-1">{title}</p>
        <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
        <div className="flex items-center mt-3 text-sm text-green-600 font-medium">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M5 12l5-5 5 5M5 18l5-5 5 5" />
          </svg>
          {change}{" "}
          <span className="ml-1 text-gray-600 font-normal">{changeLabel}</span>
        </div>
      </div>

      <div className={`${iconBg} p-3 rounded-full`}>{icon}</div>
    </div>
  );
}

export default Stat;
