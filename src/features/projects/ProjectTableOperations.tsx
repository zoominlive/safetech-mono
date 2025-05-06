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
      <div className="flex items-center h-[60px] w-full gap-6">
        <DatePickerWithRange />
        <SearchInput placeholder="Type customer name..." />
        <Select>
          <SelectTrigger className="h-[60px] w-[332px]  bg-safetech-gray">
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
        <Button className="ml-auto h-full w-[200px] bg-sf-gray-600">
          Add Project <CirclePlus />
        </Button>
      </div>
    </>
  );
}

export default ProjectTableOperations;
