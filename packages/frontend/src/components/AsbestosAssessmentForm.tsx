import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MaterialSelect } from "@/components/MaterialSelect";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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

interface AsbestosMaterial {
  id: string;
  materialType: string;
  customMaterialName: string;
  location: string;
  customLocation?: string;
  description: string;
  photos: string[];
  quantity: string;
  quantityType: 'Square/ft' | 'Linear/Ft' | 'Each';
  sampleCollected: 'Yes' | 'No';
  suspectedAcm: 'Yes' | 'No';
  isCustomMaterial: boolean;
  sampleId?: string;
  sampleNo?: string;
  percentageAsbestos?: number;
  asbestosType?: string;
  timestamp?: string;
  condition: 'Good' | 'Fair' | 'Poor' | 'Unknown'; // Add condition field
  friability: 'Friable' | 'Non-Friable'; // Add friability field
  isTile?: boolean; // Add tile checkbox field
  tileType?: 'Ceramic' | 'Vinyl'; // Add tile type field
  ceilingTileStyle?: string; // Add ceiling tile style field
  customCeilingTileStyle?: string; // Add custom ceiling tile style field
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
  existingSampleIds?: string[]; // For tracking sample IDs across all areas
  areaMaterials?: Record<string, AsbestosMaterial[]>; // Materials from other areas for copying
}

