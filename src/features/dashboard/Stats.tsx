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
          change="8.5%"
          changeLabel="Up from last month"
          icon={<Users />}
          iconBg="bg-blue-100"
        />
        <Stat
          title="Projects Completed Last 30"
          value="87"
          change="1.3%"
          changeLabel="Up from last month"
          icon={<Box />}
          iconBg="bg-yellow-200"
        />
        <Stat
          title="Avg. Time To Complete"
          value="1D 10H"
          change="4.3%"
          changeLabel="Down from last month"
          icon={<Users />}
          iconBg="bg-blue-100"
        />
        <Stat
          title="Projects Older Than 48hrs"
          value="12"
          change="1.8%"
          changeLabel="Up from last week"
          icon={<Users />}
          iconBg="bg-blue-100"
        />
      </div>
    </div>
  );
}

export default Stats;
