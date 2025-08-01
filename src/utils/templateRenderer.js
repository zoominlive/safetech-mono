const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

/**
 * Render HTML template with data using Handlebars
 * @param {string} templateName - Name of the template file (without extension)
 * @param {object} data - Data to inject into the template
 * @returns {string} - Rendered HTML string
 */
const renderTemplate = (templateName, data) => {
  try {
    const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.html`);
    
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template file not found: ${templatePath}`);
    }
    
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    const template = Handlebars.compile(templateContent);
    
    return template(data);
  } catch (error) {
    console.error('Error rendering template:', error);
    throw error;
  }
};

/**
 * Parse JSON string safely
 * @param {string} jsonString - JSON string to parse
 * @returns {object} - Parsed object or empty object if invalid
 */
const safeJsonParse = (jsonString) => {
  try {
    if (typeof jsonString === 'string') {
      return JSON.parse(jsonString);
    }
    return jsonString || {};
  } catch (error) {
    console.error('Error parsing JSON:', error);
    return {};
  }
};

/**
 * Extract area details from answers
 * @param {object} answers - Parsed answers object
 * @returns {array} - Array of area details (with assessments merged)
 */
const extractAreaDetails = (answers) => {
  if (!answers || !answers.areaDetails) {
    return [];
  }
  return answers.areaDetails.map((area, index) => {
    // Merge assessments into the area object for easier access
    const merged = { ...area, ...(area.assessments || {}) };
    delete merged.assessments;
    return merged;
  });
};

/**
 * Format assessment responses for display
 * @param {object} areaData - Area assessment data
 * @returns {array} - Formatted assessment responses
 */
const formatAssessmentResponses = (areaData) => {
  const responses = [];
  
  // Project Information
  responses.push({
    question: "Project Name",
    response: areaData.projectName || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Project Number",
    response: areaData.projectNumber || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Project Address",
    response: areaData.projectAddress || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Client Company Name",
    response: areaData.clientCompanyName || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Client Address",
    response: areaData.clientAddress || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Area Name",
    response: areaData.name || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Area Description",
    response: areaData.areaDescription || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Area Square Feet",
    response: areaData.areaSquareFeet || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Specific Location",
    response: areaData.specificLocation || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Inspection Date",
    response: areaData.inspectionDate || "N/A",
    notes: ""
  });
  
  // Contact Information
  responses.push({
    question: "Contact Name",
    response: areaData.contactName || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Contact Email",
    response: areaData.contactEmail || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Contact Phone",
    response: areaData.contactPhone || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Contact Position",
    response: areaData.contactPosition || "N/A",
    notes: ""
  });
  
  // Project Management
  responses.push({
    question: "Project Manager Name",
    response: areaData.pmName || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Project Manager Email",
    response: areaData.pmEmail || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Project Manager Phone",
    response: areaData.pmPhone || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Start Date",
    response: areaData.startDate || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "End Date",
    response: areaData.endDate || "N/A",
    notes: ""
  });
  
  // Assessment Results
  responses.push({
    question: "Asbestos Assessment",
    response: areaData.isAsbestosAssessed || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Lead Assessment",
    response: areaData.isLeadAssessed || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Silica Observed",
    response: areaData.silicaObserved || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Mercury Observed",
    response: areaData.mercuryObserved || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "PCB Observed",
    response: areaData.pcbObserved || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Mold Growth",
    response: areaData.moldGrowth || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Water Staining",
    response: areaData.waterStaining || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Pest Infestation",
    response: areaData.pestInfestationObserved || "N/A",
    notes: areaData.infestationTypeSelect ? `Type: ${areaData.infestationTypeSelect}` : ""
  });
  
  responses.push({
    question: "Droppings Observed",
    response: areaData.droppingsObserved || "N/A",
    notes: ""
  });
  
  // Materials Assessment
  responses.push({
    question: "Vinyl Floor Tiles",
    response: areaData.vinyleFloorTiles || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Vinyl Sheet Flooring",
    response: areaData.vinyleSheetFlooring || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Flooring Mastic",
    response: areaData.flooringMastic || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Drywall Joint Compound",
    response: areaData.drywallJointCompound || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Plaster Finishes",
    response: areaData.plasterFinishes || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Sprayed Fireproofing",
    response: areaData.hasSprayedFireproofing || "N/A",
    notes: areaData.sprayedFireproofingDetails || ""
  });
  
  responses.push({
    question: "Sprayed Insulation",
    response: areaData.hasSprayedInsulation || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Loose Fill/Vermiculite Insulation",
    response: areaData.haslooseFillOrvermiculiteInsulation || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "HVAC Duct Insulation",
    response: areaData.hvacDuctInsulation || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Boiler Insulation",
    response: areaData.boilerInsulation || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Tank Insulation",
    response: areaData.tankInsulation || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Breeching/Exhaust Insulation",
    response: areaData.breechingExhaustInsulation || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Mechanical Pipe Insulation (Straights)",
    response: areaData.mechanicalPipeInsulationStraights || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Mechanical Pipe Insulation (Fittings)",
    response: areaData.mechanicalPipeInsulationFittings || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Other Mechanical Equipment Insulation",
    response: areaData.otherMechanicalEquipmentInsulation || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Asbestos Cement Piping",
    response: areaData.asbestosCementPiping || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Asbestos Cement Roofing/Siding/Wallboard",
    response: areaData.asbestosCementRoofingSidingWallboard || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Other Asbestos Cement Products",
    response: areaData.otherAsbestosCementProducts || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Lay-in Acoustic Ceiling Tiles",
    response: areaData.layInAcousticCeilingTiles || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Glued-on Acoustic Ceiling Tiles",
    response: areaData.gluedOnAcousticCeilingTiles || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Cement Ceiling Panels",
    response: areaData.cementCeilingPanels || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Sprayed Texture/Stucco Finishes",
    response: areaData.sprayedTextureStuccoFinishes || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Exterior Building Caulking",
    response: areaData.exteriorBuildingCaulking || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Exterior Building Shingles",
    response: areaData.exteriorBuildingShingles || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Exterior Building Roof Membrane",
    response: areaData.exteriorBuildingRoofMembrane || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Miscellaneous Materials Mastic",
    response: areaData.miscMaterialsMastic || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Miscellaneous Materials Suspect ACM",
    response: areaData.miscMaterialsSuspectAcm || "N/A",
    notes: ""
  });
  
  // Electrical Equipment
  responses.push({
    question: "Fluorescent Fixtures",
    response: areaData.fluorescentFixtures || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "HID Lights Present",
    response: areaData.hidLightsPresent || "N/A",
    notes: areaData.hidLightsCount ? `Count: ${areaData.hidLightsCount}` : ""
  });
  
  responses.push({
    question: "Recent Lighting Retrofit",
    response: areaData.recentLightingRetrofit || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Emergency Lighting",
    response: areaData.isThereEmergencyLighting || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Wall Mounted Capacitor",
    response: areaData.wallMountedCapacitor || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Capacitor Leakage Signs",
    response: areaData.capacitorLeakageSigns || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Liquid Filled Transformer",
    response: areaData.liquidFilledTransformer || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Transformer Leakage Signs",
    response: areaData.transformerLeakageSigns || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Additional PCB Equipment",
    response: areaData.additionalPcbEquipment || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Mercury Containing Equipment",
    response: areaData.areThereMercuryContainingEquip || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Mercury Equipment Removal",
    response: areaData.willTheMercuryContainingEquipmentBeRemoved || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Fire Extinguishing Equipment",
    response: areaData.fireExtinguishingEquipment || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Air Conditioning",
    response: areaData.hasAirConditioning || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Refrigerant Pounds",
    response: areaData.refrigerantPounds || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "ODS Observed",
    response: areaData.odsObserved || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Are There Vials",
    response: areaData.areThereVials || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Area Available",
    response: areaData.areaAvailable || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Documents Used",
    response: areaData.documentsUsed || "N/A",
    notes: ""
  });
  
  responses.push({
    question: "Areas Not Accessible",
    response: areaData.areasNotAccessible || "N/A",
    notes: ""
  });
  
  return responses;
};

/**
 * Prepare report data for template rendering
 * @param {object} report - Report object from database
 * @param {object} project - Project object from database
 * @param {object} customer - Customer object from database
 * @param {object} options - Optional parameters for report generation
 * @param {boolean} options.useCurrentDate - Whether to use current date for reportDate (default: true)
 * @param {object} templateSchema - (Optional) The report template schema (JSON) for dynamic mapping
 * @returns {object} - Formatted data for template
 */
