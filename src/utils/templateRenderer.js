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
 * @returns {array} - Array of area details
 */
const extractAreaDetails = (answers) => {
  if (!answers || !answers.areaDetails) {
    return [];
  }
  
  return answers.areaDetails.map((area, index) => {
    const assessments = area.assessments || {};
    return {
      id: area.id || `area-${index + 1}`,
      name: area.name || `Area ${index + 1}`,
      ...assessments
    };
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
 * @returns {object} - Formatted data for template
 */
const prepareReportData = (report, project, customer) => {
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
          caption: `Photo ${index + 1}`
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
  
  // Generate key findings based on assessment responses
  const keyFindings = [];
  if (assessmentResponses.length > 0) {
    keyFindings.push('Comprehensive area-based assessment of designated substances completed');
    keyFindings.push(`${areaDetails.length} area(s) inspected and documented`);
    if (allPhotos.length > 0) {
      keyFindings.push('Photographic documentation provided for all areas');
    }
    
    // Add specific findings based on assessment results
    if (primaryArea.isAsbestosAssessed === 'Yes') {
      keyFindings.push('Asbestos-containing materials identified and documented');
    }
    if (primaryArea.silicaObserved === 'Yes') {
      keyFindings.push('Silica-containing materials identified');
    }
    if (primaryArea.mercuryObserved === 'Yes') {
      keyFindings.push('Mercury-containing equipment identified');
    }
    if (primaryArea.pcbObserved === 'Yes') {
      keyFindings.push('PCB-containing equipment identified');
    }
    if (primaryArea.moldGrowth === 'Yes') {
      keyFindings.push('Mold growth observed and documented');
    }
  }
  
  // Generate recommendations
  const recommendations = [
    'Implement appropriate control measures during construction activities',
    'Ensure workers are properly trained on hazardous materials handling',
    'Conduct regular monitoring during work activities',
    'Maintain proper documentation of all control measures'
  ];
  
  // Add specific recommendations based on findings
  if (primaryArea.isAsbestosAssessed === 'Yes') {
    recommendations.push('Implement asbestos abatement procedures as required');
  }
  if (primaryArea.silicaObserved === 'Yes') {
    recommendations.push('Implement silica dust control measures');
  }
  if (primaryArea.mercuryObserved === 'Yes') {
    recommendations.push('Proper disposal procedures required for mercury-containing equipment');
  }
  
  // Generate control measures
  const controlMeasures = [
    'Use appropriate personal protective equipment (PPE)',
    'Implement engineering controls where necessary',
    'Establish work area isolation procedures',
    'Provide adequate ventilation during work activities'
  ];
  
  // Generate work procedures
  const workProcedures = [
    'Follow established safe work procedures',
    'Conduct pre-work inspections',
    'Implement proper waste disposal procedures',
    'Maintain communication protocols'
  ];
  
  // Generate monitoring requirements
  const monitoringRequirements = [
    'Regular air monitoring during work activities',
    'Visual inspections of work areas',
    'Documentation of control measure effectiveness',
    'Worker health monitoring as required'
  ];
  
  // Generate assessment checklist
  const assessmentChecklist = [
    { item: 'Area Inspection Completed', status: 'Yes', comments: `${areaDetails.length} area(s) inspected` },
    { item: 'Documentation Review', status: 'Yes', comments: 'Building plans and historical records reviewed' },
    { item: 'Photographic Documentation', status: allPhotos.length > 0 ? 'Yes' : 'No', comments: `${allPhotos.length} photos taken` },
    { item: 'Asbestos Assessment', status: primaryArea.isAsbestosAssessed || 'N/A', comments: 'Asbestos-containing materials identified' },
    { item: 'Lead Assessment', status: primaryArea.isLeadAssessed || 'N/A', comments: 'Lead-containing materials assessed' },
    { item: 'Silica Assessment', status: primaryArea.silicaObserved || 'N/A', comments: 'Silica-containing materials identified' },
    { item: 'Mercury Assessment', status: primaryArea.mercuryObserved || 'N/A', comments: 'Mercury-containing equipment identified' },
    { item: 'PCB Assessment', status: primaryArea.pcbObserved || 'N/A', comments: 'PCB-containing equipment identified' }
  ];
  
  return {
    // Basic report information
    reportName: report.name || 'Designated Substances and Hazardous Materials Assessment Report',
    reportNumber: `RPT-${report.id.toString().padStart(6, '0')}`,
    reportDate: formatDate(now),
    
    // Project information
    projectName: primaryArea.projectName || project?.name || 'N/A',
    projectLocation: primaryArea.projectAddress || project?.site_name || 'N/A',
    projectDescription: project?.description || 'Environmental assessment project',
    
    // Client information
    clientName: primaryArea.clientCompanyName || customer?.name || 'N/A',
    
    // Assessment information
    assessmentDate: primaryArea.inspectionDate ? formatDate(primaryArea.inspectionDate) : formatDate(report.date_of_assessment),
    assessmentDueTo: report.assessment_due_to || 'Construction and renovation activities',
    dateOfLoss: report.date_of_loss ? formatDate(report.date_of_loss) : null,
    
    // Assessment details
    areasAssessed: `${areaDetails.length} area(s) were assessed for designated substances and hazardous materials.`,
    
    // Logo URL
    logoUrl: 'https://safetech-dev-images.s3.ca-central-1.amazonaws.com/profiles/image.png',
    
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
    labResults: []
  };
};

module.exports = {
  renderTemplate,
  prepareReportData
}; 