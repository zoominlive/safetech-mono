import Stat from "./Stat";
import User from "@/components/icons/User";
import Box from "@/components/icons/Box";
import Chart from "@/components/icons/Chart";
import Timer from "@/components/icons/Timer";

interface StatsProps {
  overview: {
    totalOpenProjects: number;
    projectsCompletedLast30Days: number;
    avgTimeToComplete: number;
    projectsOlderThan48Hrs: number;
  };
}

function Stats({ overview }: StatsProps) {

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Overview</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-4 lg:gap-6">
        <Stat
          title="Total Open Projects"
          value={overview.totalOpenProjects.toString()}
          percentage="8.5%"
          subtitle="Up from last month"
          icon={<User />}
          iconBg="bg-[rgba(130,128,255,0.2)]"
          trend="up"
        />
        <Stat
          title="Projects Completed Last 30"
          value={overview.projectsCompletedLast30Days.toString()}
          percentage="1.3%"
          subtitle="Up from last month"
          icon={<Box />}
          iconBg="bg-[rgba(254,197,61,0.2)]"
          trend="up"
        />
        <Stat
          title="Avg. Time To Complete"
          value={overview.avgTimeToComplete.toString()}
          percentage="4.3%"
          subtitle="Down from last month"
          icon={<Chart />}
          iconBg="bg-[rgba(74,217,145,0.2)]"
          trend="down"
        />
        <Stat
          title="Projects Older Than 48hrs"
          value={overview.projectsOlderThan48Hrs.toString()}
          percentage="1.8%"
          subtitle="Up from last week"
          icon={<Timer />}
          iconBg="bg-[rgba(255,144,102,0.2)]"
          trend="up"
        />
      </div>
    </div>
  );
}

export default Stats;