const prepareReportData = (report, project, customer, options = {}, templateSchema = null) => {
  const now = new Date();
  
  // Format dates
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Parse answers JSON
  const answers = safeJsonParse(report.answers);
  const areaDetails = extractAreaDetails(answers);
  
  // Use first area for general information (or combine all areas)
  const primaryArea = areaDetails[0] || {};
  
  // Process photos
  const photos = [];
  if (report.photos) {
    const photoUrls = safeJsonParse(report.photos);
    if (Array.isArray(photoUrls)) {
      photoUrls.forEach((photoUrl, index) => {
        photos.push({
          url: photoUrl,
          caption: `Photo ${index + 1} - General Assessment Area`
        });
      });
    }
  }
  
  // Process area-specific photos
  const areaPhotos = [];
  areaDetails.forEach((area, areaIndex) => {
    if (area.areaPhoto && Array.isArray(area.areaPhoto)) {
      area.areaPhoto.forEach((photoUrl, photoIndex) => {
        areaPhotos.push({
          url: photoUrl,
          caption: `${area.name} - Photo ${photoIndex + 1}`
        });
      });
    }
  });
  
  // Combine all photos
  const allPhotos = [...photos, ...areaPhotos];
  
  // Generate assessment responses from primary area
  const assessmentResponses = formatAssessmentResponses(primaryArea);
  
  // Generate comprehensive key findings based on assessment responses
  const keyFindings = [];
  if (assessmentResponses.length > 0) {
    keyFindings.push('Comprehensive designated substances survey completed in accordance with regulatory requirements');
    keyFindings.push(`${areaDetails.length} area(s) systematically inspected and documented with detailed findings`);
    if (allPhotos.length > 0) {
      keyFindings.push('Extensive photographic documentation provided for all assessment areas and identified materials');
    }
    
    // Add specific findings based on assessment results
    if (primaryArea.isAsbestosAssessed === 'Yes') {
      keyFindings.push('Asbestos-containing materials identified and condition assessed for potential disturbance during construction');
    }
    if (primaryArea.isLeadAssessed === 'Yes') {
      keyFindings.push('Lead-containing materials identified and documented for safe handling during renovation activities');
    }
    if (primaryArea.silicaObserved === 'Yes') {
      keyFindings.push('Silica-containing materials identified requiring dust control measures during construction activities');
    }
    if (primaryArea.mercuryObserved === 'Yes') {
      keyFindings.push('Mercury-containing equipment identified requiring special handling and disposal procedures');
    }
    if (primaryArea.pcbObserved === 'Yes') {
      keyFindings.push('PCB-containing equipment identified requiring specialized removal and disposal procedures');
    }
    if (primaryArea.moldGrowth === 'Yes') {
      keyFindings.push('Mold growth observed and documented requiring appropriate remediation procedures');
    }
    if (primaryArea.pestInfestationObserved === 'Yes') {
      keyFindings.push('Pest infestation identified requiring appropriate control measures and worker protection');
    }
    
    // Add general findings
    keyFindings.push('Risk assessment completed for all identified hazardous materials');
    keyFindings.push('Comprehensive recommendations provided for safe work procedures and control measures');
    keyFindings.push('Regulatory compliance requirements identified and documented');
  }
  
  // Generate comprehensive recommendations
  const recommendations = [
    'Implement comprehensive designated substances control program in accordance with regulatory requirements',
    'Ensure all workers receive appropriate training on hazardous materials identification and safe work procedures',
    'Establish proper containment and decontamination procedures for all work activities',
    'Implement regular monitoring and documentation protocols during construction activities',
    'Maintain detailed records of all control measures and worker protection procedures',
    'Establish emergency response procedures for unexpected discovery of hazardous materials',
    'Coordinate with qualified environmental contractors for specialized removal and disposal activities',
    'Implement proper waste management procedures for all hazardous materials'
  ];
  
  // Add specific recommendations based on findings
  if (primaryArea.isAsbestosAssessed === 'Yes') {
    recommendations.push('Implement asbestos abatement procedures in accordance with Regulation 278/05 requirements');
    recommendations.push('Ensure asbestos awareness training for all workers and supervisors');
  }
  if (primaryArea.isLeadAssessed === 'Yes') {
    recommendations.push('Implement lead-safe work practices during all renovation and demolition activities');
    recommendations.push('Provide appropriate respiratory protection and personal protective equipment');
  }
  if (primaryArea.silicaObserved === 'Yes') {
    recommendations.push('Implement comprehensive silica dust control measures during cutting and grinding activities');
    recommendations.push('Use wet methods and local exhaust ventilation where appropriate');
  }
  if (primaryArea.mercuryObserved === 'Yes') {
    recommendations.push('Implement specialized handling procedures for mercury-containing equipment');
    recommendations.push('Arrange for proper disposal of mercury waste at approved facilities');
  }
  if (primaryArea.pcbObserved === 'Yes') {
    recommendations.push('Implement specialized procedures for PCB-containing equipment removal and disposal');
    recommendations.push('Coordinate with qualified PCB disposal contractors');
  }
  if (primaryArea.moldGrowth === 'Yes') {
    recommendations.push('Implement appropriate mold remediation procedures following industry best practices');
    recommendations.push('Ensure proper containment and worker protection during remediation activities');
  }
  
  // Generate comprehensive control measures
  const controlMeasures = [
    'Implement engineering controls including local exhaust ventilation and wet methods',
    'Use appropriate personal protective equipment (PPE) including respiratory protection',
    'Establish work area isolation and containment procedures',
    'Implement proper decontamination procedures for workers and equipment',
    'Provide adequate ventilation and air monitoring during work activities',
    'Establish proper waste containment and disposal procedures',
    'Implement regular air monitoring and exposure assessment',
    'Establish emergency response and evacuation procedures'
  ];
  
  // Generate comprehensive work procedures
  const workProcedures = [
    'Conduct pre-work inspections and hazard assessments',
    'Implement proper work area preparation and containment',
    'Follow established safe work procedures for each material type',
    'Implement proper waste handling and disposal procedures',
    'Maintain detailed documentation of all work activities',
    'Establish communication protocols for all workers and supervisors',
    'Implement proper cleanup and decontamination procedures',
    'Conduct post-work inspections and air monitoring'
  ];
  
  // Generate comprehensive monitoring requirements
  const monitoringRequirements = [
    'Conduct regular air monitoring during work activities to assess exposure levels',
    'Implement visual inspections of work areas and control measures',
    'Document effectiveness of control measures and worker protection procedures',
    'Conduct worker health monitoring as required by regulations',
    'Maintain detailed records of all monitoring activities and results',
    'Implement real-time monitoring for critical work activities',
    'Conduct post-work clearance monitoring and documentation',
    'Establish regular review and update of monitoring protocols'
  ];
  
  // Generate comprehensive assessment checklist
  const assessmentChecklist = [
    { item: 'Comprehensive Area Inspection', status: 'Completed', comments: `${areaDetails.length} area(s) systematically inspected` },
    { item: 'Historical Documentation Review', status: 'Completed', comments: 'Building plans, construction records, and renovation history reviewed' },
    { item: 'Photographic Documentation', status: allPhotos.length > 0 ? 'Completed' : 'Not Available', comments: `${allPhotos.length} photos taken and documented` },
    { item: 'Asbestos Assessment', status: primaryArea.isAsbestosAssessed || 'N/A', comments: 'Asbestos-containing materials identified and condition assessed' },
    { item: 'Lead Assessment', status: primaryArea.isLeadAssessed || 'N/A', comments: 'Lead-containing materials identified and documented' },
    { item: 'Silica Assessment', status: primaryArea.silicaObserved || 'N/A', comments: 'Silica-containing materials identified and documented' },
    { item: 'Mercury Assessment', status: primaryArea.mercuryObserved || 'N/A', comments: 'Mercury-containing equipment identified and documented' },
    { item: 'PCB Assessment', status: primaryArea.pcbObserved || 'N/A', comments: 'PCB-containing equipment identified and documented' },
    { item: 'Mold Assessment', status: primaryArea.moldGrowth || 'N/A', comments: 'Mold growth and water damage assessed' },
    { item: 'Pest Assessment', status: primaryArea.pestInfestationObserved || 'N/A', comments: 'Pest infestation and associated hazards evaluated' },
    { item: 'Risk Assessment', status: 'Completed', comments: 'Comprehensive risk assessment completed for all identified materials' },
    { item: 'Regulatory Compliance Review', status: 'Completed', comments: 'All applicable regulations identified and compliance requirements documented' }
  ];

  // Collect all asbestos materials from all areas with area names
  const allAsbestosMaterials = [];
  const allSuspectedAsbestosMaterials = [];
  
  // Prepare data for template variables
  const asbestosContainingMaterials = [];
  const suspectAsbestosMaterials = [];
  
  areaDetails.forEach(area => {
    if (area.asbestosMaterials && Array.isArray(area.asbestosMaterials)) {
      area.asbestosMaterials.forEach(material => {
        const materialName = material.materialType || material.customMaterialName || 'Unknown Material';
        const areaName = area.name || 'Unknown Area';
        const materialWithArea = `${materialName} (${areaName})`;
        
        // Add to allAsbestosMaterials for Table 1
        if (!allAsbestosMaterials.some(item => item.includes(materialName))) {
          allAsbestosMaterials.push(materialWithArea);
        }
        
        // Add to asbestosContainingMaterials for template
        asbestosContainingMaterials.push(materialWithArea);
        
        // Check if material is suspected ACM
        if (material.suspectedAcm === 'Yes') {
          const suspectedMaterialWithArea = `${materialName} (${areaName})`;
          if (!suspectAsbestosMaterials.some(item => item.includes(materialName))) {
            suspectAsbestosMaterials.push(suspectedMaterialWithArea);
          }
        }
      });
    }
    
    if (area.suspectedAsbestosMaterials && Array.isArray(area.suspectedAsbestosMaterials)) {
      area.suspectedAsbestosMaterials.forEach(material => {
        const materialName = material.materialType || material.customMaterialName || 'Unknown Material';
        const areaName = area.name || 'Unknown Area';
        const materialWithArea = `${materialName} (${areaName})`;
        
        // Add to allSuspectedAsbestosMaterials for Table 1
        if (!allSuspectedAsbestosMaterials.some(item => item.includes(materialName))) {
          allSuspectedAsbestosMaterials.push(materialWithArea);
        }
        
        // Add to suspectAsbestosMaterials for template
        if (!suspectAsbestosMaterials.some(item => item.includes(materialName))) {
          suspectAsbestosMaterials.push(materialWithArea);
        }
      });
    }
  });
  console.log("suspectAsbestosMaterials=>", suspectAsbestosMaterials);
  
  // Collect all lead materials from all areas with area names
  const allLeadMaterials = [];
  const allSuspectedLeadMaterials = [];
  
  // Prepare data for template variables
  const leadContainingMaterials = [];
  const suspectLeadMaterials = [];
  
  areaDetails.forEach(area => {
    if (area.leadMaterials && Array.isArray(area.leadMaterials)) {
      area.leadMaterials.forEach(material => {
        const materialName = material.materialType || material.customMaterialName || 'Unknown Material';
        const areaName = area.name || 'Unknown Area';
        const materialWithArea = `${materialName} (${areaName})`;
        
        // Add to allLeadMaterials for Table 1
        if (!allLeadMaterials.some(item => item.includes(materialName))) {
          allLeadMaterials.push(materialWithArea);
        }
        
        // Add to leadContainingMaterials for template
        leadContainingMaterials.push(materialWithArea);
        
        // Check if material is suspected lead
        if (material.suspectedLead === 'Yes') {
          const suspectedMaterialWithArea = `${materialName} (${areaName})`;
          if (!suspectLeadMaterials.some(item => item.includes(materialName))) {
            suspectLeadMaterials.push(suspectedMaterialWithArea);
          }
        }
      });
    }
  });
  
  console.log("suspectLeadMaterials=>", suspectLeadMaterials);
  
  // Collect all mercury materials from all areas with area names
  const allMercuryMaterials = [];
  const allSuspectedMercuryMaterials = [];
  
  // Prepare data for template variables
  const mercuryContainingMaterials = [];
  const suspectMercuryMaterials = [];
  
  areaDetails.forEach(area => {
    if (area.mercuryMaterials && Array.isArray(area.mercuryMaterials)) {
      area.mercuryMaterials.forEach(material => {
        const materialName = material.materialType || material.customMaterialName || 'Unknown Material';
        const areaName = area.name || 'Unknown Area';
        const materialWithArea = `${materialName} (${areaName})`;
        
        // Add to allMercuryMaterials for Table 1
        if (!allMercuryMaterials.some(item => item.includes(materialName))) {
          allMercuryMaterials.push(materialWithArea);
        }
        
        // Add to mercuryContainingMaterials for template
        mercuryContainingMaterials.push(materialWithArea);
        
        // Check if material is suspected mercury
        if (material.suspectedMercury === 'Yes') {
          const suspectedMaterialWithArea = `${materialName} (${areaName})`;
          if (!suspectMercuryMaterials.some(item => item.includes(materialName))) {
            suspectMercuryMaterials.push(suspectedMaterialWithArea);
          }
        }
      });
    }
  });
  
  console.log("suspectMercuryMaterials=>", suspectMercuryMaterials);
  
    // Function to determine mercury recommendations based on area details
  const getMercuryRecommendations = (areaDetails) => {
    let hasLamps = false;
    let areThereVials = false;

    // Check all areas for hasLamps and areThereVials
    areaDetails.forEach(area => {
      if (area.hasLamps === 'Yes') {
        hasLamps = true;
      }
      if (area.areThereVials === 'Yes') {
        areThereVials = true;
      }
    });

    if (hasLamps && areThereVials) {
      return "If required, handle lamps and vials with care and keep intact. All waste lamps and vials are recommended to be sent to a recycling facility.";
    } else if (hasLamps) {
      return "If required, handle lamps with care and keep intact. All waste lamps are recommended to be sent to a lamp recycling facility.";
    } else {
      return "If required, handle mercury-containing materials with care and keep intact. All waste mercury-containing materials are recommended to be sent to a recycling facility.";
    }
  };

  // Collect all silica materials from all areas with area names
  const allSilicaMaterials = [];
  const allSuspectedSilicaMaterials = [];

  // Prepare data for template variables
  const silicaContainingMaterials = [];
  const suspectSilicaMaterials = [];

  areaDetails.forEach(area => {
    if (area.silicaMaterials && Array.isArray(area.silicaMaterials)) {
      area.silicaMaterials.forEach(material => {
        const materialName = material.materialType || material.customMaterialName || 'Unknown Material';
        const areaName = area.name || 'Unknown Area';
        const materialWithArea = `${materialName} (${areaName})`;

        // Add to allSilicaMaterials for Table 1
        if (!allSilicaMaterials.some(item => item.includes(materialName))) {
          allSilicaMaterials.push(materialWithArea);
        }

        // Add to silicaContainingMaterials for template
        silicaContainingMaterials.push(materialWithArea);

        // Check if material is suspected silica
        if (material.suspectedSilica === 'Yes') {
          const suspectedMaterialWithArea = `${materialName} (${areaName})`;
          if (!suspectSilicaMaterials.some(item => item.includes(materialName))) {
            suspectSilicaMaterials.push(suspectedMaterialWithArea);
          }
        }
      });
    }
  });

  // Collect pest infestation data from all areas
  const pestInfestationData = [];
  const allInfestationTypes = [];

  areaDetails.forEach(area => {
    const areaName = area.name || 'Unknown Area';
    
    // Check for infestation type selections
    if (area.infestationTypeSelect && Array.isArray(area.infestationTypeSelect) && area.infestationTypeSelect.length > 0) {
      const sources = area.infestationTypeSelect.join(', ');
      const location = area.droppingsLocation || 'unknown location';
      
      // Collect all infestation types for recommendations
      area.infestationTypeSelect.forEach(type => {
        if (!allInfestationTypes.includes(type)) {
          allInfestationTypes.push(type);
        }
      });
      
      pestInfestationData.push({
        type: 'droppings',
        source: sources,
        location: location,
        areaName: areaName,
        statement: `An area of ${sources} dropping accumulation was identified on ${location} in the ${areaName}.`
      });
    }
    
    // Check for dead animals
    if (area.deadAnimals && Array.isArray(area.deadAnimals)) {
      area.deadAnimals.forEach(animal => {
        if (animal.animalName && animal.animalName.trim() !== '') {
          const animalType = animal.animalName;
          const animalLocation = animal.animalLocation || 'unknown location';
          
          pestInfestationData.push({
            type: 'dead_animal',
            animalType: animalType,
            location: animalLocation,
            areaName: areaName,
            statement: `${animalType} was identified on/near ${animalLocation} in the ${areaName}.`
          });
        }
      });
    } 
  });
  
    // Collect PCB data from all areas
  const pcbData = {
    pcbObserved: false,
    pcbElectricalEquipmentTable: []
  };

  areaDetails.forEach(area => {
    // Check if PCB was observed in any area
    if (area.pcbObserved === 'Yes') {
      pcbData.pcbObserved = true;
    }

    // Collect PCB electrical equipment data
    if (area.pcbElectricalEquipmentTable && Array.isArray(area.pcbElectricalEquipmentTable)) {
      area.pcbElectricalEquipmentTable.forEach(equipment => {
        // Only add if equipment has meaningful data
        if (equipment.tableLocation || equipment.tablePcbIdInfo || equipment.tablePcbContent ||
            equipment.tableManufacturer || equipment.tableElectricalEquipment) {
          pcbData.pcbElectricalEquipmentTable.push({
            location: equipment.tableLocation || '',
            pcbIdInfo: equipment.tablePcbIdInfo || '',
            pcbContent: equipment.tablePcbContent || '',
            manufacturer: equipment.tableManufacturer || '',
            electricalEquipment: equipment.tableElectricalEquipment || ''
          });
        }
      });
    }
  });

  // Collect ODS/GWS data from all areas
  const odsData = {
    odsObserved: false,
    odsGwsAssessmentTable: []
  };

  areaDetails.forEach(area => {
    // Check if ODS was observed in any area
    if (area.odsObserved === 'Yes') {
      odsData.odsObserved = true;
    }

    // Collect ODS/GWS assessment data
    if (area.odsGwsAssessmentTable && Array.isArray(area.odsGwsAssessmentTable)) {
      area.odsGwsAssessmentTable.forEach(equipment => {
        // Only add if equipment has meaningful data
        if (equipment.tableLocation || equipment.tableOdsGwsClassification || 
            equipment.tableRefrigerantTypeQuantity || equipment.tableEquipmentManufacturerType) {
          odsData.odsGwsAssessmentTable.push({
            location: equipment.tableLocation || '',
            classification: equipment.tableOdsGwsClassification || '',
            refrigerantType: equipment.tableRefrigerantTypeQuantity || '',
            equipmentType: equipment.tableEquipmentManufacturerType || ''
          });
        }
      });
    }
  });
  
    // Function to generate PCB findings and recommendations
  const getPcbFindingsAndRecommendations = (pcbData) => {
    let findings = '';
    let recommendations = '';

    // Check for general PCB observation
    if (pcbData.pcbObserved) {
      findings = 'Fluorescent light ballasts are assumed to contain PCB\'s.';
      recommendations = 'PCB-containing ballasts should be removed, separated from other waste and disposed of as PCB waste at an authorized destruction facility.';
    }

    // Check for specific PCB electrical equipment
    if (pcbData.pcbElectricalEquipmentTable.length > 0) {
      if (findings) {
        findings += ' ';
      }
      findings += 'The following PCB-containing electrical equipment was identified:<ul>';
      pcbData.pcbElectricalEquipmentTable.forEach(equipment => {
        const details = [
          equipment.location && `Location: ${equipment.location}`,
          equipment.pcbIdInfo && `PCB ID Info: ${equipment.pcbIdInfo}`,
          equipment.pcbContent && `PCB Content: ${equipment.pcbContent}`,
          equipment.manufacturer && `Manufacturer: ${equipment.manufacturer}`,
          equipment.electricalEquipment && `Equipment: ${equipment.electricalEquipment}`
        ].filter(Boolean).join(', ');

        if (details) {
          findings += `<li>${details}</li>`;
        }
      });
      findings += '</ul>';

      if (recommendations) {
        recommendations += ' ';
      }
      recommendations += 'At the time of decommissioning any suspect PCB-containing equipment should be verified by referring to the Environment Canada document entitled "Handbook on PCB\'s in Electrical Equipment." Any PCB-containing equipment taken out of service should be properly handled and disposed of at an authorized destruction facility.';
    }

    // If no findings, set default message
    if (!findings) {
      findings = 'No equipment was observed that is suspected to contain PCBs.';
      recommendations = 'No action required.';
    }

    return { findings, recommendations };
  };

  // Function to generate ODS/GWS findings and recommendations
  const getOdsFindingsAndRecommendations = (odsData) => {
    let findings = '';
    let recommendations = '';

    // Check for ODS observation
    if (odsData.odsObserved) {
      findings = 'Equipment containing ozone depleting substances (ODS) and/or global warming substances (GWS) was identified in the subject area.';
    }

    // Check for specific ODS/GWS equipment
    if (odsData.odsGwsAssessmentTable.length > 0) {
      if (findings) {
        findings += ' ';
      }
      findings += 'The following ODS/GWS-containing equipment was identified:<ul>';
      odsData.odsGwsAssessmentTable.forEach(equipment => {
        const details = [
          equipment.location && `Location: ${equipment.location}`,
          equipment.classification && `Classification: ${equipment.classification}`,
          equipment.refrigerantType && `Refrigerant: ${equipment.refrigerantType}`,
          equipment.equipmentType && `Equipment: ${equipment.equipmentType}`
        ].filter(Boolean).join(', ');

        if (details) {
          findings += `<li>${details}</li>`;
        }
      });
      findings += '</ul>';
    }

                      // Generate recommendations based on findings
                  if (odsData.odsObserved || odsData.odsGwsAssessmentTable.length > 0) {
                    recommendations = 'Purge unit(s) of remaining refrigerant prior to removal and disposal. This should be conducted by a certified person who holds a valid Ozone Depletion Prevention Certificate. Servicing and testing of refrigeration equipment should be conducted in accordance with Environment Canada\'s "Environmental Code of Practice for Elimination of Fluorocarbon Emissions from Refrigeration and Air Conditioning Systems".';
                  }

    // If no findings, set default message
    if (!findings) {
      findings = 'No equipment was observed that is suspected to contain ozone depleting and/or global warming substances.';
      recommendations = 'No action required.';
    }

    return { findings, recommendations };
  };
  
    // Function to generate combined recommendations for Other Hazardous Materials
  const getOtherHazardousMaterialsRecommendations = (pestInfestationData, allInfestationTypes, pcbData, odsData) => {
    const recommendations = [];

    // Add pest infestation recommendations if applicable
    if (pestInfestationData.length > 0) {
      recommendations.push(`<strong>Pest Infestation:</strong> Precautions should be taken to minimize worker exposure when disturbing/removing ${allInfestationTypes.join(', ')}. This includes measures to minimize dust generation and use of appropriate personal protection.`);
    }

    // Add PCB recommendations if applicable
    const pcbRecommendations = getPcbFindingsAndRecommendations(pcbData).recommendations;
    if (pcbRecommendations !== 'No action required.') {
      recommendations.push(`<strong>Polychlorinated Biphenyls:</strong> ${pcbRecommendations}`);
    }

    // Add ODS recommendations if applicable
    const odsRecommendations = getOdsFindingsAndRecommendations(odsData).recommendations;
    if (odsRecommendations !== 'No action required.') {
      recommendations.push(`<strong>Ozone Depleting and Global Warming Substances:</strong> ${odsRecommendations}`);
    }

    return recommendations.length > 0 ? recommendations.join('<br><br>') : 'No action required.';
  };
  
  // Generate summary table for hazardous materials and designated substances
  const summaryTable = [
    {
      substance: 'Asbestos',
      findings: `The following asbestos-containing materials were identified in the subject area that may be impacted during the project:<ul>${allAsbestosMaterials.length > 0 ? allAsbestosMaterials.map(material => `<li>${material}</li>`).join('') : '<li>N/A</li>'}</ul>
      ${suspectAsbestosMaterials.length > 0 ? 'The following building materials are suspected to be asbestos-containing:<ul>' + suspectAsbestosMaterials.map(material => `<li>${material}</li>`).join('') + '</ul>' : ''}`,
      recommendations: `Disturbance of asbestos-containing materials must be conducted in accordance with Ontario Regulation 278/05 <i>Designated Substance – Asbestos on Construction Projects and in Building and Repair Operations</i>. Refer to Table 3 (Results of Assessment for Asbestos-Containing Materials), Section 3.1.1 (Conclusions and Recommendations), Appendix A (Summary of ACM Occurrences) and Appendix B (Site Drawings). Asbestos-containing materials must be disposed of in accordance with R.R.O. 1990, Regulation 347, <i>General - Waste Management</i>.`
    },
    {
      substance: 'Lead',
      findings: `The following materials are assumed  to be lead-containing: :<ul>${allLeadMaterials.length > 0 ? allLeadMaterials.map(material => `<li>${material}</li>`).join('') : '<li>N/A</li>'}</ul>
      ${suspectLeadMaterials.length > 0 ? 'The following building materials are suspected to be lead-containing:<ul>' + suspectLeadMaterials.map(material => `<li>${material}</li>`).join('') + '</ul>' : ''}`,
      recommendations: `Disturbance of lead-containing materials must be conducted in accordance with the Ontario Ministry of Labour <i>Lead on Construction Projects</i> guideline (2011) and/or the Environmental Abatement Council of Ontario (EACO) <i>Lead Guideline</i> (October 2014). For additional details, refer to Section 2.1.2 (Results) and Section 3.1.2 (Conclusions and Recommendations). Lead-containing wastes should be recycled if practicable or handled and disposed of according to R.R.O. 1990, Regulation 347, <i>General - Waste Management</i>.`
    },
    {
      substance: 'Mercury',
      findings: `The following mercury-containing materials were identified in the subject area that may be impacted during the project:<ul>${allMercuryMaterials.length > 0 ? allMercuryMaterials.map(material => `<li>${material}</li>`).join('') : '<li>N/A</li>'}</ul>
      ${suspectMercuryMaterials.length > 0 ? 'The following building materials are suspected to be mercury-containing:<ul>' + suspectMercuryMaterials.map(material => `<li>${material}</li>`).join('') + '</ul>' : ''}`,
      recommendations: getMercuryRecommendations(areaDetails)
    },
    {
      substance: 'Silica',
      findings: `The following silica-containing materials were identified in the subject area that may be impacted during the project:<ul>${allSilicaMaterials.length > 0 ? allSilicaMaterials.map(material => `<li>${material}</li>`).join('') : '<li>N/A</li>'}</ul>
      ${suspectSilicaMaterials.length > 0 ? 'The following building materials are suspected to be silica-containing:<ul>' + suspectSilicaMaterials.map(material => `<li>${material}</li>`).join('') + '</ul>' : ''}`,
      recommendations: `Any work involving the disturbance of silica-containing materials should follow the procedures outlined in the Ontario Ministry of Labour <i>Silica on Construction Projects</i> guideline. For additional information, refer to Section 2.1.4 (Results) and Section 3.1.4 (Conclusions and Recommendations).`
    },
    {
      substance: 'Other Designated Substances',
      findings: `No other designated substances are expected to be present in any significant quantities or in a form that would represent an exposure concern.`,
      recommendations: `No protective measures or procedures specific to acrylonitrile, arsenic, benzene, coke oven emissions, ethylene oxide, isocyanates, and vinyl chloride are considered necessary.`
    },
    {
      substance: 'Other Hazardous Materials',
      findings: `
      <ul>
        <li>
          <b>Urea Formaldehyde Foam Insulation:</b> 
          No UFFI was identified or is suspected in the subject area.
        </li>
        <li>
          <b>Mould Contamination:</b> 
          No suspect mould contamination was observed on building finishes in the subject area.
        </li>
        <li>
          <b>Pest Infestation:</b> 
          ${pestInfestationData.length > 0 ? pestInfestationData.map(item => item.statement).join(' ') : 'No pest infestations were observed in the areas assessed.'}
        </li>
        <li>
          <b>Polychlorinated Biphenyls:</b> 
          ${getPcbFindingsAndRecommendations(pcbData).findings}</li>
        <li>
          <b>Ozone Depleting and Global Warming Substances:</b> 
          ${getOdsFindingsAndRecommendations(odsData).findings}
        </li>
      </ul>`,
      recommendations: getOtherHazardousMaterialsRecommendations(pestInfestationData, allInfestationTypes, pcbData, odsData)
    }
  ];

  console.log("primaryArea.projectName=>", primaryArea.projectName);
  
  // Determine report date based on options
  const reportDate = options.useCurrentDate === false ? 'To Be Determined' : formatDate(now);
  
  // Dynamically build asbestosAssessment for Table 3 if templateSchema is provided
  let asbestosAssessment = [];
  if (templateSchema && templateSchema.sections) {
    // Find a section or question group related to asbestos assessment table
    // (e.g., by label, id, or type: 'table', or containing 'asbestos' in label)
    const asbestosSection = templateSchema.sections.find(
      s => s.title && /asbestos/i.test(s.title)
    );
    console.log("asbestosSection=>", asbestosSection);

    if (asbestosSection && asbestosSection.fields) {
      areaDetails.forEach(area => {
        asbestosSection.fields.forEach(materialGroup => {
          // Only process groups with subfields
          if (Array.isArray(materialGroup.fields)) {
            materialGroup.fields.forEach(subField => {
              // Only process radio fields (Yes/No questions)
              if (subField.type === "radio") {
                const radioValue = area[subField.id];
                
                if (radioValue === "Yes") {
                  // Find the corresponding repeater field for this radio field
                  const repeaterField = materialGroup.fields.find(f =>
                    f.type === "repeater" &&
                    (f.condition === subField.id || (f.showWhen && f.showWhen.startsWith(subField.id + "=")))
                  );
                  
                  if (repeaterField && repeaterField.fields) {
                    // Process repeater field entries
                    const repeaterData = area[repeaterField.id];
                    if (Array.isArray(repeaterData) && repeaterData.length > 0) {
                      repeaterData.forEach((entry, index) => {
                        // Find location, description, and photo fields within the repeater
                        const locationField = repeaterField.fields.find(f =>
                          f.type === "text" && f.label === "Location"
                        );
                        const descriptionField = repeaterField.fields.find(f =>
                          f.type === "text" && f.label === "Description"
                        );
                        const photoField = repeaterField.fields.find(f =>
                          f.type === "file" && f.label === "Photo"
                        );
                        
                        const locationValue = locationField ? entry[locationField.id] : "";
                        const descriptionValue = descriptionField ? entry[descriptionField.id] : "";
                        const photoValue = photoField ? entry[photoField.id] : "";
                        
                        // Combine location and description
                        const combinedValue = [locationValue, descriptionValue].filter(Boolean).join(" - ");
                        
                        asbestosAssessment.push({
                          id: `${subField.label || subField.id || ""} ${index + 1}`,
                          locationAndDescription: combinedValue || "",
                          photo: photoValue || ""
                        });
                      });
                    } else {
                      // Fallback for single text fields if no repeater data
                      const locationField = materialGroup.fields.find(f =>
                        f.type === "text" &&
                        f.label === "Location" &&
                        (f.condition === subField.id || (f.showWhen && f.showWhen.startsWith(subField.id + "=")))
                      );
                      const descriptionField = materialGroup.fields.find(f =>
                        f.type === "text" &&
                        f.label === "Description" &&
                        (f.condition === subField.id || (f.showWhen && f.showWhen.startsWith(subField.id + "=")))
                      );
                      const photoField = materialGroup.fields.find(f =>
                        f.type === "file" &&
                        (f.condition === subField.id || (f.showWhen && f.showWhen.startsWith(subField.id + "=")))
                      );
                      
                      const locationValue = locationField ? area[locationField.id] : "";
                      const descriptionValue = descriptionField ? area[descriptionField.id] : "";
                      const photoValue = photoField ? area[photoField.id] : "";
                      
                      // Combine location and description
                      const combinedValue = [locationValue, descriptionValue].filter(Boolean).join(" - ");
                      
                      asbestosAssessment.push({
                        id: subField.label || subField.id || "",
                        locationAndDescription: combinedValue || "",
                        photo: photoValue || ""
                      });
                    }
                  } else {
                    // Fallback for single text fields if no repeater field found
                    const locationField = materialGroup.fields.find(f =>
                      f.type === "text" &&
                      f.label === "Location" &&
                      (f.condition === subField.id || (f.showWhen && f.showWhen.startsWith(subField.id + "=")))
                    );
                    const descriptionField = materialGroup.fields.find(f =>
                      f.type === "text" &&
                      f.label === "Description" &&
                      (f.condition === subField.id || (f.showWhen && f.showWhen.startsWith(subField.id + "=")))
                    );
                    const photoField = materialGroup.fields.find(f =>
                      f.type === "file" &&
                      (f.condition === subField.id || (f.showWhen && f.showWhen.startsWith(subField.id + "=")))
                    );
                    
                    const locationValue = locationField ? area[locationField.id] : "";
                    const descriptionValue = descriptionField ? area[descriptionField.id] : "";
                    const photoValue = photoField ? area[photoField.id] : "";
                    
                    // Combine location and description
                    const combinedValue = [locationValue, descriptionValue].filter(Boolean).join(" - ");
                    
                    asbestosAssessment.push({
                      id: subField.label || subField.id || "",
                      locationAndDescription: combinedValue || "",
                      photo: photoValue || ""
                    });
                  }
                } else {
                  asbestosAssessment.push({
                    id: subField.label || subField.id || "",
                    locationAndDescription: "None identified in subject building.",
                    photo: ""
                  });
                }
              }
            });
          }
        });
      });
    }
  }
  
  // Dynamically build leadAssessment for Table 3 if templateSchema is provided
  let leadAssessment = [];
  if (templateSchema && templateSchema.sections) {
    // Find a section or question group related to lead assessment table
    // (e.g., by label, id, or type: 'table', or containing 'lead' in label)
    const leadSection = templateSchema.sections.find(
      s => s.title && /lead/i.test(s.title)
    );
    console.log("leadSection=>", leadSection);

    if (leadSection && leadSection.fields) {
      areaDetails.forEach(area => {
        leadSection.fields.forEach(materialGroup => {
          // Only process groups with subfields
          if (Array.isArray(materialGroup.fields)) {
            materialGroup.fields.forEach(subField => {
              // Only process radio fields (Yes/No questions)
              if (subField.type === "radio") {
                const radioValue = area[subField.id];
                // Find the corresponding location, description, and photo fields for this radio field
                const locationField = materialGroup.fields.find(f =>
                  f.type === "text" &&
                  f.label === "Location" &&
                  (f.condition === subField.id || (f.showWhen && f.showWhen.startsWith(subField.id + "=")))
                );
                const descriptionField = materialGroup.fields.find(f =>
                  f.type === "text" &&
                  f.label === "Description" &&
                  (f.condition === subField.id || (f.showWhen && f.showWhen.startsWith(subField.id + "=")))
                );
                const photoField = materialGroup.fields.find(f =>
                  f.type === "file" &&
                  (f.condition === subField.id || (f.showWhen && f.showWhen.startsWith(subField.id + "=")))
                );
                
                const locationValue = locationField ? area[locationField.id] : "";
                const descriptionValue = descriptionField ? area[descriptionField.id] : "";
                const photoValue = photoField ? area[photoField.id] : "";
                
                // Combine location and description
                const combinedValue = [locationValue, descriptionValue].filter(Boolean).join(" - ");

                if (radioValue === "Yes") {
                  leadAssessment.push({
                    id: subField.label || subField.id || "",
                    locationAndDescription: combinedValue || "",
                    photo: photoValue || ""
                  });
                } else {
                  leadAssessment.push({
                    id: subField.label || subField.id || "",
                    locationAndDescription: "None identified in subject building.",
                    photo: ""
                  });
                }
              }
            });
          }
        });
      });
    }
  }
  
  // Dynamically build pcbAssessment for Table 3 if templateSchema is provided
  let pcbAssessment = [];
  if (templateSchema && templateSchema.sections) {
    // Find a section or question group related to PCB assessment table
    // (e.g., by label, id, or type: 'table', or containing 'pcb' in label)
    const pcbSection = templateSchema.sections.find(
      s => s.title && /pcb/i.test(s.title)
    );
    console.log("pcbSection=>", pcbSection);

    if (pcbSection && pcbSection.fields) {
      areaDetails.forEach(area => {
        pcbSection.fields.forEach(materialGroup => {
          // Only process groups with subfields
          if (Array.isArray(materialGroup.fields)) {
            materialGroup.fields.forEach(subField => {
              // Only process radio fields (Yes/No questions)
              if (subField.type === "radio") {
                const radioValue = area[subField.id];
                // Find the corresponding location, description, and photo fields for this radio field
                const locationField = materialGroup.fields.find(f =>
                  f.type === "text" &&
                  f.label === "Location" &&
                  (f.condition === subField.id || (f.showWhen && f.showWhen.startsWith(subField.id + "=")))
                );
                const descriptionField = materialGroup.fields.find(f =>
                  f.type === "text" &&
                  f.label === "Description" &&
                  (f.condition === subField.id || (f.showWhen && f.showWhen.startsWith(subField.id + "=")))
                );
                const photoField = materialGroup.fields.find(f =>
                  f.type === "file" &&
                  (f.condition === subField.id || (f.showWhen && f.showWhen.startsWith(subField.id + "=")))
                );
                
                const locationValue = locationField ? area[locationField.id] : "";
                const descriptionValue = descriptionField ? area[descriptionField.id] : "";
                const photoValue = photoField ? area[photoField.id] : "";
                
                // Combine location and description
                const combinedValue = [locationValue, descriptionValue].filter(Boolean).join(" - ");

                if (radioValue === "Yes") {
                  pcbAssessment.push({
                    id: subField.label || subField.id || "",
                    locationAndDescription: combinedValue || "",
                    photo: photoValue || ""
                  });
                } else {
                  pcbAssessment.push({
                    id: subField.label || subField.id || "",
                    locationAndDescription: "None identified in subject building.",
                    photo: ""
                  });
                }
              }
            });
          }
        });
      });
    }
  }
  
  // Process asbestos samples for Table 2
  let asbestosSamples = [];
  areaDetails.forEach(area => {
    if (Array.isArray(area.asbestosMaterials)) {
      area.asbestosMaterials.forEach((material, index) => {
        // Determine material classification based on percentage and suspected status
        let materialClassification = 'Non-ACM';
        
        // Check if percentageAsbestos is a positive number
        const isPositiveNumber = material.percentageAsbestos && 
          !isNaN(parseFloat(material.percentageAsbestos)) && 
          parseFloat(material.percentageAsbestos) > 0;
        
        if (isPositiveNumber || material.suspectedAcm === 'Yes') {
          materialClassification = 'ACM';
        }
        
        // Format sample number with area name
        const sampleNo = `${area.name || 'Area'}-${material.sampleNo || (index + 1)}`;
        
        function containsNumber(str) {
          return /\d/.test(str);
        }
        asbestosSamples.push({
          sampleNo: sampleNo,
          materialDescription: material.materialType || material.customMaterialName || 'Unknown Material',
          sampleLocation: material.location || 'Unknown Location',
          asbestosContent: material.percentageAsbestos && containsNumber(material.percentageAsbestos) ? `${material.percentageAsbestos}%` : material.percentageAsbestos,
          materialClassification: materialClassification
        });
      });
    }
  });
  // Process lead samples for Table 4
  let leadSamples = [];
  areaDetails.forEach(area => {
    if (Array.isArray(area.leadMaterials)) {
      area.leadMaterials.forEach((material, index) => {
        // Determine material classification based on lead concentration
        let materialClassification = 'Non-LCP';
        if (material.leadConcentration && parseFloat(material.leadConcentration) > 0.1) {
          materialClassification = 'LCP';
        } else if (material.leadConcentration && parseFloat(material.leadConcentration) === 0.1) {
          materialClassification = 'LLLP';
        }
        
        leadSamples.push({
          sampleNo: material.sampleNo || `L${index + 1}`,
          location: material.materialLocation || 'Unknown Location',
          surface: material.materialDescription || 'Unknown Surface',
          paintColour: material.paintColour || 'Unknown',
          condition: material.condition || 'Unknown',
          leadConcentration: material.leadConcentration ? `${material.leadConcentration}%` : 'N/A',
          materialClassification: materialClassification
        });
      });
    }
  });

  // Area-specific sectioned output for clarity
  let areaSections = [];
  if (templateSchema && templateSchema.sections && areaDetails.length > 0) {
    areaSections = areaDetails.map(area => {
      // Area-specific asbestos assessment
      let areaAsbestosAssessment = [];
      const asbestosSection = templateSchema.sections.find(
        s => s.title && /asbestos/i.test(s.title)
      );
      if (asbestosSection && asbestosSection.fields) {
        asbestosSection.fields.forEach(materialGroup => {
          if (Array.isArray(materialGroup.fields)) {
            materialGroup.fields.forEach(subField => {
              if (subField.type === "radio") {
                const radioValue = area[subField.id];
                
                if (radioValue === "Yes") {
                  // Find the corresponding repeater field for this radio field
                  const repeaterField = materialGroup.fields.find(f =>
                    f.type === "repeater" &&
                    (f.condition === subField.id || (f.showWhen && f.showWhen.startsWith(subField.id + "=")))
                  );
                  
                  if (repeaterField && repeaterField.fields) {
                    // Process repeater field entries
                    const repeaterData = area[repeaterField.id];
                    if (Array.isArray(repeaterData) && repeaterData.length > 0) {
                      repeaterData.forEach((entry, index) => {
                        // Find location, description, and photo fields within the repeater
                        const locationField = repeaterField.fields.find(f =>
                          f.type === "text" && f.label === "Location"
                        );
                        const descriptionField = repeaterField.fields.find(f =>
                          f.type === "text" && f.label === "Description"
                        );
                        const photoField = repeaterField.fields.find(f =>
                          f.type === "file" && f.label === "Photo"
                        );
                        
                        const locationValue = locationField ? entry[locationField.id] : "";
                        const descriptionValue = descriptionField ? entry[descriptionField.id] : "";
                        const photoValue = photoField ? entry[photoField.id] : "";
                        
                        // Combine location and description
                        const combinedValue = [locationValue, descriptionValue].filter(Boolean).join(" - ");
                        
                        areaAsbestosAssessment.push({
                          id: `${subField.label || subField.id || ""} ${index + 1}`,
                          locationAndDescription: combinedValue || "",
                          photo: photoValue || ""
                        });
                      });
                    } else {
                      // Fallback for single text fields if no repeater data
                      const locationField = materialGroup.fields.find(f =>
                        f.type === "text" &&
                        f.label === "Location" &&
                        (f.condition === subField.id || (f.showWhen && f.showWhen.startsWith(subField.id + "=")))
                      );
                      const descriptionField = materialGroup.fields.find(f =>
                        f.type === "text" &&
                        f.label === "Description" &&
                        (f.condition === subField.id || (f.showWhen && f.showWhen.startsWith(subField.id + "=")))
                      );
                      const photoField = materialGroup.fields.find(f =>
                        f.type === "file" &&
                        (f.condition === subField.id || (f.showWhen && f.showWhen.startsWith(subField.id + "=")))
                      );
                      
                      const locationValue = locationField ? area[locationField.id] : "";
                      const descriptionValue = descriptionField ? area[descriptionField.id] : "";
                      const photoValue = photoField ? area[photoField.id] : "";
                      
                      // Combine location and description
                      const combinedValue = [locationValue, descriptionValue].filter(Boolean).join(" - ");
                      
                      areaAsbestosAssessment.push({
                        id: subField.label || subField.id || "",
                        locationAndDescription: combinedValue || "",
                        photo: photoValue || ""
                      });
                    }
                  } else {
                    // Fallback for single text fields if no repeater field found
                    const locationField = materialGroup.fields.find(f =>
                      f.type === "text" &&
                      f.label === "Location" &&
                      (f.condition === subField.id || (f.showWhen && f.showWhen.startsWith(subField.id + "=")))
                    );
                    const descriptionField = materialGroup.fields.find(f =>
                      f.type === "text" &&
                      f.label === "Description" &&
                      (f.condition === subField.id || (f.showWhen && f.showWhen.startsWith(subField.id + "=")))
                    );
                    const photoField = materialGroup.fields.find(f =>
                      f.type === "file" &&
                      (f.condition === subField.id || (f.showWhen && f.showWhen.startsWith(subField.id + "=")))
                    );
                    
                    const locationValue = locationField ? area[locationField.id] : "";
                    const descriptionValue = descriptionField ? area[descriptionField.id] : "";
                    const photoValue = photoField ? area[photoField.id] : "";
                    
                    // Combine location and description
                    const combinedValue = [locationValue, descriptionValue].filter(Boolean).join(" - ");
                    
                    areaAsbestosAssessment.push({
                      id: subField.label || subField.id || "",
                      locationAndDescription: combinedValue || "",
                      photo: photoValue || ""
                    });
                  }
                } else {
                  areaAsbestosAssessment.push({
                    id: subField.label || subField.id || "",
                    locationAndDescription: "None identified in subject building.",
                    photo: ""
                  });
                }
              }
            });
          }
        });
      }
      // Area-specific lead assessment
      let areaLeadAssessment = [];
      if (Array.isArray(area.leadMaterials)) {
        areaLeadAssessment = area.leadMaterials.map((item, idx) => ({
          id: `Lead Material ${idx + 1}`,
          locationAndDescription: `${item.location || ''} - ${item.description || ''} - ${item.materialType || item.customMaterialName || ''}`.replace(/^ - | - $/g, '').replace(/ - - /g, ' - '),
          photo: (Array.isArray(item.photos) && item.photos.length > 0) ? item.photos[0] : ''
        }));
      }
      // Area-specific suspect lead materials (dynamic)
      let areaSuspectLeadMaterials = [];
      if (Array.isArray(area.suspectLeadMaterials) && area.suspectLeadMaterials.length > 0) {
        areaSuspectLeadMaterials = area.suspectLeadMaterials;
      } else if (typeof area.suspectLeadMaterials === 'string' && area.suspectLeadMaterials.trim() !== '') {
        // If it's a string, split by newlines or commas
        areaSuspectLeadMaterials = area.suspectLeadMaterials.split(/\n|,/).map(s => s.trim()).filter(Boolean);
      }
      // Area-specific mercury assessment (dynamic)
      let areaMercuryPresent = area.mercuryObserved === 'Yes';
      let areaMercurySourcesMaterials = [];
      if (area.hasLamps === 'Yes') {
        let lampLabel = 'fluorescent lamps';
        if (area.lampCount && !isNaN(area.lampCount)) {
          lampLabel += ` (Count: ${area.lampCount})`;
        }
        areaMercurySourcesMaterials.push(lampLabel);
      }
      if (area.areThereVials === 'Yes') {
        areaMercurySourcesMaterials.push('mercury vials');
      }
      if (area.areThereMercuryContainingEquip === 'Yes') {
        areaMercurySourcesMaterials.push('mercury-containing equipment (thermostats, thermometers, barometers, etc.)');
      }
      if (area.mercuryForms && typeof area.mercuryForms === 'string' && area.mercuryForms.trim() !== '') {
        areaMercurySourcesMaterials.push(...area.mercuryForms.split(/\n|,/).map(s => s.trim()).filter(Boolean));
      }
      // Area-specific silica assessment (dynamic)
      let areaSilicaObserved = area.silicaObserved === 'Yes';
      let areaSilicaMaterials = [];
      if (Array.isArray(area.silicaForms)) {
        areaSilicaMaterials = area.silicaForms;
      } else if (typeof area.silicaForms === 'string' && area.silicaForms.trim() !== '') {
        areaSilicaMaterials = area.silicaForms.split(/\n|,/).map(s => s.trim()).filter(Boolean);
      }
      // Area-specific mould assessment (dynamic)
      let areaMouldAssessment = [];
      if (Array.isArray(area.mouldMaterials)) {
        areaMouldAssessment = area.mouldMaterials.map((item, idx) => ({
          id: `Mould Material ${idx + 1}`,
          locationAndDescription: `${item.location || ''} - ${item.description || ''} - ${item.materialType || item.customMaterialName || ''}`.replace(/^ - | - $/g, '').replace(/ - - /g, ' - '),
          photo: (Array.isArray(item.photos) && item.photos.length > 0) ? item.photos[0] : ''
        }));
      }
      // Area-specific pest infestation (dynamic)
      let areaPestInfestationObserved = area.pestInfestationObserved === 'Yes';
      let areaInfestationType = '';
      if (area.infestationTypeSelect === 'Other' && area.infestationTypeOther) {
        areaInfestationType = area.infestationTypeOther;
      } else if (area.infestationTypeSelect) {
        areaInfestationType = area.infestationTypeSelect;
      }
      let areaDroppingsObserved = area.droppingsObserved === 'Yes';
      let areaDroppingsLocation = area.droppingsLocation || '';
      // Area-specific PCB assessment (dynamic)
      let areaPcbObserved = area.pcbObserved === 'Yes';
      let areaPcbAssessment = [];
      if (areaPcbObserved && Array.isArray(area.pcbElectricalEquipmentTable)) {
        areaPcbAssessment = area.pcbElectricalEquipmentTable.map(item => ({
          location: item.tableLocation || '',
          equipment: item.tableElectricalEquipment || '',
          manufacturer: item.tableManufacturer || '',
          pcbInfo: item.tablePcbIdInfo || '',
          pcbContent: item.tablePcbContent || ''
        }));
      }
      // Area-specific PCB summary paragraphs (dynamic)
      let pcbSummaryParagraphs = [];
      if (areaPcbObserved) {
        // Fluorescent light fixtures
        if (area.fluorescentFixtures || area.fixtureType || area.fixtureSize || area.ballastPcbPercentage || area.assumedPcbBallastsCount) {
          let fixtureCount = area.fluorescentFixtures || 'N/A';
          let fixtureType = area.fixtureType || '';
          let fixtureSize = area.fixtureSize || '';
          let ballastCount = area.assumedPcbBallastsCount || 'N/A';
          let ballastPcbPercent = area.ballastPcbPercentage || 'N/A';
          pcbSummaryParagraphs.push(
            `Fluorescent light fixtures were identified in the project areas. These were noted to be ${fixtureCount}-lamp fixtures. Most of the lamps were noted to be ${fixtureSize ? fixtureSize : 'N/A'}. ${fixtureCount} fluorescent light fixtures were inspected to determine PCB content. ${ballastCount} ballasts were identified. ${ballastPcbPercent} of these ballasts were verified to be non-PCB-containing while ${ballastPcbPercent} ballasts were verified to contain PCBs. ${ballastPcbPercent} ballast(s) did not contain sufficient information on the label to make a proper determination and therefore is assumed to contain PCBs.`
          );
        }
        // HID lights
        if (area.hidLightsPresent === 'Yes') {
          let hidCount = area.hidLightsCount || 'N/A';
          pcbSummaryParagraphs.push(
            `A total of approximately ${hidCount} HID lights were also present throughout the project areas. These lights could not be accessed for further evaluation to determine the type(s) of ballasts present and therefore the ballasts within these lights are assumed to contain PCBs.`
          );
        }
        // Liquid-filled transformer
        if (area.liquidFilledTransformer === 'Yes') {
          let transformerLocation = area.transformerLocation || 'the project areas';
          let leakageSigns = area.transformerLeakageSigns === 'Yes' ? 'Significant staining or discolouration of the concrete floor was noted beneath the transformer that may be suggestive of previous leakage.' : 'No significant staining or discolouration of the concrete floor was noted beneath the transformer that may be suggestive of previous leakage.';
          pcbSummaryParagraphs.push(
            `1 liquid-filled transformer was identified in ${transformerLocation} of the project areas that was identified to be PCB-containing. ${leakageSigns} The transformer itself was observed to be in good condition and did not exhibit any signs of leakage.`
          );
        }
        // Wall-mounted capacitors
        if (area.wallMountedCapacitor === 'Yes') {
          let capCount = area.wallMountedCapacitorCount || 'N/A';
          let capLeakage = area.capacitorLeakageSigns === 'Yes' ? 'was verified to not contain PCBs while the second capacitor is assumed to be PCB-containing. No suspect leakage was observed on the exterior casing of these capacitors.' : 'is assumed to be PCB-containing. No suspect leakage was observed on the exterior casing of these capacitors.';
          pcbSummaryParagraphs.push(
            `(wall-mounted capacitors) ${capCount} wall-mounted capacitors were identified in the project areas. Based on the nameplate information obtained, ${capLeakage}`
          );
        }
      }
      // Area-specific ODS/GWS assessment (dynamic)
      let areaOdsObserved = area.odsObserved === 'Yes';
      let areaOdsAssessment = [];
      if (areaOdsObserved && Array.isArray(area.odsGwsAssessmentTable)) {
        areaOdsAssessment = area.odsGwsAssessmentTable.map(item => ({
          location: item.tableLocation || '',
          equipmentType: item.tableEquipmentManufacturerType || '',
          refrigerantType: item.tableRefrigerantTypeQuantity || '',
          classification: item.tableOdsGwsClassification || ''
        }));
      }
      // ODS summary paragraphs
      let odsSummaryParagraphs = [];
      if (areaOdsObserved) {
        if (area.hasAirConditioning === 'Yes') {
          let acCount = area.acUnitCount || 'N/A';
          let acSize = area.acUnitSize || 'N/A';
          odsSummaryParagraphs.push(`There are ${acCount} air conditioning unit(s) (${acSize}) present in the project area.`);
        }
        if (area.refrigerantType) {
          let refrigerant = area.refrigerantType;
          let pounds = area.refrigerantPounds || 'N/A';
          odsSummaryParagraphs.push(`The refrigerant type is ${refrigerant} with approximately ${pounds} pounds present.`);
        }
        if (area.fireExtinguishingEquipment === 'Yes') {
          odsSummaryParagraphs.push('Fire extinguishing equipment is present in the project area.');
        }
      }
      return {
        areaName: area.name || area.id || `Area ${area.areaNumber || ''}`,
        areaNumber: area.areaNumber || '',
        asbestosAssessment: areaAsbestosAssessment,
        leadAssessment: areaLeadAssessment,
        suspectLeadMaterials: areaSuspectLeadMaterials,
        mercuryAssessment: areaMercurySourcesMaterials,
        silicaObserved: areaSilicaObserved,
        silicaMaterials: areaSilicaMaterials,
        mercuryPresent: areaMercuryPresent,
        mercurySourcesMaterials: areaMercurySourcesMaterials,
        mouldAssessment: areaMouldAssessment,
        pestInfestationObserved: areaPestInfestationObserved,
        infestationType: areaInfestationType,
        droppingsObserved: areaDroppingsObserved,
        droppingsLocation: areaDroppingsLocation,
        pcbObserved: areaPcbObserved,
        pcbAssessment: areaPcbAssessment,
        pcbSummaryParagraphs: pcbSummaryParagraphs,
        odsObserved: areaOdsObserved,
        odsAssessment: areaOdsAssessment,
        odsSummaryParagraphs: odsSummaryParagraphs,
        // Add more area-specific mapped data here as needed
      };
    });
  }
  
  return {
    // Basic report information
    reportName: report.name || 'Comprehensive Designated Substances and Hazardous Materials Assessment Report',
    reportNumber: `RPT-${report.id.toString().padStart(6, '0')}`,
    reportDate: reportDate,
    
    // Project information
    projectName: project?.name || 'N/A',
    projectNumber: project?.project_no || 'N/A',
    projectContactName: project?.site_contact_name || 'N/A',
    projectContactTitle: project?.site_contact_title || 'N/A',
    projectLocation: project?.location?.address_line_1 + ' ' + project?.location?.address_line_2 + ' ' + project?.location?.city + ' ' + project?.location?.province + ' ' + project?.location?.postal_code || 'N/A',
    projectDescription: project?.description || 'Comprehensive environmental assessment and designated substances survey project',
    
    // Client information
    clientName: primaryArea.clientCompanyName || customer?.name || 'N/A',
    customerHeadOfficeAddress: primaryArea?.clientAddress || 'N/A',
    
    // Assessment information
    assessmentDate: primaryArea.inspectionDate ? formatDate(primaryArea.inspectionDate) : formatDate(report.date_of_assessment),
    assessmentDueTo: report.assessment_due_to || 'Construction, renovation, and demolition activities',
    dateOfLoss: report.date_of_loss ? formatDate(report.date_of_loss) : null,
    
    // Assessment details
    areasAssessed: `${areaDetails.length} area(s) were comprehensively assessed for designated substances and hazardous materials in accordance with regulatory requirements.`,
    
    // Logo URL
    logoUrl: 'https://safetech-dev-images.s3.ca-central-1.amazonaws.com/profiles/image.png',

    // Technician Details
    technicianName: project?.technician?.first_name + ' ' + project?.technician?.last_name || 'N/A',
    technicianSignature: project?.technician?.technician_signature || 'N/A',
    pmName: project?.pm?.first_name + ' ' + project?.pm?.last_name || 'N/A',
    pmSignature: project?.pm?.technician_signature || 'N/A',
    
    // Assessment data
    assessmentResponses,
    photos: allPhotos,
    keyFindings,
    recommendations,
    controlMeasures,
    workProcedures,
    monitoringRequirements,
    assessmentChecklist,
    
    // Area details for template
    areaDetails,
    
    // Laboratory results (if available)
    labResults: [],

    // Summary table for hazardous materials and designated substances
    summaryTable,
    // Add dynamic Table 2 mapping for asbestos samples
    asbestosSamples,
    // Add dynamic Table 3 mapping
    asbestosAssessment,
    // Add dynamic Table 4 mapping for lead samples
    leadSamples,
    // Add dynamic Table 4 mapping    
    leadAssessment,
    // Add dynamic Table 5 mapping
    pcbAssessment,
    // Area-specific sectioned output
    areaSections,

    // Comprehensive Area Assessment Summary

    // Asbestos data for template
    asbestosFound: asbestosContainingMaterials.length > 0 || suspectAsbestosMaterials.length > 0,
    asbestosContainingMaterials: asbestosContainingMaterials,
    suspectAsbestosMaterials: suspectAsbestosMaterials,

    // Lead data for template
    leadFound: leadContainingMaterials.length > 0 || suspectLeadMaterials.length > 0,
    leadContainingMaterials: leadContainingMaterials,
    suspectLeadMaterials: suspectLeadMaterials,

    // Mercury data for template
    mercuryFound: mercuryContainingMaterials.length > 0 || suspectMercuryMaterials.length > 0,
    mercuryContainingMaterials: mercuryContainingMaterials,
    suspectMercuryMaterials: suspectMercuryMaterials,

    // Silica data for template
    silicaFound: silicaContainingMaterials.length > 0 || suspectSilicaMaterials.length > 0,
    silicaContainingMaterials: silicaContainingMaterials,
    suspectSilicaMaterials: suspectSilicaMaterials,

    // Pest Infestation data for template
    pestInfestationData: pestInfestationData,
  };
};