export const AsbestosAssessmentForm: React.FC<AsbestosAssessmentFormProps> = ({
  value = [],
  onChange,
  disabled = false,
  onFileUpload,
  materialUsageStats = {},
  existingSampleIds = [],
  areaMaterials = {},
}) => {
  const [localMaterials, setLocalMaterials] = useState<AsbestosMaterial[]>(value);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [expandedMaterials, setExpandedMaterials] = useState<Set<string>>(new Set());
  const [materialToDelete, setMaterialToDelete] = useState<AsbestosMaterial | null>(null);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [materialToCopy, setMaterialToCopy] = useState<{ materialType: string; materialId: string } | null>(null);

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
    console.log('AsbestosAssessmentForm mounted, fetching materials...');
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
  }, [disabled]); // Only run when disabled state changes

  const handleAddMaterial = () => {
    const newMaterial: AsbestosMaterial = {
      id: `material-${Date.now()}`,
      materialType: '',
      customMaterialName: '',
      location: '',
      customLocation: '',
      description: '',
      photos: [],
      quantity: '',
      quantityType: 'Square/ft',
      sampleCollected: 'No',
      suspectedAcm: 'No',
      isCustomMaterial: false,
      condition: 'Unknown', // Default value for condition
      friability: 'Non-Friable', // Default value for friability
      isTile: false, // Default value for tile checkbox
    };
    const updatedMaterials = [newMaterial, ...localMaterials];
    setLocalMaterials(updatedMaterials);
    onChange(updatedMaterials);
    
    // Automatically expand the new material
    setExpandedMaterials(prev => new Set([...prev, newMaterial.id]));
  };

  const handleRemoveMaterial = (id: string) => {
    const material = localMaterials.find(m => m.id === id);
    if (material) {
      setMaterialToDelete(material);
    }
  };

  const confirmRemoveMaterial = () => {
    if (materialToDelete) {
      const updatedMaterials = localMaterials.filter(material => material.id !== materialToDelete.id);
      setLocalMaterials(updatedMaterials);
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
    const updatedMaterials = localMaterials.map(material => {
      if (material.id === id) {
        const updatedMaterial = { ...material, [field]: value };
        
        // If sampleCollected is being set to 'Yes', add timestamp and generate sampleId
        if (field === 'sampleCollected' && value === 'Yes') {
          const timestamp = new Date().toISOString();
          
          // Find the highest existing sample ID across all areas and current materials
          const allExistingSampleIds = [
            ...existingSampleIds,
            ...localMaterials.filter(m => m.sampleId).map(m => m.sampleId!)
          ];
          
          const existingSampleNumbers = allExistingSampleIds
            .map(sampleId => {
              const match = sampleId.match(/S(\d+)/);
              return match ? parseInt(match[1]) : 0;
            });
          
          const nextSampleNumber = existingSampleNumbers.length > 0 
            ? Math.max(...existingSampleNumbers) + 1 
            : 10001;
          
          const sampleId = `S${nextSampleNumber.toString().padStart(5, '0')}`;
          updatedMaterial.timestamp = timestamp;
          updatedMaterial.sampleId = sampleId;
        }
        
        return updatedMaterial;
      }
      return material;
    });
    setLocalMaterials(updatedMaterials);
    onChange(updatedMaterials);
  };

  const handleFileUpload = async (materialId: string, files: FileList | null) => {
    if (!files || !files.length || !onFileUpload) return;

    try {
      setUploadingFiles(prev => ({ ...prev, [materialId]: true }));
      const uploadedUrls = await onFileUpload(files);
      
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
    const updatedMaterials = localMaterials.map(material => {
      if (material.id === materialId) {
        return {
          ...material,
          photos: material.photos.filter((url: string) => url !== photoUrl)
        };
      }
      return material;
    });
    setLocalMaterials(updatedMaterials);
    onChange(updatedMaterials);
  };

  const handleLocationChange = (materialId: string, newLocation: string) => {
    const updatedMaterials = localMaterials.map(material => {
      if (material.id === materialId) {
        return {
          ...material,
          location: newLocation,
          customLocation: newLocation === 'Other' ? (material.customLocation || '') : ''
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
    
    // Check if this material is already used in other areas
    const materialName = isCustom ? materialType : materialType;
    const areasWithMaterial = Object.entries(areaMaterials).filter(([, materials]) => 
      materials.some(m => (m.isCustomMaterial ? m.customMaterialName : m.materialType) === materialName)
    );
    
    if (areasWithMaterial.length > 0) {
      // Show copy dialog
      setMaterialToCopy({ materialType, materialId });
      setCopyDialogOpen(true);
      return;
    }
    
    const updatedMaterials = localMaterials.map(material => {
      if (material.id === materialId) {
        return { 
          ...material, 
          materialType: materialType,
          customMaterialName: isCustom ? materialType : '', // Only set customMaterialName if it's a custom material
          isCustomMaterial: isCustom 
        };
      }
      return material;
    });
    setLocalMaterials(updatedMaterials);
    onChange(updatedMaterials);
  };

  const handleTileCheckboxChange = async (materialId: string, isTile: boolean) => {
    const updatedMaterials = localMaterials.map(material => {
      if (material.id === materialId) {
        return { ...material, isTile };
      }
      return material;
    });

    if (isTile) {
      // Ensure Grout and Thinset exist in BE (avoid duplicates)
      try {
        const store = useMaterialStore.getState();
        const required = ['Grout', 'Thinset'];
        for (const mat of required) {
          await store.addMaterialIfMissing(mat, 'standard');
        }
        // Ensure latest materials are in store before we render locally
        await store.fetchMaterials();
      } catch (e) {
        console.error('Error ensuring tile-related materials exist:', e);
      }

      // Add Grout and Thinset materials
      const storeAfter = useMaterialStore.getState();
      const groutIsCustom = storeAfter.isCustomMaterial('Grout');
      const thinsetIsCustom = storeAfter.isCustomMaterial('Thinset');

      const groutMaterial: AsbestosMaterial = {
        id: `material-${Date.now()}-grout`,
        materialType: 'Grout',
        customMaterialName: 'Grout',
        location: '',
        description: '',
        photos: [],
        quantity: '',
        quantityType: 'Square/ft',
        sampleCollected: 'No',
        suspectedAcm: 'No',
        isCustomMaterial: groutIsCustom,
        condition: 'Unknown',
        friability: 'Non-Friable',
        isTile: false,
      };

      const thinsetMaterial: AsbestosMaterial = {
        id: `material-${Date.now()}-thinset`,
        materialType: 'Thinset',
        customMaterialName: 'Thinset',
        location: '',
        description: '',
        photos: [],
        quantity: '',
        quantityType: 'Square/ft',
        sampleCollected: 'No',
        suspectedAcm: 'No',
        isCustomMaterial: thinsetIsCustom,
        condition: 'Unknown',
        friability: 'Non-Friable',
        isTile: false,
      };

      // Insert the new materials after the current material
      const currentMaterialIndex = updatedMaterials.findIndex(m => m.id === materialId);
      const alreadyHasGrout = updatedMaterials.some(m => m.materialType === 'Grout');
      const alreadyHasThinset = updatedMaterials.some(m => m.materialType === 'Thinset');
      const toInsert: AsbestosMaterial[] = [];
      if (!alreadyHasGrout) toInsert.push(groutMaterial);
      if (!alreadyHasThinset) toInsert.push(thinsetMaterial);

      const newMaterials = [
        ...updatedMaterials.slice(0, currentMaterialIndex + 1),
        ...toInsert,
        ...updatedMaterials.slice(currentMaterialIndex + 1)
      ];

      setLocalMaterials(newMaterials);
      onChange(newMaterials);
    } else {
      // Remove Grout and Thinset materials that were auto-added
      const filteredMaterials = updatedMaterials.filter(material => 
        !(material.materialType === 'Grout' || material.materialType === 'Thinset')
      );
      setLocalMaterials(filteredMaterials);
      onChange(filteredMaterials);
    }
  };

  const handleCopyFromArea = (areaName: string) => {
    if (!materialToCopy) return;
    
    const materialName = materialToCopy.materialType;
    const sourceMaterials = areaMaterials[areaName] || [];
    const sourceMaterial = sourceMaterials.find(m => 
      (m.isCustomMaterial ? m.customMaterialName : m.materialType) === materialName
    );
    
    if (sourceMaterial) {
      const updatedMaterials = localMaterials.map(material => {
        if (material.id === materialToCopy.materialId) {
          return {
            ...sourceMaterial,
            id: materialToCopy.materialId, // Keep the current material's ID
            timestamp: new Date().toISOString(), // Update timestamp
          };
        }
        return material;
      });
      
      setLocalMaterials(updatedMaterials);
      onChange(updatedMaterials);
    }
    
    setCopyDialogOpen(false);
    setMaterialToCopy(null);
  };

  const handleSkipCopy = () => {
    if (!materialToCopy) return;
    
    const materialType = materialToCopy.materialType;
    const isCustom = isCustomMaterial(materialType);
    
    const updatedMaterials = localMaterials.map(material => {
      if (material.id === materialToCopy.materialId) {
        return { 
          ...material, 
          materialType: materialType,
          customMaterialName: materialType,
          isCustomMaterial: isCustom 
        };
      }
      return material;
    });
    
    setLocalMaterials(updatedMaterials);
    onChange(updatedMaterials);
    setCopyDialogOpen(false);
    setMaterialToCopy(null);
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
      
      // Define the priority materials that should appear at the top
      const priorityMaterials = [
        'Sprayed Texture / Stucco Finishes',
        'Plaster Finishes',
        'Sprayed Fireproofing',
        'Lay-in Acoustic Ceiling Tiles',
        'Glued-on Acoustic Ceiling Tiles',
        'Cement Ceiling Panels',
        'Drywall Joint Compound',
        'Refractory Associated with the Boiler'
      ];
      
      // Separate priority and regular materials
      const priorityOptions: MaterialOption[] = [];
      const regularOptions: MaterialOption[] = [];
      
      availableMaterials.forEach(material => {
        const stats = materialUsageStats[material];
        const usageText = stats ? ` (Used ${stats.count} times, ${stats.samplesCollected} samples)` : '';
        const isCustom = isCustomMaterial(material);
        const option = {
          value: material,
          label: material + usageText,
          isCustom: isCustom,
          usageStats: stats
        };
        
        // Check if this material is in the priority list
        if (priorityMaterials.includes(material)) {
          priorityOptions.push(option);
        } else {
          regularOptions.push(option);
        }
      });
      
      // Sort priority options to maintain the specified order
      priorityOptions.sort((a, b) => {
        const aIndex = priorityMaterials.indexOf(a.value);
        const bIndex = priorityMaterials.indexOf(b.value);
        return aIndex - bIndex;
      });
      
      // Combine priority options first, then regular options
      options.push(...priorityOptions, ...regularOptions);
      
      // If no materials are available from API, add some default materials
      if (availableMaterials.length === 0 && !materialsError) {
        console.log('No materials from API, adding default materials');
        const defaultMaterials = [
          'Acoustic Ceiling Tiles',
          'Asphalt Roofing',
          'Cement Pipes',
          'Floor Tiles',
          'Insulation',
          'Joint Compound',
          'Pipe Insulation',
          'Roofing Felt',
          'Siding',
          'Textured Paint',
          'Vinyl Floor Tiles',
          'Wallboard'
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
    
    console.log('Created options:', options);
    return options;
  };

  const materialOptions = createMaterialOptions();
  
  // Debug material options
  useEffect(() => {
    console.log('Material options updated:', {
      optionsCount: materialOptions.length,
      options: materialOptions,
      materialsLoading,
      materialsError
    });
  }, [materialOptions, materialsLoading, materialsError]);

  return (
    <div className="space-y-6">
      {/* Materials List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
            {/* <Label className="text-lg font-semibold">Asbestos-Containing Materials</Label> */}
            {!disabled && (
              <Button onClick={handleAddMaterial} size="sm" className="bg-gray-700 dark:bg-gray-600 text-white hover:bg-gray-600 dark:hover:bg-gray-500">
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
                                        {/* {usageInfo.samplesCollected > 0 && (
                                          <p className="text-green-600 text-sm">✓ Samples available for testing</p>
                                        )} */}
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
                            value={getDisplayMaterialName(material) || ""}
                            onValueChange={(value) => handleMaterialTypeChange(material.id, value)}
                            options={materialOptions}
                            placeholder={materialsLoading ? "Loading materials..." : "Select material type"}
                            disabled={disabled || materialsLoading}
                            loading={materialsLoading}
                          />
                        </div>

                        {/* Is this tile? Checkbox */}
                        {material.materialType && (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`is-tile-${material.id}`}
                                checked={material.isTile || false}
                                onCheckedChange={(checked) => handleTileCheckboxChange(material.id, checked as boolean)}
                                disabled={disabled}
                              />
                              <Label htmlFor={`is-tile-${material.id}`} className="text-sm font-medium">
                                Is this tile?
                              </Label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Checking this will automatically add Grout and Thinset materials to your list.
                            </p>
                          </div>
                        )}

                        {/* Tile Type - Only show if isTile is true */}
                        {material.isTile && (
                          <div className="space-y-2">
                            <Label>Is the tile Ceramic or Vinyl?</Label>
                            <RadioGroup
                              value={material.tileType || ''}
                              onValueChange={(value) => handleMaterialChange(material.id, 'tileType', value)}
                              disabled={disabled}
                              className="flex space-x-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Ceramic" id={`tile-ceramic-${material.id}`} />
                                <Label htmlFor={`tile-ceramic-${material.id}`}>Ceramic</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Vinyl" id={`tile-vinyl-${material.id}`} />
                                <Label htmlFor={`tile-vinyl-${material.id}`}>Vinyl</Label>
                              </div>
                            </RadioGroup>
                          </div>
                        )}

                        {/* Ceiling Tile Style Dropdown */}
                        {material.materialType && 
                         material.materialType.toLowerCase().includes('ceiling') && 
                         material.materialType.toLowerCase().includes('tile') && (
                          <div className="space-y-2">
                            <Label>Ceiling Tile Style</Label>
                            <Select
                              value={material.ceilingTileStyle || ''}
                              onValueChange={(value) => {
                                if (value === '__add_new__') {
                                  handleMaterialChange(material.id, 'ceilingTileStyle', value);
                                } else {
                                  handleMaterialChange(material.id, 'ceilingTileStyle', value);
                                  handleMaterialChange(material.id, 'customCeilingTileStyle', '');
                                }
                              }}
                              disabled={disabled}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select ceiling tile style" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Style 1">Style 1</SelectItem>
                                <SelectItem value="Style 2">Style 2</SelectItem>
                                <SelectItem value="Style 3">Style 3</SelectItem>
                                <SelectItem value="__add_new__">Add New Style</SelectItem>
                              </SelectContent>
                            </Select>
                            {material.ceilingTileStyle === '__add_new__' && (
                              <Input
                                placeholder="Enter new ceiling tile style"
                                value={material.customCeilingTileStyle || ''}
                                onChange={(e) => handleMaterialChange(material.id, 'customCeilingTileStyle', e.target.value)}
                                disabled={disabled}
                              />
                            )}
                          </div>
                        )}

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
                            <p className="text-sm text-muted-foreground">
                              Click "Add to Options" to make this material available for future use across all areas.
                            </p>
                          </div>
                        )}

                        {/* Location */}
                        <div className="space-y-2">
                          <Label>Location/System *</Label>
                          <Select
                            value={material.location}
                            onValueChange={(value) => handleLocationChange(material.id, value)}
                            disabled={disabled}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Ceiling">Ceiling</SelectItem>
                              <SelectItem value="Wall">Wall</SelectItem>
                              <SelectItem value="Pipe">Pipe</SelectItem>
                              <SelectItem value="Floor">Floor</SelectItem>
                              <SelectItem value="Mechanical">Mechanical</SelectItem>
                              <SelectItem value="Duct">Duct</SelectItem>
                              <SelectItem value="Electrical">Electrical</SelectItem>
                              <SelectItem value="Door">Door</SelectItem>
                              <SelectItem value="Exterior">Exterior</SelectItem>
                              <SelectItem value="Roof">Roof</SelectItem>
                              <SelectItem value="Structure">Structure</SelectItem>
                              <SelectItem value="Window">Window</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          {material.location === 'Other' && (
                            <Input
                              placeholder="Enter other location/system"
                              value={material.customLocation || ''}
                              onChange={(e) => handleMaterialChange(material.id, 'customLocation', e.target.value)}
                              disabled={disabled}
                            />
                          )}
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

                        {/* Quantity */}
                        <div className="space-y-2">
                          <Label>Quantity</Label>
                          <div className="flex space-x-2">
                            <Input
                              type="number"
                              value={material.quantity}
                              onChange={(e) => handleMaterialChange(material.id, 'quantity', e.target.value)}
                              placeholder="Enter quantity"
                              disabled={disabled}
                              className="flex-1"
                            />
                            <Select
                              value={material.quantityType}
                              onValueChange={(value) => handleMaterialChange(material.id, 'quantityType', value)}
                              disabled={disabled}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Square/ft">Square/ft</SelectItem>
                                <SelectItem value="Linear/Ft">Linear/Ft</SelectItem>
                                <SelectItem value="Each">Each</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Condition - Required */}
                        <div className="space-y-2">
                          <Label>Condition *</Label>
                          <RadioGroup
                            value={material.condition}
                            onValueChange={(value) => handleMaterialChange(material.id, 'condition', value)}
                            disabled={disabled}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Good" id={`condition-good-${material.id}`} />
                              <Label htmlFor={`condition-good-${material.id}`}>Good</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Fair" id={`condition-fair-${material.id}`} />
                              <Label htmlFor={`condition-fair-${material.id}`}>Fair</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Poor" id={`condition-poor-${material.id}`} />
                              <Label htmlFor={`condition-poor-${material.id}`}>Poor</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Unknown" id={`condition-unknown-${material.id}`} />
                              <Label htmlFor={`condition-unknown-${material.id}`}>Unknown</Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Friability */}
                        <div className="space-y-2">
                          <Label>Friability</Label>
                          <RadioGroup
                            value={material.friability}
                            onValueChange={(value) => handleMaterialChange(material.id, 'friability', value)}
                            disabled={disabled}
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Friable" id={`friable-yes-${material.id}`} />
                              <Label htmlFor={`friable-yes-${material.id}`}>Friable</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="Non-Friable" id={`friable-no-${material.id}`} />
                              <Label htmlFor={`friable-no-${material.id}`}>Non-Friable</Label>
                            </div>
                          </RadioGroup>
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

      {/* Copy Material Dialog */}
      <AlertDialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Material Already Used</AlertDialogTitle>
            <AlertDialogDescription>
              This material "{materialToCopy?.materialType}" is already used in other areas. Would you like to copy the form data from one of these areas?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            {materialToCopy && Object.entries(areaMaterials).map(([areaName, materials]) => {
              const materialName = materialToCopy.materialType;
              const hasMaterial = materials.some(m => 
                (m.isCustomMaterial ? m.customMaterialName : m.materialType) === materialName
              );
              
              if (!hasMaterial) return null;
              
              return (
                <Button
                  key={areaName}
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleCopyFromArea(areaName)}
                >
                  Copy from {areaName}
                </Button>
              );
            })}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSkipCopy}
            >
              Start Fresh (Don't Copy)
            </Button>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCopyDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}; 