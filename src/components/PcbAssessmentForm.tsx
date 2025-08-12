import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface MaterialOption {
  value: string;
  label: string;
  isCustom: boolean;
  usageStats?: { count: number; samplesCollected: number };
}

interface PcbEquipment {
  id: string;
  equipmentType: string;
  customEquipmentName: string;
  location: string;
  description: string;
  photos: string[];
  isCustomEquipment: boolean;
  timestamp?: string;
}

interface PcbAssessmentFormProps {
  value: PcbEquipment[];
  onChange: (equipment: PcbEquipment[]) => void;
  disabled?: boolean;
  projectId?: string;
  reportId?: string;
  onFileUpload?: (files: FileList) => Promise<string[]>;
  existingEquipment?: string[]; // For tracking usage across areas
  equipmentUsageStats?: Record<string, { count: number }>;
}

export const PcbAssessmentForm: React.FC<PcbAssessmentFormProps> = ({
  value = [],
  onChange,
  disabled = false,
  onFileUpload,
  equipmentUsageStats = {},
}) => {
  // Ensure value is always an array for defensive programming
  const safeValue = Array.isArray(value) ? value : [];
  const [localEquipment, setLocalEquipment] = useState<PcbEquipment[]>(safeValue);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [expandedEquipment, setExpandedEquipment] = useState<Set<string>>(new Set());
  const [equipmentToDelete, setEquipmentToDelete] = useState<PcbEquipment | null>(null);

  // Use the material store for equipment types
  const { 
    loading: materialsLoading,
    error: materialsError,
    getAvailableMaterials, 
    isStandardMaterial, 
    isCustomMaterial, 
    addCustomMaterial,
  } = useMaterialStore();

  // Fetch materials on component mount
  useEffect(() => {
    console.log('PcbAssessmentForm mounted, fetching materials...');
    const store = useMaterialStore.getState();
    store.fetchMaterials();
  }, []);

  useEffect(() => {
    // Ensure value is always an array for defensive programming
    const safeValue = Array.isArray(value) ? value : [];
    setLocalEquipment(safeValue);
  }, [value]);

  // Auto-add first equipment if none exist and form is enabled
  useEffect(() => {
    if (localEquipment.length === 0 && !disabled) {
      handleAddEquipment();
    }
  }, [disabled]);

  const handleAddEquipment = () => {
    const newEquipment: PcbEquipment = {
      id: `equipment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      equipmentType: "",
      customEquipmentName: "",
      location: "",
      description: "",
      photos: [],
      isCustomEquipment: false,
      timestamp: new Date().toISOString(),
    };

    const updatedEquipment = [...localEquipment, newEquipment];
    setLocalEquipment(updatedEquipment);
    onChange(updatedEquipment);
  };

  const handleRemoveEquipment = (equipmentId: string) => {
    const updatedEquipment = localEquipment.filter(eq => eq.id !== equipmentId);
    setLocalEquipment(updatedEquipment);
    onChange(updatedEquipment);
  };

  const handleEquipmentChange = (equipmentId: string, field: keyof PcbEquipment, value: any) => {
    const updatedEquipment = localEquipment.map(eq => {
      if (eq.id === equipmentId) {
        return { ...eq, [field]: value };
      }
      return eq;
    });
    setLocalEquipment(updatedEquipment);
    onChange(updatedEquipment);
  };

  const handleFileUpload = async (equipmentId: string, files: FileList) => {
    if (!onFileUpload) return;

    setUploadingFiles(prev => ({ ...prev, [equipmentId]: true }));
    try {
      const urls = await onFileUpload(files);
      const equipment = localEquipment.find(eq => eq.id === equipmentId);
      if (equipment) {
        handleEquipmentChange(equipmentId, 'photos', [...equipment.photos, ...urls]);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Error",
        description: "Failed to upload files",
        variant: "destructive",
      });
    } finally {
      setUploadingFiles(prev => ({ ...prev, [equipmentId]: false }));
    }
  };

  const removeFile = (equipmentId: string, fileUrl: string) => {
    const equipment = localEquipment.find(eq => eq.id === equipmentId);
    if (equipment) {
      const updatedPhotos = equipment.photos.filter(url => url !== fileUrl);
      handleEquipmentChange(equipmentId, 'photos', updatedPhotos);
    }
  };

  const toggleExpanded = (equipmentId: string) => {
    setExpandedEquipment(prev => {
      const newSet = new Set(prev);
      if (newSet.has(equipmentId)) {
        newSet.delete(equipmentId);
      } else {
        newSet.add(equipmentId);
      }
      return newSet;
    });
  };

  const handleEquipmentTypeChange = (equipmentId: string, equipmentType: string) => {
    console.log('handleEquipmentTypeChange called with:', { equipmentId, equipmentType });
    
    // Handle the custom equipment option
    if (equipmentType === "__custom__") {
      console.log('Setting custom equipment mode');
      const updatedEquipment = localEquipment.map(equipment => {
        if (equipment.id === equipmentId) {
          return { 
            ...equipment, 
            equipmentType: '',
            customEquipmentName: '',
            isCustomEquipment: true 
          };
        }
        return equipment;
      });
      setLocalEquipment(updatedEquipment);
      onChange(updatedEquipment);
      return;
    }
    
    // Check if this is a standard or custom equipment
    const isStandard = isStandardMaterial(equipmentType);
    const isCustom = isCustomMaterial(equipmentType);
    
    console.log('Equipment type:', equipmentType, 'isStandard:', isStandard, 'isCustom:', isCustom);
    
    console.log('Updating equipment with:', { equipmentType, isCustomEquipment: isCustom });
    const updatedEquipment = localEquipment.map(equipment => {
      if (equipment.id === equipmentId) {
        return { 
          ...equipment, 
          equipmentType: equipmentType,
          customEquipmentName: equipmentType, // Set the custom equipment name to the selected equipment type
          isCustomEquipment: isCustom 
        };
      }
      return equipment;
    });
    setLocalEquipment(updatedEquipment);
    onChange(updatedEquipment);
  };

  const getEquipmentUsageInfo = (equipmentType: string) => {
    // Add defensive check for equipmentUsageStats
    if (!equipmentUsageStats || typeof equipmentUsageStats !== 'object') {
      return null;
    }
    
    const stats = equipmentUsageStats[equipmentType];
    if (!stats || typeof stats !== 'object' || typeof stats.count !== 'number') {
      return null;
    }
    
    return {
      usageCount: stats.count,
    };
  };

  const getDisplayEquipmentName = (equipment: PcbEquipment) => {
    // Add defensive check for equipment parameter
    if (!equipment || typeof equipment !== 'object') {
      return 'Electrical Equipment';
    }
    
    console.log('getDisplayEquipmentName called with:', {
      equipmentType: equipment.equipmentType,
      isCustomEquipment: equipment.isCustomEquipment,
      customEquipmentName: equipment.customEquipmentName
    });
    
    if (equipment.isCustomEquipment) {
      const result = equipment.customEquipmentName || 'Custom Equipment';
      console.log('Custom equipment, returning:', result);
      return result;
    }
    
    console.log('Standard equipment, returning:', equipment.equipmentType);
    return equipment.equipmentType || 'Electrical Equipment';
  };

  const createEquipmentOptions = (): MaterialOption[] => {
    const options: MaterialOption[] = [];
    
    if (!materialsLoading) {
      const availableMaterials = getAvailableMaterials();
      
      // Add defensive check to ensure availableMaterials is an array
      if (Array.isArray(availableMaterials)) {
        availableMaterials.forEach(material => {
          // Add defensive check for equipmentUsageStats
          const stats = equipmentUsageStats && typeof equipmentUsageStats === 'object' 
            ? equipmentUsageStats[material] 
            : undefined;
          const usageText = stats && typeof stats === 'object' && typeof stats.count === 'number' 
            ? ` (Used ${stats.count} times)` 
            : '';
          const isCustom = isCustomMaterial(material);
          options.push({
            value: material,
            label: material + usageText,
            isCustom: isCustom,
            usageStats: stats && typeof stats === 'object' && typeof stats.count === 'number' 
              ? { count: stats.count, samplesCollected: 0 } 
              : undefined
          });
        });
      }
      
      // If no materials are available from API, add some default PCB equipment types
      if ((!Array.isArray(availableMaterials) || availableMaterials.length === 0) && !materialsError) {
        console.log('No materials from API, adding default PCB equipment types');
        const defaultEquipment = [
          'Fluorescent Light Fixtures',
          'HID Lights',
          'Liquid-Filled Transformers',
          'Wall-Mounted Capacitors',
          'Electrical Equipment',
          'PCB-Containing Equipment'
        ];
        
        defaultEquipment.forEach(equipment => {
          options.push({
            value: equipment,
            label: equipment,
            isCustom: false
          });
        });
      }
    }
    
    return options;
  };

  const equipmentOptions = createEquipmentOptions();

  return (
    <div className="space-y-6">
      {/* Equipment List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {!disabled && (
            <Button onClick={handleAddEquipment} size="sm">
              <CirclePlus className="h-4 w-4 mr-2" />
              Add Electrical Equipment
            </Button>
          )}
        </div>

        {Array.isArray(localEquipment) ? localEquipment.map((equipment, index) => {
          const isExpanded = expandedEquipment.has(equipment.id);
          const isUploading = uploadingFiles[equipment.id];
          const displayName = getDisplayEquipmentName(equipment) || `Electrical Equipment ${index + 1}`;
          
          return (
            <Card key={equipment.id} className="p-4">
              <CardContent className="p-0">
                <div className="space-y-4">
                  {/* Header with expand/collapse and remove button */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(equipment.id)}
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
                        onClick={() => setEquipmentToDelete(equipment)}
                      >
                        <CircleX className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Collapsible content */}
                  {isExpanded && (
                    <div className="space-y-4">
                      {/* Equipment Type Selection */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Label>Equipment Type</Label>
                          {(() => {
                            const usageInfo = getDisplayEquipmentName(equipment) ? getEquipmentUsageInfo(getDisplayEquipmentName(equipment)) : null;
                            return usageInfo && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="h-4 w-4 text-blue-600" />
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs">
                                    <div className="space-y-1">
                                      <p className="font-medium">Equipment Usage Across Areas:</p>
                                      <p>• Used in {usageInfo.usageCount} area(s)</p>
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
                                    <p className="font-medium text-red-600">Error Loading Equipment:</p>
                                    <p className="text-red-600">{materialsError}</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                        <MaterialSelect
                          value={equipment.equipmentType || ""}
                          onValueChange={(value) => handleEquipmentTypeChange(equipment.id, value)}
                          options={equipmentOptions}
                          placeholder={materialsLoading ? "Loading equipment..." : "Select equipment type"}
                          disabled={disabled || materialsLoading}
                          loading={materialsLoading}
                        />
                      </div>

                      {/* Custom Equipment Input */}
                      {equipment.isCustomEquipment && 
                       (!equipment.customEquipmentName || 
                        (!isStandardMaterial(equipment.customEquipmentName) && 
                         !isCustomMaterial(equipment.customEquipmentName))) && (
                        <div className="space-y-2">
                          <Label>Custom Equipment Name</Label>
                          <div className="flex space-x-2">
                            <Input
                              value={equipment.customEquipmentName}
                              onChange={(e) => handleEquipmentChange(equipment.id, 'customEquipmentName', e.target.value)}
                              placeholder="Enter custom equipment name"
                              disabled={disabled}
                              className="flex-1"
                            />
                            {equipment.customEquipmentName && equipment.customEquipmentName.trim() && (
                              <Button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await addCustomMaterial(equipment.customEquipmentName.trim());
                                    // Fetch materials again to refresh the dropdown
                                    const store = useMaterialStore.getState();
                                    await store.fetchMaterials();
                                    toast({
                                      title: "Equipment Added",
                                      description: `"${equipment.customEquipmentName.trim()}" has been added to the equipment options.`,
                                    });
                                  } catch (error) {
                                    console.error('Error adding custom equipment:', error);
                                    toast({
                                      title: "Error",
                                      description: "Failed to add equipment to options.",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                                disabled={disabled}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                Add
                              </Button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Location */}
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input
                          value={equipment.location}
                          onChange={(e) => handleEquipmentChange(equipment.id, 'location', e.target.value)}
                          disabled={disabled}
                          placeholder="Enter location"
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={equipment.description}
                          onChange={(e) => handleEquipmentChange(equipment.id, 'description', e.target.value)}
                          disabled={disabled}
                          placeholder="Enter description"
                        />
                      </div>

                      {/* Photos */}
                      <div className="space-y-2">
                        <Label>Photos</Label>
                        <div className="space-y-2">
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files) {
                                handleFileUpload(equipment.id, e.target.files);
                              }
                            }}
                            disabled={disabled || isUploading}
                            className="hidden"
                            id={`file-upload-${equipment.id}`}
                          />
                          <label
                            htmlFor={`file-upload-${equipment.id}`}
                            className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer ${
                              disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {isUploading ? 'Uploading...' : 'Upload Photos'}
                          </label>
                        </div>

                        {/* Display uploaded photos */}
                        {equipment.photos.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                            {equipment.photos.map((photo, photoIndex) => (
                              <div key={photoIndex} className="relative">
                                <img
                                  src={photo}
                                  alt={`Photo ${photoIndex + 1}`}
                                  className="w-full h-20 object-cover rounded border"
                                />
                                {!disabled && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="absolute top-0 right-0 h-6 w-6 p-0"
                                    onClick={() => removeFile(equipment.id, photo)}
                                  >
                                    <CircleX className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        }) : null}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!equipmentToDelete} onOpenChange={() => setEquipmentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Equipment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this electrical equipment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (equipmentToDelete) {
                  handleRemoveEquipment(equipmentToDelete.id);
                  setEquipmentToDelete(null);
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}; 