// Header template for PDF reports
const getHeaderTemplate = (logoPath = 'coloredsafetech.png') => {
  // Try to read the logo file and convert to base64 for better PDF compatibility
  try {
    const logoFilePath = path.join(__dirname, '../public', path.basename(logoPath));
    console.log('Attempting to load logo from:', logoFilePath);
    
    if (fs.existsSync(logoFilePath)) {
      console.log('Logo file found, reading...');
      const logoBuffer = fs.readFileSync(logoFilePath);
      const base64Logo = logoBuffer.toString('base64');
      const mimeType = path.extname(logoPath).toLowerCase() === '.png' ? 'image/png' : 'image/jpeg';
      
      console.log('Logo converted to base64, length:', base64Logo.length);
      
      return `
        <div style="width:100%; padding:0 20px; box-sizing:border-box;">
          <div style="max-width:1000px; margin:0 auto; position:relative; height:60px; text-align: right;">
            <img src="data:${mimeType};base64,${base64Logo}" style="height: 100px;" />
          </div>
        </div>
      `;
    } else {
      console.warn('Logo file not found at:', logoFilePath);
    }
  } catch (error) {
    console.error('Error loading logo file:', error.message);
  }
  
  // Fallback to URL approach
  console.log('Using fallback URL approach for logo');
  return `
    <div style="width:100%; padding:0 20px; box-sizing:border-box;">
      <div style="max-width:1000px; margin:0 auto; position:relative; height:60px; text-align: right;">
        <img src="/${logoPath}" style="height: 100px;" />
      </div>
    </div>
  `;
};

