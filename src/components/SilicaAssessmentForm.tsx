import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MaterialSelect } from "@/components/MaterialSelect";
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
import { useMaterialStore } from "@/store";

interface SilicaMaterial {
  id: string;
  materialType: string;
  customMaterialName: string;
  location: string;
  description: string;
  photos: string[];
  sampleCollected: 'Yes' | 'No';
  suspectedSilica: 'Yes' | 'No';
  isCustomMaterial: boolean;
  sampleId?: string;
  sampleNo?: string;
  percentageSilica?: number;
  silicaType?: string;
  timestamp?: string;
}

interface SilicaAssessmentFormProps {
  value: SilicaMaterial[];
  onChange: (materials: SilicaMaterial[]) => void;
  disabled?: boolean;
  projectId?: string;
  reportId?: string;
  onFileUpload?: (files: FileList) => Promise<string[]>;
  existingMaterials?: string[]; // For tracking usage across areas
  materialUsageStats?: Record<string, { count: number; samplesCollected: number }>;
  existingSampleIds?: string[]; // For tracking sample IDs across all areas
}

export const SilicaAssessmentForm: React.FC<SilicaAssessmentFormProps> = ({
  value = [],
  onChange,
  disabled = false,
  onFileUpload,
  materialUsageStats = {},
}) => {
  const [localMaterials, setLocalMaterials] = useState<SilicaMaterial[]>(value);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [expandedMaterials, setExpandedMaterials] = useState<Set<string>>(new Set());
  const [materialToDelete, setMaterialToDelete] = useState<SilicaMaterial | null>(null);

  // Use the material store
  const { 
    materials,
    loading: materialsLoading,
    error: materialsError,
    getAvailableMaterials, 
    isStandardMaterial, 
    isCustomMaterial, 
    addCustomMaterial,
  } = useMaterialStore();

  // Fetch materials on component mount
  useEffect(() => {
    console.log('SilicaAssessmentForm mounted, fetching materials...');
    // Call fetchMaterials directly from store state
    const store = useMaterialStore.getState();
    store.fetchMaterials();
  }, []); // Empty dependency array

  // Debug materials loading
  useEffect(() => {
    console.log('Materials state changed:', {
      materials: materials.length,
      loading: materialsLoading,
      error: materialsError,
      availableMaterials: getAvailableMaterials()
    });
  }, [materials, materialsLoading, materialsError]);

  useEffect(() => {
    setLocalMaterials(value);
  }, [value]);

  // Auto-add first material if none exist and form is enabled
  useEffect(() => {
    if (localMaterials.length === 0 && !disabled) {
      handleAddMaterial();
    }
  }, [disabled]);

  const handleAddMaterial = () => {
    const newMaterial: SilicaMaterial = {
      id: `silica-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      materialType: "",
      customMaterialName: "",
      location: "",
      description: "",
      photos: [],
      sampleCollected: 'No',
      suspectedSilica: 'No',
      isCustomMaterial: false,
      timestamp: new Date().toISOString()
    };
    const updatedMaterials = [newMaterial, ...localMaterials];
    setLocalMaterials(updatedMaterials);
    onChange(updatedMaterials);
  };

  const handleRemoveMaterial = (id: string) => {
    const material = localMaterials.find(m => m.id === id);
    if (material) {
      setMaterialToDelete(material);
    }
  };

  const confirmRemoveMaterial = () => {
    if (materialToDelete) {
      const updatedMaterials = localMaterials.filter(m => m.id !== materialToDelete.id);
      setLocalMaterials(updatedMaterials);
      onChange(updatedMaterials);
      setMaterialToDelete(null);
    }
  };

  const toggleMaterialExpansion = (materialId: string) => {
    const newExpanded = new Set(expandedMaterials);
    if (newExpanded.has(materialId)) {
      newExpanded.delete(materialId);
    } else {
      newExpanded.add(materialId);
    }
    setExpandedMaterials(newExpanded);
  };

  const handleMaterialChange = (id: string, field: keyof SilicaMaterial, value: any) => {
    const updatedMaterials = localMaterials.map(material => {
      if (material.id === id) {
        return { ...material, [field]: value };
      }
      return material;
    });
    setLocalMaterials(updatedMaterials);
    onChange(updatedMaterials);
  };

  const handleFileUpload = async (materialId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadingFiles(prev => ({ ...prev, [materialId]: true }));

    try {
      let uploadedUrls: string[] = [];
      
      if (onFileUpload) {
        uploadedUrls = await onFileUpload(files);
      } else {
        // Simulate file upload for demo purposes
        uploadedUrls = Array.from(files).map(file => URL.createObjectURL(file));
      }

      const updatedMaterials = localMaterials.map(material => {
        if (material.id === materialId) {
          return {
            ...material,
            photos: [...material.photos, ...uploadedUrls]
          };
        }
        return material;
      });

      setLocalMaterials(updatedMaterials);
      onChange(updatedMaterials);

      toast({
        title: "Files uploaded successfully",
        description: `${files.length} file(s) uploaded.`,
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(prev => ({ ...prev, [materialId]: false }));
    }
  };

  const handleRemovePhoto = (materialId: string, photoUrl: string) => {
    const updatedMaterials = localMaterials.map(material => {
      if (material.id === materialId) {
        return {
          ...material,
          photos: material.photos.filter(photo => photo !== photoUrl)
        };
      }
      return material;
    });
    setLocalMaterials(updatedMaterials);
    onChange(updatedMaterials);
  };

  const handleMaterialTypeChange = (materialId: string, materialType: string) => {
    console.log('handleMaterialTypeChange called with:', { materialId, materialType });
    
    // Handle the custom material option
    if (materialType === "__custom__") {
      console.log('Setting custom material mode');
      const updatedMaterials = localMaterials.map(material => {
        if (material.id === materialId) {
          return { 
            ...material, 
            materialType: '',
            customMaterialName: '',
            isCustomMaterial: true 
          };
        }
        return material;
      });
      setLocalMaterials(updatedMaterials);
      onChange(updatedMaterials);
      return;
    }
    
    // Check if this is a standard or custom material
    const isStandard = isStandardMaterial(materialType);
    const isCustom = isCustomMaterial(materialType);
    
    console.log('Material type:', materialType, 'isStandard:', isStandard, 'isCustom:', isCustom);
    
    console.log('Updating material with:', { materialType, isCustomMaterial: isCustom });
    const updatedMaterials = localMaterials.map(material => {
      if (material.id === materialId) {
        return { 
          ...material, 
          materialType: materialType,
          customMaterialName: materialType, // Set the custom material name to the selected material type
          isCustomMaterial: isCustom 
        };
      }
      return material;
    });
    setLocalMaterials(updatedMaterials);
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

  const getDisplayMaterialName = (material: SilicaMaterial) => {
    if (material.isCustomMaterial) {
      const result = material.customMaterialName || 'Custom Material';
      return result;
    }
    return material.materialType;
  };

  interface MaterialOption {
    value: string;
    label: string;
    isCustom: boolean;
    usageStats?: { count: number; samplesCollected: number };
  }

  const createMaterialOptions = (): MaterialOption[] => {
    const options: MaterialOption[] = [];
    
    console.log('Creating material options:', {
      materialsLoading,
      materialsLength: materials.length,
      materialsError,
      materials: materials
    });
    
    // Only create options if materials are loaded and not loading
    if (!materialsLoading) {
      const availableMaterials = getAvailableMaterials();
      
      console.log('Available materials:', availableMaterials);
      console.log('Materials loading:', materialsLoading);
      console.log('Materials error:', materialsError);
      console.log('Store materials:', materials);
      
      // Add all available materials (both standard and custom)
      availableMaterials.forEach(material => {
        const stats = materialUsageStats[material];
        const usageText = stats ? ` (Used ${stats.count} times, ${stats.samplesCollected} samples)` : '';
        const isCustom = isCustomMaterial(material);
        options.push({
          value: material,
          label: material + usageText,
          isCustom: isCustom,
          usageStats: stats
        });
      });
      
      // If no materials are available from API, add some default silica materials
      if (availableMaterials.length === 0 && !materialsError) {
        console.log('No materials from API, adding default silica materials');
        const defaultMaterials = [
          'Concrete',
          'Brick',
          'Stone',
          'Tile',
          'Cement',
          'Mortar',
          'Grout',
          'Stucco',
          'Plaster',
          'Drywall',
          'Insulation',
          'Abrasive Blasting Media',
          'Foundry Sand',
          'Glass',
          'Ceramics',
          'Porcelain',
          'Quartz',
          'Granite',
          'Marble',
          'Sandstone',
          'Limestone',
          'Slate',
          'Shale',
          'Clay',
          'Soil',
          'Dust'
        ];
        
        defaultMaterials.forEach(material => {
          options.push({
            value: material,
            label: material,
            isCustom: false
          });
        });
      }
    }
    
    return options;
  };

  const materialOptions = createMaterialOptions();

  return (
    <div className="space-y-6">
      {/* Materials List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            {/* <Label className="text-lg font-semibold">Silica-Containing Materials</Label> */}
            {!disabled && (
              <Button onClick={handleAddMaterial} size="sm">
                <CirclePlus className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            )}
          </div>

          {localMaterials.map((material, index) => {
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
                                      </div>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              );
                            })()}
                            {materialsError && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-4 w-4 text-red-600" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <div className="space-y-1">
                                      <p className="font-medium text-red-600">Error Loading Materials:</p>
                                      <p className="text-red-600">{materialsError}</p>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <MaterialSelect
                            value={material.materialType || ""}
                            onValueChange={(value) => handleMaterialTypeChange(material.id, value)}
                            options={materialOptions}
                            placeholder={materialsLoading ? "Loading materials..." : "Select material type"}
                            disabled={disabled || materialsLoading}
                            loading={materialsLoading}
                          />
                        </div>

                        {/* Custom Material Input */}
                        {material.isCustomMaterial && 
                         (!material.customMaterialName || 
                          (!isStandardMaterial(material.customMaterialName) && 
                           !isCustomMaterial(material.customMaterialName))) && (
                          <div className="space-y-2">
                            <Label>Custom Material Name</Label>
                            <div className="flex space-x-2">
                              <Input
                                value={material.customMaterialName}
                                onChange={(e) => handleMaterialChange(material.id, 'customMaterialName', e.target.value)}
                                placeholder="Enter custom material name"
                                disabled={disabled}
                                className="flex-1"
                              />
                              {material.customMaterialName && material.customMaterialName.trim() && (
                                <Button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      await addCustomMaterial(material.customMaterialName.trim());
                                      // Fetch materials again to refresh the dropdown
                                      const store = useMaterialStore.getState();
                                      await store.fetchMaterials();
                                      toast({
                                        title: "Material Added",
                                        description: `"${material.customMaterialName.trim()}" has been added to the material options.`,
                                      });
                                    } catch (error) {
                                      console.error('Error adding custom material:', error);
                                      toast({
                                        title: "Error",
                                        description: "Failed to add material to options.",
                                        variant: "destructive",
                                      });
                                    }
                                  }}
                                  disabled={disabled}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                  Add to Options
                                </Button>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">
                              Click "Add to Options" to make this material available for future use across all areas.
                            </p>
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
                                        type="button"
                                        onClick={() => handleRemovePhoto(material.id, photoUrl)}
                                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
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

                        {/* Suspected Silica (only show if sample not collected) */}
                        {material.sampleCollected === 'No' && (
                          <div className="space-y-2">
                            <Label>Is it a suspected silica-containing material?</Label>
                            <RadioGroup
                              value={material.suspectedSilica}
                              onValueChange={(value) => handleMaterialChange(material.id, 'suspectedSilica', value)}
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
      <AlertDialog open={!!materialToDelete} onOpenChange={() => setMaterialToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Material</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this material? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveMaterial} className="bg-red-600 hover:bg-red-700">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}; 