import { SchemaSection } from "@/features/projectreports/ProjectReport";

export const transformPestInfestationSchema = (
  originalSchema: SchemaSection[]
): SchemaSection[] => {
  return originalSchema.map((section) => {
    if (section.title === "Pest Infestation") {
      return {
        title: "Pest Infestation",
        showWhen: "areaAvailable=Yes",
        fields: [
          {
            id: "pestInfestationObserved",
            name: "pestInfestationObserved",
            type: "radio",
            label: "Was there evidence of pest infestation observed?",
            options: ["Yes", "No"],
          },
          {
            id: "typeOfInfestation",
            name: "typeOfInfestation",
            type: "conditional",
            label: "Type of infestation?",
            showWhen: "pestInfestationObserved=Yes",
            fields: [
              {
                id: "infestationTypeSelect",
                name: "infestationTypeSelect",
                type: "multiselect",
                label: "Select Type",
                options: ["Mouse"],
              },
              {
                id: "infestationTypeOther",
                name: "infestationTypeOther",
                type: "text",
                label: "Please specify other type",
                showWhen: "infestationTypeSelect=Other",
              },
              {
                id: "infestationTypePhoto",
                name: "infestationTypePhoto",
                type: "file",
                label: "Photo",
              },
            ],
          },
          {
            id: "droppingsObserved",
            name: "droppingsObserved",
            type: "radio",
            label: "Were droppings observed?",
            options: ["Yes", "No"],
            showWhen: "pestInfestationObserved=Yes",
            fields: [
              {
                id: "droppingsObservedPhoto",
                name: "droppingsObservedPhoto",
                type: "file",
                label: "Photo",
                showWhen: "droppingsObserved=Yes",
              },
            ],
          },
          {
            id: "droppingsLocation",
            name: "droppingsLocation",
            type: "text",
            label: "Location of droppings?",
            showWhen: "droppingsObserved=Yes",
          },
          {
            id: "deadAnimals",
            name: "deadAnimals",
            type: "repeater",
            label: "Were dead animals found?",
            showWhen: "pestInfestationObserved=Yes",
            fields: [
              {
                id: "animalName",
                name: "animalName",
                type: "text",
                label: "Name",
                required: true,
              },
              {
                id: "animalDescription",
                name: "animalDescription",
                type: "text",
                label: "Description",
                required: true,
              },
              {
                id: "animalLocation",
                name: "animalLocation",
                type: "text",
                label: "Location",
                required: true,
              },
              {
                id: "animalPhoto",
                name: "animalPhoto",
                type: "file",
                label: "Photo",
                required: true,
              },
            ],
          },
        ],
      } as SchemaSection;
    }

    return section;
  });
};


