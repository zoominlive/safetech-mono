import { Box, Users } from "lucide-react";
import Stat from "./Stat";

function Stats() {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Overview</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Stat
          title="Total Open Projects"
          value="123"
          percentage="8.5%"
          subtitle="Up from last month"
          icon={<Users />}
          trend="up"
        />
        <Stat
          title="Projects Completed Last 30"
          value="87"
          percentage="1.3%"
          subtitle="Up from last month"
          icon={<Box />}
          trend="up"
        />
        <Stat
          title="Avg. Time To Complete"
          value="1D 10H"
          percentage="4.3%"
          subtitle="Down from last month"
          icon={<Users />}
          trend="down"
        />
        <Stat
          title="Projects Older Than 48hrs"
          value="12"
          percentage="1.8%"
          subtitle="Up from last week"
          icon={<Users />}
          trend="up"
        />
      </div>
    </div>
  );
}

export default Stats;
