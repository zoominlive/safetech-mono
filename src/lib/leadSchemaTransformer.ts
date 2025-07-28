import { SchemaSection } from '../features/projectreports/ProjectReport';

interface LeadMaterial {
  id: string;
  materialType: string;
  location: string;
  description: string;
  photos: string[];
  sampleCollected: 'Yes' | 'No';
  suspectedLead: 'Yes' | 'No';
  isCustomMaterial: boolean;
}

export const transformLeadSchema = (originalSchema: SchemaSection[]): SchemaSection[] => {
  return originalSchema.map(section => {
    // If this is the Lead Assessment section, transform it
    if (section.title === "Lead Assessment") {
      return {
        title: "Lead Assessment",
        fields: [
          {
            id: "isLeadAssessed",
            type: "radio",
            label: "Is Lead being assessed?",
            name: "isLeadAssessed",
            options: ["Yes", "No"]
          },
          {
            id: "leadMaterials",
            type: "leadAssessment",
            label: "Lead-Containing Materials",
            name: "leadMaterials",
            showWhen: "isLeadAssessed=Yes"
          },
          {
            id: "isThereEmergencyLighting",
            type: "radio",
            name: "isThereEmergencyLighting",
            label: "Is there emergency lighting?",
            showWhen: "isLeadAssessed=Yes",
            options: ["Yes", "No"]
          }
        ] 
      };
    }
    
    // Return other sections unchanged
    return section;
  });
};

