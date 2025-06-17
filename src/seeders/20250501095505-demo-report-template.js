'use strict';
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const reportTemplates = [
      {
        id: uuidv4(),
        name: 'Water Damage Assessment',
        schema: JSON.stringify({
          sections: [
            {
              title: 'Property Information',
              questions: [
                { id: 'property_type', type: 'select', label: 'Property Type', options: ['Residential', 'Commercial', 'Industrial', 'Multi-family'] },
                { id: 'property_age', type: 'text', label: 'Approximate Age of Property' },
                { id: 'square_footage', type: 'number', label: 'Approximate Square Footage' }
              ]
            },
            {
              title: 'Damage Assessment',
              questions: [
                { id: 'water_source', type: 'select', label: 'Source of Water', options: ['Clean Water', 'Gray Water', 'Black Water'] },
                { id: 'affected_areas', type: 'checkbox', label: 'Affected Areas', options: ['Kitchen', 'Bathroom', 'Bedroom', 'Living Room', 'Basement', 'Attic'] },
                { id: 'moisture_readings', type: 'table', label: 'Moisture Readings', columns: ['Location', 'Reading', 'Notes'] }
              ]
            },
            {
              title: 'Photo Documentation',
              questions: [
                { id: 'damage_photos', type: 'photo-upload', label: 'Photos of Damage' }
              ]
            }
          ]
        }),
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Fire Damage Assessment',
        schema: JSON.stringify({
          sections: [
            {
              title: 'Incident Information',
              questions: [
                { id: 'fire_source', type: 'select', label: 'Source of Fire', options: ['Electrical', 'Kitchen', 'HVAC', 'External', 'Chemical', 'Unknown'] },
                { id: 'affected_floors', type: 'checkbox', label: 'Affected Floors', options: ['Basement', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor', 'Attic'] },
              ]
            },
            {
              title: 'Structural Assessment',
              questions: [
                { id: 'structural_damage', type: 'radio', label: 'Structural Damage Present', options: ['Yes', 'No'] },
                { id: 'smoke_damage', type: 'checkbox', label: 'Smoke Damage Areas', options: ['Walls', 'Ceiling', 'Furniture', 'HVAC System', 'Contents'] },
                { id: 'water_damage', type: 'radio', label: 'Water Damage from Firefighting', options: ['Yes', 'No'] }
              ]
            },
            {
              title: 'Photo Documentation',
              questions: [
                { id: 'damage_photos', type: 'photo-upload', label: 'Photos of Damage' }
              ]
            }
          ]
        }),
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Mold Inspection',
        schema: JSON.stringify({
          sections: [
            {
              title: 'Property Information',
              questions: [
                { id: 'property_type', type: 'select', label: 'Property Type', options: ['Residential', 'Commercial', 'Industrial', 'Multi-family'] },
                { id: 'occupancy_status', type: 'radio', label: 'Occupancy Status', options: ['Occupied', 'Vacant'] },
                { id: 'humidity_level', type: 'number', label: 'Humidity Level (%)' }
              ]
            },
            {
              title: 'Mold Assessment',
              questions: [
                { id: 'visible_mold', type: 'radio', label: 'Visible Mold Present', options: ['Yes', 'No'] },
                { id: 'mold_location', type: 'checkbox', label: 'Mold Locations', options: ['Walls', 'Ceiling', 'Flooring', 'Bathroom', 'Kitchen', 'Basement', 'Attic', 'HVAC'] },
                { id: 'sample_taken', type: 'radio', label: 'Samples Taken for Lab Analysis', options: ['Yes', 'No'] }
              ]
            },
            {
              title: 'Photo Documentation',
              questions: [
                { id: 'mold_photos', type: 'photo-upload', label: 'Photos of Affected Areas' }
              ]
            }
          ]
        }),
        status: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Structural Assessment',
        schema: JSON.stringify({
          sections: [
            {
              title: 'Property Information',
              questions: [
                { id: 'structure_type', type: 'select', label: 'Structure Type', options: ['Wood Frame', 'Concrete', 'Steel Frame', 'Masonry', 'Mixed'] },
                { id: 'building_stories', type: 'number', label: 'Number of Stories' },
                { id: 'construction_year', type: 'text', label: 'Year of Construction' }
              ]
            },
            {
              title: 'Damage Assessment',
              questions: [
                { id: 'damage_cause', type: 'select', label: 'Cause of Damage', options: ['Storm', 'Flood', 'Fire', 'Age', 'Poor Maintenance', 'Accident', 'Other'] },
                { id: 'structural_elements', type: 'checkbox', label: 'Affected Structural Elements', options: ['Foundation', 'Load-bearing Walls', 'Columns', 'Beams', 'Roof Structure', 'Floor Structure'] },
                { id: 'safety_concerns', type: 'radio', label: 'Immediate Safety Concerns', options: ['Yes', 'No'] }
              ]
            },
            {
              title: 'Photo Documentation',
              questions: [
                { id: 'damage_photos', type: 'photo-upload', label: 'Photos of Structural Issues' }
              ]
            }
          ]
        }),
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Insurance Claim Assessment',
        schema: JSON.stringify({
          sections: [
            {
              title: 'Claim Information',
              questions: [
                { id: 'claim_type', type: 'select', label: 'Type of Claim', options: ['Water Damage', 'Fire Damage', 'Storm Damage', 'Mold', 'Theft', 'Vandalism', 'Other'] },
                { id: 'policy_coverage', type: 'text', label: 'Policy Coverage Details' },
                { id: 'prev_claims', type: 'radio', label: 'Previous Claims for Similar Issues', options: ['Yes', 'No'] }
              ]
            },
            {
              title: 'Damage Assessment',
              questions: [
                { id: 'affected_items', type: 'table', label: 'Affected Items/Areas', columns: ['Item/Area', 'Damage Description', 'Estimated Value'] },
                { id: 'pre_existing', type: 'textarea', label: 'Pre-existing Conditions' },
                { id: 'mitigation_steps', type: 'textarea', label: 'Mitigation Steps Already Taken' }
              ]
            },
            {
              title: 'Documentation',
              questions: [
                { id: 'damage_photos', type: 'photo-upload', label: 'Photos of Damage' },
                { id: 'receipts', type: 'file-upload', label: 'Receipts/Documentation' }
              ]
            }
          ]
        }),
        status: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Storm Damage Assessment',
        schema: JSON.stringify({
          sections: [
            {
              title: 'Storm Information',
              questions: [
                { id: 'storm_type', type: 'select', label: 'Type of Storm', options: ['Hurricane', 'Tornado', 'Hail', 'Flood', 'Wind', 'Snow/Ice', 'Thunderstorm'] },
                { id: 'storm_date', type: 'date', label: 'Date of Storm' }
              ]
            },
            {
              title: 'Exterior Damage',
              questions: [
                { id: 'roof_damage', type: 'radio', label: 'Roof Damage Present', options: ['Yes', 'No'] },
                { id: 'exterior_walls', type: 'radio', label: 'Exterior Wall Damage', options: ['Yes', 'No'] },
                { id: 'window_damage', type: 'radio', label: 'Window/Door Damage', options: ['Yes', 'No'] }
              ]
            },
            {
              title: 'Interior Damage',
              questions: [
                { id: 'water_intrusion', type: 'radio', label: 'Water Intrusion', options: ['Yes', 'No'] },
                { id: 'ceiling_damage', type: 'radio', label: 'Ceiling Damage', options: ['Yes', 'No'] },
                { id: 'floor_damage', type: 'radio', label: 'Floor Damage', options: ['Yes', 'No'] }
              ]
            },
            {
              title: 'Documentation',
              questions: [
                { id: 'damage_photos', type: 'photo-upload', label: 'Photos of Damage' }
              ]
            }
          ]
        }),
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        name: 'Restoration Completion Report',
        schema: JSON.stringify({
          sections: [
            {
              title: 'Project Information',
              questions: [
                { id: 'project_type', type: 'select', label: 'Type of Restoration', options: ['Water', 'Fire', 'Mold', 'Storm', 'Reconstruction'] },
                { id: 'start_date', type: 'date', label: 'Project Start Date' },
                { id: 'end_date', type: 'date', label: 'Project Completion Date' }
              ]
            },
            {
              title: 'Work Completed',
              questions: [
                { id: 'work_performed', type: 'checkbox', label: 'Work Performed', options: ['Demolition', 'Drying', 'Cleaning', 'Sanitizing', 'Deodorizing', 'Reconstruction'] },
                { id: 'equipment_used', type: 'textarea', label: 'Equipment Used' },
                { id: 'materials_used', type: 'textarea', label: 'Materials Used' }
              ]
            },
            {
              title: 'Final Verification',
              questions: [
                { id: 'moisture_readings', type: 'table', label: 'Final Moisture Readings', columns: ['Location', 'Reading', 'Status'] },
                { id: 'clearance_testing', type: 'radio', label: 'Clearance Testing Passed', options: ['Yes', 'No', 'N/A'] },
                { id: 'customer_satisfaction', type: 'radio', label: 'Customer Satisfaction', options: ['Satisfied', 'Partially Satisfied', 'Not Satisfied'] }
              ]
            },
            {
              title: 'Documentation',
              questions: [
                { id: 'before_after_photos', type: 'photo-upload', label: 'Before/After Photos' },
                { id: 'completion_docs', type: 'file-upload', label: 'Completion Documents' }
              ]
            }
          ]
        }),
        status: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ];
    
    await queryInterface.bulkInsert('report_templates', reportTemplates);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('report_templates', null, {});
  }
};
