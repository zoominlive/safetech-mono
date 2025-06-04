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
    mtd: {
      totalOpenProjectsChange: any,
      projectsCompletedChange: any,
      avgTimeChange: any,
      projectsOlderThan48HrsChange: any
    }
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
          percentage={overview.mtd.totalOpenProjectsChange || '-'}
          subtitle="Up from month to date"
          icon={<User />}
          iconBg="bg-[rgba(130,128,255,0.2)]"
          trend="up"
        />
        <Stat
          title="Projects Completed"
          value={overview.projectsCompletedLast30Days.toString()}
          percentage={overview.mtd.projectsCompletedChange || '-'}
          subtitle="Up from month to date"
          icon={<Box />}
          iconBg="bg-[rgba(254,197,61,0.2)]"
          trend="up"
        />
        <Stat
          title="Avg. Time To Complete"
          value={overview.avgTimeToComplete.toString()}
          percentage={overview.mtd.avgTimeChange || '-'}
          subtitle="Down from month to date"
          icon={<Chart />}
          iconBg="bg-[rgba(74,217,145,0.2)]"
          trend="down"
        />
        <Stat
          title="Projects Older Than 48hrs"
          value={overview.projectsOlderThan48Hrs.toString()}
          percentage={overview.mtd.projectsOlderThan48HrsChange || '-'}
          subtitle="Up from month to date"
          icon={<Timer />}
          iconBg="bg-[rgba(255,144,102,0.2)]"
          trend="up"
        />
      </div>
    </div>
  );
}

export default Stats;
