import { SchemaSection } from "@/features/projectreports/ProjectReport";

export const transformSilicaSchema = (originalSchema: SchemaSection[]): SchemaSection[] => {
  return originalSchema.map(section => {
    // If this is the Silica Assessment section, transform it
    if (section.title === "Silica Assessment") {
      return {
        title: "Silica Assessment",
        fields: [
          {
            id: "silicaObserved",
            type: "radio",
            label: "Were any sources of silica observed?",
            name: "silicaObserved",
            options: ["Yes", "No"]
          },
          {
            id: "silicaMaterials",
            type: "silicaAssessment",
            label: "Silica-Containing Materials",
            name: "silicaMaterials",
            showWhen: "silicaObserved=Yes"
          }
        ],
        type: "conditional",
        condition: "areaAvailable",
        showWhen: "areaAvailable=Yes"
      };
    }
    
    // Return other sections unchanged
    return section;
  });
};

export const convertOldSilicaDataToNew = (oldData: any): any => {
  // Convert old silica data format to new format if needed
  // This function can be expanded as needed for data migration
  
  // If oldData already has silicaMaterials as an array, return it
  if (Array.isArray(oldData.silicaMaterials)) {
    return oldData.silicaMaterials;
  }
  
  // If there's old repeater data (silicaForms), convert it to the new format
  if (Array.isArray(oldData.silicaForms)) {
    return oldData.silicaForms.map((item: any) => ({
      id: item.id || `silica-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      materialType: item.materialType || "",
      customMaterialName: item.customMaterialName || "",
      location: item.materialLocation || "",
      description: item.materialDescription || "",
      photos: item.materialPhoto ? [item.materialPhoto] : [],
      sampleCollected: 'No',
      suspectedSilica: 'No',
      isCustomMaterial: item.materialType === "Other",
      timestamp: new Date().toISOString()
    }));
  }
  
  // Return empty array if no data exists
  return [];
}; 