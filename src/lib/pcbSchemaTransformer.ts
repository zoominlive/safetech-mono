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
            options: ["Yes", "No"]
          },
          {
            id: "fluorescentFixtures",
            type: "number",
            label: "How many flourescent light fixtures present?",
            name: "fluorescentFixtures",
            showWhen: "pcbObserved=Yes"
          },
          {
            id: "fixtureType",
            type: "text",
            label: "What type of number light fixtures are they?",
            name: "fixtureType",
            showWhen: "pcbObserved=Yes"
          },
          {
            id: "fixtureSize",
            type: "select",
            label: "What type of light fixtures are they?",
            name: "fixtureSize",
            options: ["T8", "T12"],
            showWhen: "pcbObserved=Yes"
          },
          {
            id: "ballastPcbPercentage",
            type: "number",
            label: "What % is estimated to have ballasts that contain PCBs?",
            name: "ballastPcbPercentage",
            showWhen: "pcbObserved=Yes"
          },
          {
            id: "assumedPcbBallastsCount",
            type: "number",
            label: "How many \"assumed PCB-containing\" light ballasts are there?",
            name: "assumedPcbBallastsCount",
            showWhen: "pcbObserved=Yes"
          },
          {
            id: "hidLightsPresent",
            type: "radio",
            label: "Was there HID lights?",
            name: "hidLightsPresent",
            options: ["Yes", "No"],
            showWhen: "pcbObserved=Yes"
          },
          {
            id: "hidLightsCount",
            type: "number",
            label: "How many?",
            name: "hidLightsCount",
            showWhen: "pcbObserved=Yes"
          },
          {
            id: "liquidFilledTransformer",
            type: "radio",
            label: "Was there a liquid-filled transformer(s)?",
            name: "liquidFilledTransformer",
            options: ["Yes", "No"],
            showWhen: "pcbObserved=Yes"
          },
          {
            id: "transformerLeakageSigns",
            type: "radio",
            label: "If yes to previous question, was there signs of leakage?",
            name: "transformerLeakageSigns",
            options: ["Yes", "No"],
            showWhen: "pcbObserved=Yes"
          },
          {
            id: "wallMountedCapacitor",
            type: "radio",
            label: "Was there a wall-mounted capacitor(s)?",
            name: "wallMountedCapacitor",
            options: ["Yes", "No"],
            showWhen: "pcbObserved=Yes"
          },
          {
            id: "capacitorLeakageSigns",
            type: "radio",
            label: "If yes to previous question, was there signs of leakage?",
            name: "capacitorLeakageSigns",
            options: ["Yes", "No"],
            showWhen: "pcbObserved=Yes"
          },
          {
            id: "recentLightingRetrofit",
            type: "radio",
            label: "Has the project area/building had a recent lighting retrofit?",
            name: "recentLightingRetrofit",
            options: ["Yes", "No"],
            showWhen: "pcbObserved=Yes"
          },
          {
            id: "additionalPcbEquipment",
            type: "radio",
            label: "Was there additional PCB containing electrical equipment?",
            name: "additionalPcbEquipment",
            options: ["Yes", "No"],
            showWhen: "pcbObserved=Yes"
          },
          {
            id: "additionalEquipmentType",
            type: "pcbAssessment",
            label: "If yes to previous question, what type of equipment?",
            name: "additionalEquipmentType",
            showWhen: "additionalPcbEquipment=Yes"
          },
          {
            id: "additionalEquipmentLocation",
            type: "repeater",
            label: "Location of additional electrical equipment?",
            name: "additionalEquipmentLocation",
            showWhen: "pcbObserved=Yes",
            fields: [
              {
                id: "ElectricalEquipment",
                type: "text",
                label: "Electrical Equipment",
                name: "ElectricalEquipment"
              },
              { 
                id: "ElectricalEquipmentLocation", 
                type: "text", 
                label: "Location",
                name: "ElectricalEquipmentLocation"
              },
              { 
                id: "ElectricalEquipmentDescription", 
                type: "text", 
                label: "Description",
                name: "ElectricalEquipmentDescription"
              },
              { 
                id: "ElectricalEquipmentPhoto", 
                type: "file", 
                label: "Photo",
                name: "ElectricalEquipmentPhoto"
              }
            ]
          },
          {
            id: "additionalEquipmentPcbType",
            type: "text",
            label: "Additional electrical equipment: Type of PCB",
            name: "additionalEquipmentPcbType",
            showWhen: "pcbObserved=Yes"
          },
          {
            id: "pcbElectricalEquipmentTable",
            type: "repeater",
            label: "Assessment for PCB-Containing Electrical Equipment",
            name: "pcbElectricalEquipmentTable",
            showWhen: "pcbObserved=Yes",
            fields: [
              { 
                id: "tableLocation", 
                type: "text", 
                label: "Location",
                name: "tableLocation"
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
        ]
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