// Footer template for PDF reports
const getFooterTemplate = (templateData) => `
  <div style="width: 100%; padding: 0 20px; box-sizing: border-box; font-family: Arial, sans-serif; font-size: 10px; color: #000;">
    <div style="border-top: 2px solid #F9B233; margin-bottom: 4px;"></div>

    <div style="display: grid; grid-template-columns: 1fr auto 1fr; text-align: center; line-height: 1.4;">
      <div style="text-align: left;">
        Safetech Project No: ${templateData?.projectNumber || ''}
      </div>

      <div>
        <div>Designated Substances and Hazardous Materials Assessment Report</div>
        <div>${templateData?.projectName || ''}</div>
        <div>${templateData?.projectLocation || ''}</div>
      </div>

      <div style="text-align: right;">
        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
      </div>
    </div>
  </div>
`;

// Test function to verify logo loading
const testLogoLoading = () => {
  try {
    const logoPath = 'coloredsafetech.png';
    const logoFilePath = path.join(__dirname, '../public', path.basename(logoPath));
    console.log('Testing logo loading from:', logoFilePath);
    
    if (fs.existsSync(logoFilePath)) {
      console.log('✅ Logo file exists');
      const logoBuffer = fs.readFileSync(logoFilePath);
      const base64Logo = logoBuffer.toString('base64');
      console.log('✅ Logo converted to base64, length:', base64Logo.length);
      return true;
    } else {
      console.log('❌ Logo file not found');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing logo loading:', error.message);
    return false;
  }
};

// Run test on module load
testLogoLoading();

module.exports = {
  renderTemplate,
  prepareReportData,
  getHeaderTemplate,
  getFooterTemplate,
  testLogoLoading
}; 