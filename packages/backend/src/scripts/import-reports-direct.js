#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const db = require('../models');
const { Report } = db;

// Manual report data extracted from SQL file
const reportsData = [
  {
    id: '1c94e8da-ddf2-4ff6-82d5-4c9f910cdb9b',
    name: 'Designated Substances and Hazardous Materials Assessment Report',
    project_id: '79094779-b28c-4e95-b030-5d8b74c3cdd9',
    report_template_id: '9bc0e9fc-a0e7-4037-89e8-f0202e827dcb',
    assessment_due_to: '',
    date_of_loss: null,
    date_of_assessment: null,
    answers: {
      areaDetails: [{
        id: "area-1",
        name: "Area 1",
        assessments: {
          pmName: "David Martinez",
          endDate: "2025-07-04",
          pmEmail: "david.martinez754@yopmail.com",
          pmPhone: "730-739-8597",
          startDate: "2025-06-29",
          contactName: "Joe Contact",
          projectName: "Fire Restoration - Recovery",
          contactEmail: "chris+joecontact@dastech.ca",
          contactPhone: "5555555555",
          clientAddress: "123 Fake, Line 2, Miss, ON, L4L4L4",
          projectNumber: "",
          projectAddress: "123 Fake, Line 2, Miss, ON, L4L4L4",
          technicianName: "Charles Jackson",
          contactPosition: "",
          technicianEmail: "charles.jackson201@yopmail.com",
          technicianPhone: "437-576-7616",
          technicianTitle: "Technician",
          specificLocation: "Kitchen Area",
          clientCompanyName: "Acme Inc.",
          technicianSignature: "https://safetech-dev-images.s3.ca-central-1.amazonaws.com/profiles/1750916263898-signature-pro-wMXWYDlN-Oc-unsplash.jpg"
        }
      }]
    },
    photos: [],
    status: true,
    created_at: '2025-06-30 11:14:53',
    updated_at: '2025-06-30 11:15:19',
    deleted_at: '2025-06-30 16:46:31',
    pm_feedback: null
  },
  {
    id: '3ff558d8-8520-49b0-af88-cb9fe5c360f0',
    name: 'Designated Substances and Hazardous Materials Assessment Report',
    project_id: 'cde36863-768d-4067-88d9-26e5057ea165',
    report_template_id: '9bc0e9fc-a0e7-4037-89e8-f0202e827dcb',
    assessment_due_to: '',
    date_of_loss: null,
    date_of_assessment: null,
    answers: {
      notes: [],
      areaDetails: [{
        id: "area-1",
        name: "WI-1 Stairwell",
        areaNumber: 1,
        assessments: {
          pmName: "David Martinez",
          endDate: "2025-10-31",
          pmEmail: "david.martinez754@yopmail.com",
          pmPhone: "730-739-8597",
          startDate: "2025-10-27",
          moldGrowth: "No",
          contactName: "PrimaryContactFirstName PrimaryContactLastName",
          odsObserved: "No",
          pcbObserved: "No",
          projectName: "Window Replacement Project (Phase 1)",
          contactEmail: "chris+reporttest@dastech.ca",
          contactPhone: "416-555-5555",
          areThereVials: "Yes",
          areaAvailable: "Yes",
          clientAddress: "285 Victoria Street, Toronto, Ontario, M5B 1W1",
          leadMaterials: [],
          projectNumber: "68742",
          waterStaining: "No",
          isLeadAssessed: "No",
          mouldMaterials: [],
          projectAddress: "285 Victoria Street, Toronto, Ontario, M5B 1W1",
          silicaObserved: "No",
          technicianName: "Jack Reacher",
          contactPosition: "",
          mercuryObserved: "Yes",
          silicaMaterials: [],
          technicianEmail: "reacher@yopmail.com",
          technicianPhone: "9874563211",
          technicianTitle: "Technician",
          hidLightsPresent: "No",
          mercuryMaterials: [{
            id: "mercury-1761548637314-8iu6dcny3",
            photos: [],
            location: "",
            timestamp: "2025-10-27T07:03:57.314Z",
            description: "",
            materialType: "Custome 00002",
            sampleCollected: "No",
            isCustomMaterial: true,
            suspectedMercury: "No",
            customMaterialName: "Custome 00002"
          }],
          specificLocation: "SpecificLocation",
          asbestosMaterials: [{
            id: "material-1761542871502",
            isTile: false,
            photos: ["https://safetech-dev-images.s3.ca-central-1.amazonaws.com/reports/3ff558d8-8520-49b0-af88-cb9fe5c360f0/1761560455776-download%20%282%29.jpg"],
            location: "",
            quantity: "",
            sampleId: "S10039",
            sampleNo: "1A",
            condition: "Unknown",
            timestamp: "2025-10-27T06:27:58.562Z",
            description: "",
            materialType: "Spray Fire-proofing (50%)",
            areaAvailable: "Yes",
            suspectedAsbestos: "No",
            sampleCollected: "Yes"
          }],
          clientCompanyName: "Toronto Metropolitan University"
        }
      }]
    },
    photos: [],
    status: true,
    created_at: '2025-10-27 04:39:45',
    updated_at: '2025-10-27 08:19:16',
    deleted_at: null,
    pm_feedback: null
  },
  {
    id: '9f3291aa-2085-4bd0-9190-fd5d8ecf48cc',
    name: 'Designated Substances and Hazardous Materials Assessment Report',
    project_id: '7236a707-ec22-4634-a2e4-1d6c2c54fad4',
    report_template_id: '9bc0e9fc-a0e7-4037-89e8-f0202e827dcb',
    assessment_due_to: '',
    date_of_loss: null,
    date_of_assessment: null,
    answers: {
      areaDetails: [{
        id: "area-1",
        name: "Area 1",
        areaNumber: 1,
        assessments: {
          pmName: "David Martinez",
          endDate: "2025-07-11",
          pmEmail: "david.martinez754@yopmail.com",
          pmPhone: "730-739-8597",
          hasLamps: "Yes",
          lampCount: "3",
          startDate: "2025-07-07",
          acUnitSize: "medium",
          moldGrowth: "Yes",
          moldImpact: "No",
          acUnitCount: "3",
          contactName: "James White",
          fixtureSize: "T12",
          fixtureType: "test type data",
          odsObserved: "Yes",
          pcbObserved: "No",
          projectName: "Demolition Project",
          contactEmail: "william636@yopmail.com",
          contactPhone: "402-579-5512",
          areThereVials: "Yes",
          areaAvailable: "Yes",
          clientAddress: "1238 Main St, Suite 201, Seattle, IN, 24312",
          documentsUsed: "test docs",
          leadMaterials: [{
            materialPhoto: ["https://safetech-dev-images.s3.ca-central-1.amazonaws.com/reports/9f3291aa-2085-4bd0-9190-fd5d8ecf48cc/1751953022390-download.jpg"],
            materialLocation: "Test loc and desc",
            materialDescription: "Test loc and desc"
          }],
          projectNumber: "",
          waterStaining: "Yes",
          areaSquareFeet: "4000",
          flooringMastic: "Yes",
          hidLightsCount: "3",
          inspectionDate: "2025-07-08",
          isLeadAssessed: "Yes",
          projectAddress: "1238 Main St, Suite 201, Seattle, IN, 24312",
          silicaObserved: "Yes",
          technicianName: "Jack Reacher",
          technicianEmail: "reacher@yopmail.com",
          technicianPhone: "9874563211",
          clientCompanyName: "New Company"
        }
      }]
    },
    photos: [],
    status: true,
    created_at: '2025-07-08 05:33:24',
    updated_at: '2025-07-10 06:47:31',
    deleted_at: null,
    pm_feedback: null
  },
  {
    id: 'baed87d2-1927-4b9f-92bf-e4fa9d71322f',
    name: 'Designated Substances and Hazardous Materials Assessment Report',
    project_id: 'a6427955-c1fe-4d5c-81b0-fd39d0cc0328',
    report_template_id: '9bc0e9fc-a0e7-4037-89e8-f0202e827dcb',
    assessment_due_to: '',
    date_of_loss: null,
    date_of_assessment: null,
    answers: {
      notes: [],
      areaDetails: [{
        id: "area-1",
        name: "Reception",
        areaNumber: 1,
        assessments: {
          floor: "1",
          pmName: "David Martinez",
          endDate: "2025-09-30",
          pmEmail: "david.martinez754@yopmail.com",
          pmPhone: "730-739-8597",
          startDate: "2025-09-16",
          moldGrowth: "Yes",
          moldImpact: "No",
          contactName: "Contactname Contactlast",
          odsObserved: "Yes",
          pcbObserved: "No",
          projectName: "Interior test",
          contactEmail: "info@safetechenv.com",
          contactPhone: "5555555555",
          areThereVials: "No",
          areaAvailable: "Yes",
          clientAddress: "123 fake st, Miss, Ontario, L5J 2X6",
          leadMaterials: [{
            id: "material-1759482080742",
            photos: ["https://safetech-dev-images.s3.ca-central-1.amazonaws.com/reports/baed87d2-1927-4b9f-92bf-e4fa9d71322f/1759862418282-20251006_152434.jpg"],
            location: "Walls",
            sampleId: "S10008",
            sampleNo: "Reception-L4A",
            timestamp: "2025-10-07T18:40:11.926Z",
            description: "",
            materialType: "Paint, Grey-Blue",
            suspectedLead: "No",
            percentageLead: null,
            sampleCollected: "Yes",
            isCustomMaterial: true,
            customMaterialName: "Paint, Grey-Blue"
          }],
          projectAddress: "123 fake st, Miss, Ontario, L5J 2X6",
          silicaObserved: "No",
          technicianName: "Jack Reacher",
          technicianEmail: "reacher@yopmail.com",
          technicianPhone: "9874563211",
          specificLocation: "Reception Area",
          clientCompanyName: "Safetech Env"
        }
      }]
    },
    photos: [],
    status: true,
    created_at: '2025-09-23 09:02:30',
    updated_at: '2025-10-07 19:01:45',
    deleted_at: null,
    pm_feedback: 'This report needs more details on asbestos materials.'
  },
  {
    id: 'c66943d9-d54e-469f-9222-f3e7194d9436',
    name: 'Designated Substances and Hazardous Materials Assessment Report',
    project_id: 'bf27d459-425d-4d98-a9ba-db2e14d8bfeb',
    report_template_id: '9bc0e9fc-a0e7-4037-89e8-f0202e827dcb',
    assessment_due_to: '',
    date_of_loss: null,
    date_of_assessment: null,
    answers: {
      notes: [],
      areaDetails: [{
        id: "area-1",
        name: "First Area",
        areaNumber: 1,
        assessments: {
          floor: "123",
          pmName: "David Martinez",
          endDate: "2026-01-02",
          pmEmail: "david.martinez754@yopmail.com",
          pmPhone: "730-739-8597",
          startDate: "2025-10-01",
          moldGrowth: "Yes",
          contactName: "Joe Contact",
          odsObserved: "Yes",
          pcbObserved: "Yes",
          projectName: "Test Project for Assessing via Mobile",
          contactEmail: "chris+joecontact@dastech.ca",
          contactPhone: "5555555555",
          areThereVials: "No",
          clientAddress: "123 Fake, Line 2, Miss, ON, L4L4L4",
          projectAddress: "123 Fake, Line 2, Miss, ON, L4L4L4",
          technicianName: "Jack Reacher",
          technicianEmail: "reacher@yopmail.com",
          technicianPhone: "9874563211",
          specificLocation: "Test Location",
          clientCompanyName: "Acme Inc."
        }
      }]
    },
    photos: [],
    status: true,
    created_at: '2025-10-07 08:20:14',
    updated_at: '2025-10-15 13:15:20',
    deleted_at: null,
    pm_feedback: null
  },
  {
    id: 'ce6ecc31-6007-425b-8949-9e80ef94e754',
    name: 'Designated Substances and Hazardous Materials Assessment Report',
    project_id: '6546e74d-02b9-4d32-987a-13f0daa81289',
    report_template_id: '9bc0e9fc-a0e7-4037-89e8-f0202e827dcb',
    assessment_due_to: '',
    date_of_loss: null,
    date_of_assessment: null,
    answers: {
      notes: [],
      areaDetails: [{
        id: "area-1",
        name: "Main Roof",
        areaNumber: 1,
        assessments: {
          floor: "111",
          pmName: "David Martinez",
          endDate: "2025-08-31",
          pmEmail: "david.martinez754@yopmail.com",
          pmPhone: "730-739-8597",
          startDate: "2025-07-14",
          hasLamps: "Yes",
          lampCount: "None",
          moldGrowth: "Yes",
          moldImpact: "Yes",
          acUnitSize: "medium",
          acUnitCount: "2",
          contactName: "James White",
          fixtureSize: "T8",
          fixtureType: "Test 1",
          odsObserved: "Yes",
          pcbObserved: "Yes",
          projectName: "St. Matthias Catholic School Demolition",
          contactEmail: "william636@yopmail.com",
          contactPhone: "402-579-5512",
          areThereVials: "Yes",
          areaAvailable: "Yes",
          clientAddress: "1238 Main St, Suite 201, Seattle, IN, 24312",
          projectAddress: "1238 Main St, Suite 201, Seattle, IN, 24312",
          technicianName: "Jack Reacher",
          technicianEmail: "reacher@yopmail.com",
          technicianPhone: "9874563211",
          clientCompanyName: "New Company"
        }
      }]
    },
    photos: [],
    status: true,
    created_at: '2025-10-06 11:33:51',
    updated_at: '2025-10-29 14:26:58',
    deleted_at: null,
    pm_feedback: null
  }
];

