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
import { CirclePlus } from "lucide-react";
import { Link } from "react-router";

function ProjectTableOperations() {
  return (
    <>
      <div className="flex flex-col lg:flex-row items-start lg:items-center w-full gap-4 lg:gap-6 mb-4">
        <div className="w-full lg:w-auto">
          <DatePickerWithRange />
        </div>
        <div className="w-full lg:w-auto">
          <SearchInput placeholder="Type customer name..." />
        </div>
        <Select>
          <SelectTrigger className="w-full lg:w-auto py-7.5 bg-safetech-gray">
            <SelectValue placeholder="Select project status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Status</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="blueberry">Blueberry</SelectItem>
              <SelectItem value="grapes">Grapes</SelectItem>
              <SelectItem value="pineapple">Pineapple</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button className="ml-auto h-[60px] w-[200px] bg-sf-gray-600" asChild>
          <Link to="/projects/create">
            Add Project <CirclePlus />
          </Link>
        </Button>
      </div>
    </>
  );
}

export default ProjectTableOperations;
