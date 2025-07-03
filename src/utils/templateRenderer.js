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

  // Generate summary table for hazardous materials and designated substances
  const summaryTable = [
    {
      substance: 'Asbestos',
      findings: `The following asbestos-containing materials were identified in the subject area that may be impacted during the project:<ul>${primaryArea.asbestosMaterials ? primaryArea.asbestosMaterials.map(item => `<li>${item}</li>`).join('') : '<li>N/A</li>'}</ul>
      ${primaryArea.suspectedAsbestosMaterials ? 'The following building materials are suspected to be asbestos-containing:<ul>' + primaryArea.suspectedAsbestosMaterials.map(item => `<li>${item}</li>`).join('') + '</ul>' : ''}`,
      recommendations: `Disturbance of asbestos-containing materials must be conducted in accordance with Ontario Regulation 278/05 <i>Designated Substance – Asbestos on Construction Projects and in Building and Repair Operations</i>. Refer to Table 3 (Results of Assessment for Asbestos-Containing Materials), Section 3.1.1 (Conclusions and Recommendations), Appendix A (Summary of ACM Occurrences) and Appendix B (Site Drawings). Asbestos-containing materials must be disposed of in accordance with R.R.O. 1990, Regulation 347, <i>General - Waste Management</i>.`
    },
    {
      substance: 'Lead',
      findings: `White paint was confirmed to be a low-level lead-containing paint (&le;0.1% lead content).<br>Light blue and yellow paint was confirmed to be not lead-containing paint (&le;0.009% lead content).<br>The following materials are assumed to be lead-containing:<ul><li>paints and surface coatings (not sampled)</li><li>glazing associated with ceramic tiles</li><li>batteries associated with emergency lighting</li><li>solder in copper pipe fittings</li><li>solder in electrical components</li></ul>`,
      recommendations: `Disturbance of lead-containing materials must be conducted in accordance with the Ontario Ministry of Labour <i>Lead on Construction Projects</i> guideline (2011) and/or the Environmental Abatement Council of Ontario (EACO) <i>Lead Guideline</i> (October 2014). For additional details, refer to Section 2.1.2 (Results) and Section 3.1.2 (Conclusions and Recommendations). Lead-containing wastes should be recycled if practicable or handled and disposed of according to R.R.O. 1990, Regulation 347, <i>General - Waste Management</i>.`
    },
    {
      substance: 'Mercury',
      findings: `Sources of mercury were observed in the subject area and include the following:<ul><li>vapour in fluorescent lamps</li><li>vapour in HID lamps</li><li>liquid in thermostats</li><li>thermometers associated with the boiler</li><li>thermometers associated with mechanical equipment</li></ul>`,
      recommendations: `If required, handle lamps with care and keep intact. All waste lamps are recommended to be sent to a lamp recycling facility. If required, handle lamps and vials with care and keep intact. All waste lamps and vials are recommended to be sent to a lamp recycling facility.`
    },
    {
      substance: 'Silica',
      findings: `Building materials identified that are suspected to contain crystalline silica and may be disturbed as part of the planned construction project include:<ul><li>drywall walls/drywall joint compound</li><li>concrete</li><li>mortar</li><li>refractory associated with the boiler</li></ul>`,
      recommendations: `Any work involving the disturbance of silica-containing materials should follow the procedures outlined in the Ontario Ministry of Labour <i>Silica on Construction Projects</i> guideline. For additional information, refer to Section 2.1.4 (Results) and Section 3.1.4 (Conclusions and Recommendations).`
    },
    {
      substance: 'Other Designated Substances',
      findings: `No other designated substances are expected to be present in any significant quantities or in a form that would represent an exposure concern.`,
      recommendations: `No protective measures or procedures specific to acrylonitrile, arsenic, benzene, coke oven emissions, ethylene oxide, isocyanates, and vinyl chloride are considered necessary.`
    },
    {
      substance: 'Other Hazardous Materials',
      findings: `<ul><li><b>Urea Formaldehyde Foam Insulation:</b> No UFFI was identified or is suspected in the subject area.</li><li><b>Mould Contamination:</b> No suspect mould contamination was observed on building finishes in the subject area.</li><li><b>Pest Infestation:</b> No pest infestations were observed in the areas assessed.</li><li><b>Polychlorinated Biphenyls:</b> No equipment was observed that is suspected to contain PCBs.</li><li><b>Ozone Depleting and Global Warming Substances:</b> No equipment was observed that is suspected to contain ozone depleting and/or global warming substances.</li></ul>`,
      recommendations: `No action required.`
    }
  ];

  console.log("primaryArea.projectName=>", primaryArea.projectName);
  return {
    // Basic report information
    reportName: report.name || 'Comprehensive Designated Substances and Hazardous Materials Assessment Report',
    reportNumber: `RPT-${report.id.toString().padStart(6, '0')}`,
    reportDate: formatDate(now),
    
    // Project information
    projectName: project?.name || 'N/A',
    projectNumber: project?.project_no || 'N/A',
    projectContactName: project?.site_contact_name || 'N/A',
    projectContactTitle: project?.site_contact_title || 'N/A',
    projectLocation: project.location.address_line_1 + ' ' + project.location.address_line_2 + ' ' + project.location.city + ' ' + project.location.province + ' ' + project.location.postal_code || 'N/A',
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
    summaryTable
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