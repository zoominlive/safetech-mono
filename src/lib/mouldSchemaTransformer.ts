import { SchemaSection } from "@/features/projectreports/ProjectReport";

export const transformMouldSchema = (originalSchema: SchemaSection[]): SchemaSection[] => {
  return originalSchema.map(section => {
    // If this is the Assessment for Mould Contamination section, transform it
    if (section.title === "Assessment for Mould Contamination") {
      return {
        title: "Assessment for Mould Contamination",
        fields: [
          {
            id: "moldGrowth",
            type: "radio",
            label: "Visible evidence of obvious mould growth on building finishes?",
            options: ["Yes", "No"],
            name: "moldGrowth",
            fields: [
                {
                  id: "moldGrowthPhoto",
                  type: "file",
                  label: "Add Photo",
                  name: "moldGrowthPhoto",
                  showWhen: "moldGrowth=Yes"
                }
            ]
          },
          {
            id: "waterStaining",
            type: "radio",
            showWhen: "moldGrowth=Yes",
            label: "Visible evidence of any significant water staining or discolouration to building finishes?",
            options: ["Yes", "No"],
            name: "waterStaining",
            fields: [
              {
                id: "waterStrainingPhoto",
                type: "file",
                label: "Add Photo",
                name: "waterStrainingPhoto",
                showWhen: "waterStaining=Yes"
              }
            ]
          },
          {
            id: "moldImpact",
            type: "radio",
            label: "Will the mould be impacted/removed/is within scope?",
            options: ["Yes", "No"],
            name: "moldImpact",
            showWhen: "moldGrowth=Yes"
          },
          {
            id: "mouldMaterials",
            type: "mouldAssessment",
            label: "Mould-Containing Materials",
            name: "mouldMaterials",
            showWhen: "moldGrowth=Yes"
          }
        ]
      };
    }
    
    // Return other sections unchanged
    return section;
  });
};

export const convertOldMouldDataToNew = (oldData: any): any => {
  // Convert old mould data format to new format if needed
  // This function can be expanded as needed for data migration
  
  // If oldData already has mouldMaterials as an array, return it
  if (Array.isArray(oldData.mouldMaterials)) {
    return oldData.mouldMaterials;
  }
  
  // If there's old repeater data (mouldContaminationDetails), convert it to the new format
  if (Array.isArray(oldData.mouldContaminationDetails)) {
    return oldData.mouldContaminationDetails.map((item: any) => ({
      id: item.id || `mould-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      materialType: item.materialType || "",
      customMaterialName: item.customMaterialName || "",
      location: item.mouldLocation || "",
      description: item.mouldDescription || "",
      photos: item.mouldPhoto ? [item.mouldPhoto] : [],
      sampleCollected: 'No',
      suspectedMould: 'No',
      isCustomMaterial: item.materialType === "Other",
      timestamp: new Date().toISOString()
    }));
  }
  
  // Return empty array if no data exists
  return [];
}; 