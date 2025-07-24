'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const materials = [
      // Standard Materials
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Sprayed Fireproofing',
        type: 'standard',
        created_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Blown Insulation',
        type: 'standard',
        created_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Loose Fill / Vermiculite Insulation',
        type: 'standard',
        created_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Mechanical Pipe Insulation – Straights',
        type: 'standard',
        created_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        name: 'Mechanical Pipe Insulation – Fittings',
        type: 'standard',
        created_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440006',
        name: 'HVAC Duct Insulation',
        type: 'standard',
        created_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440007',
        name: 'Breeching / Exhaust Insulation',
        type: 'standard',
        created_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440008',
        name: 'Tank Insulation',
        type: 'standard',
        created_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440009',
        name: 'Boiler Insulation',
        type: 'standard',
        created_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440010',
        name: 'Other Mechanical Equipment Insulation',
        type: 'standard',
        created_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440011',
        name: 'Sprayed Texture / Stucco Finishes',
        type: 'standard',
        created_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440012',
        name: 'Plaster Finishes',
        type: 'standard',
        created_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440013',
        name: 'Drywall Joint Compound',
        type: 'standard',
        created_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440014',
        name: 'Lay-in Acoustic Ceiling Tiles',
        type: 'standard',
        created_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440015',
        name: 'Glued-on Acoustic Ceiling Tiles',
        type: 'standard',
        created_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440016',
        name: 'Cement Ceiling Panels',
        type: 'standard',
        created_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440017',
        name: 'Vinyl Floor Tiles',
        type: 'standard',
        created_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440018',
        name: 'Vinyl Sheet Flooring',
        type: 'standard',
        created_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440019',
        name: 'Mastic (Flooring)',
        type: 'standard',
        created_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440020',
        name: 'Asbestos Cement Piping',
        type: 'standard',
        created_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440021',
        name: 'Asbestos Cement Roofing, Siding, Wallboard',
        type: 'standard',
        created_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440022',
        name: 'Other Cement Products (Asbestos Cement)',
        type: 'standard',
        created_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440023',
        name: 'Exterior Building Caulking',
        type: 'standard',
        created_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440024',
        name: 'Exterior Building Shingles',
        type: 'standard',
        created_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440025',
        name: 'Exterior Building Roof Membrane',
        type: 'standard',
        created_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440026',
        name: 'Miscellaneous Mastic',
        type: 'standard',
        created_by: null,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      },
      // Custom Materials
      {
        id: '03cf58b4-4d6b-4479-b878-e906c1529d2d',
        name: 'Grey Caulking on Windows',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 04:56:13'),
        updated_at: new Date('2025-07-24 04:56:13'),
        is_active: true
      },
      {
        id: '068de93a-8eec-48e3-8f1c-ec6fcb11f1d3',
        name: 'Beige Caulking on Flashing',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 04:50:15'),
        updated_at: new Date('2025-07-24 04:50:15'),
        is_active: true
      },
      {
        id: '1330e155-a44a-4f8d-a884-68277c118cb3',
        name: 'Black Mastic on Duct',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 04:57:30'),
        updated_at: new Date('2025-07-24 04:57:30'),
        is_active: true
      },
      {
        id: '1ad5439e-639c-42c4-bb19-73bfd049f23b',
        name: 'Asphalt on Fiberboard and Iso',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 04:49:29'),
        updated_at: new Date('2025-07-24 04:49:29'),
        is_active: true
      },
      {
        id: '1e9d7b39-01e8-4970-9155-29b6143f467b',
        name: '12"x12" vinyl floor tile - pale with white streak',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 04:53:52'),
        updated_at: new Date('2025-07-24 04:53:52'),
        is_active: true
      },
      {
        id: '240ba30f-10bb-4c4a-8a59-c248b93d9922',
        name: '12"x12" vinyl floor tile - light blue with light and dark speck',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 04:57:49'),
        updated_at: new Date('2025-07-24 04:57:49'),
        is_active: true
      },
      {
        id: '43c36727-8edf-46fe-b230-e862a800cc51',
        name: 'Asphalt on Vapor Barrier',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 05:13:07'),
        updated_at: new Date('2025-07-24 05:13:07'),
        is_active: true
      },
      {
        id: '490a9e35-8a7b-4655-bf2f-fe513ac95b97',
        name: '12"x12" vinyl floor tile - white speck',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 04:57:38'),
        updated_at: new Date('2025-07-24 04:57:38'),
        is_active: true
      },
      {
        id: '5156f7b7-92de-4d11-9a0d-04ffe3c6a13a',
        name: 'Vapour Barrier',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 04:51:09'),
        updated_at: new Date('2025-07-24 04:51:09'),
        is_active: true
      },
      {
        id: '5188c261-3c27-4598-88ca-56cc02c2fa9d',
        name: '12"x12" vinyl floor tile - green',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 04:55:25'),
        updated_at: new Date('2025-07-24 04:55:25'),
        is_active: true
      },
      {
        id: '53297132-69f0-439c-8bc1-50b194330c84',
        name: 'Mastic Behind Particle Board',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 07:19:25'),
        updated_at: new Date('2025-07-24 07:19:25'),
        is_active: true
      },
      {
        id: '67f3e3af-4c1d-4855-ae21-38818ff76403',
        name: '12"x12" vinyl floor tile - light grey with light and dark speck',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 04:55:58'),
        updated_at: new Date('2025-07-24 04:55:58'),
        is_active: true
      },
      {
        id: '68f08d1b-2997-44d9-b065-a03031cb9980',
        name: '2\'x4\' ceiling tile -  fissure on 2\' with pinhole (white)',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 04:56:19'),
        updated_at: new Date('2025-07-24 04:56:19'),
        is_active: true
      },
      {
        id: '7478db00-8177-4a18-9a82-beae0ccb2f7b',
        name: '12"x12" vinyl floor tile - off-white with tan swivel',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 06:56:50'),
        updated_at: new Date('2025-07-24 06:56:50'),
        is_active: true
      },
      {
        id: '75bd6349-0265-494a-a595-2708ec20745e',
        name: 'White Caulking',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 07:01:59'),
        updated_at: new Date('2025-07-24 07:01:59'),
        is_active: true
      },
      {
        id: '7b1d2cdd-7af8-49e1-94aa-b906ab95e0c1',
        name: '12"x12" vinyl floor tile - purple blue',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 04:56:46'),
        updated_at: new Date('2025-07-24 04:56:46'),
        is_active: true
      },
      {
        id: '84ff6546-5ed3-4260-b2de-6d1f414fb1b8',
        name: '2\'x4\' ceiling tile -  fissure on 2\' with pinhole (beige)',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 04:55:54'),
        updated_at: new Date('2025-07-24 04:55:54'),
        is_active: true
      },
      {
        id: '8dd4b8f8-7f28-44c3-9333-16eff1551883',
        name: '12"x12" vinyl floor tile - tan with light and dark speck',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 04:54:19'),
        updated_at: new Date('2025-07-24 04:54:19'),
        is_active: true
      },
      {
        id: '9b31ec37-63e6-49a8-b49e-18df9b589ffe',
        name: '12"x12" vinyl floor tile - off-white with brown speck',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 04:58:08'),
        updated_at: new Date('2025-07-24 04:58:08'),
        is_active: true
      },
      {
        id: '9c24b3a9-c314-4b89-9fc6-41bb4de5eac3',
        name: 'Brown Caulking on Exhaust',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 07:00:04'),
        updated_at: new Date('2025-07-24 07:00:04'),
        is_active: true
      },
      {
        id: 'a1c43be9-64d9-48f6-871a-12da1838493f',
        name: 'Stone Finish',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 05:13:12'),
        updated_at: new Date('2025-07-24 05:13:12'),
        is_active: true
      },
      {
        id: 'ad6a7ff5-3575-4943-8536-aa712f6369fa',
        name: 'Brick Mortar',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 05:13:16'),
        updated_at: new Date('2025-07-24 05:13:16'),
        is_active: true
      },
      {
        id: 'ae658b62-a64b-4176-b462-b80a6bdff551',
        name: 'Roof Felt',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 04:49:24'),
        updated_at: new Date('2025-07-24 04:49:24'),
        is_active: true
      },
      {
        id: 'b27d1b54-06ec-4a31-913c-cd10a65ed143',
        name: 'vinyl sheet flooring - grey',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 04:57:34'),
        updated_at: new Date('2025-07-24 04:57:34'),
        is_active: true
      },
      {
        id: 'bb612a3d-6bc2-43f3-9063-072cb6fd430a',
        name: 'Concrete Block Mortar',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 04:54:07'),
        updated_at: new Date('2025-07-24 04:54:07'),
        is_active: true
      },
      {
        id: 'bdb69c89-183e-4a9a-8cfc-9dfddd70c3fe',
        name: '12"x12" vinyl floor tile - Navy Blue',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 04:56:34'),
        updated_at: new Date('2025-07-24 04:56:34'),
        is_active: true
      },
      {
        id: 'c0b1592b-b3c0-414c-996a-cfffaaa5f4cd',
        name: '12"x12" vinyl floor tile - pink with light and dark speck',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 04:55:36'),
        updated_at: new Date('2025-07-24 04:55:36'),
        is_active: true
      },
      {
        id: 'c7cbc6cd-6e4f-4cdc-a206-73591a78c72c',
        name: '12"x12" vinyl floor tile - bluish green',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 04:56:56'),
        updated_at: new Date('2025-07-24 04:56:56'),
        is_active: true
      },
      {
        id: 'c84319fc-d06f-4005-abda-803e433d36cc',
        name: 'Red Caulking',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 07:11:01'),
        updated_at: new Date('2025-07-24 07:11:01'),
        is_active: true
      },
      {
        id: 'd2c01081-d004-44b3-965c-3c10509af3e9',
        name: '12"x12" vinyl floor tile - beige with thick brown streak',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 04:57:05'),
        updated_at: new Date('2025-07-24 04:57:05'),
        is_active: true
      },
      {
        id: 'd9de98dd-39a1-42cc-85da-8e714314065c',
        name: '12"x12" vinyl floor tile - pale with pink streak',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 04:37:10'),
        updated_at: new Date('2025-07-24 04:37:10'),
        is_active: true
      },
      {
        id: 'e40e4f93-ca4a-4d6e-8ef5-546c5bd516a6',
        name: 'Transite Soffits',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 05:13:37'),
        updated_at: new Date('2025-07-24 05:13:37'),
        is_active: true
      },
      {
        id: 'ee143510-80d2-4d54-840c-d52cc6e3d688',
        name: 'Black Mastic on Vinyl Floor tiles',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 04:53:42'),
        updated_at: new Date('2025-07-24 04:53:42'),
        is_active: true
      },
      {
        id: 'f9a73a9f-572a-4c4c-9a65-053dd8520837',
        name: '12"x12" vinyl floor tile - Yellow with white speck',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 04:54:28'),
        updated_at: new Date('2025-07-24 04:54:28'),
        is_active: true
      },
      {
        id: 'fbee17de-10a2-4c35-ae4c-f3b5c6cbb0da',
        name: '12"x12" vinyl floor tile - tan with brown and white streak',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 04:54:46'),
        updated_at: new Date('2025-07-24 04:54:46'),
        is_active: true
      },
      {
        id: 'ff08c639-c022-4846-8499-db9025e515ce',
        name: '12"x12" vinyl floor tile - yellow/beige with light and dark speck',
        type: 'custom',
        created_by: 'a0056997-bc2e-424b-b769-ee0ef88a650b',
        created_at: new Date('2025-07-24 04:57:17'),
        updated_at: new Date('2025-07-24 04:57:17'),
        is_active: true
      }
    ];

    await queryInterface.bulkInsert('materials', materials, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('materials', null, {});
  }
}; 