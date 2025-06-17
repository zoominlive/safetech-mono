import { useState } from "react";
import ReportsTableOperations from "@/features/reports/ReportsTableOperations";
import ProjectReportTable from "@/features/projectreports/ProjectReportTable";

const ProjectReports: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");

  return (
    <div className="space-y-4">
      <ReportsTableOperations
        onSearch={setSearchQuery}
        onSort={setSortBy}
      />
      <ProjectReportTable
        searchQuery={searchQuery}
        sortBy={sortBy}
      />
    </div>
  );
};

export default ProjectReports; 