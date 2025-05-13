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

interface CustomersTableOperationsProps {
  onSearch: (query: string) => void;
  onSort: (sortBy: string) => void;
}

function CustomersTableOperations({ onSearch, onSort }: CustomersTableOperationsProps) {
  const [sortValue, setSortValue] = useState<string>("");

  const handleSortChange = (value: string) => {
    setSortValue(value);
    onSort(value);
  };

  return (
    <div className="flex w-full h-16 gap-6">
      <SearchInput 
        placeholder="Search customer name, email..." 
        onSearch={onSearch}
      />
      <Select value={sortValue} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[332px] py-7.5 bg-safetech-gray text-gray-600 rounded-md">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name_asc">Name (A-Z)</SelectItem>
          <SelectItem value="name_desc">Name (Z-A)</SelectItem>
          <SelectItem value="created_asc">Oldest First</SelectItem>
          <SelectItem value="created_desc">Newest First</SelectItem>
        </SelectContent>
      </Select>
      <Button className="ml-auto h-full w-[200px] bg-sf-gray-600" asChild>
        <Link to="/customers/add">
          Add Customer <CirclePlus />
        </Link>
      </Button>
    </div>
  );
}

export default CustomersTableOperations;
