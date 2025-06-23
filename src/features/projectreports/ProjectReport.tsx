import { CirclePlus, CircleX, Upload, List } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/MultiSelect";
import { CardSkeleton } from "@/components/ui/skeletons/CardSkeleton";
import { toast } from "@/components/ui/use-toast";
import { reportService } from "@/services/api/reportService";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import BackButton from "@/components/BackButton";
import { useAuthStore } from "@/store";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface SchemaField {
  type: string;
  label: string;
  name: string;
  id: string;
  required?: boolean;
  options?: any[];
  validation?: {
    type: string;
    message: string;
  };
  placeholder?: string;
  showWhen?: string;
  condition?: string;
  fields?: SchemaField[];
}

interface SchemaSection {
  title: string;
  fields: SchemaField[];
  showWhen?: string;
}

interface Area {
  id: string;
  name: string;
  assessments: Record<string, any>;
}

export const ProjectReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuthStore();
  const userRole = user?.role;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [areas, setAreas] = useState<Area[]>([]);

  const [reportData, setReportData] = useState<Record<string, any>>({});
  const [schema, setSchema] = useState<SchemaSection[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [projectId, setProjectId] = useState<string>("");
  const [projectStatus, setProjectStatus] = useState<string>("");
  const [projectData, setProjectData] = useState<any>();
  const [areaToDelete, setAreaToDelete] = useState<Area | null>(null);

  // State for Add Area dialog
  const [isAddAreaDialogOpen, setIsAddAreaDialogOpen] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");
  const [newAreaDescription, setNewAreaDescription] = useState("");
  const [newAreaSqft, setNewAreaSqft] = useState("");
  const areaNameInputRef = useRef<HTMLInputElement>(null);

  const alwaysDisabledFields = [
    'clientCompanyName', 'clientAddress', 'contactName', 'contactPosition', 'contactEmail', 'contactPhone',
    'projectName', 'specificLocation', 'projectNumber', 'projectAddress', 'startDate', 'endDate', 'pmName', 'pmEmail', 'pmPhone',
    'technicianName', 'technicianEmail', 'technicianPhone', 'technicianTitle'
  ];

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
        const project = response.data.project || {};
        const company = project.company || {};
        const pm = project.pm || {};
        const technician = project.technician || {};
        setProjectId(project?.id ?? "");
        setProjectStatus(project?.status ?? "");
        setProjectData(response?.data?.project ?? {});

        // Initialize areas from areaDetails or create a default area
        const areaDetails = Array.isArray(answers?.areaDetails) ? answers.areaDetails : [];
        const initialAreas = areaDetails.length > 0 
          ? areaDetails.map((area: any, index: number) => ({
              id: area.id || `area-${index}`,
              name: area.name || `Area ${index + 1}`,
              assessments: {
                ...area.assessments,
                // Prefill common fields for each area
                clientCompanyName: company.company_name || '',
                clientAddress: [company.address_line_1, company.address_line_2, company.city, company.province, company.postal_code].filter(Boolean).join(', '),
                contactName: [company.first_name, company.last_name].filter(Boolean).join(' '),
                contactPosition: company.position || '',
                contactEmail: company.email || '',
                contactPhone: company.phone || '',
                projectName: project.name || '',
                specificLocation: project.specific_location || '',
                startDate: project.start_date ? project.start_date.split('T')[0] : '',
                endDate: project.end_date ? project.end_date.split('T')[0] : '',
                projectNumber: project.project_no || '',
                projectAddress: [company.address_line_1, company.address_line_2, company.city, company.province, company.postal_code].filter(Boolean).join(', ') || '',
                pmName: [pm.first_name, pm.last_name].filter(Boolean).join(' '),
                pmEmail: pm.email || '',
                pmPhone: pm.phone || '',
                technicianName: [technician.first_name, technician.last_name].filter(Boolean).join(' '),
                technicianEmail: technician.email || '',
                technicianPhone: technician.phone || '',
                technicianTitle: technician.role || '',
                technicianSignature: technician.technician_signature || '',
              }
            }))
          : [{
              id: 'area-1',
              name: 'Area 1',
              assessments: {
                clientCompanyName: company.company_name || '',
                clientAddress: [company.address_line_1, company.address_line_2, company.city, company.province, company.postal_code].filter(Boolean).join(', '),
                contactName: [company.first_name, company.last_name].filter(Boolean).join(' '),
                contactPosition: company.position || '',
                contactEmail: company.email || '',
                contactPhone: company.phone || '',
                projectName: project.name || '',
                specificLocation: project.specific_location || '',
                startDate: project.start_date ? project.start_date.split('T')[0] : '',
                endDate: project.end_date ? project.end_date.split('T')[0] : '',
                projectNumber: project.project_no || '',
                projectAddress: [company.address_line_1, company.address_line_2, company.city, company.province, company.postal_code].filter(Boolean).join(', ') || '',
                pmName: [pm.first_name, pm.last_name].filter(Boolean).join(' '),
                pmEmail: pm.email || '',
                pmPhone: pm.phone || '',
                technicianName: [technician.first_name, technician.last_name].filter(Boolean).join(' '),
                technicianEmail: technician.email || '',
                technicianPhone: technician.phone || '',
                technicianTitle: technician.role || '',
                technicianSignature: technician.technician_signature || '',
              }
            }];

        setAreas(initialAreas);
        setSelectedArea(initialAreas[0]);

        const mergedAnswers = {
          ...answers,
          areaDetails: initialAreas
        };
        setReportData(mergedAnswers);

        if (response.data.template?.schema) {
          try {
            const parsedSchema = typeof response.data.template.schema === 'string' 
              ? JSON.parse(response.data.template.schema)
              : response.data.template.schema;
            setSchema(parsedSchema.sections);
          } catch (error) {
            console.error("Error parsing schema:", error);
            toast({
              title: "Error",
              description: "Failed to parse report schema",
              variant: "destructive",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch report data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const payload = {
        name: reportData.name || "",
        status: true,
        project_id: projectId,
        answers: {
          ...reportData,
          areaDetails: areas
        }
      };

      const response = await reportService.updateReport(id!, payload);

      if (response.success) {
        toast({
          title: "Success",
          description: "Report updated successfully",
        });
        navigate("/project-reports");
      }
    } catch (error) {
      console.error("Error saving report:", error);
      toast({
        title: "Error",
        description: "Failed to save report",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/project-reports");
  };

  const isFieldEditable = () => {
    if (!userRole) return false;
    if (projectStatus === "Complete") {
      return userRole === "Project Manager";
    }
    return userRole === "Technician" || userRole === "Project Manager" || userRole === "Admin";
  };

  const handleFileUpload = async (fieldId: string, files: FileList | null) => {
    if (!files || !files.length || !id) return;

    try {
      setUploadingFiles(prev => ({ ...prev, [fieldId]: true }));
      
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      const response = await reportService.uploadReportFile(id, formData);
      
      if (response.success) {
        // Update the report data with the returned URLs
        const currentFiles = Array.isArray(reportData[fieldId]) ? reportData[fieldId] : [];
        setReportData({
          ...reportData,
          [fieldId]: [...currentFiles, ...(response.data as { data: { urls: string[] } }).data.urls],
        });
        
        toast({
          title: "Success",
          description: "Files uploaded successfully",
        });
      } else {
        toast({
          title: "Upload failed",
          description: response.message || "Failed to upload files",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to upload files:", error);
      toast({
        title: "Upload failed",
        description: "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(prev => ({ ...prev, [fieldId]: false }));
    }
  };

  const removeFile = (fieldId: string, fileUrl: string) => {
    const currentFiles = Array.isArray(reportData[fieldId]) ? reportData[fieldId] : [];
    setReportData({
      ...reportData,
      [fieldId]: currentFiles.filter(url => url !== fileUrl),
    });
  };

  const renderField = (field: SchemaField, area: Area) => {
    let value = area.assessments[field.id];
    if (typeof value === "undefined" && reportData[field.id]) {
      value = reportData[field.id];
    }
    const isPrefilledDisabled = alwaysDisabledFields.includes(field.id);
    const isEditable = isFieldEditable() && !isPrefilledDisabled;
    
    // Get project object from reportData or state
    const projectObj = projectData || {};
    const technicianObj = projectObj?.technician || {};

    let fileUrls: string[] = [];

    switch (field.type) {
      case "text":
        return (
          <Input
            value={value || ""}
            onChange={(e) =>
              updateAreaAssessment(field.id, e.target.value)
            }
            disabled={!isEditable}
            placeholder={field.placeholder}
          />
        );
      case "radio":
        return (
          <RadioGroup
            value={value}
            onValueChange={(newValue) =>
              updateAreaAssessment(field.id, newValue)
            }
            disabled={!isEditable}
            className="flex space-x-4"
          >
            {field.options?.map((option: string) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      case "multiselect":
        return (
          <MultiSelect
            options={field.options?.map((opt: string) => ({ value: opt, label: opt })) || []}
            selected={Array.isArray(value) ? value : []}
            onChange={(selected) =>
              updateAreaAssessment(field.id, selected)
            }
            className="w-full"
            placeholder={field.placeholder || `Select ${field.label}`}
            disabled={!isEditable}
          />
        );
      case "select":
        return (
          <MultiSelect
            options={field.options?.map((opt: string) => ({ value: opt, label: opt })) || []}
            selected={value ? [value] : []}
            onChange={(selected) =>
              updateAreaAssessment(field.id, selected[0])
            }
            className="w-full"
            placeholder={field.placeholder || `Select ${field.label}`}
            disabled={!isEditable}
          />
        );
      case "date":
        return (
          <Input
            type="date"
            value={value || ""}
            onChange={(e) =>
              updateAreaAssessment(field.id, e.target.value)
            }
            disabled={!isEditable}
          />
        );
      case "number":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) =>
              updateAreaAssessment(field.id, e.target.value)
            }
            disabled={!isEditable}
          />
        );
      case "signature":
        return (
          <Input
            type="text"
            value={value || ""}
            onChange={(e) =>
              updateAreaAssessment(field.id, e.target.value)
            }
            disabled={!isEditable}
            placeholder="Technician Signature (Type to sign)"
          />
        );
      case "file":
        // For technicianSignature, show the technician signature from project if not present in value
        if (Array.isArray(value)) {
          fileUrls = value;
        } else if (typeof value === "string" && value.startsWith("http")) {
          fileUrls = [value];
        } else if (
          field.id === "technicianSignature" &&
          typeof technicianObj.technician_signature === "string" &&
          technicianObj.technician_signature.startsWith("http")
        ) {
          fileUrls = [technicianObj.technician_signature];
        }
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Label htmlFor={`file-${field.id}`} className="cursor-pointer">
                <div className="flex items-center space-x-2 bg-sf-gray-600 text-white py-2 px-4 rounded-md">
                  <Upload size={18} />
                  <span>{uploadingFiles[field.id] ? "Uploading..." : "Upload Files"}</span>
                </div>
              </Label>
              <input
                id={`file-${field.id}`}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(field.id, e.target.files)}
                disabled={!isEditable || uploadingFiles[field.id]}
              />
            </div>
            {fileUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {fileUrls.map((fileUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={fileUrl}
                      alt={`Uploaded file ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    {isEditable && (
                      <button
                        onClick={() => removeFile(field.id, fileUrl)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <CircleX className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case "conditional": {
        const conditionKey = field.showWhen?.split('=')[0];
        const expectedCondition = field.showWhen?.split('=')[1];
        const conditionValue = area.assessments[conditionKey || ''];
      
        if (conditionValue === expectedCondition) {
          return (
            <div className="space-y-4">
              {field.fields?.map((nestedField) => {
                let showNestedField = true;
                if (nestedField.showWhen) {
                  const [depKey, depValue] = nestedField.showWhen.split('=');
                  showNestedField = area.assessments[depKey] === depValue;
                }
                return showNestedField ? (
                  <div key={nestedField.id} className="space-y-2">
                    <Label>
                      {nestedField.label}
                      {nestedField.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {renderField(nestedField, area)}
                  </div>
                ) : null;
              })}
            </div>
          );
        }
        return null;
      }
      case "repeater": {
        const repeaterItems = Array.isArray(area.assessments[field.id]) ? area.assessments[field.id] : [];
        return (
          <div className="space-y-4">
            {repeaterItems.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2 w-full">
                  {field.fields?.map((nestedField) => (
                    <div key={nestedField.id}>
                      <Label>{nestedField.label}</Label>
                      <Input
                        value={item[nestedField.id] || ""}
                        onChange={(e) => {
                          const newItems = [...repeaterItems];
                          newItems[index] = {
                            ...newItems[index],
                            [nestedField.id]: e.target.value,
                          };
                          updateAreaAssessment(field.id, newItems);
                        }}
                        disabled={!isEditable}
                      />
                    </div>
                  ))}
                </div>
                {isFieldEditable() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newItems = repeaterItems.filter((_: any, i: number) => i !== index);
                      updateAreaAssessment(field.id, newItems);
                    }}
                  >
                    <CircleX className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {isFieldEditable() && (
              <Button onClick={() => {
                const newItems = [...repeaterItems];
                const newItem: Record<string, any> = {};
                field.fields?.forEach(nestedField => {
                  newItem[nestedField.id] = '';
                });
                updateAreaAssessment(field.id, [...newItems, newItem]);
              }}>
                <CirclePlus className="h-4 w-4 mr-2" />
                Add {field.label}
              </Button>
            )}
          </div>
        );
      }
      default:
        return null;
    }
  };

  // const addNewArea = () => {
  //   const newArea: Area = {
  //     id: `area-${areas.length + 1}`,
  //     name: `Area ${areas.length + 1}`,
  //     assessments: {
  //       // Copy common fields from the first area
  //       ...areas[0].assessments,
  //       // Clear any area-specific fields
  //       ...Object.fromEntries(
  //         Object.entries(areas[0].assessments)
  //           .filter(([key]) => !alwaysDisabledFields.includes(key))
  //           .map(([key]) => [key, ''])
  //       )
  //     }
  //   };
  //   setAreas([...areas, newArea]);
  //   setSelectedArea(newArea);
  // };

  const updateAreaAssessment = (fieldId: string, value: any) => {
    if (!selectedArea) return;

    const updatedAreas = areas.map(area => {
      if (area.id === selectedArea.id) {
        return {
          ...area,
          assessments: {
            ...area.assessments,
            [fieldId]: value
          }
        };
      }
      return area;
    });

    setAreas(updatedAreas);
    setSelectedArea(updatedAreas.find(area => area.id === selectedArea.id) || null);
  };

  const removeArea = (areaId: string) => {
    if (areas.length <= 1) {
      toast({
        title: "Error",
        description: "Cannot remove the last area",
        variant: "destructive",
      });
      return;
    }

    const updatedAreas = areas.filter(area => area.id !== areaId);
    setAreas(updatedAreas);
    
    // If the removed area was selected, select the first remaining area
    if (selectedArea?.id === areaId) {
      setSelectedArea(updatedAreas[0]);
    }

    // Reset the area to delete
    setAreaToDelete(null);
  };

  // Helper to update area name inline
  const updateAreaName = (areaId: string, newName: string) => {
    const updatedAreas = areas.map(area =>
      area.id === areaId ? { ...area, name: newName } : area
    );
    setAreas(updatedAreas);
    if (selectedArea?.id === areaId) {
      setSelectedArea({ ...selectedArea, name: newName });
    }
  };

  // Helper to open Add Area dialog and reset fields
  const openAddAreaDialog = () => {
    setNewAreaName("");
    setNewAreaDescription("");
    setNewAreaSqft("");
    setIsAddAreaDialogOpen(true);
    setTimeout(() => areaNameInputRef.current?.focus(), 100);
  };

  // Helper to add area from dialog
  const handleAddAreaFromDialog = () => {
    if (!newAreaName.trim()) return;
    const newArea = {
      id: `area-${areas.length + 1}-${Date.now()}`,
      name: newAreaName,
      assessments: {
        ...areas[0]?.assessments,
        areaName: newAreaName,
        areaDescription: newAreaDescription,
        areaSquareFeet: newAreaSqft,
      },
    };
    setAreas([...areas, newArea]);
    setSelectedArea(newArea);
    setIsAddAreaDialogOpen(false);
  };

  if (isLoading) {
    return <CardSkeleton />;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <BackButton />
          <h1 className="text-2xl font-bold">Project Report</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <List className="h-4 w-4" />
                <span>Areas</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Areas</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {areas.map((area) => (
                  <div key={area.id} className="flex items-center justify-between">
                    <Button
                      variant={selectedArea?.id === area.id ? "default" : "outline"}
                      className="flex-1 justify-start"
                      onClick={() => {
                        setSelectedArea(area);
                        setIsDrawerOpen(false);
                      }}
                    >
                      {area.name}
                    </Button>
                    {areas.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2"
                        onClick={() => setAreaToDelete(area)}
                      >
                        <CircleX className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={openAddAreaDialog}
                >
                  <CirclePlus className="h-4 w-4 mr-2" />
                  Add New Area
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Report"}
          </Button>
        </div>
      </div>

      <AlertDialog open={!!areaToDelete} onOpenChange={(open) => !open && setAreaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Area</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {areaToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => areaToDelete && removeArea(areaToDelete.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* If no areas, show Add Area button and dialog */}
      {areas.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Button size="lg" onClick={openAddAreaDialog}>
            <CirclePlus className="h-5 w-5 mr-2" /> Add Area
          </Button>
          <Dialog open={isAddAreaDialogOpen} onOpenChange={setIsAddAreaDialogOpen}>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Add Area</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input ref={areaNameInputRef} placeholder="Area Name" value={newAreaName} onChange={e => setNewAreaName(e.target.value)} />
                <Input placeholder="Area Description" value={newAreaDescription} onChange={e => setNewAreaDescription(e.target.value)} />
                <Input placeholder="Area Square Feet" type="number" value={newAreaSqft} onChange={e => setNewAreaSqft(e.target.value)} />
              </div>
              <DialogFooter>
                <Button onClick={handleAddAreaFromDialog} disabled={!newAreaName.trim()}>Add Area</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <Tabs
          value={selectedArea?.id}
          onValueChange={(areaId) => {
            const found = areas.find((a) => a.id === areaId);
            if (found) setSelectedArea(found);
          }}
          className="w-full"
        >
          <TabsList className="overflow-x-auto flex-nowrap w-full scrollbar-thin scrollbar-thumb-gray-300">
            {areas.map((area) => (
              <TabsTrigger
                key={area.id}
                value={area.id}
                className="relative max-w-xs min-w-[120px] px-4"
              >
                <input
                  className="bg-transparent border-none outline-none font-semibold w-full text-center"
                  value={area.name}
                  onChange={e => updateAreaName(area.id, e.target.value)}
                  onClick={e => e.stopPropagation()}
                  onFocus={e => e.stopPropagation()}
                  disabled={!isFieldEditable()}
                  style={{ pointerEvents: isFieldEditable() ? 'auto' : 'none' }}
                />
                {areas.length > 1 && (
                  <button
                    type="button"
                    className="absolute top-1 right-1 text-gray-400 hover:text-red-500"
                    onClick={e => {
                      e.stopPropagation();
                      setAreaToDelete(area);
                    }}
                    tabIndex={-1}
                  >
                    <CircleX className="h-4 w-4" />
                  </button>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          {areas.map((area) => (
            <TabsContent key={area.id} value={area.id} className="w-full">
              {/* Accordions for Client and Project Info */}
              <div className="mb-6">
                <Accordion type="multiple" defaultValue={[]}>
                  <AccordionItem value="client-info">
                    <AccordionTrigger>Client Information</AccordionTrigger>
                    <AccordionContent className="bg-white rounded-md shadow-sm">
                      {/* Render client info fields (read-only) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label>Company Name</Label><div>{area.assessments.clientCompanyName}</div></div>
                        <div><Label>Address</Label><div>{area.assessments.clientAddress}</div></div>
                        <div><Label>Contact Name</Label><div>{area.assessments.contactName}</div></div>
                        <div><Label>Contact Position</Label><div>{area.assessments.contactPosition}</div></div>
                        <div><Label>Contact Email</Label><div>{area.assessments.contactEmail}</div></div>
                        <div><Label>Contact Phone</Label><div>{area.assessments.contactPhone}</div></div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="project-info">
                    <AccordionTrigger>Project Information</AccordionTrigger>
                    <AccordionContent className="bg-white rounded-md shadow-sm">
                      {/* Render project info fields (read-only) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label>Project Name</Label><div>{area.assessments.projectName}</div></div>
                        <div><Label>Specific Location</Label><div>{area.assessments.specificLocation}</div></div>
                        <div><Label>Project Number</Label><div>{area.assessments.projectNumber}</div></div>
                        <div><Label>Project Address</Label><div>{area.assessments.projectAddress}</div></div>
                        <div><Label>Start Date</Label><div>{area.assessments.startDate}</div></div>
                        <div><Label>End Date</Label><div>{area.assessments.endDate}</div></div>
                        <div><Label>PM Name</Label><div>{area.assessments.pmName}</div></div>
                        <div><Label>PM Email</Label><div>{area.assessments.pmEmail}</div></div>
                        <div><Label>PM Phone</Label><div>{area.assessments.pmPhone}</div></div>
                        <div><Label>Technician Name</Label><div>{area.assessments.technicianName}</div></div>
                        <div><Label>Technician Email</Label><div>{area.assessments.technicianEmail}</div></div>
                        <div><Label>Technician Phone</Label><div>{area.assessments.technicianPhone}</div></div>
                        <div><Label>Technician Title</Label><div>{area.assessments.technicianTitle}</div></div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
              {/* Area-specific questions */}
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-6">
                    {schema.map((section, sectionIndex) => {
                      // Check if section has showWhen and if it should be shown
                      let showSection = true;
                      if (section.showWhen) {
                        const [depKey, depValue] = section.showWhen.split('=');
                        showSection = area.assessments[depKey] === depValue;
                      }
                      if (!showSection) return null;

                      // Hide client/project info fields from area form
                      if (["Client Information", "Project Information"].includes(section.title)) return null;

                      return (
                        <div key={sectionIndex} className="space-y-6 border-b pb-7">
                          <h4 className="font-semibold text-xl">{section.title}</h4>
                          <div className="space-y-4">
                            {section.fields.map((field, fieldIndex) => {
                              const showField = field.showWhen 
                                ? area.assessments[field.showWhen.split('=')[0]] === field.showWhen.split('=')[1] 
                                : true;
                              return showField ? (
                                <div 
                                  key={field.id} 
                                  className={`p-4 rounded-lg ${
                                    fieldIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                  }`}
                                >
                                  <div className="space-y-2">
                                    <Label className="flex items-start space-x-2">
                                      <span className="text-gray-500 font-medium min-w-[24px]">
                                        {`${sectionIndex + 1}.${fieldIndex + 1}`}
                                      </span>
                                      <span>
                                        {field.label}
                                        {field.required && <span className="text-red-500 ml-1">*</span>}
                                      </span>
                                    </Label>
                                    <div className="pl-8">
                                      {renderField(field, area)}
                                    </div>
                                  </div>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Add Area button at the bottom */}
                  <div className="flex justify-end pt-4">
                    <Button variant="outline" onClick={openAddAreaDialog}>
                      <CirclePlus className="h-4 w-4 mr-2" /> Add Area
                    </Button>
                  </div>
                </CardContent>
              </Card>
              {/* Add Area Dialog */}
              <Dialog open={isAddAreaDialogOpen} onOpenChange={setIsAddAreaDialogOpen}>
                <DialogContent className="bg-white">
                  <DialogHeader>
                    <DialogTitle>Add Area</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input ref={areaNameInputRef} placeholder="Area Name" value={newAreaName} onChange={e => setNewAreaName(e.target.value)} />
                    <Input placeholder="Area Description" value={newAreaDescription} onChange={e => setNewAreaDescription(e.target.value)} />
                    <Input placeholder="Area Square Feet" type="number" value={newAreaSqft} onChange={e => setNewAreaSqft(e.target.value)} />
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddAreaFromDialog} disabled={!newAreaName.trim()}>Add Area</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}; 