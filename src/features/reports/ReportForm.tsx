import { CirclePlus, CircleX, Info, Pen } from "lucide-react";
import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { MultiSelect, Option } from "@/components/MultiSelect";

const moistureStatus: Record<string, string>[] = [
  {
    name: "Very High Moisture",
    value: "ms1",
  },
  {
    name: "Slight Moisture",
    value: "ms2",
  },
  {
    name: "Unknown Moisture Level",
    value: "ms3",
  },
  {
    name: "Water Standing",
    value: "ms4",
  },
  {
    name: "Moisture Level Inconclusive",
    value: "ms5",
  },
];

const fruitOptions: Option[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "blueberry", label: "Blueberry" },
  { value: "cherry", label: "Cherry" },
  { value: "grape", label: "Grape" },
  { value: "lemon", label: "Lemon" },
  { value: "lime", label: "Lime" },
  { value: "mango", label: "Mango" },
  { value: "orange", label: "Orange" },
  { value: "peach", label: "Peach" },
  { value: "pear", label: "Pear" },
  { value: "pineapple", label: "Pineapple" },
  { value: "strawberry", label: "Strawberry" },
];

const ReportForm: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <h2 className="font-semibold text-xl text-sf-black-300 me-2">
          Report Attribute Editor
        </h2>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info />
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Edit the attributes for your report questions below</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Card>
        <CardContent className="space-y-6">
          <div className="space-y-6 border-b pb-7">
            <h4 className="font-semibold text-xl">Report Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 text-lg text-sf-black-300">
              <div className="space-y-4">
                <p className="font-medium">Report Name</p>
                <p className="font-normal">Mould Assessment</p>
              </div>
              <div className="space-y-4">
                <p className="font-medium">Create Date</p>
                <p className="font-normal">Nov 1, 2024</p>
              </div>
              <div className="space-y-4">
                <p className="font-medium">Last Modified Date</p>
                <p className="font-normal">Dec 8, 2024</p>
              </div>
            </div>
          </div>
          <div className="space-y-3 border-b pb-7">
            <h4>Floor Moisture Description</h4>
            <div className="flex w-2xl space-x-2">
              <MultiSelect options={fruitOptions} />
              <Button>
                <CirclePlus />
              </Button>
            </div>
          </div>
          <div className="space-y-3 border-b pb-7">
            <h4 className="font-medium text-lg">Moisture Status</h4>
            <RadioGroup defaultValue="ms3">
              {moistureStatus.map((ms) => (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={ms.value} id={ms.value} />
                  <Label htmlFor={ms.value} className="text-lg font-normal">
                    {ms.name}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-lg text-sf-black-300">
              Wall Condition: Describe the condition of the walls in the
              inspected area
            </h4>
            <div className="flex">
              <p className="">
                The walls in the inspected area show minor wear and tear, with
                small cracks observed near the northeast corner. Paint is
                slightly peeling in a few places, but no signs of moisture
                intrusion or structural damage were detected. Overall, the walls
                are in good condition, requiring minimal repair or maintenance.
              </p>
              <div className="space-x-2 flex flex-row ps-10">
                <Button
                  variant="outline"
                  className="rounded-b-none bg-safetech-gray"
                >
                  <Pen />
                </Button>
                <Button
                  variant="outline"
                  className="rounded-b-none bg-safetech-gray"
                >
                  <CircleX />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { ReportForm };
