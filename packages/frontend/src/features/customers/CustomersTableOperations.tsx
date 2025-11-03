import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CirclePlus } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { useAuthStore } from "@/store";

interface CustomersTableOperationsProps {
  onSearch: (query: string) => void;
  onSort: (sortBy: string) => void;
}

function CustomersTableOperations({
  onSearch,
  onSort,
}: CustomersTableOperationsProps) {
  const [sortValue, setSortValue] = useState<string>("");
  const { user } = useAuthStore();
  
  const handleSortChange = (value: string) => {
    setSortValue(value);
    onSort(value);
  };

  return (
    <div className="flex flex-col md:flex-row w-full md:h-16 gap-6">
      <SearchInput
        placeholder="Search customer"
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
      {user?.role !== "Technician" && 
      <Button className="md:ml-auto py-7.5 md:w-[200px] bg-sf-gray-600" asChild>
        <Link to="/customers/add">
          Add Customer <CirclePlus />
        </Link>
      </Button>
      }
    </div>
  );
}

export default CustomersTableOperations;
