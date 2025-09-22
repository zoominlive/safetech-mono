import { SchemaSection } from "@/features/projectreports/ProjectReport";

export const transformPcbSchema = (originalSchema: SchemaSection[]): SchemaSection[] => {
  return originalSchema.map(section => {
    // If this is the PCB Assessment section, transform it
    if (section.title === "PCB Assessment") {
      return {
        title: "PCB Assessment",
        fields: [
          {
            id: "pcbObserved",
            type: "radio",
            label: "Were any sources of polychlorinated biphenyls (PCBs) observed?",
            name: "pcbObserved",
            options: ["Yes", "No"],
            showWhen: "buildingConstructionYear=Before 1980"
          },
          {
            id: "fluorescentFixtures",
            type: "radio",
            label: "Are there fluorescent light fixtures present?",
            name: "fluorescentFixtures",
            options: ["Yes", "No"],
            showWhen: "pcbObserved=Yes and buildingConstructionYear=Before 1980"
          },
          {
            id: "fixtureType",
            type: "text",
            label: "What type of number light fixtures are they?",
            name: "fixtureType",
            showWhen: "pcbObserved=Yes and buildingConstructionYear=Before 1980"
          },
          {
            id: "fixtureSize",
            type: "select",
            label: "What type of light fixtures are they?",
            name: "fixtureSize",
            options: ["T8", "T12"],
            showWhen: "pcbObserved=Yes and buildingConstructionYear=Before 1980"
          },
          {
            id: "hidLightsPresent",
            type: "radio",
            label: "Was there HID lights?",
            name: "hidLightsPresent",
            options: ["Yes", "No"],
            showWhen: "pcbObserved=Yes and buildingConstructionYear=Before 1980"
          },
          {
            id: "hidLightsCount",
            type: "number",
            label: "How many?",
            name: "hidLightsCount",
            showWhen: "hidLightsPresent=Yes and buildingConstructionYear=Before 1980"
          },
          {
            id: "liquidFilledTransformer",
            type: "radio",
            label: "Was there a liquid-filled transformer(s)?",
            name: "liquidFilledTransformer",
            options: ["Yes", "No"],
            showWhen: "pcbObserved=Yes and buildingConstructionYear=Before 1980"
          },
          {
            id: "transformerLeakageSigns",
            type: "radio",
            label: "If yes to previous question, was there signs of leakage?",
            name: "transformerLeakageSigns",
            options: ["Yes", "No"],
            showWhen: "pcbObserved=Yes and buildingConstructionYear=Before 1980"
          },
          {
            id: "transformerLeakageLocation",
            type: "text",
            label: "If yes to previous question, where was the leakage?",
            name: "transformerLeakageLocation",
            showWhen: "pcbObserved=Yes and transformerLeakageSigns=Yes and buildingConstructionYear=Before 1980"
          },
          {
            id: "wallMountedCapacitor",
            type: "radio",
            label: "Was there a wall-mounted capacitor(s)?",
            name: "wallMountedCapacitor",
            options: ["Yes", "No"],
            showWhen: "pcbObserved=Yes and buildingConstructionYear=Before 1980"
          },
          {
            id: "capacitorLeakageSigns",
            type: "radio",
            label: "If yes to previous question, was there signs of leakage?",
            name: "capacitorLeakageSigns",
            options: ["Yes", "No"],
            showWhen: "pcbObserved=Yes and buildingConstructionYear=Before 1980"
          },
          {
            id: "recentLightingRetrofit",
            type: "radio",
            label: "Has the project area/building had a recent lighting retrofit?",
            name: "recentLightingRetrofit",
            options: ["Yes", "No"],
            showWhen: "pcbObserved=Yes and buildingConstructionYear=Before 1980"
          },
          {
            id: "pcbElectricalEquipmentTable",
            type: "repeater",
            label: "Assessment for PCB-Containing Electrical Equipment",
            name: "pcbElectricalEquipmentTable",
            showWhen: "pcbObserved=Yes and buildingConstructionYear=Before 1980",
            fields: [
              { 
                id: "tableLocation", 
                type: "text", 
                label: "Location",
                name: "tableLocation",
                showWhen: "pcbObserved=Yes"
              },
              {
                id: "tableElectricalEquipment",
                type: "text",
                label: "Electrical Equipment",
                name: "tableElectricalEquipment"
              },
              {
                id: "tableManufacturer",
                type: "text",
                label: "Manufacturer",
                name: "tableManufacturer"
              },
              {
                id: "tablePcbIdInfo",
                type: "text",
                label: "PCB Identification Information",
                name: "tablePcbIdInfo"
              },
              { 
                id: "tablePcbContent", 
                type: "text", 
                label: "PCB Content",
                name: "tablePcbContent"
              },
              { 
                id: "photoPcbContent", 
                type: "file", 
                label: "PCB Content Photo",
                name: "photoPcbContent"
              }
            ]
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

export const convertOldPcbDataToNew = (oldData: any): any => {
  // Transform old PCB data format to new format if needed
  return oldData;
}; 