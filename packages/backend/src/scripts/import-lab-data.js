const db = require('../models');
const LabReport = db.LabReport;
const LabReportResult = db.LabReportResult;

async function importLabData() {
  try {
    console.log('🔬 Starting lab data import...\n');

    // Lab Report 1
    const labReport1 = await LabReport.create({
      id: '51fba4eb-f608-49ec-9acd-4926ce81ffe0',
      client: 'Safetech Environmental Limited (Mississauga)',
      attention: 'Lesley Pinto',
      work_order: '2518431',
      reference: 'SO Safetech Environmental Limited - ENV',
      report_date: '2025-05-06 15:03:00',
      project_number: '1-2250033',
      project_id: '6546e74d-02b9-4d32-987a-13f0daa81289',
      created_at: '2025-07-15 08:55:32',
      updated_at: '2025-07-15 08:55:32'
    });
    console.log('✅ Imported Lab Report 1:', labReport1.id);

    // Lab Report 2
    const labReport2 = await LabReport.create({
      id: '7fb124d6-c60a-4d70-b4e3-5f34d97ac843',
      client: 'Safetech Environmental Limited (Mississauga)',
      attention: 'Lesley Pinto',
      work_order: '2518431',
      reference: 'SO Safetech Environmental Limited - ENV',
      report_date: '2025-05-06 15:03:00',
      project_number: '1-2250033',
      project_id: '7236a707-ec22-4634-a2e4-1d6c2c54fad4',
      created_at: '2025-07-08 05:41:52',
      updated_at: '2025-07-08 05:41:52'
    });
    console.log('✅ Imported Lab Report 2:', labReport2.id);

    // Lab Report Results for Report 1
    const results1 = [
      { id: '0000c9f3-b206-4595-ad3f-7a35a56ae349', parameter: 'Acenaphthene', units: 'ug/g', mrl: '0.02', value: '<0.10' },
      { id: '040e9f03-9180-45c9-ab21-f543469ad6db', parameter: 'Methylene Chloride', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '080b8121-cfd3-4d82-aa41-5915916a4c21', parameter: 'pH', units: 'pH Units', mrl: '0.05', value: '7.18' },
      { id: '095456c0-2311-4439-a4e8-daeb674e522c', parameter: 'Trichlorofluoromethane', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '117d83ee-466e-46c8-a0aa-9daa109217a4', parameter: 'Vinyl chloride', units: 'ug/g', mrl: '0.02', value: '<0.02' },
      { id: '11e9e849-8a22-48e1-b756-acf91acdc858', parameter: 'Methylnaphthalene (1&2)', units: 'ug/g', mrl: '0.03', value: '10.4' },
      { id: '146bd4ff-e934-4f00-91a7-39a8af93c069', parameter: 'Anthracene', units: 'ug/g', mrl: '0.02', value: '<0.10' },
      { id: '1520885a-4e13-4aa4-99f5-0e41ab21f0bd', parameter: 'Benzo [b] fluoranthene', units: 'ug/g', mrl: '0.02', value: '<0.10' },
      { id: '15b51fde-9010-410f-906a-15bf5d0c5069', parameter: 'Dichlorodifluoromethane', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '184de36d-1f52-48e2-951d-4c2ce2dff49a', parameter: 'Ethylbenzene', units: 'ug/g', mrl: '0.05', value: '1.53' },
      { id: '2106dddd-44c4-4616-b1f6-cca975fa0d21', parameter: '% Solids', units: '% by Wt.', mrl: '0.1', value: '68.6' },
      { id: '23c1c355-3875-4556-94f0-eb50a474eb5b', parameter: 'Bromomethane', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '2a072b17-6f54-4272-9264-6256e19f65ec', parameter: 'Lead', units: 'ug/g dry', mrl: '1', value: '140' },
      { id: '2a10339c-a080-4858-bd24-475aeb42960e', parameter: 'Benzene', units: 'ug/g', mrl: '0.02', value: '0.06' },
      { id: '2b4408de-f770-492a-b33c-5544af947a7c', parameter: 'Pyrene', units: 'ug/g', mrl: '0.02', value: '0.79' },
      { id: '2ca69fbc-60bb-45e7-92c8-65e2cdff781a', parameter: 'Trichloroethylene', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '2d479d91-be66-4276-bf41-d9bca2f65ed9', parameter: 'Styrene', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '2f1b2d8f-f55d-4e06-8be5-9cde3b9bbfc2', parameter: 'Beryllium', units: 'ug/g dry', mrl: '0.5', value: '<0.5' },
      { id: '31917caf-9ea0-4fe7-9872-51b77550fddc', parameter: 'Antimony', units: 'ug/g dry', mrl: '1', value: '<1.0' },
      { id: '31cf1fdc-388f-4f2c-8a87-6d111420c69b', parameter: 'Barium', units: 'ug/g dry', mrl: '1', value: '31.9' },
      { id: '33be7e1b-49a2-4b78-8093-a43086475980', parameter: 'Methyl Ethyl Ketone (2-Butanone)', units: 'ug/g', mrl: '0.5', value: '<0.50' },
      { id: '3d3ba986-29f5-4b1c-954b-99db6baff075', parameter: 'F3 PHCs (C16-C34)', units: 'ug/g', mrl: '8', value: '3610' },
      { id: '416b7872-11bd-4632-8416-99126f6483ce', parameter: '1-Methylnaphthalene', units: 'ug/g', mrl: '0.02', value: '4.16' },
      { id: '47510401-58ab-4854-95dd-06a7b06107ed', parameter: 'Benzo [g,h,i] perylene', units: 'ug/g', mrl: '0.02', value: '<0.10' },
      { id: '47d5e770-0b95-4a2a-9d9e-a637774c1b54', parameter: 'F1 PHCs (C6-C10)', units: 'ug/g', mrl: '7', value: '202' },
      { id: '483870d5-7b2a-4271-aaa6-9d9e12780630', parameter: 'Ethylene dibromide (dibromoethane, 1,2-)', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '4894e409-8c70-44bb-9abe-00a382ce7f01', parameter: 'Selenium', units: 'ug/g dry', mrl: '1', value: '<1.0' },
      { id: '48a216c8-f382-4e8c-bf10-2345c82b33a5', parameter: 'Bromoform', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '4ce9ad72-cb44-4998-88b1-756f66628fc0', parameter: 'trans-1,3-Dichloropropylene', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '4df7386e-59d2-41e0-acc0-e9c0b16f407c', parameter: 'Dibromochloromethane', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '4e6684c6-740c-4789-8055-ce57e40ec3e1', parameter: '1,2-Dichloroethane', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '50445e49-c2c0-499d-b611-f0e68b84f8e3', parameter: 'Xylenes, total', units: 'ug/g', mrl: '0.05', value: '8' },
      { id: '56fcd845-51c2-4474-9f38-8045eef3af73', parameter: 'Conductivity', units: 'mS/cm', mrl: '0.005', value: '7.39' },
      { id: '58a82b90-6bb3-4370-a011-18f0a837e34c', parameter: 'Cyanide, free', units: 'ug/g', mrl: '0.03', value: '<0.03' },
      { id: '59e1cea5-9352-462c-b3a3-298582dcc3c6', parameter: 'Cobalt', units: 'ug/g dry', mrl: '1', value: '3.3' },
      { id: '613e49fc-90cf-4999-8dd3-ee10a068de70', parameter: 'Chloroform', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '61507963-b668-4ca4-9448-74c61a31e0cc', parameter: 'F4 PHCs (C34-C50)', units: 'ug/g', mrl: '6', value: '579' },
      { id: '61d31a6b-bf65-4677-a09b-d4c35b8dda79', parameter: 'cis-1,2-Dichloroethylene', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '62ecbda8-cb77-4fbb-9b8d-12f4bce00dde', parameter: 'Benzo [a] pyrene', units: 'ug/g', mrl: '0.02', value: '<0.10' },
      { id: '6ad86dab-96bb-4139-b41e-a67fcef786d2', parameter: 'Acetone', units: 'ug/g', mrl: '0.5', value: '<0.50' },
      { id: '6b1b39f6-6155-4253-b701-4a362286ce97', parameter: '1,1,1-Trichloroethane', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '704de299-4725-4d32-ac63-88af34633930', parameter: 'Molybdenum', units: 'ug/g dry', mrl: '1', value: '<1.0' },
      { id: '76d3253d-6096-4254-af16-ca1b105bf8a2', parameter: 'Nickel', units: 'ug/g dry', mrl: '5', value: '8.8' },
      { id: '7a63ce39-dfca-4a9c-a6c4-84568e64f0b2', parameter: 'Arsenic', units: 'ug/g dry', mrl: '1', value: '1.6' },
      { id: '7e945d5c-4942-4846-9b8e-86dd8e21a7fd', parameter: 'Tetrachloroethylene', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '7edbb215-ae51-4b76-abbc-8afe3adadf7c', parameter: 'Hexane', units: 'ug/g', mrl: '0.05', value: '0.36' },
      { id: '81317415-19fd-4ac1-974d-8d9d88cc0dd5', parameter: 'Cadmium', units: 'ug/g dry', mrl: '0.5', value: '<0.5' }
    ];

    let count1 = 0;
    for (const result of results1) {
      await LabReportResult.create({
        ...result,
        lab_report_id: '51fba4eb-f608-49ec-9acd-4926ce81ffe0',
        created_at: '2025-07-15 08:55:32',
        updated_at: '2025-07-15 08:55:32'
      });
      count1++;
    }
    console.log(`✅ Imported ${count1} results for Lab Report 1\n`);

    // Lab Report Results for Report 2
    const results2 = [
      { id: '006a1ee8-f7d3-4146-abaa-dd37ebda9880', parameter: 'Methyl Ethyl Ketone (2-Butanone)', units: 'ug/g', mrl: '0.5', value: '<0.50' },
      { id: '011f2d31-ca5b-4893-9f90-d1741ce0b256', parameter: 'Methyl Isobutyl Ketone', units: 'ug/g', mrl: '0.5', value: '<0.50' },
      { id: '022232b5-ff56-4c5e-8536-2e4cab03071a', parameter: '1,1,1,2-Tetrachloroethane', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '044d1c22-051e-4c20-8aed-43c952855169', parameter: 'o-Xylene', units: 'ug/g', mrl: '0.05', value: '2.77' },
      { id: '07ccbfd8-8c4e-49c4-b610-3502900fda93', parameter: 'Molybdenum', units: 'ug/g dry', mrl: '1', value: '<1.0' },
      { id: '0932b3c4-153a-40cf-a05c-79ac56f93792', parameter: '1,1-Dichloroethane', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '0c8a196a-5b42-4244-ad1b-2e977cf5ff5b', parameter: 'Styrene', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '0cd5b4c5-b634-4ce3-95c8-c03eb89141b2', parameter: 'Ethylene dibromide (dibromoethane, 1,2-)', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '0dbdcccf-f9f2-485d-aca2-36f794b1b802', parameter: '1,2-Dichloropropane', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '14946b25-348e-49b1-a671-35ebd143ea7d', parameter: 'Barium', units: 'ug/g dry', mrl: '1', value: '31.9' },
      { id: '19aebe14-c28b-4930-bfb7-eb622d668627', parameter: 'Dichlorodifluoromethane', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '1ca1be99-4e5f-4f75-9da5-6ad88326636b', parameter: 'Methylnaphthalene (1&2)', units: 'ug/g', mrl: '0.03', value: '10.4' },
      { id: '1ceb6ae1-4312-4251-b9ed-699b8596c6c4', parameter: 'Mercury', units: 'ug/g dry', mrl: '0.1', value: '<0.1' },
      { id: '20327b10-1246-41c6-bd72-bc1bb7a8d7f5', parameter: '1,2-Dichloroethane', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '214ea017-e27a-4b7f-bbaa-9d166ec30ac5', parameter: 'Acetone', units: 'ug/g', mrl: '0.5', value: '<0.50' },
      { id: '23ec37e1-d277-4efb-9f8e-d87bbaec01f4', parameter: 'cis-1,3-Dichloropropylene', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '262b55fa-ac10-4d4f-bdd6-56224f098883', parameter: 'pH', units: 'pH Units', mrl: '0.05', value: '7.18' },
      { id: '36c5eb60-efa4-48c3-9c3d-4f15c6e37af6', parameter: 'Methyl tert-butyl ether', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '38042fae-37a7-4e4a-87d5-93fba835c2d3', parameter: 'cis-1,2-Dichloroethylene', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '42aecaf6-3594-4a17-b3d3-82e8f47c6c6d', parameter: 'Trichloroethylene', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '4538337c-e169-4297-b856-e5875d5e4e6b', parameter: 'Fluoranthene', units: 'ug/g', mrl: '0.02', value: '<0.10' },
      { id: '45956ab7-e855-48d6-ad74-d11c91f3fd72', parameter: 'm,p-Xylenes', units: 'ug/g', mrl: '0.05', value: '5.23' },
      { id: '475a6e77-d268-4dda-914b-3b8b2e847ef9', parameter: '1,1,2,2-Tetrachloroethane', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '483c1244-bdb3-449b-82e3-6dea735dbbd2', parameter: 'F3 PHCs (C16-C34)', units: 'ug/g', mrl: '8', value: '3610' },
      { id: '494e39ff-aa00-428d-b60c-1c6bd1669b77', parameter: '1,3-Dichloropropene, total', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '4a7b69d5-fabc-454d-9c5f-031f7bd17174', parameter: 'F2 PHCs (C10-C16)', units: 'ug/g', mrl: '4', value: '2920' },
      { id: '4af1d64f-3568-466d-b2d7-08bbdd1e4b44', parameter: 'F4 PHCs (C34-C50)', units: 'ug/g', mrl: '6', value: '579' },
      { id: '4c7bdb96-3de2-4790-921a-d5044eaf85da', parameter: 'Acenaphthene', units: 'ug/g', mrl: '0.02', value: '<0.10' },
      { id: '4f27744e-84a3-4831-b2d0-720c30b6594d', parameter: 'F1 PHCs (C6-C10)', units: 'ug/g', mrl: '7', value: '202' },
      { id: '5c7d34d0-150c-4a6e-9842-cd297745fa0b', parameter: 'Tetrachloroethylene', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '5c8c9fa7-da02-448d-8c43-c1b017281505', parameter: '1,3-Dichlorobenzene', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '5f4a6bcd-9033-4886-b4b3-7c6a6d53cb82', parameter: 'Benzo [a] pyrene', units: 'ug/g', mrl: '0.02', value: '<0.10' },
      { id: '601a6e98-13af-4daf-a12b-d78e5011cdde', parameter: 'Selenium', units: 'ug/g dry', mrl: '1', value: '<1.0' },
      { id: '6148a0de-1824-4cb0-9956-2a2184ce9807', parameter: 'Cobalt', units: 'ug/g dry', mrl: '1', value: '3.3' },
      { id: '624fade7-8410-45d3-bc9f-b29c7b13880e', parameter: 'Arsenic', units: 'ug/g dry', mrl: '1', value: '1.6' },
      { id: '65be2d6b-fd8b-4193-86a0-277f188e39c7', parameter: 'Chloroform', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '6a7dc3c6-301d-4d7d-a86f-ff6584a3f619', parameter: 'Nickel', units: 'ug/g dry', mrl: '5', value: '8.8' },
      { id: '6bc65308-84e1-4352-bad2-ee93470940da', parameter: 'Fluorene', units: 'ug/g', mrl: '0.02', value: '1.62' },
      { id: '74318955-ab47-4311-b6c0-31907d678938', parameter: 'Benzo [a] anthracene', units: 'ug/g', mrl: '0.02', value: '<0.10' },
      { id: '76083c9b-63a8-4c9c-b905-6074e3fb7a6d', parameter: 'Conductivity', units: 'mS/cm', mrl: '0.005', value: '7.39' },
      { id: '76fc50ca-89c1-4b82-8f6f-9b688bf25fbc', parameter: '% Solids', units: '% by Wt.', mrl: '0.1', value: '68.6' },
      { id: '7894fa33-1d4d-44ac-8916-893a743d4d36', parameter: 'Methylene Chloride', units: 'ug/g', mrl: '0.05', value: '<0.05' },
      { id: '7c625aab-9567-463c-b30c-734e64075f9f', parameter: 'Boron', units: 'ug/g dry', mrl: '5', value: '9.5' },
      { id: '7d05d04e-7305-4d73-8d36-28b57f6e9e95', parameter: 'Benzo [g,h,i] perylene', units: 'ug/g', mrl: '0.02', value: '<0.10' },
      { id: '7d599aaa-5e57-4866-99d3-aea672dafda4', parameter: 'Vanadium', units: 'ug/g dry', mrl: '10', value: '14.3' },
      { id: '80f86a2d-2639-4bdc-a406-54ba1aa59984', parameter: 'Antimony', units: 'ug/g dry', mrl: '1', value: '<1.0' },
      { id: '81db309a-acda-4589-a664-f6409a25ad46', parameter: 'Thallium', units: 'ug/g dry', mrl: '1', value: '<1.0' },
      { id: '834e2464-4647-4fe5-850d-0b9176e2b78d', parameter: 'Vinyl chloride', units: 'ug/g', mrl: '0.02', value: '<0.02' }
    ];

    let count2 = 0;
    for (const result of results2) {
      await LabReportResult.create({
        ...result,
        lab_report_id: '7fb124d6-c60a-4d70-b4e3-5f34d97ac843',
        created_at: '2025-07-08 05:41:52',
        updated_at: '2025-07-08 05:41:52'
      });
      count2++;
    }
    console.log(`✅ Imported ${count2} results for Lab Report 2\n`);

    console.log('================================================================================');
    console.log('📊 IMPORT SUMMARY');
    console.log('================================================================================');
    console.log(`✅ Lab Reports: 2`);
    console.log(`✅ Lab Report Results: ${count1 + count2}`);
    console.log('================================================================================');
    console.log('✨ Lab data import completed successfully!');
    console.log('================================================================================');

  } catch (error) {
    console.error('❌ Error importing lab data:', error);
    throw error;
  }
}

// Run the import
importLabData()
  .then(() => {
    console.log('\n✅ Import process finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Import process failed:', error);
    process.exit(1);
  });
