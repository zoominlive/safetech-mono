import ReportsTable from "@/features/reports/ReportsTable";
import ReportsTableOperations from "@/features/reports/ReportsTableOperations";
import { useState } from "react";

const Reports: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("");

  return (
    <div className="space-y-4">
      <ReportsTableOperations
        onSearch={setSearchQuery}
        onSort={setSortBy}
      />
      <ReportsTable
        searchQuery={searchQuery}
        sortBy={sortBy}
      />
    </div>
  );
};

export default Reports;
