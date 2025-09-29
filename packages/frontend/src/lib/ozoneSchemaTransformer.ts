import { SchemaSection } from "@/features/projectreports/ProjectReport";

export const transformOzoneSchema = (
  originalSchema: SchemaSection[]
): SchemaSection[] => {
  return originalSchema.map((section) => {
    if (section.title === "Ozone Depleting Substances") {
      return {
        title: "Ozone Depleting Substances",
        showWhen: "areaAvailable=Yes",
        fields: [
          {
            id: "odsObserved",
            name: "odsObserved",
            type: "radio",
            label:
              "Were any equipment suspected to contain ODS/GWS observed in the subject building?",
            options: ["Yes", "No"],
          },
          {
            id: "odsGwsAssessmentTable",
            name: "odsGwsAssessmentTable",
            type: "repeater",
            label: "Assessment for Ozone-Depleting and Global Warming Substances",
            showWhen: "odsObserved=Yes",
            fields: [
              { id: "tableLocation", name: "tableLocation", type: "text", label: "Location" },
              {
                id: "tableEquipmentManufacturerType",
                name: "tableEquipmentManufacturerType",
                type: "select",
                label: "Equipment Manufacturer and Type",
                options: [
                  "Air Conditioning Unit",
                  "Walk-In Fridge",
                  "Walk-In Freezer",
                  "Chiller",
                  "Other",
                ],
              },
              {
                id: "tableEquipmentManufacturerTypeOther",
                name: "tableEquipmentManufacturerTypeOther",
                type: "text",
                label: "Please specify other equipment type",
                showWhen: "tableEquipmentManufacturerType=Other",
              },
              {
                id: "tableRefrigerantTypeQuantity",
                name: "tableRefrigerantTypeQuantity",
                type: "text",
                label: "Type and Quantity of Refrigerant or Fire Extinguishing Agent",
              },
              {
                id: "tableOdsGwsClassification",
                name: "tableOdsGwsClassification",
                type: "text",
                label: "ODS/GWS Classification",
              },
            ],
          },
          {
            id: "refrigerantType",
            name: "refrigerantType",
            type: "select",
            label: "What type of refrigerant?",
            options: [
              "CFC-11",
              "CFC-12",
              "CFC-13",
              "CFC-111",
              "CFC-112",
              "CFC-113",
              "CFC-114",
              "CFC-115",
              "CFC-211",
              "CFC-212",
              "CFC-213",
              "CFC-214",
              "CFC-215",
              "CFC-216",
              "CFC-217",
              "HCFC-21",
              "HCFC-22",
              "HCFC-31",
              "HCFC-121",
              "HCFC-122",
              "HCFC-123",
              "HCFC-124",
              "HCFC-131",
              "HCFC-132",
              "HCFC-133",
              "HCFC-141",
              "HCFC-142",
              "HCFC-151",
              "HCFC-221",
              "HCFC-222",
              "HCFC-223",
              "HCFC-224",
              "HCFC-225",
              "HCFC-226",
              "HCFC-231",
              "HCFC-232",
              "HCFC-233",
              "HCFC-234",
              "HCFC-235",
              "HCFC-241",
              "HCFC-242",
              "HCFC-243",
              "HCFC-244",
              "HCFC-251",
              "HCFC-252",
              "HCFC-253",
              "HCFC-261",
              "HCFC-262",
              "HCFC-271",
            ],
            showWhen: "odsObserved=Yes and hasAirConditioning=Yes",
          },
          {
            id: "refrigerantPounds",
            name: "refrigerantPounds",
            type: "number",
            label: "Approximately how many pounds of refrigerant?",
            showWhen: "odsObserved=Yes",
          },
          {
            id: "fireExtinguishingEquipment",
            name: "fireExtinguishingEquipment",
            type: "radio",
            label: "Is there fire extinguishing equipment?",
            options: ["Yes", "No"],
            showWhen: "odsObserved=Yes",
          },
        ],
      } as SchemaSection;
    }

    return section;
  });
};
