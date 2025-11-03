const db = require('../models');
const Report = db.Report;

async function importReports() {
  try {
    console.log('📊 Starting reports data import...\n');

    // Report 1: Window Replacement Project (Phase 1)
    const report1 = await Report.create({
      id: '3ff558d8-8520-49b0-af88-cb9fe5c360f0',
      name: 'Designated Substances and Hazardous Materials Assessment Report',
      project_id: 'cde36863-768d-4067-88d9-26e5057ea165',
      report_template_id: '9bc0e9fc-a0e7-4037-89e8-f0202e827dcb',
      assessment_due_to: '',
      date_of_loss: null,
      date_of_assessment: null,
      answers: {
        "notes": [],
        "areaDetails": [{
          "id": "area-1",
          "name": "WI-1 Stairwell",
          "areaNumber": 1,
          "assessments": {
            "pmName": "David Martinez",
            "endDate": "2025-10-31",
            "pmEmail": "david.martinez754@yopmail.com",
            "pmPhone": "730-739-8597",
            "startDate": "2025-10-27",
            "projectName": "Window Replacement Project (Phase 1)",
            "contactName": "PrimaryContactFirstName PrimaryContactLastName",
            "contactEmail": "chris+reporttest@dastech.ca",
            "contactPhone": "416-555-5555",
            "clientAddress": "285 Victoria Street, Toronto, Ontario, M5B 1W1",
            "projectAddress": "285 Victoria Street, Toronto, Ontario, M5B 1W1",
            "projectNumber": "68742",
            "technicianName": "Jack Reacher",
            "technicianEmail": "reacher@yopmail.com",
            "technicianPhone": "9874563211",
            "specificLocation": "SpecificLocation",
            "clientCompanyName": "Toronto Metropolitan University"
          }
        }],
        "scopeOfWork": [
          "A review of existing documents, including renovation documents and drawings, floor plans and existing environmental assessment reports, etc., where available;",
          "A visual assessment of accessible area(s) in the project areas to identify the presence, location, condition and quantities of designated substances and other hazardous materials;",
          "Collection, analysis and interpretation of representative bulk samples of suspect asbestos-containing building materials for the determination of asbestos content and material classification;",
          "Collection, analysis and interpretation of representative paint chip samples for the determination of lead content; and",
          "Preparation of a report to document findings and provide recommendations regarding control measures and/or special handling procedures for designated substances or specific hazardous materials that may be disturbed as part of planned activities."
        ]
      },
      photos: [],
      status: true,
      created_at: '2025-10-27 04:39:45',
      updated_at: '2025-10-27 08:19:16',
      deleted_at: null,
      pm_feedback: null
    });
    console.log('✅ Imported Report 1:', report1.id, '- Window Replacement Project');

    // Report 2: Demolition Project
    const report2 = await Report.create({
      id: '9f3291aa-2085-4bd0-9190-fd5d8ecf48cc',
      name: 'Designated Substances and Hazardous Materials Assessment Report',
      project_id: '7236a707-ec22-4634-a2e4-1d6c2c54fad4',
      report_template_id: '9bc0e9fc-a0e7-4037-89e8-f0202e827dcb',
      assessment_due_to: '',
      date_of_loss: null,
      date_of_assessment: null,
      answers: {
        "areaDetails": [{
          "id": "area-1",
          "name": "Area 1",
          "areaNumber": 1,
          "assessments": {
            "pmName": "David Martinez",
            "endDate": "2025-07-11",
            "pmEmail": "david.martinez754@yopmail.com",
            "pmPhone": "730-739-8597",
            "startDate": "2025-07-07",
            "projectName": "Demolition Project",
            "contactName": "James White",
            "contactEmail": "william636@yopmail.com",
            "contactPhone": "402-579-5512",
            "clientAddress": "1238 Main St, Suite 201, Seattle, IN, 24312",
            "projectAddress": "1238 Main St, Suite 201, Seattle, IN, 24312",
            "projectNumber": "",
            "technicianName": "Jack Reacher",
            "technicianEmail": "reacher@yopmail.com",
            "technicianPhone": "9874563211",
            "specificLocation": "Area 1",
            "clientCompanyName": "New Company"
          }
        }]
      },
      photos: [],
      status: true,
      created_at: '2025-07-08 05:33:24',
      updated_at: '2025-07-10 06:47:31',
      deleted_at: null,
      pm_feedback: null
    });
    console.log('✅ Imported Report 2:', report2.id, '- Demolition Project');

    // Report 3: Interior test
    const report3 = await Report.create({
      id: 'baed87d2-1927-4b9f-92bf-e4fa9d71322f',
      name: 'Designated Substances and Hazardous Materials Assessment Report',
      project_id: 'a6427955-c1fe-4d5c-81b0-fd39d0cc0328',
      report_template_id: '9bc0e9fc-a0e7-4037-89e8-f0202e827dcb',
      assessment_due_to: '',
      date_of_loss: null,
      date_of_assessment: null,
      answers: {
        "notes": [],
        "areaDetails": [{
          "id": "area-1",
          "name": "Reception",
          "areaNumber": 1,
          "assessments": {
            "floor": "1",
            "pmName": "David Martinez",
            "endDate": "2025-09-30",
            "pmEmail": "david.martinez754@yopmail.com",
            "pmPhone": "730-739-8597",
            "startDate": "2025-09-16",
            "projectName": "Interior test",
            "contactName": "Contactname Contactlast",
            "contactEmail": "info@safetechenv.com",
            "contactPhone": "5555555555",
            "clientAddress": "123 fake st, Miss, Ontario, L5J 2X6",
            "projectAddress": "123 fake st, Miss, Ontario, L5J 2X6",
            "projectNumber": "",
            "technicianName": "Jack Reacher",
            "technicianEmail": "reacher@yopmail.com",
            "technicianPhone": "9874563211",
            "specificLocation": "Reception Area",
            "clientCompanyName": "Safetech Env"
          }
        }]
      },
      photos: [],
      status: true,
      created_at: '2025-09-23 09:02:30',
      updated_at: '2025-10-07 19:01:45',
      deleted_at: null,
      pm_feedback: 'This report needs more details on asbestos materials.'
    });
    console.log('✅ Imported Report 3:', report3.id, '- Interior test');

    console.log('\n' + '='.repeat(80));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(80));
    console.log('✅ Total Reports Imported: 3');
    console.log('   - Window Replacement Project (Phase 1)');
    console.log('   - Demolition Project');
    console.log('   - Interior test');
    console.log('='.repeat(80));
    console.log('✨ Reports import completed successfully!');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ Error importing reports:', error);
    throw error;
  }
}

// Run the import
importReports()
  .then(() => {
    console.log('\n✅ Import process finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import process failed:', error);
    process.exit(1);
  });
