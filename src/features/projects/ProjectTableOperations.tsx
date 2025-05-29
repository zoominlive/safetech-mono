import { DatePickerWithRange } from "@/components/DatePickerWithRange";
import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store";
import { CirclePlus } from "lucide-react";
import { Link } from "react-router";

interface ProjectTableOperationsProps {
  onSearch?: (query: string) => void;
  onFilterStatus?: (status: string) => void;
  onDateRangeChange?: (dateRange: { from: Date | undefined; to: Date | undefined }) => void;
}

function ProjectTableOperations({
  onSearch,
  onFilterStatus,
  onDateRangeChange
}: ProjectTableOperationsProps) {
  
  const { user } = useAuthStore();
  
  return (
    <>
      <div className="flex flex-col lg:flex-row items-start lg:items-center w-full gap-4 lg:gap-6 mb-4">
        <div className="w-full lg:w-auto">
          <DatePickerWithRange onDateChange={onDateRangeChange} />
        </div>
        <div className="w-full lg:w-auto">
          <SearchInput 
            placeholder="Type customer name..." 
            onSearch={(value: string) => onSearch && onSearch(value)}
          />
        </div>
        <Select onValueChange={(value) => onFilterStatus && onFilterStatus(value)}>
          <SelectTrigger className="w-full md:w-[332px] py-7.5 bg-safetech-gray">
            <SelectValue placeholder="Select project status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="on hold">On Hold</SelectItem>
              <SelectItem value="all">All Statuses</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        {user?.role !== "Technician" && 
        <Button
          className="lg:ml-auto h-[60px] w-[200px] bg-sf-gray-600 hover:bg-sf-gray-600"
          asChild
        >
          <Link to="/projects/create">
            Add Project <CirclePlus />
          </Link>
        </Button>
        }
      </div>
    </>
  );
}

export default ProjectTableOperations;
