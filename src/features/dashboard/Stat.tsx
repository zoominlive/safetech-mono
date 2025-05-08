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
    <div className="flex justify-between items-center p-4 sm:p-6 bg-white rounded-2xl shadow-sm w-full">
      <div className="flex-grow">
        <p className="text-gray-600 text-xs sm:text-sm mb-1 line-clamp-1">{title}</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</h2>
        <div className="flex flex-wrap items-center mt-2 sm:mt-3 text-xs sm:text-sm text-green-600 font-medium">
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4 mr-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M5 12l5-5 5 5M5 18l5-5 5 5" />
          </svg>
          <span>{change}</span>
          <span className="ml-1 text-gray-600 font-normal text-xs sm:text-sm truncate">
            {changeLabel}
          </span>
        </div>
      </div>

      <div className={`${iconBg} p-2 sm:p-3 rounded-full flex-shrink-0 ml-2`}>{icon}</div>
    </div>
  );
}

export default Stat;
