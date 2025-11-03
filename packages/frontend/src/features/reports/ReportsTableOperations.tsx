import { SearchInput } from "@/components/SearchInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface ReportsTableOperationsProps {
  onSearch: (query: string) => void;
  onSort: (sortBy: string) => void;
}

function ReportsTableOperations({
  onSearch,
  onSort,
}: ReportsTableOperationsProps) {
  const [sortValue, setSortValue] = useState<string>("");

  const handleSortChange = (value: string) => {
    setSortValue(value);
    onSort(value);
  };

  return (
    <div className="flex flex-col md:flex-row w-full md:h-16 gap-6">
      <SearchInput
        placeholder="Search report name..."
        onSearch={onSearch}
      />
      <Select value={sortValue} onValueChange={handleSortChange}>
        <SelectTrigger className="w-full md:w-[332px] py-7.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-md">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name_asc">Name (A-Z)</SelectItem>
          <SelectItem value="name_desc">Name (Z-A)</SelectItem>
          <SelectItem value="created_asc">Oldest First</SelectItem>
          <SelectItem value="created_desc">Newest First</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default ReportsTableOperations;
