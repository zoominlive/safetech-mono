import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { CirclePlus, CircleX, Upload, Info, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

interface AsbestosMaterial {
  id: string;
  materialType: string;
  customMaterialName: string;
  location: string;
  description: string;
  photos: string[];
  squareFootage: string;
  sampleCollected: 'Yes' | 'No';
  suspectedAcm: 'Yes' | 'No';
  isCustomMaterial: boolean;
}

interface AsbestosAssessmentFormProps {
  value: AsbestosMaterial[];
  onChange: (materials: AsbestosMaterial[]) => void;
  disabled?: boolean;
  projectId?: string;
  reportId?: string;
  onFileUpload?: (files: FileList) => Promise<string[]>;
  existingMaterials?: string[]; // For tracking usage across areas
  materialUsageStats?: Record<string, { count: number; samplesCollected: number }>;
}

const STANDARD_MATERIALS = [
  "Sprayed Fireproofing",
  "Blown Insulation",
  "Loose Fill / Vermiculite Insulation",
  "Mechanical Pipe Insulation – Straights",
  "Mechanical Pipe Insulation – Fittings",
  "HVAC Duct Insulation",
  "Breeching / Exhaust Insulation",
  "Tank Insulation",
  "Boiler Insulation",
  "Other Mechanical Equipment Insulation",
  "Sprayed Texture / Stucco Finishes",
  "Plaster Finishes",
  "Drywall Joint Compound",
  "Lay-in Acoustic Ceiling Tiles",
  "Glued-on Acoustic Ceiling Tiles",
  "Cement Ceiling Panels",
  "Vinyl Floor Tiles",
  "Vinyl Sheet Flooring",
  "Mastic (Flooring)",
  "Asbestos Cement Piping",
  "Asbestos Cement Roofing, Siding, Wallboard",
  "Other Cement Products (Asbestos Cement)",
  "Exterior Building Caulking",
  "Exterior Building Shingles",
  "Exterior Building Roof Membrane",
  "Miscellaneous Mastic",
];

export const AsbestosAssessmentForm: React.FC<AsbestosAssessmentFormProps> = ({
  value = [],
  onChange,
  disabled = false,
  onFileUpload,
  existingMaterials = [],
  materialUsageStats = {},
}) => {
  const [materials, setMaterials] = useState<AsbestosMaterial[]>(value);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [customMaterials, setCustomMaterials] = useState<string[]>(existingMaterials);
  const [expandedMaterials, setExpandedMaterials] = useState<Set<string>>(new Set());
  const [materialToDelete, setMaterialToDelete] = useState<AsbestosMaterial | null>(null);

  useEffect(() => {
    setMaterials(value);
  }, [value]);

  // Update custom materials when existingMaterials changes
  useEffect(() => {
    setCustomMaterials(existingMaterials);
  }, [existingMaterials]);

  // Auto-add first material if none exist and form is enabled
  useEffect(() => {
    if (materials.length === 0 && !disabled) {
      handleAddMaterial();
    }
  }, [disabled]); // Only run when disabled state changes

  const handleAddMaterial = () => {
    const newMaterial: AsbestosMaterial = {
      id: `material-${Date.now()}`,
      materialType: '',
      customMaterialName: '',
      location: '',
      description: '',
      photos: [],
      squareFootage: '',
      sampleCollected: 'No',
      suspectedAcm: 'No',
      isCustomMaterial: false,
    };
    const updatedMaterials = [newMaterial, ...materials];
    setMaterials(updatedMaterials);
    onChange(updatedMaterials);
    
    // Automatically expand the new material
    setExpandedMaterials(prev => new Set([...prev, newMaterial.id]));
  };

  const handleRemoveMaterial = (id: string) => {
    const material = materials.find(m => m.id === id);
    if (material) {
      setMaterialToDelete(material);
    }
  };

  const confirmRemoveMaterial = () => {
    if (materialToDelete) {
      const updatedMaterials = materials.filter(material => material.id !== materialToDelete.id);
      setMaterials(updatedMaterials);
      onChange(updatedMaterials);
      setMaterialToDelete(null);
    }
  };

  const toggleMaterialExpansion = (materialId: string) => {
    setExpandedMaterials(prev => {
      const newSet = new Set(prev);
      if (newSet.has(materialId)) {
        newSet.delete(materialId);
      } else {
        newSet.add(materialId);
      }
      return newSet;
    });
  };

  const handleMaterialChange = (id: string, field: keyof AsbestosMaterial, value: any) => {
    const updatedMaterials = materials.map(material => {
      if (material.id === id) {
        return { ...material, [field]: value };
      }
      return material;
    });
    setMaterials(updatedMaterials);
    onChange(updatedMaterials);
  };

  const handleFileUpload = async (materialId: string, files: FileList | null) => {
    if (!files || !files.length || !onFileUpload) return;

    try {
      setUploadingFiles(prev => ({ ...prev, [materialId]: true }));
      const uploadedUrls = await onFileUpload(files);
      
      const updatedMaterials = materials.map(material => {
        if (material.id === materialId) {
          return {
            ...material,
            photos: [...material.photos, ...uploadedUrls]
          };
        }
        return material;
      });
      
      setMaterials(updatedMaterials);
      onChange(updatedMaterials);
      
      toast({
        title: "Success",
        description: "Files uploaded successfully",
      });
    } catch (error) {
      console.error("Failed to upload files:", error);
      toast({
        title: "Upload failed",
        description: "An error occurred during upload",
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(prev => ({ ...prev, [materialId]: false }));
    }
  };

  const handleRemovePhoto = (materialId: string, photoUrl: string) => {
    const updatedMaterials = materials.map(material => {
      if (material.id === materialId) {
        return {
          ...material,
          photos: material.photos.filter(url => url !== photoUrl)
        };
      }
      return material;
    });
    setMaterials(updatedMaterials);
    onChange(updatedMaterials);
  };

  const handleMaterialTypeChange = (materialId: string, materialType: string) => {
    console.log('handleMaterialTypeChange called with:', { materialId, materialType });
    
    // Handle the custom material option
    if (materialType === "__custom__") {
      console.log('Setting custom material mode');
      const updatedMaterials = materials.map(material => {
        if (material.id === materialId) {
          return { 
            ...material, 
            materialType: '',
            isCustomMaterial: true 
          };
        }
        return material;
      });
      setMaterials(updatedMaterials);
      onChange(updatedMaterials);
      return;
    }
    
    // Find the material option to determine if it's custom
    const materialOption = materialOptions.find(option => option.value === materialType);
    const isCustom = materialOption?.isCustom || false;
    
    console.log('Material type:', materialType, 'isCustom:', isCustom);
    
    // If it's a custom material and not already in our list, add it
    if (isCustom && materialType && !customMaterials.includes(materialType)) {
      setCustomMaterials(prev => [...prev, materialType]);
    }
    
    console.log('Updating material with:', { materialType, isCustom });
    const updatedMaterials = materials.map(material => {
      if (material.id === materialId) {
        return { 
          ...material, 
          materialType: materialType,
          isCustomMaterial: isCustom 
        };
      }
      return material;
    });
    setMaterials(updatedMaterials);
    onChange(updatedMaterials);
  };

  const getMaterialUsageInfo = (materialType: string) => {
    const stats = materialUsageStats[materialType];
    if (!stats) return null;
    
    return {
      usageCount: stats.count,
      samplesCollected: stats.samplesCollected,
    };
  };

  const getDisplayMaterialName = (material: AsbestosMaterial) => {
    console.log('getDisplayMaterialName called with:', {
      materialType: material.materialType,
      isCustomMaterial: material.isCustomMaterial,
      customMaterialName: material.customMaterialName
    });
    
    if (material.isCustomMaterial) {
      const result = material.customMaterialName || 'Custom Material';
      console.log('Custom material, returning:', result);
      return result;
    }
    
    console.log('Standard material, returning:', material.materialType);
    return material.materialType;
  };

  // Create material options with usage statistics
  interface MaterialOption {
    value: string;
    label: string;
    isCustom: boolean;
    usageStats?: { count: number; samplesCollected: number };
  }

  const createMaterialOptions = (): MaterialOption[] => {
    const options: MaterialOption[] = [];
    
    // Add standard materials
    STANDARD_MATERIALS.forEach(material => {
      const stats = materialUsageStats[material];
      const usageText = stats ? ` (Used ${stats.count} times, ${stats.samplesCollected} samples)` : '';
      options.push({
        value: material,
        label: material + usageText,
        isCustom: false,
        usageStats: stats
      });
    });
    
    // Add custom materials
    customMaterials.forEach(material => {
      const stats = materialUsageStats[material];
      const usageText = stats ? ` (Used ${stats.count} times, ${stats.samplesCollected} samples)` : '';
      options.push({
        value: material,
        label: material + usageText,
        isCustom: true,
        usageStats: stats
      });
    });
    
    return options;
  };

  const materialOptions = createMaterialOptions();

  return (
    <div className="space-y-6">
      {/* Materials List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            {/* <Label className="text-lg font-semibold">Asbestos-Containing Materials</Label> */}
            {!disabled && (
              <Button onClick={handleAddMaterial} size="sm">
                <CirclePlus className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            )}
          </div>

          {materials.map((material, index) => {
            const isExpanded = expandedMaterials.has(material.id);
            const displayName = getDisplayMaterialName(material) || `Material ${index + 1}`;
            
            return (
              <Card key={material.id} className="p-4">
                <CardContent className="p-0">
                  <div className="space-y-4">
                    {/* Header with expand/collapse and remove button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleMaterialExpansion(material.id)}
                          className="p-1 h-auto"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        <h4 className="font-medium">
                          {displayName}
                        </h4>
                      </div>
                      {!disabled && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMaterial(material.id)}
                        >
                          <CircleX className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Collapsible content */}
                    {isExpanded && (
                      <div className="space-y-4">
                        {/* Material Type */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Label>Material Type *</Label>
                            {(() => {
                              const usageInfo = getDisplayMaterialName(material) ? getMaterialUsageInfo(getDisplayMaterialName(material)) : null;
                              return usageInfo && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <Info className="h-4 w-4 text-blue-600" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                      <div className="space-y-1">
                                        <p className="font-medium">Material Usage Across Areas:</p>
                                        <p>• Used in {usageInfo.usageCount} area(s)</p>
                                        <p>• {usageInfo.samplesCollected} sample(s) collected</p>
                                        {/* {usageInfo.samplesCollected > 0 && (
                                          <p className="text-green-600 text-sm">✓ Samples available for testing</p>
                                        )} */}
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              );
                            })()}
                          </div>
                          <Select
                            value={material.materialType || undefined}
                            onValueChange={(value) => handleMaterialTypeChange(material.id, value)}
                            disabled={disabled}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select material type" />
                            </SelectTrigger>
                            <SelectContent>
                              {materialOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                              <SelectItem value="__custom__">Add Other Material...</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Custom Material Input */}
                        {material.isCustomMaterial && (
                          <div className="space-y-2">
                            <Label>Custom Material Name</Label>
                            <Input
                              value={material.customMaterialName}
                              onChange={(e) => handleMaterialChange(material.id, 'customMaterialName', e.target.value)}
                              placeholder="Enter custom material name"
                              disabled={disabled}
                            />
                          </div>
                        )}

                        {/* Location */}
                        <div className="space-y-2">
                          <Label>Location *</Label>
                          <Input
                            value={material.location}
                            onChange={(e) => handleMaterialChange(material.id, 'location', e.target.value)}
                            placeholder="Describe the location"
                            disabled={disabled}
                          />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Input
                            value={material.description}
                            onChange={(e) => handleMaterialChange(material.id, 'description', e.target.value)}
                            placeholder="Describe the material"
                            disabled={disabled}
                          />
                        </div>

                        {/* Square Footage */}
                        <div className="space-y-2">
                          <Label>Square Footage</Label>
                          <Input
                            type="number"
                            value={material.squareFootage}
                            onChange={(e) => handleMaterialChange(material.id, 'squareFootage', e.target.value)}
                            placeholder="Enter square footage"
                            disabled={disabled}
                          />
                        </div>

                        {/* Photos */}
                        <div className="space-y-2">
                          <Label>Photos</Label>
                          <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                              <Label htmlFor={`file-${material.id}`} className="cursor-pointer">
                                <div className="flex items-center space-x-2 bg-sf-gray-600 text-white py-2 px-4 rounded-md">
                                  <Upload size={18} />
                                  <span>{uploadingFiles[material.id] ? "Uploading..." : "Upload Files"}</span>
                                </div>
                              </Label>
                              <input
                                id={`file-${material.id}`}
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(material.id, e.target.files)}
                                disabled={disabled || uploadingFiles[material.id]}
                              />
                            </div>
                            {material.photos.length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {material.photos.map((photoUrl, photoIndex) => (
                                  <div key={photoIndex} className="relative group">
                                    <img
                                      src={photoUrl}
                                      alt={`Material photo ${photoIndex + 1}`}
                                      className="w-full h-32 object-cover rounded-lg"
                                    />
                                    {!disabled && (
                                      <button
                                        onClick={() => handleRemovePhoto(material.id, photoUrl)}
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

                        {/* Sample Collected */}
                        <div className="space-y-2">
                          <Label>Sample Collected?</Label>
                          <RadioGroup
                            value={material.sampleCollected}
                            onValueChange={(value) => handleMaterialChange(material.id, 'sampleCollected', value)}
                            disabled={disabled}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Yes" id={`sample-yes-${material.id}`} />
                              <Label htmlFor={`sample-yes-${material.id}`}>Yes</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="No" id={`sample-no-${material.id}`} />
                              <Label htmlFor={`sample-no-${material.id}`}>No</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Suspected ACM (only show if sample not collected) */}
                        {material.sampleCollected === 'No' && (
                          <div className="space-y-2">
                            <Label>Is it a suspected ACM?</Label>
                            <RadioGroup
                              value={material.suspectedAcm}
                              onValueChange={(value) => handleMaterialChange(material.id, 'suspectedAcm', value)}
                              disabled={disabled}
                              className="flex space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Yes" id={`suspected-yes-${material.id}`} />
                                <Label htmlFor={`suspected-yes-${material.id}`}>Yes</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="No" id={`suspected-no-${material.id}`} />
                                <Label htmlFor={`suspected-no-${material.id}`}>No</Label>
                              </div>
                            </RadioGroup>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

      {/* Confirmation Dialog for Material Removal */}
      <AlertDialog open={!!materialToDelete} onOpenChange={(open) => !open && setMaterialToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Material</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{materialToDelete ? getDisplayMaterialName(materialToDelete) : ''}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveMaterial}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}; 