async function importReports() {
  console.log('📊 Starting simplified reports import...\n');
  
  let imported = 0;
  let skipped = 0;
  let failed = 0;

  for (const reportData of reportsData) {
    try {
      // Check if project exists
      const project = await db.Project.findByPk(reportData.project_id);
      
      if (!project) {
        console.log(`⚠️  Skipping report ${reportData.id.substring(0, 8)}... - project ${reportData.project_id.substring(0, 8)}... not found`);
        skipped++;
        continue;
      }

      // Check if report already exists
      const existingReport = await Report.findByPk(reportData.id);
      if (existingReport) {
        console.log(`⚠️  Report ${reportData.id.substring(0, 8)}... already exists`);
        skipped++;
        continue;
      }

      // Create the report
      await Report.create(reportData);
      imported++;
      console.log(`✅ Imported report ${imported}: ${reportData.id.substring(0, 8)}... for project: ${project.name}`);
      
    } catch (error) {
      failed++;
      console.error(`❌ Failed to import report ${reportData.id.substring(0, 8)}...: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 REPORTS IMPORT SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Successfully Imported: ${imported} reports`);
  console.log(`⚠️  Skipped: ${skipped} reports`);
  console.log(`❌ Failed: ${failed} reports`);
  console.log(`📋 Total Processed: ${reportsData.length} reports`);
  console.log('='.repeat(80));
}

// Run the import
importReports()
  .then(() => {
    console.log('\n✅ Reports import completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  });