export const convertOldLeadDataToNew = (oldData: Record<string, any>): LeadMaterial[] => {
  const materials: LeadMaterial[] = [];
  
  // Helper function to create material from old data
  const createMaterial = (
    materialType: string,
    locationKey: string,
    descriptionKey: string,
    photoKey: string
  ): LeadMaterial | null => {
    const location = oldData[locationKey];
    const description = oldData[descriptionKey];
    const photos = photoKey && Array.isArray(oldData[photoKey])
      ? oldData[photoKey]
      : (photoKey && typeof oldData[photoKey] === 'string' && oldData[photoKey].startsWith('http'))
        ? [oldData[photoKey]]
        : [];
    
    if (location || description || photos.length > 0) {
      return {
        id: `material-${Date.now()}-${Math.random()}`,
        materialType,
        location: location || '',
        description: description || '',
        photos,
        sampleCollected: 'No', // Default, would need to be determined from lab results
        suspectedLead: 'No', // Default
        isCustomMaterial: false,
      };
    }
    
    return null;
  };

  // Map old fields to new materials - these would be specific to lead assessment fields
  const materialMappings = [
    {
      type: "Lead-Based Paint",
      locationKey: "leadBasedPaintLocationDetails",
      descriptionKey: "leadBasedPaintDescriptionDetails",
      photoKey: "leadBasedPaintPhoto",
      condition: oldData.hasLeadBasedPaint === "Yes"
    },
    {
      type: "Lead Dust",
      locationKey: "leadDustLocationDetails",
      descriptionKey: "leadDustDescriptionDetails",
      photoKey: "leadDustPhoto",
      condition: oldData.hasLeadDust === "Yes"
    },
    {
      type: "Lead Soil",
      locationKey: "leadSoilLocationDetails",
      descriptionKey: "leadSoilDescriptionDetails",
      photoKey: "leadSoilPhoto",
      condition: oldData.hasLeadSoil === "Yes"
    },
    {
      type: "Lead Water",
      locationKey: "leadWaterLocationDetails",
      descriptionKey: "leadWaterDescriptionDetails",
      photoKey: "leadWaterPhoto",
      condition: oldData.hasLeadWater === "Yes"
    },
    {
      type: "Lead Paint Chips",
      locationKey: "leadPaintChipsLocationDetails",
      descriptionKey: "leadPaintChipsDescriptionDetails",
      photoKey: "leadPaintChipsPhoto",
      condition: oldData.hasLeadPaintChips === "Yes"
    },
    {
      type: "Lead Paint Dust",
      locationKey: "leadPaintDustLocationDetails",
      descriptionKey: "leadPaintDustDescriptionDetails",
      photoKey: "leadPaintDustPhoto",
      condition: oldData.hasLeadPaintDust === "Yes"
    },
    {
      type: "Lead Paint Residue",
      locationKey: "leadPaintResidueLocationDetails",
      descriptionKey: "leadPaintResidueDescriptionDetails",
      photoKey: "leadPaintResiduePhoto",
      condition: oldData.hasLeadPaintResidue === "Yes"
    },
    {
      type: "Lead Paint Debris",
      locationKey: "leadPaintDebrisLocationDetails",
      descriptionKey: "leadPaintDebrisDescriptionDetails",
      photoKey: "leadPaintDebrisPhoto",
      condition: oldData.hasLeadPaintDebris === "Yes"
    },
    {
      type: "Lead Paint Waste",
      locationKey: "leadPaintWasteLocationDetails",
      descriptionKey: "leadPaintWasteDescriptionDetails",
      photoKey: "leadPaintWastePhoto",
      condition: oldData.hasLeadPaintWaste === "Yes"
    },
    {
      type: "Lead Paint Scrapings",
      locationKey: "leadPaintScrapingsLocationDetails",
      descriptionKey: "leadPaintScrapingsDescriptionDetails",
      photoKey: "leadPaintScrapingsPhoto",
      condition: oldData.hasLeadPaintScrapings === "Yes"
    },
    {
      type: "Lead Paint Flakes",
      locationKey: "leadPaintFlakesLocationDetails",
      descriptionKey: "leadPaintFlakesDescriptionDetails",
      photoKey: "leadPaintFlakesPhoto",
      condition: oldData.hasLeadPaintFlakes === "Yes"
    },
    {
      type: "Lead Paint Particles",
      locationKey: "leadPaintParticlesLocationDetails",
      descriptionKey: "leadPaintParticlesDescriptionDetails",
      photoKey: "leadPaintParticlesPhoto",
      condition: oldData.hasLeadPaintParticles === "Yes"
    }
  ];

  // Process each mapping
  materialMappings.forEach(mapping => {
    if (mapping.condition) {
      const material = createMaterial(
        mapping.type,
        mapping.locationKey,
        mapping.descriptionKey,
        mapping.photoKey
      );
      if (material) {
        materials.push(material);
      }
    }
  });

  // Handle suspect lead materials from the old format
  if (oldData.miscMaterialsSuspectLead === "Yes" && Array.isArray(oldData.miscMaterialsSuspectLeadDetails)) {
    oldData.miscMaterialsSuspectLeadDetails.forEach((suspectLead: any, index: number) => {
      const material: LeadMaterial = {
        id: `suspect-lead-${Date.now()}-${index}`,
        materialType: "Suspect Lead Material",
        location: suspectLead.miscMaterialsSuspectLeadLocationDetails || '',
        description: suspectLead.miscMaterialsSuspectLeadDescriptionDetails || '',
        photos: Array.isArray(suspectLead.miscMaterialsSuspectLeadPhoto) ? suspectLead.miscMaterialsSuspectLeadPhoto : 
                (typeof suspectLead.miscMaterialsSuspectLeadPhoto === 'string' && suspectLead.miscMaterialsSuspectLeadPhoto.startsWith('http')) ? [suspectLead.miscMaterialsSuspectLeadPhoto] : [],
        sampleCollected: 'No',
        suspectedLead: 'Yes',
        isCustomMaterial: true,
      };
      materials.push(material);
    });
  }

  return materials;
};

export const convertNewLeadDataToOld = (materials: LeadMaterial[]): Record<string, any> => {
  const oldData: Record<string, any> = {
    isLeadAssessed: materials.length > 0 ? "Yes" : "No"
  };

  // Helper function to set old field values
  const setOldField = (fieldName: string, value: any) => {
    if (value) {
      oldData[fieldName] = value;
    }
  };

  // Map new materials back to old format
  materials.forEach((material) => {
    const materialType = material.materialType.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Set the main "Yes/No" field
    setOldField(`has${materialType}`, "Yes");
    
    // Set location, description, and photo fields
    setOldField(`${materialType}LocationDetails`, material.location);
    setOldField(`${materialType}DescriptionDetails`, material.description);
    setOldField(`${materialType}Photo`, material.photos);
  });

  return oldData;
}; 