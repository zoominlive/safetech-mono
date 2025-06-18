import { CirclePlus, CircleX, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/MultiSelect";
import { CardSkeleton } from "@/components/ui/skeletons/CardSkeleton";
import { toast } from "@/components/ui/use-toast";
import { reportService } from "@/services/api/reportService";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import BackButton from "@/components/BackButton";
import { useAuthStore } from "@/store";
import { Input } from "@/components/ui/input";

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
}

export const ProjectReport: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuthStore();
  const userRole = user?.role;

  const [reportData, setReportData] = useState<Record<string, any>>({});
  const [schema, setSchema] = useState<SchemaSection[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});

  const alwaysDisabledFields = [
    'clientCompanyName', 'clientAddress', 'contactName', 'contactPosition', 'contactEmail', 'contactPhone',
    'projectName', 'projectNumber', 'projectAddress', 'startDate', 'endDate', 'pmName', 'pmEmail', 'pmPhone',
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

        const mergedAnswers = {
          ...answers,
          clientCompanyName: company.company_name || '',
          clientAddress: [company.address_line_1, company.address_line_2, company.city, company.province, company.postal_code].filter(Boolean).join(', '),
          contactName: [company.first_name, company.last_name].filter(Boolean).join(' '),
          contactPosition: company.position || '',
          contactEmail: company.email || '',
          contactPhone: company.phone || '',
          projectName: project.name || '',
          startDate: project.start_date ? project.start_date.split('T')[0] : '',
          endDate: project.end_date ? project.end_date.split('T')[0] : '',
          projectNumber: project.project_no || '',
          projectAddress: project.site_name || '',
          pmName: [pm.first_name, pm.last_name].filter(Boolean).join(' '),
          pmEmail: pm.email || '',
          pmPhone: pm.phone || '',
          technicianName: [technician.first_name, technician.last_name].filter(Boolean).join(' '),
          technicianEmail: technician.email || '',
          technicianPhone: technician.phone || '',
          technicianTitle: technician.role || '',
          // Defensive: ensure areaDetails is always an array of unique objects
          areaDetails: Array.isArray(answers.areaDetails)
            ? answers.areaDetails.map(item => ({ ...item }))
            : [],
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
        answers: reportData
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
    return userRole === "Technician" || userRole === "Project Manager";
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

  const renderField = (field: SchemaField) => {
    const value = reportData[field.id];
    // Always disable for prefilled fields
    const isPrefilledDisabled = alwaysDisabledFields.includes(field.id);
    const isEditable = isFieldEditable() && !isPrefilledDisabled;
    const files = field.type === "file" ? (Array.isArray(value) ? value : []) : [];

    switch (field.type) {
      case "text":
        return (
          <Input
            value={value || ""}
            onChange={(e) =>
              setReportData({
                ...reportData,
                [field.id]: e.target.value,
              })
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
              setReportData({
                ...reportData,
                [field.id]: newValue,
              })
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
              setReportData({
                ...reportData,
                [field.id]: selected,
              })
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
              setReportData({
                ...reportData,
                [field.id]: selected[0],
              })
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
              setReportData({
                ...reportData,
                [field.id]: e.target.value,
              })
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
              setReportData({
                ...reportData,
                [field.id]: e.target.value,
              })
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
              setReportData({
                ...reportData,
                [field.id]: e.target.value,
              })
            }
            disabled={!isEditable}
            placeholder="Technician Signature (Type to sign)"
          />
        );
      case "file":
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
            
            {files.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {files.map((fileUrl, index) => (
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
        const conditionValue = reportData[conditionKey || ''];
      
        if (conditionValue === expectedCondition) {
          return (
            <div className="space-y-4">
              {field.fields?.map((nestedField) => {
                let showNestedField = true;
                if (nestedField.showWhen) {
                  const [depKey, depValue] = nestedField.showWhen.split('=');
                  showNestedField = reportData[depKey] === depValue;
                }
                return showNestedField ? (
                  <div key={nestedField.id} className="space-y-2">
                    <Label>
                      {nestedField.label}
                      {nestedField.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {renderField(nestedField)}
                  </div>
                ) : null;
              })}
            </div>
          );
        }
        return null;
      }
      case "repeater": {
        const repeaterItems = Array.isArray(reportData[field.id]) ? reportData[field.id] : [];
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
                          const newItems = [...(reportData[field.id] || [])];
                          newItems[index] = {
                            ...newItems[index],
                            [nestedField.id]: e.target.value,
                          };
                          setReportData({
                            ...reportData,
                            [field.id]: newItems,
                          });
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
                      const newItems = (reportData[field.id] || []).filter((_: any, i: number) => i !== index);
                      setReportData({
                        ...reportData,
                        [field.id]: newItems,
                      });
                    }}
                  >
                    <CircleX className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {isFieldEditable() && (
              <Button onClick={() => {
                const newItems = [...(reportData[field.id] || [])];
                const newItem: Record<string, any> = {};
                field.fields?.forEach(nestedField => {
                  newItem[nestedField.id] = '';
                });
                setReportData({
                  ...reportData,
                  [field.id]: [...newItems, newItem],
                });
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

      <Card>
        <CardContent className="p-6 space-y-6">
          {schema.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-6 border-b pb-7">
              <h4 className="font-semibold text-xl">{section.title}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.fields.map((field) => {
                  const showField = field.showWhen ? reportData[field.showWhen.split('=')[0]] === field.showWhen.split('=')[1] : true;
                  return showField ? (
                    <div key={field.id} className="space-y-2">
                      <Label>
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      {renderField(field)}
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}; 