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

function ProjectTableOperations() {
  return (
    <>
      <div className="flex flex-col lg:flex-row items-start lg:items-center w-full gap-4 lg:gap-6 mb-4 lg:mb-0">
        <div className="w-full lg:w-auto">
          <DatePickerWithRange />
        </div>
        <div className="w-full lg:w-auto">
          <SearchInput placeholder="Type customer name..." />
        </div>
        <Select>
          <SelectTrigger className="h-[60px] w-full lg:w-[332px] bg-safetech-gray">
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
        <Button className="mt-4 lg:mt-0 lg:ml-auto h-[60px] w-full lg:w-[200px] bg-sf-gray-600">
          Add Project <CirclePlus className="ml-1" />
        </Button>
      </div>
    </>
  );
}

export default ProjectTableOperations;
