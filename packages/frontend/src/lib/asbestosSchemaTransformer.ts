import { SchemaSection } from '../features/projectreports/ProjectReport';

interface AsbestosMaterial {
  id: string;
  materialType: string;
  location: string;
  description: string;
  photos: string[];
  quantity: string;
  quantityType: 'Square/ft' | 'Linear/Ft' | 'Each';
  sampleCollected: 'Yes' | 'No';
  suspectedAcm: 'Yes' | 'No';
  isCustomMaterial: boolean;
}

export const transformAsbestosSchema = (originalSchema: SchemaSection[]): SchemaSection[] => {
  return originalSchema.map(section => {
    // If this is the Asbestos Assessment section, transform it
    if (section.title === "Asbestos Assessment ") {
      return {
        title: "Asbestos Assessment",
        fields: [
          {
            id: "isAsbestosAssessed",
            type: "radio",
            label: "Is Asbestos being assessed?",
            name: "isAsbestosAssessed",
            options: ["Yes", "No"]
          },
          {
            id: "asbestosMaterials",
            type: "asbestosAssessment",
            label: "Asbestos-Containing Materials",
            name: "asbestosMaterials",
            showWhen: "isAsbestosAssessed=Yes"
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

export const convertOldAsbestosDataToNew = (oldData: Record<string, any>): AsbestosMaterial[] => {
  const materials: AsbestosMaterial[] = [];
  
  // Helper function to create material from old data
  const createMaterial = (
    materialType: string,
    locationKey: string,
    descriptionKey: string,
    photoKey: string,
    quantityKey?: string
  ): AsbestosMaterial | null => {
    const location = oldData[locationKey];
    const description = oldData[descriptionKey];
    const photos = photoKey && Array.isArray(oldData[photoKey])
      ? oldData[photoKey]
      : (photoKey && typeof oldData[photoKey] === 'string' && oldData[photoKey].startsWith('http'))
        ? [oldData[photoKey]]
        : [];
    const quantity = quantityKey ? (oldData[quantityKey] || '') : '';
    
    if (location || description || photos.length > 0) {
      return {
        id: `material-${Date.now()}-${Math.random()}`,
        materialType,
        location: location || '',
        description: description || '',
        photos,
        quantity,
        quantityType: 'Square/ft', // Default to Square/ft for backward compatibility
        sampleCollected: 'No', // Default, would need to be determined from lab results
        suspectedAcm: 'No', // Default
        isCustomMaterial: false,
      };
    }
    
    return null;
  };

  // Map old fields to new materials
  const materialMappings = [
    {
      type: "Sprayed Fireproofing",
      locationKey: "sprayedFireproofingLocationDetails",
      descriptionKey: "sprayedFireproofingDescriptionDetails",
      photoKey: "sprayedFireproofingPhoto",
      condition: oldData.hasSprayedFireproofing === "Yes"
    },
    {
      type: "Blown Insulation",
      locationKey: "sprayedInsulationLocationDetails",
      descriptionKey: "sprayedInsulationDescriptionDetails",
      photoKey: "sprayedInsulationPhoto",
      condition: oldData.hasSprayedInsulation === "Yes"
    },
    {
      type: "Loose Fill / Vermiculite Insulation",
      locationKey: "haslooseFillOrvermiculiteInsulationLocationDetails",
      descriptionKey: "haslooseFillOrvermiculiteInsulationDescriptionDetails",
      photoKey: "haslooseFillOrvermiculiteInsulationPhoto",
      condition: oldData.haslooseFillOrvermiculiteInsulation === "Yes"
    },
    {
      type: "Mechanical Pipe Insulation – Straights",
      locationKey: "mechanicalPipeInsulationStraightsLocationDetails",
      descriptionKey: "mechanicalPipeInsulationStraightsDescriptionDetails",
      photoKey: "mechanicalPipeInsulationStraightsPhoto",
      condition: oldData.mechanicalPipeInsulationStraights === "Yes"
    },
    {
      type: "Mechanical Pipe Insulation – Fittings",
      locationKey: "mechanicalPipeInsulationFittingsLocationDetails",
      descriptionKey: "mechanicalPipeInsulationFittingsDescriptionDetails",
      photoKey: "mechanicalPipeInsulationFittingsPhoto",
      condition: oldData.mechanicalPipeInsulationFittings === "Yes"
    },
    {
      type: "HVAC Duct Insulation",
      locationKey: "hvacDuctInsulationLocationDetails",
      descriptionKey: "hvacDuctInsulationDescriptionDetails",
      photoKey: "hvacDuctInsulationPhoto",
      condition: oldData.hvacDuctInsulation === "Yes"
    },
    {
      type: "Breeching / Exhaust Insulation",
      locationKey: "breechingExhaustInsulationLocationDetails",
      descriptionKey: "breechingExhaustInsulationDescriptionDetails",
      photoKey: "breechingExhaustInsulationPhoto",
      condition: oldData.breechingExhaustInsulation === "Yes"
    },
    {
      type: "Tank Insulation",
      locationKey: "tankInsulationLocationDetails",
      descriptionKey: "tankInsulationDescriptionDetails",
      photoKey: "tankInsulationPhoto",
      condition: oldData.tankInsulation === "Yes"
    },
    {
      type: "Boiler Insulation",
      locationKey: "boilerInsulationLocationDetails",
      descriptionKey: "boilerInsulationDescriptionDetails",
      photoKey: "boilerInsulationPhoto",
      condition: oldData.boilerInsulation === "Yes"
    },
    {
      type: "Other Mechanical Equipment Insulation",
      locationKey: "otherMechanicalEquipmentInsulationLocationDetails",
      descriptionKey: "otherMechanicalEquipmentInsulationDescriptionDetails",
      photoKey: "otherMechanicalEquipmentInsulationPhoto",
      condition: oldData.otherMechanicalEquipmentInsulation === "Yes"
    },
    {
      type: "Sprayed Texture / Stucco Finishes",
      locationKey: "sprayedTextureStuccoFinishesLocationDetails",
      descriptionKey: "sprayedTextureStuccoFinishesDescriptionDetails",
      photoKey: "sprayedTextureStuccoFinishesPhoto",
      condition: oldData.sprayedTextureStuccoFinishes === "Yes"
    },
    {
      type: "Plaster Finishes",
      locationKey: "plasterFinishesLocationDetails",
      descriptionKey: "plasterFinishesDescriptionDetails",
      photoKey: "plasterFinishesPhoto",
      condition: oldData.plasterFinishes === "Yes"
    },
    {
      type: "Drywall Joint Compound",
      locationKey: "drywallJointCompoundLocationDetails",
      descriptionKey: "drywallJointCompoundDescriptionDetails",
      photoKey: "drywallJointCompoundPhoto",
      condition: oldData.drywallJointCompound === "Yes"
    },
    {
      type: "Lay-in Acoustic Ceiling Tiles",
      locationKey: "layInAcousticCeilingTilesLocationDetails",
      descriptionKey: "layInAcousticCeilingTilesDescriptionDetails",
      photoKey: "layInAcousticCeilingTilesPhoto",
      condition: oldData.layInAcousticCeilingTiles === "Yes"
    },
    {
      type: "Glued-on Acoustic Ceiling Tiles",
      locationKey: "gluedOnAcousticCeilingTilesLocationDetails",
      descriptionKey: "gluedOnAcousticCeilingTilesDescriptionDetails",
      photoKey: "gluedOnAcousticCeilingTilesPhoto",
      condition: oldData.gluedOnAcousticCeilingTiles === "Yes"
    },
    {
      type: "Cement Ceiling Panels",
      locationKey: "cementCeilingPanelsLocationDetails",
      descriptionKey: "cementCeilingPanelsDescriptionDetails",
      photoKey: "cementCeilingPanelsPhoto",
      condition: oldData.cementCeilingPanels === "Yes"
    },
    {
      type: "Vinyl Floor Tiles",
      locationKey: "vinylFloorTilesLocationDetails",
      descriptionKey: "vinylFloorTilesDescriptionDetails",
      photoKey: "vinylFloorTilesPhoto",
      condition: oldData.vinylFloorTiles === "Yes"
    },
    {
      type: "Vinyl Sheet Flooring",
      locationKey: "vinylSheetFlooringLocationDetails",
      descriptionKey: "vinylSheetFlooringDescriptionDetails",
      photoKey: "vinylSheetFlooringPhoto",
      condition: oldData.vinylSheetFlooring === "Yes"
    },
    {
      type: "Mastic (Flooring)",
      locationKey: "flooringMasticLocationDetails",
      descriptionKey: "flooringMasticDescriptionDetails",
      photoKey: "flooringMasticPhoto",
      condition: oldData.flooringMastic === "Yes"
    },
    {
      type: "Asbestos Cement Piping",
      locationKey: "asbestosCementPipingLocationDetails",
      descriptionKey: "asbestosCementPipingDescriptionDetails",
      photoKey: "asbestosCementPipingPhoto",
      condition: oldData.asbestosCementPiping === "Yes"
    },
    {
      type: "Asbestos Cement Roofing, Siding, Wallboard",
      locationKey: "asbestosCementRoofingSidingWallboardLocationDetails",
      descriptionKey: "asbestosCementRoofingSidingWallboardDescriptionDetails",
      photoKey: "asbestosCementRoofingSidingWallboardPhoto",
      condition: oldData.asbestosCementRoofingSidingWallboard === "Yes"
    },
    {
      type: "Other Cement Products (Asbestos Cement)",
      locationKey: "otherAsbestosCementProductsLocationDetails",
      descriptionKey: "otherAsbestosCementProductsDescriptionDetails",
      photoKey: "otherAsbestosCementProductsPhoto",
      condition: oldData.otherAsbestosCementProducts === "Yes"
    },
    {
      type: "Exterior Building Caulking",
      locationKey: "exteriorBuildingCaulkingLocationDetails",
      descriptionKey: "exteriorBuildingCaulkingDescriptionDetails",
      photoKey: "exteriorBuildingCaulkingPhoto",
      condition: oldData.exteriorBuildingCaulking === "Yes"
    },
    {
      type: "Exterior Building Shingles",
      locationKey: "exteriorBuildingShinglesLocationDetails",
      descriptionKey: "exteriorBuildingShinglesDescriptionDetails",
      photoKey: "exteriorBuildingShinglesPhoto",
      condition: oldData.exteriorBuildingShingles === "Yes"
    },
    {
      type: "Exterior Building Roof Membrane",
      locationKey: "exteriorBuildingRoofMembraneLocationDetails",
      descriptionKey: "exteriorBuildingRoofMembraneDescriptionDetails",
      photoKey: "exteriorBuildingRoofMembranePhoto",
      condition: oldData.exteriorBuildingRoofMembrane === "Yes"
    },
    {
      type: "Miscellaneous Mastic",
      locationKey: "miscMaterialsMasticLocationDetails",
      descriptionKey: "miscMaterialsMasticDescriptionDetails",
      photoKey: "miscMaterialsMasticPhoto",
      condition: oldData.miscMaterialsMastic === "Yes"
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

  // Handle suspect ACMs from the old format
  if (oldData.miscMaterialsSuspectAcm === "Yes" && Array.isArray(oldData.miscMaterialsSuspectAcmDetails)) {
    oldData.miscMaterialsSuspectAcmDetails.forEach((suspectAcm: any, index: number) => {
      const material: AsbestosMaterial = {
        id: `suspect-acm-${Date.now()}-${index}`,
        materialType: "Suspect ACM",
        location: suspectAcm.miscMaterialsSuspectAcmLocationDetails || '',
        description: suspectAcm.miscMaterialsSuspectAcmDescriptionDetails || '',
        photos: Array.isArray(suspectAcm.miscMaterialsSuspectAcmPhoto) ? suspectAcm.miscMaterialsSuspectAcmPhoto : 
                (typeof suspectAcm.miscMaterialsSuspectAcmPhoto === 'string' && suspectAcm.miscMaterialsSuspectAcmPhoto.startsWith('http')) ? [suspectAcm.miscMaterialsSuspectAcmPhoto] : [],
        quantity: '',
        quantityType: 'Square/ft',
        sampleCollected: 'No',
        suspectedAcm: 'Yes',
        isCustomMaterial: true,
      };
      materials.push(material);
    });
  }

  return materials;
};

export const convertNewAsbestosDataToOld = (materials: AsbestosMaterial[]): Record<string, any> => {
  const oldData: Record<string, any> = {
    isAsbestosAssessed: materials.length > 0 ? "Yes" : "No"
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
    
    // Set quantity if available
    if (material.quantity) {
      setOldField(`${materialType}Quantity`, material.quantity);
      setOldField(`${materialType}QuantityType`, material.quantityType);
    }
  });

  return oldData;
}; 