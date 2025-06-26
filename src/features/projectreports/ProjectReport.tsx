import { CirclePlus, CircleX, Upload, List, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/MultiSelect";
import { CardSkeleton } from "@/components/ui/skeletons/CardSkeleton";
import { toast } from "@/components/ui/use-toast";
import { reportService } from "@/services/api/reportService";
import { useEffect, useState, useRef, useCallback } from "react";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import LabImport from "@/components/LabImport";
import { Textarea } from "@/components/ui/textarea";

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

export const ProjectReport: React.FC<{ readOnly?: boolean }> = ({ readOnly = false }) => {
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

  // Auto-save related state
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const periodicSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedDataRef = useRef<string>('');

  // State for Add Area dialog
  const [isAddAreaDialogOpen, setIsAddAreaDialogOpen] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");
  const [newAreaDescription, setNewAreaDescription] = useState("");
  const [newAreaSqft, setNewAreaSqft] = useState("");
  const areaNameInputRef = useRef<HTMLInputElement>(null);

  // Add this state at the top, after other useState hooks
  const [isEditingAreaDetails, setIsEditingAreaDetails] = useState(false);

  // Add this state after other useState hooks
  const [dialogUploadedPhotos, setDialogUploadedPhotos] = useState<string[]>([]);

  // Add state for open accordion items
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>(readOnly ? ["client-info", "project-info"] : []);

  // Add after other useState hooks
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);

  const alwaysDisabledFields = [
    'clientCompanyName', 'clientAddress', 'contactName', 'contactPosition', 'contactEmail', 'contactPhone',
    'projectName', 'specificLocation', 'projectNumber', 'projectAddress', 'startDate', 'endDate', 'pmName', 'pmEmail', 'pmPhone',
    'technicianName', 'technicianEmail', 'technicianPhone', 'technicianTitle'
  ];

  // Auto-save configuration
  const AUTO_SAVE_DELAY = 2000; // 2 seconds after last change
  const PERIODIC_SAVE_INTERVAL = 30000; // 30 seconds

  // Debounced auto-save function
  const debouncedAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      if (hasUnsavedChanges && !readOnly) {
        performAutoSave();
      }
    }, AUTO_SAVE_DELAY);
  }, [hasUnsavedChanges, readOnly]);

  // Perform the actual auto-save
  const performAutoSave = async () => {
    if (!id || readOnly || !hasUnsavedChanges) return;

    try {
      setAutoSaveStatus('saving');
      const payload = {
        name: reportData.name || "",
        status: true,
        project_id: projectId,
        answers: {
          ...reportData,
          sprayedInsulationPhoto: undefined,
          sprayedFireproofingPhoto: undefined,
          mechanicalPipeInsulationStraightsPhoto: undefined,
          haslooseFillOrvermiculiteInsulationPhoto: undefined,
          areaDetails: areas
        }
      };

      // Remove undefined fields
      Object.keys(payload.answers as Record<string, any>).forEach(key => {
        if ((payload.answers as Record<string, any>)[key] === undefined) {
          delete (payload.answers as Record<string, any>)[key];
        }
      });

      const response = await reportService.updateReport(id, payload);
      
      if (response.success) {
        setAutoSaveStatus('saved');
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        lastSavedDataRef.current = JSON.stringify({ areas, reportData });
        
        // Show success toast only if it's been a while since last save
        const timeSinceLastToast = lastSaved ? Date.now() - lastSaved.getTime() : 60000;
        if (timeSinceLastToast > 60000) { // Only show toast if more than 1 minute since last save
          toast({
            title: "Auto-saved",
            description: "Your changes have been automatically saved",
          });
        }
      } else {
        throw new Error(response.message || 'Auto-save failed');
      }
    } catch (error) {
      console.error("Auto-save error:", error);
      setAutoSaveStatus('error');
      toast({
        title: "Auto-save failed",
        description: "Your changes could not be saved automatically. Please save manually.",
        variant: "destructive",
      });
    }
  };

  // Check for changes and trigger auto-save
  const checkForChanges = useCallback(() => {
    const currentData = JSON.stringify({ areas, reportData });
    const hasChanges = currentData !== lastSavedDataRef.current;
    
    if (hasChanges && !hasUnsavedChanges) {
      setHasUnsavedChanges(true);
    } else if (!hasChanges && hasUnsavedChanges) {
      setHasUnsavedChanges(false);
    }

    if (hasChanges) {
      debouncedAutoSave();
    }
  }, [areas, reportData, hasUnsavedChanges, debouncedAutoSave]);

  // Set up periodic auto-save
  useEffect(() => {
    if (!readOnly && id) {
      periodicSaveIntervalRef.current = setInterval(() => {
        if (hasUnsavedChanges) {
          performAutoSave();
        }
      }, PERIODIC_SAVE_INTERVAL);
    }

    return () => {
      if (periodicSaveIntervalRef.current) {
        clearInterval(periodicSaveIntervalRef.current);
      }
    };
  }, [readOnly, id, hasUnsavedChanges]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      if (periodicSaveIntervalRef.current) {
        clearInterval(periodicSaveIntervalRef.current);
      }
    };
  }, []);

  // Check for changes whenever areas or reportData changes
  useEffect(() => {
    if (areas.length > 0 && reportData) {
      checkForChanges();
    }
  }, [areas, reportData, checkForChanges]);

  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !readOnly) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    // Add keyboard shortcut for manual save (Ctrl+S or Cmd+S)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!readOnly && !isSaving) {
          handleSave(false);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasUnsavedChanges, readOnly, isSaving]);

  // Manual save function that can be called when auto-save fails
  const handleManualSave = async () => {
    if (readOnly || isSaving) return;
    
    try {
      setIsSaving(true);
      setAutoSaveStatus('saving');
      const payload = {
        name: reportData.name || "",
        status: true,
        project_id: projectId,
        answers: {
          ...reportData,
          sprayedInsulationPhoto: undefined,
          sprayedFireproofingPhoto: undefined,
          mechanicalPipeInsulationStraightsPhoto: undefined,
          haslooseFillOrvermiculiteInsulationPhoto: undefined,
          areaDetails: areas
        }
      };
      
      Object.keys(payload.answers as Record<string, any>).forEach(key => {
        if ((payload.answers as Record<string, any>)[key] === undefined) {
          delete (payload.answers as Record<string, any>)[key];
        }
      });
      
      const response = await reportService.updateReport(id!, payload);
      if (response.success) {
        setAutoSaveStatus('saved');
        setLastSaved(new Date());
        setHasUnsavedChanges(false);
        lastSavedDataRef.current = JSON.stringify({ areas, reportData });
        toast({
          title: "Success",
          description: "Report saved successfully",
        });
      } else {
        throw new Error(response.message || 'Save failed');
      }
    } catch (error) {
      console.error("Manual save error:", error);
      setAutoSaveStatus('error');
      toast({
        title: "Save failed",
        description: "Failed to save report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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

        // Initialize last saved data reference
        lastSavedDataRef.current = JSON.stringify({ areas: initialAreas, reportData: mergedAnswers });

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

  const handleSave = async (area:boolean) => {
    try {
      setIsSaving(true);
      const payload = {
        name: reportData.name || "",
        status: true,
        project_id: projectId,
        answers: {
          ...reportData,
          // Remove any top-level image fields
          sprayedInsulationPhoto: undefined,
          sprayedFireproofingPhoto: undefined,
          mechanicalPipeInsulationStraightsPhoto: undefined,
          haslooseFillOrvermiculiteInsulationPhoto: undefined,
          areaDetails: areas
        }
      };
      // Remove undefined fields with type guard
      Object.keys(payload.answers as Record<string, any>).forEach(key => {
        if ((payload.answers as Record<string, any>)[key] === undefined) {
          delete (payload.answers as Record<string, any>)[key];
        }
      });
      const response = await reportService.updateReport(id!, payload);
      if (response.success) {
        setHasUnsavedChanges(false);
        setLastSaved(new Date());
        lastSavedDataRef.current = JSON.stringify({ areas, reportData });
        toast({
          title: "Success",
          description: "Report updated successfully",
        });
        if (!area) navigate("/project-reports");
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
    if (hasUnsavedChanges && !readOnly) {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
        navigate("/project-reports");
      }
    } else {
      navigate("/project-reports");
    }
  };

  const isFieldEditable = () => {
    // If readOnly is true, always return false
    if (readOnly) return false;
    
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
        // Update the selected area's assessments with the returned URLs
        const updatedAreas = areas.map(area => {
          if (area.id === selectedArea?.id) {
            const currentFiles = Array.isArray(area.assessments[fieldId]) ? area.assessments[fieldId] : [];
            return {
              ...area,
              assessments: {
                ...area.assessments,
                [fieldId]: [...currentFiles, ...(response.data as { data: { urls: string[] } }).data.urls],
              }
            };
          }
          return area;
        });
        setAreas(updatedAreas);
        setSelectedArea(updatedAreas.find(area => area.id === selectedArea?.id) || null);
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
    const updatedAreas = areas.map(area => {
      if (area.id === selectedArea?.id) {
        const currentFiles = Array.isArray(area.assessments[fieldId]) ? area.assessments[fieldId] : [];
        return {
          ...area,
          assessments: {
            ...area.assessments,
            [fieldId]: currentFiles.filter(url => url !== fileUrl),
          }
        };
      }
      return area;
    });
    setAreas(updatedAreas);
    setSelectedArea(updatedAreas.find(area => area.id === selectedArea?.id) || null);
  };

  const renderField = (field: SchemaField, area: Area) => {
    const value = area.assessments[field.id];
    const isPrefilledDisabled = alwaysDisabledFields.includes(field.id);
    const isEditable = isFieldEditable() && !isPrefilledDisabled;
    
    // Get project object from reportData or state
    const projectObj = projectData || {};
    const technicianObj = projectObj?.technician || {};

    let fileUrls: string[] = [];

    switch (field.type) {
      case "text":
        return (
          <div className="space-y-2">
            <Input
              value={value || ""}
              onChange={(e) =>
                updateAreaAssessment(field.id, e.target.value)
              }
              disabled={!isEditable}
              placeholder={field.placeholder}
            />
          </div>
        );
      case "radio":
        return (
          <div className="space-y-2">
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
          </div>
        );
      case "multiselect":
        return (
          <div className="space-y-2">
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
          </div>
        );
      case "select":
        return (
          <div className="space-y-2">
            <Select
              value={value || ""}
              onValueChange={(selected) => updateAreaAssessment(field.id, selected)}
              disabled={!isEditable}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((opt: string) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      case "date":
        return (
          <div className="space-y-2">
            <Input
              type="date"
              value={value || ""}
              onChange={(e) =>
                updateAreaAssessment(field.id, e.target.value)
              }
              disabled={!isEditable}
            />
          </div>
        );
      case "number":
        return (
          <div className="space-y-2">
            <Input
              type="number"
              value={value || ""}
              onChange={(e) =>
                updateAreaAssessment(field.id, e.target.value)
              }
              disabled={!isEditable}
            />
          </div>
        );
      case "signature":
        return (
          <div className="space-y-2">
            <Input
              type="text"
              value={value || ""}
              onChange={(e) =>
                updateAreaAssessment(field.id, e.target.value)
              }
              disabled={!isEditable}
              placeholder="Technician Signature (Type to sign)"
            />
          </div>
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
                        className="absolute top-2 right-2 z-10 p-2 bg-red-500 text-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400"
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
        if (field.id === "areaDetails") {
        const repeaterItems = Array.isArray(area.assessments[field.id]) ? area.assessments[field.id] : [];
          const hasAreaDetails = !!(selectedArea?.assessments.areaDescription || selectedArea?.assessments.areaSquareFeet);
        return (
          <div className="space-y-4">
            {repeaterItems.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2 w-full">
                  {field.fields?.map((nestedField) => (
                    <div key={nestedField.id} className="space-y-2">
                      <Label>{nestedField.label}</Label>
                      {nestedField.type === "file" ? (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <Label htmlFor={`file-${nestedField.id}-${index}`} className="cursor-pointer">
                              <div className="flex items-center space-x-2 bg-sf-gray-600 text-white py-2 px-4 rounded-md">
                                <Upload size={18} />
                                <span>{uploadingFiles[`${nestedField.id}-${index}`] ? "Uploading..." : "Upload Files"}</span>
                              </div>
                            </Label>
                            <input
                              id={`file-${nestedField.id}-${index}`}
                              type="file"
                              multiple
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleRepeaterFileUpload(field.id, nestedField.id, index, e.target.files)}
                              disabled={!isFieldEditable() || uploadingFiles[`${nestedField.id}-${index}`]}
                            />
                          </div>
                          {Array.isArray(item[nestedField.id]) && item[nestedField.id].length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {item[nestedField.id].map((fileUrl: string, photoIndex: number) => (
                                <div key={photoIndex} className="relative group">
                                  <img
                                    src={fileUrl}
                                    alt={`Uploaded file ${photoIndex + 1}`}
                                    className="w-full h-32 object-cover rounded-lg"
                                  />
                                  {isFieldEditable() && (
                                    <button
                                      onClick={() => {
                                        const newItems = [...repeaterItems];
                                        newItems[index] = {
                                          ...newItems[index],
                                          [nestedField.id]: item[nestedField.id].filter((_: string, i: number) => i !== photoIndex),
                                        };
                                        updateAreaAssessment(field.id, newItems);
                                      }}
                                      className="absolute top-2 right-2 z-10 p-2 bg-red-500 text-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400"
                                    >
                                      <CircleX className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
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
                          disabled={!isFieldEditable()}
                        />
                      )}
                    </div>
                  ))}
                </div>
                </div>
              ))}
              {isEditingAreaDetails ? (
                <div className="space-y-4">
                  <Input
                    placeholder="Area Name"
                    value={selectedArea?.name || ""}
                    onChange={e => {
                      if (selectedArea) updateAreaName(selectedArea.id, e.target.value);
                    }}
                  />
                  <Input
                    placeholder="Area Description"
                    value={selectedArea?.assessments.areaDescription || ""}
                    onChange={e => {
                      updateAreaAssessment("areaDescription", e.target.value);
                    }}
                  />
                  <Input
                    placeholder="Area Square Feet"
                    type="number"
                    value={selectedArea?.assessments.areaSquareFeet || ""}
                    onChange={e => {
                      updateAreaAssessment("areaSquareFeet", e.target.value);
                    }}
                  />
                  <div className="space-y-2">
                    <Label>Area Photo</Label>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Label htmlFor={`file-areaPhoto`} className="cursor-pointer">
                          <div className="flex items-center space-x-2 bg-sf-gray-600 text-white py-2 px-4 rounded-md">
                            <Upload size={18} />
                            <span>{uploadingFiles["areaPhoto"] ? "Uploading..." : "Upload Files"}</span>
                          </div>
                        </Label>
                        <input
                          id={`file-areaPhoto`}
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload("areaPhoto", e.target.files)}
                          disabled={!isFieldEditable() || uploadingFiles["areaPhoto"]}
                        />
                      </div>
                      {Array.isArray(selectedArea?.assessments.areaPhoto) && selectedArea?.assessments.areaPhoto.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {selectedArea.assessments.areaPhoto.map((fileUrl: string, index: number) => (
                            <div key={index} className="relative group">
                              <img
                                src={fileUrl}
                                alt={`Area photo ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              {isFieldEditable() && (
                                <button
                                  onClick={() => removeFile("areaPhoto", fileUrl)}
                                  className="absolute top-2 right-2 z-10 p-2 bg-red-500 text-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400"
                                >
                                  <CircleX className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {!readOnly && (
                    <Button
                      onClick={() => {
                        handleSave(true);
                        setIsEditingAreaDetails(false);
                      }}
                    >
                      Save Details
                    </Button>
                  )}
                </div>
              ) : hasAreaDetails ? (
                <div className="space-y-4">
                  <Input
                    placeholder="Area Name"
                    value={selectedArea?.name || ""}
                    disabled
                  />
                  <Input
                    placeholder="Area Description"
                    value={selectedArea?.assessments.areaDescription || ""}
                    disabled
                  />
                  <Input
                    placeholder="Area Square Feet"
                    type="number"
                    value={selectedArea?.assessments.areaSquareFeet || ""}
                    disabled
                  />
                  {Array.isArray(selectedArea?.assessments.areaPhoto) && selectedArea?.assessments.areaPhoto.length > 0 && (
                    <div className="space-y-2">
                      <Label>Area Photo</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedArea.assessments.areaPhoto.map((fileUrl: string, index: number) => (
                          <div key={index} className="relative">
                            <img
                              src={fileUrl}
                              alt={`Area photo ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {!readOnly && (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingAreaDetails(true)}
                    >
                      Edit
                    </Button>
                  )}
                </div>
              ) : (
                !readOnly && (
                  <Button
                    onClick={() => setIsEditingAreaDetails(true)}
                  >
                    Add Area Details
                  </Button>
                )
              )}
            </div>
          );
        } else {
          // Default repeater logic for all other repeater fields
          const repeaterItems = Array.isArray(area.assessments[field.id]) ? area.assessments[field.id] : [];
          return (
            <div className="space-y-4">
              {repeaterItems.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2 w-full">
                    {field.fields?.map((nestedField) => (
                      <div key={nestedField.id} className="space-y-2">
                        <Label>{nestedField.label}</Label>
                        {nestedField.type === "file" ? (
                          <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                              <Label htmlFor={`file-${nestedField.id}-${index}`} className="cursor-pointer">
                                <div className="flex items-center space-x-2 bg-sf-gray-600 text-white py-2 px-4 rounded-md">
                                  <Upload size={18} />
                                  <span>{uploadingFiles[`${nestedField.id}-${index}`] ? "Uploading..." : "Upload Files"}</span>
                                </div>
                              </Label>
                              <input
                                id={`file-${nestedField.id}-${index}`}
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleRepeaterFileUpload(field.id, nestedField.id, index, e.target.files)}
                                disabled={!isFieldEditable() || uploadingFiles[`${nestedField.id}-${index}`]}
                              />
                            </div>
                            {Array.isArray(item[nestedField.id]) && item[nestedField.id].length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {item[nestedField.id].map((fileUrl: string, photoIndex: number) => (
                                  <div key={photoIndex} className="relative group">
                                    <img
                                      src={fileUrl}
                                      alt={`Uploaded file ${photoIndex + 1}`}
                                      className="w-full h-32 object-cover rounded-lg"
                                    />
                                    {isFieldEditable() && (
                                      <button
                                        onClick={() => {
                                          const newItems = [...repeaterItems];
                                          newItems[index] = {
                                            ...newItems[index],
                                            [nestedField.id]: item[nestedField.id].filter((_: string, i: number) => i !== photoIndex),
                                          };
                                          updateAreaAssessment(field.id, newItems);
                                        }}
                                        className="absolute top-2 right-2 z-10 p-2 bg-red-500 text-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400"
                                      >
                                        <CircleX className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
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
                            disabled={!isFieldEditable()}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  {isFieldEditable() && !readOnly && (
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
            {isFieldEditable() && !readOnly && (
              <Button onClick={() => {
                const newItems = [...repeaterItems];
                const newItem: Record<string, any> = {};
                field.fields?.forEach(nestedField => {
                    newItem[nestedField.id] = nestedField.type === "file" ? [] : '';
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
      }
      case "textarea":
        return (
          <div className="space-y-2">
            <Textarea
              value={value || ""}
              onChange={e => updateAreaAssessment(field.id, e.target.value)}
              placeholder={field.placeholder}
              disabled={!isEditable}
              className="min-h-[100px]"
            />
          </div>
        );
      case "labImport":
        return (
          <div className="space-y-2">
            <LabImport projectId={projectId} />
          </div>
        );
      default:
        return null;
    }
  };

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
    setDialogUploadedPhotos([]); // Reset uploaded photos
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
        // Only prefill client/project info fields if needed, but reset all area-specific fields
        clientCompanyName: areas[0]?.assessments.clientCompanyName || '',
        clientAddress: areas[0]?.assessments.clientAddress || '',
        contactName: areas[0]?.assessments.contactName || '',
        contactPosition: areas[0]?.assessments.contactPosition || '',
        contactEmail: areas[0]?.assessments.contactEmail || '',
        contactPhone: areas[0]?.assessments.contactPhone || '',
        projectName: areas[0]?.assessments.projectName || '',
        specificLocation: areas[0]?.assessments.specificLocation || '',
        startDate: areas[0]?.assessments.startDate || '',
        endDate: areas[0]?.assessments.endDate || '',
        projectNumber: areas[0]?.assessments.projectNumber || '',
        projectAddress: areas[0]?.assessments.projectAddress || '',
        pmName: areas[0]?.assessments.pmName || '',
        pmEmail: areas[0]?.assessments.pmEmail || '',
        pmPhone: areas[0]?.assessments.pmPhone || '',
        technicianName: areas[0]?.assessments.technicianName || '',
        technicianEmail: areas[0]?.assessments.technicianEmail || '',
        technicianPhone: areas[0]?.assessments.technicianPhone || '',
        technicianTitle: areas[0]?.assessments.technicianTitle || '',
        technicianSignature: areas[0]?.assessments.technicianSignature || '',
        // Reset area-specific fields
        areaName: newAreaName,
        areaDescription: newAreaDescription,
        areaSquareFeet: newAreaSqft,
        areaPhoto: dialogUploadedPhotos, // Include uploaded photos
        // Remove any other fields that may have been present in the previous area
      },
    };
    setAreas([...areas, newArea]);
    setSelectedArea(newArea);
    setIsAddAreaDialogOpen(false);
    setDialogUploadedPhotos([]); // Reset after adding
  };

  // Add a new function to handle dialog file uploads
  const handleDialogFileUpload = async (files: FileList | null) => {
    if (!files || !files.length || !id) return;

    try {
      setUploadingFiles(prev => ({ ...prev, ["areaPhoto"]: true }));
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      const response = await reportService.uploadReportFile(id, formData);
      if (response.success) {
        const newPhotos = (response.data as { data: { urls: string[] } }).data.urls;
        setDialogUploadedPhotos(prev => [...prev, ...newPhotos]);
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
      setUploadingFiles(prev => ({ ...prev, ["areaPhoto"]: false }));
    }
  };

  // Add a new function to handle repeater file uploads
  const handleRepeaterFileUpload = async (fieldId: string, repeaterFieldId: string, itemIndex: number, files: FileList | null) => {
    if (!files || !files.length || !id) return;

    try {
      setUploadingFiles(prev => ({ ...prev, [`${repeaterFieldId}-${itemIndex}`]: true }));
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      const response = await reportService.uploadReportFile(id, formData);
      if (response.success) {
        const newPhotos = (response.data as { data: { urls: string[] } }).data.urls;
        
        // Update the specific repeater item with the new photos
        const repeaterItems = Array.isArray(selectedArea?.assessments[fieldId]) ? selectedArea.assessments[fieldId] : [];
        const updatedItems = [...repeaterItems];
        const currentPhotos = Array.isArray(updatedItems[itemIndex]?.[repeaterFieldId]) ? updatedItems[itemIndex][repeaterFieldId] : [];
        
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          [repeaterFieldId]: [...currentPhotos, ...newPhotos],
        };
        
        updateAreaAssessment(fieldId, updatedItems);
        
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
      setUploadingFiles(prev => ({ ...prev, [`${repeaterFieldId}-${itemIndex}`]: false }));
    }
  };

  // For tab overflow
  const MAX_VISIBLE_TABS = 5;
  const visibleTabs = areas.slice(0, MAX_VISIBLE_TABS);
  const overflowTabs = areas.slice(MAX_VISIBLE_TABS);

  // Popover open state for dropdown
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Add after other useEffect hooks
  useEffect(() => {
    if (!isDrawerOpen && scrollTarget) {
      const timeout = setTimeout(() => {
        const el = document.getElementById(scrollTarget);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
        setScrollTarget(null);
      }, 250); // Wait for Drawer to fully close and scroll lock to be released
      return () => clearTimeout(timeout);
    }
  }, [isDrawerOpen, scrollTarget]);

  if (isLoading) {
    return <CardSkeleton />;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <BackButton />
          <h1 className="text-2xl font-bold">Project Report</h1>
          {/* Auto-save status indicator */}
          {!readOnly && (
            <div className="flex items-center space-x-2 text-sm">
              {autoSaveStatus === 'saving' && (
                <div className="flex items-center space-x-1 text-blue-600">
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </div>
              )}
              {autoSaveStatus === 'saved' && (
                <div className="flex items-center space-x-1 text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span>Saved</span>
                  {lastSaved && (
                    <span className="text-gray-500">
                      {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              )}
              {autoSaveStatus === 'error' && (
                <div className="flex items-center space-x-1 text-red-600">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  <span>Save failed</span>
                </div>
              )}
              {hasUnsavedChanges && autoSaveStatus === 'idle' && (
                <div className="flex items-center space-x-1 text-orange-600">
                  <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
                  <span>Unsaved changes</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <List className="h-4 w-4" />
                <span>Table of Contents</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col h-full">
              <SheetHeader>
                <SheetTitle>Table of Contents</SheetTitle>
              </SheetHeader>
              {/* Table of Contents Links */}
              <div className="mt-4 space-y-2">
                <Button variant="ghost" className="w-full justify-start" onClick={() => {
                  setScrollTarget('client-info-section');
                  setOpenAccordionItems((prev) => prev.includes("client-info") ? prev : [...prev, "client-info"]);
                  setIsDrawerOpen(false);
                }}>
                  Client Information
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => {
                  setScrollTarget('project-info-section');
                  setOpenAccordionItems((prev) => prev.includes("project-info") ? prev : [...prev, "project-info"]);
                  setIsDrawerOpen(false);
                }}>
                  Project Information
                </Button>
                <Button variant="ghost" className="w-full justify-start" onClick={() => {
                  setScrollTarget('lab-results-section');
                  setIsDrawerOpen(false);
                }}>
                  Insert Lab Results
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto mt-6 space-y-4 pr-2">
                {areas.map((area) => {
                  const areaPhotos = Array.isArray(area.assessments.areaPhoto) ? area.assessments.areaPhoto : [];
                  const latestPhoto = areaPhotos.length > 0 ? areaPhotos[areaPhotos.length - 1] : null;
                  
                  return (
                  <div key={area.id} className="flex items-center justify-between">
                    <Button
                      variant={selectedArea?.id === area.id ? "default" : "outline"}
                      className="flex-1 justify-start"
                      onClick={() => {
                        setSelectedArea(area);
                        setIsDrawerOpen(false);
                      }}
                    >
                        <div className="flex items-center space-x-3 w-full">
                          {latestPhoto && (
                            <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
                              <img
                                src={latestPhoto}
                                alt={`${area.name} thumbnail`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <span className="truncate">{area.name}</span>
                        </div>
                    </Button>
                    {areas.length > 1 && !readOnly && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2"
                        onClick={e => {
                          e.stopPropagation();
                          setAreaToDelete(area);
                        }}
                      >
                        <CircleX className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  );
                })}
              </div>
              {!readOnly && (
                <div className="pt-4 pb-2 bg-white sticky bottom-0">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={openAddAreaDialog}
                  >
                    <CirclePlus className="h-4 w-4 mr-2" />
                    Add New Area
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            {readOnly ? "Back" : "Cancel"}
          </Button>
          {!readOnly && (
            <>
              {autoSaveStatus === 'error' && (
                <Button 
                  variant="outline" 
                  onClick={handleManualSave}
                  disabled={isSaving}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  {isSaving ? "Retrying..." : "Retry Save"}
                </Button>
              )}
              <Button onClick={handleManualSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Report"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Auto-save info message */}
      {!readOnly && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <div className="text-sm text-blue-800">
              <p className="font-medium">Auto-save enabled</p>
              <p className="text-blue-600">
                Your changes are automatically saved every 30 seconds or 2 seconds after you stop typing. 
                You can also save manually using Ctrl+S (or Cmd+S on Mac).
              </p>
            </div>
          </div>
        </div>
      )}

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
          {!readOnly ? (
            <Button size="lg" onClick={openAddAreaDialog}>
              <CirclePlus className="h-5 w-5 mr-2" /> Add Area
            </Button>
          ) : (
            <div className="text-center">
              <p className="text-gray-500 mb-4">No areas found in this report.</p>
            </div>
          )}
          <Dialog open={isAddAreaDialogOpen} onOpenChange={setIsAddAreaDialogOpen}>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Add Area</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input ref={areaNameInputRef} placeholder="Area Name" value={newAreaName} onChange={e => setNewAreaName(e.target.value)} />
                <Input placeholder="Area Description" value={newAreaDescription} onChange={e => setNewAreaDescription(e.target.value)} />
                <Input placeholder="Area Square Feet" type="number" value={newAreaSqft} onChange={e => setNewAreaSqft(e.target.value)} />
                <div className="space-y-2">
                  <Label>Area Photo</Label>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Label htmlFor={`dialog-file-areaPhoto`} className="cursor-pointer">
                        <div className="flex items-center space-x-2 bg-sf-gray-600 text-white py-2 px-4 rounded-md">
                          <Upload size={18} />
                          <span>{uploadingFiles["areaPhoto"] ? "Uploading..." : "Upload Files"}</span>
                        </div>
                      </Label>
                      <input
                        id={`dialog-file-areaPhoto`}
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleDialogFileUpload(e.target.files)}
                        disabled={!isFieldEditable() || uploadingFiles["areaPhoto"]}
                      />
                    </div>
                    {dialogUploadedPhotos.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {dialogUploadedPhotos.map((fileUrl: string, index: number) => (
                          <div key={index} className="relative group">
                            <img
                              src={fileUrl}
                              alt={`Area photo ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => setDialogUploadedPhotos(prev => prev.filter((_, i) => i !== index))}
                              className="absolute top-2 right-2 z-10 p-2 bg-red-500 text-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400"
                            >
                              <CircleX className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
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
          <TabsList className="w-full flex-nowrap overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
            {visibleTabs.map((area) => (
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
                {areas.length > 1 && !readOnly && (
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
            {overflowTabs.length > 0 && (
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-2 flex items-center">
                    <ChevronDown className="h-4 w-4 mr-1" /> More
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0 w-48">
                  <div className="flex flex-col">
                    {overflowTabs.map((area) => (
                      <button
                        key={area.id}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${selectedArea?.id === area.id ? 'bg-gray-200 font-semibold' : ''}`}
                        onClick={() => {
                          setSelectedArea(area);
                          toast({ title: 'Area selected', description: `Area "${area.name}" is now active` });
                          setIsPopoverOpen(false);
                        }}
                      >
                        {area.name}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </TabsList>
          {areas.map((area) => (
            <TabsContent key={area.id} value={area.id} className="w-full">
              {/* Accordions for Client and Project Info */}
              <div className="mb-6">
                <Accordion type="multiple" value={openAccordionItems} onValueChange={setOpenAccordionItems}>
                  <AccordionItem value="client-info" className="bg-white rounded-md shadow-sm mb-4">
                    <AccordionTrigger className="pl-4" id="client-info-section">Client Information</AccordionTrigger>
                    <AccordionContent className="p-6">
                      {/* Render client info fields (read-only) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label>Company Name</Label><div className="text-gray-500">{area.assessments.clientCompanyName}</div></div>
                        <div><Label>Address</Label><div className="text-gray-500">{area.assessments.clientAddress}</div></div>
                        <div><Label>Contact Name</Label><div className="text-gray-500">{area.assessments.contactName}</div></div>
                        <div><Label>Contact Position</Label><div className="text-gray-500">{area.assessments.contactPosition}</div></div>
                        <div><Label>Contact Email</Label><div className="text-gray-500">{area.assessments.contactEmail}</div></div>
                        <div><Label>Contact Phone</Label><div className="text-gray-500">{area.assessments.contactPhone}</div></div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="project-info" className="bg-white rounded-md shadow-sm">
                    <AccordionTrigger className="pl-4" id="project-info-section">Project Information</AccordionTrigger>
                    <AccordionContent className="p-6">
                      {/* Render project info fields (read-only) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><Label>Project Name</Label><div className="text-gray-500">{area.assessments.projectName}</div></div>
                        <div><Label>Specific Location</Label><div className="text-gray-500">{area.assessments.specificLocation}</div></div>
                        <div><Label>Project Number</Label><div className="text-gray-500">{area.assessments.projectNumber}</div></div>
                        <div><Label>Project Address</Label><div className="text-gray-500">{area.assessments.projectAddress}</div></div>
                        <div><Label>Start Date</Label><div className="text-gray-500">{area.assessments.startDate}</div></div>
                        <div><Label>End Date</Label><div className="text-gray-500">{area.assessments.endDate}</div></div>
                        <div><Label>PM Name</Label><div className="text-gray-500">{area.assessments.pmName}</div></div>
                        <div><Label>PM Email</Label><div className="text-gray-500">{area.assessments.pmEmail}</div></div>
                        <div><Label>PM Phone</Label><div className="text-gray-500">{area.assessments.pmPhone}</div></div>
                        <div><Label>Technician Name</Label><div className="text-gray-500">{area.assessments.technicianName}</div></div>
                        <div><Label>Technician Email</Label><div className="text-gray-500">{area.assessments.technicianEmail}</div></div>
                        <div><Label>Technician Phone</Label><div className="text-gray-500">{area.assessments.technicianPhone}</div></div>
                        <div><Label>Technician Title</Label><div className="text-gray-500">{area.assessments.technicianTitle}</div></div>
                        <div><Label>Technician Signature</Label>
                          {typeof area.assessments.technicianSignature === 'string' && area.assessments.technicianSignature.startsWith('http') ? (
                            <img
                              src={area.assessments.technicianSignature}
                              alt="Technician Signature"
                              className="h-12 mt-1 rounded border"
                              style={{ maxWidth: '200px', objectFit: 'contain', background: '#fff' }}
                            />
                          ) : (
                            <div className="text-gray-500">No Signature uploaded</div>
                          )}
                        </div>
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

                      // If this section contains LabImport, wrap with anchor
                      const containsLabImport = section.fields.some(f => f.type === "labImport");
                      return (
                        <div key={sectionIndex} className="space-y-6 border-b pb-7" {...(containsLabImport ? { id: "lab-results-section" } : {})}>
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
                  {!readOnly && (
                    <div className="flex justify-end pt-4">
                      <Button variant="outline" onClick={openAddAreaDialog}>
                        <CirclePlus className="h-4 w-4 mr-2" /> Add Area
                      </Button>
                    </div>
                  )}
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
                    <div className="space-y-2">
                      <Label>Area Photo</Label>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <Label htmlFor={`dialog-file-areaPhoto-2`} className="cursor-pointer">
                            <div className="flex items-center space-x-2 bg-sf-gray-600 text-white py-2 px-4 rounded-md">
                              <Upload size={18} />
                              <span>{uploadingFiles["areaPhoto"] ? "Uploading..." : "Upload Files"}</span>
                            </div>
                          </Label>
                          <input
                            id={`dialog-file-areaPhoto-2`}
                            type="file"
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleDialogFileUpload(e.target.files)}
                            disabled={!isFieldEditable() || uploadingFiles["areaPhoto"]}
                          />
                        </div>
                        {dialogUploadedPhotos.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {dialogUploadedPhotos.map((fileUrl: string, index: number) => (
                              <div key={index} className="relative group">
                                <img
                                  src={fileUrl}
                                  alt={`Area photo ${index + 1}`}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                                <button
                                  onClick={() => setDialogUploadedPhotos(prev => prev.filter((_, i) => i !== index))}
                                  className="absolute top-2 right-2 z-10 p-2 bg-red-500 text-white rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-red-400"
                                >
                                  <CircleX className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
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