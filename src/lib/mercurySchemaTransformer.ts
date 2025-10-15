import { SchemaSection } from "@/features/projectreports/ProjectReport";

export const transformMercurySchema = (originalSchema: SchemaSection[]): SchemaSection[] => {
  return originalSchema.map(section => {
    // If this is the Mercury Assessment section, transform it
    if (section.title === "Mercury Assessment") {
      return {
        title: "Mercury Assessment",
        fields: [
          {
            id: "mercuryObserved",
            type: "radio",
            label: "Were any sources of mercury observed?",
            name: "mercuryObserved",
            options: ["Yes", "No"]
          },
          {
            id: "mercuryMaterials",
            type: "mercuryAssessment",
            label: "Mercury-Containing Materials",
            name: "mercuryMaterials",
            showWhen: "mercuryObserved=Yes"
          },
          // {
          //   id: "hasLamps",
          //   type: "radio",
          //   label: "Are there lamps?",
          //   name: "hasLamps",
          //   showWhen: "mercuryObserved=Yes",
          //   options: ["Yes", "No"]
          // },
          {
            id: "lampCount",
            type: "select",
            label: "How many lamps?",
            options: [
              "<=15",
              ">15",
              "None"
              ],
            showWhen: "mercuryObserved=Yes",
            name: "lampCount"
          },
          {
            id: "areThereVials",
            type: "radio",
            label: "Are there vials?",
            name: "areThereVials",
            showWhen: "mercuryObserved=Yes",
            options: ["Yes", "No"]
          },
          {
            id: "willTheMercuryContainingEquipmentBeRemoved",
            type: "select",
            label: "Will the mercury-containing equipment be removed/disturbed?",
            name: "willTheMercuryContainingEquipmentBeRemoved",
            showWhen: "mercuryObserved=Yes",
            options: ["Removed", "Disturbed", "Unknown"]
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

export const convertOldMercuryDataToNew = (oldData: any): any => {
  // Convert old mercury data format to new format if needed
  // This function can be expanded as needed for data migration
  
  // If oldData already has mercuryMaterials as an array, return it
  if (Array.isArray(oldData.mercuryMaterials)) {
    return oldData.mercuryMaterials;
  }
  
  // If there's old repeater data (mercuryForms), convert it to the new format
  if (Array.isArray(oldData.mercuryForms)) {
    return oldData.mercuryForms.map((item: any) => ({
      id: item.id || `mercury-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      materialType: item.materialType || "",
      customMaterialName: item.customMaterialName || "",
      location: item.materialLocation || "",
      description: item.materialDescription || "",
      photos: item.materialPhoto ? [item.materialPhoto] : [],
      sampleCollected: 'No',
      suspectedMercury: 'No',
      isCustomMaterial: item.materialType === "Other",
      timestamp: new Date().toISOString()
    }));
  }
  
  // Return empty array if no data exists
  return [];
}; 