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

function CustomersTableOperations() {
  return (
    <div className="flex w-full h-16 gap-6">
      <SearchInput placeholder="Search here..." />
      <Select>
        <SelectTrigger className="w-[332px] py-7.5 bg-safetech-gray text-gray-600 rounded-md">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="latest">Latest</SelectItem>
          <SelectItem value="popular">Most Popular</SelectItem>
          <SelectItem value="rating">Top Rated</SelectItem>
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
