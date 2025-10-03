import { DatePickerWithRange } from "@/components/DatePickerWithRange";
import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store";
import { CirclePlus } from "lucide-react";
import { Link } from "react-router";
import { useState, useEffect } from "react";
import { MultiSelect } from "@/components/MultiSelect";
import { userService } from "@/services/api/userService";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ProjectTableOperationsProps {
  onSearch?: (query: string) => void;
  onFilterStatus?: (status: string) => void;
  onDateRangeChange?: (dateRange: { from: Date | undefined; to: Date | undefined }) => void;
  onFilterPMs?: (pms: string) => void;
  onFilterTechnicians?: (techs: string) => void;
}

function ProjectTableOperations({
  onSearch,
  onFilterStatus,
  onDateRangeChange,
  onFilterPMs,
  onFilterTechnicians
}: ProjectTableOperationsProps) {
  const { user } = useAuthStore();
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(["all"]);
  const [pmOptions, setPmOptions] = useState<{ value: string; label: string }[]>([]);
  const [technicianOptions, setTechnicianOptions] = useState<{ value: string; label: string }[]>([]);
  const [selectedPMs, setSelectedPMs] = useState<string[]>([]);
  const [selectedTechnicians, setSelectedTechnicians] = useState<string[]>([]);

  useEffect(() => {
    // Fetch Project Managers
    userService.getAllUsers(undefined, undefined, undefined, 100, 1, "project manager").then((res) => {
      if (res.success) {
        setPmOptions(res.data.rows.map((u: any) => ({ value: u.id, label: u.first_name + " " + u.last_name })));
      }
    });
    // Fetch Technicians
    userService.getAllUsers(undefined, undefined, undefined, 100, 1, "technician").then((res) => {
      if (res.success) {
        setTechnicianOptions(res.data.rows.map((u: any) => ({ value: u.id, label: u.first_name + " " + u.last_name })));
      }
    });
  }, []);

  const statusOptions = [
    { value: "all", label: "All" },
    { value: "new", label: "New" },
    { value: "in progress", label: "In Progress" },
    { value: "pm review", label: "PM Review" },
    { value: "complete", label: "Complete" },
    { value: "on hold", label: "On Hold" },
  ];

  const handleStatusChange = (selected: { value: string; label: string }[]) => {
    const values = selected.length ? selected.map((s) => s.value) : ["all"];
    setSelectedStatuses(values);
    if (onFilterStatus) onFilterStatus(values.length ? values.join(",") : "all");
  };
  const handlePMChange = (selected: { value: string; label: string }[]) => {
    const values = selected.map((s) => s.value);
    setSelectedPMs(values);
    if (onFilterPMs) onFilterPMs(values.join(","));
  };
  const handleTechnicianChange = (selected: { value: string; label: string }[]) => {
    const values = selected.map((s) => s.value);
    setSelectedTechnicians(values);
    if (onFilterTechnicians) onFilterTechnicians(values.join(","));
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row items-start lg:items-center w-full gap-4 lg:gap-6 mb-4">
        <div className="w-full lg:w-auto">
          <SearchInput 
            placeholder="Search Project" 
            onSearch={(value: string) => onSearch && onSearch(value)}
          />
        </div>
        <div className="w-full lg:w-auto">
          <DatePickerWithRange onDateChange={onDateRangeChange} />
        </div>
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
      <div className="w-full mb-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="filters">
            <AccordionTrigger className="text-sm font-medium">Filters</AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col md:flex-row flex-wrap gap-4 w-full">
                <div className="flex-1 min-w-[150px] md:min-w-[200px]">
                  <MultiSelect
                    options={statusOptions}
                    selected={statusOptions.filter(opt => selectedStatuses.includes(opt.value))}
                    placeholder="Select project status"
                    onChange={handleStatusChange}
                  />
                </div>
                <div className="flex-1 min-w-[150px] md:min-w-[200px]">
                  <MultiSelect
                    options={pmOptions}
                    selected={pmOptions.filter(opt => selectedPMs.includes(opt.value))}
                    placeholder="Select project managers"
                    onChange={handlePMChange}
                  />
                </div>
                <div className="flex-1 min-w-[150px] md:min-w-[200px]">
                  <MultiSelect
                    options={technicianOptions}
                    selected={technicianOptions.filter(opt => selectedTechnicians.includes(opt.value))}
                    placeholder="Select technicians"
                    onChange={handleTechnicianChange}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}

export default ProjectTableOperations;
