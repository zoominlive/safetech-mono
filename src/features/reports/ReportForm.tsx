import { Bookmark, CirclePlus, CircleX, Info, Pen } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { CardSkeleton } from "@/components/ui/skeletons/CardSkeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { reportService } from "@/services/api/reportService";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { formatDate } from "@/lib/utils";
import BackButton from "@/components/BackButton";

const moistureStatusOptions = [
  { id: "ms1", name: "Very High Moisture" },
  { id: "ms2", name: "Slight Moisture" },
  { id: "ms3", name: "Unknown Moisture Level" },
  { id: "ms4", name: "Water Standing" },
  { id: "ms5", name: "Moisture Level Inconclusive" },
];

const moistureOptions: Option[] = [
  { value: "vhm", label: "Very High Moisture" },
  { value: "sm", label: "Slight Moisture" },
  { value: "uml", label: "Unknown Moisture Level" },
  { value: "ws", label: "Water Standing" },
  { value: "mli", label: "Moisture Level Inconclusive" },
];

interface ReportFormProps {
  onCancel?: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ onCancel }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reportData, setReportData] = useState({
    name: "",
    created_at: "",
    updated_at: "",
    moisture_status: "ms3", // Default to Unknown Moisture Level
    moisture_options: [] as Option[],
    wall_condition: "",
  });

  useEffect(() => {
    if (id) {
      fetchReportData();
    }
  }, [id]);

  const fetchReportData = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const response = await reportService.getReportById(id);

      if (response.success) {
        const answers = response.data.answers || {};

        // Map the moisture options from API response
        const selectedOptions = answers.moisture_level
          ? typeof answers.moisture_level === "string"
            ? JSON.parse(answers.moisture_level).map((level: string) => {
                return moistureOptions.find((option) => option.value === level) ||
                  { value: level, label: level };
              })
            : Array.isArray(answers.moisture_level)
            ? answers.moisture_level.map((level: string) => {
                return moistureOptions.find((option) => option.value === level) ||
                  { value: level, label: level };
              })
            : []
          : [];

        setReportData({
          name: response.data.name,
          created_at: response.data.created_at,
          updated_at: response.data.updated_at,
          moisture_status: answers.moisture_status || "ms3",
          moisture_options: selectedOptions,
          wall_condition: answers.wall_condition || "",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load report data",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      toast({
        title: "Error",
        description: "Failed to load report data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;

    try {
      setIsSaving(true);

      // Format the moisture options for API submission
      const moisture_level = JSON.stringify(
        reportData.moisture_options.map((option) => option.value)
      );

      const reportPayload = {
        name: reportData.name, // Include existing name
        status: true, // Maintain enabled status
        answers: {
          moisture_status: reportData.moisture_status,
          moisture_level: moisture_level,
          wall_condition: reportData.wall_condition,
        },
      };

      const response = await reportService.updateReport(id, reportPayload);

      if (response.success) {
        toast({
          title: "Success",
          description: "Report updated successfully",
        });
        navigate(`/reports/${id}`);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update report",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating report:", error);
      toast({
        title: "Error",
        description: "Failed to update report",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(`/reports/${id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center">
          <h2 className="font-semibold text-xl text-sf-black-300 me-2">
            Report Attribute Editor
          </h2>
          <Skeleton className="w-6 h-6 rounded-full" />
        </div>
        <CardSkeleton rows={5} columns={1} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <div className="flex items-center gap-4">
          <BackButton/>
          <h2 className="font-semibold text-xl text-sf-black-300 me-2">
            Report Attribute Editor
          </h2>
        </div>
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
        <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-6 border-b pb-7">
            <h4 className="font-semibold text-xl">Report Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 text-lg text-sf-black-300">
              <div className="space-y-4">
                <p className="font-medium">Report Name</p>
                <p className="font-normal">{reportData.name}</p>
              </div>
              <div className="space-y-4">
                <p className="font-medium">Create Date</p>
                <p className="font-normal">
                  {formatDate(reportData.created_at)}
                </p>
              </div>
              <div className="space-y-4">
                <p className="font-medium">Last Modified Date</p>
                <p className="font-normal">
                  {formatDate(reportData.updated_at)}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3 border-b pb-7">
            <h4>Floor Moisture Description</h4>
            <div className="flex w-full md:w-2xl space-x-2">
              <MultiSelect
                options={moistureOptions}
                selected={Array.isArray(reportData.moisture_options) ? reportData.moisture_options : []}
                onChange={(selected) =>
                  setReportData({
                    ...reportData,
                    moisture_options: selected,
                  })
                }
              />
              <Button className="bg-safetech-gray text-black">
                <CirclePlus />
              </Button>
            </div>
          </div>
          <div className="space-y-3 border-b pb-7">
            <h4 className="font-medium text-lg">Moisture Status</h4>
            <RadioGroup
              value={reportData.moisture_status}
              onValueChange={(value) =>
                setReportData({
                  ...reportData,
                  moisture_status: value,
                })
              }
            >
              {moistureStatusOptions.map((ms) => (
                <div key={ms.id} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={ms.id}
                    id={ms.id}
                    className="border-sf-black-300"
                  />
                  <Label htmlFor={ms.id} className="text-lg font-normal">
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
              <Textarea
                value={reportData.wall_condition}
                onChange={(e) =>
                  setReportData({
                    ...reportData,
                    wall_condition: e.target.value,
                  })
                }
                placeholder="Enter wall condition details"
                className="min-h-[150px] flex-grow"
              />
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
                  onClick={() =>
                    setReportData({
                      ...reportData,
                      wall_condition: "",
                    })
                  }
                >
                  <CircleX />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-end bg-white py-5 pe-8 space-x-6 absolute bottom-0 w-full left-0">
        <Button
          className="bg-sf-gray-600 text-white w-[150px] h-[48px]"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save"} <Bookmark />
        </Button>
        <Button
          className="bg-sf-secondary text-black w-[150px] h-[48px]"
          onClick={handleCancel}
          disabled={isSaving}
        >
          Cancel <CircleX />
        </Button>
      </div>
    </div>
  );
};
