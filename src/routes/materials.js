const { authenticate } = require('../middleware/auth');
const controller = require('../controllers/material');
const app = require('express').Router();

// GET /api/materials/all - fetch all materials
app.route('/all').get(authenticate, controller.getAllMaterials);

// GET /api/materials/standard - fetch only standard materials
app.route('/standard').get(authenticate, controller.getStandardMaterials);

// GET /api/materials/custom - fetch only custom materials
app.route('/custom').get(authenticate, controller.getCustomMaterials);

// POST /api/materials/add - add new custom material
app.route('/add').post(authenticate, controller.addMaterial);

// PUT /api/materials/edit/:id - update material
app.route('/edit/:id').put(authenticate, controller.updateMaterial);

// DELETE /api/materials/delete/:id - remove custom material
app.route('/delete/:id').delete(authenticate, controller.deleteMaterial);

// PATCH /api/materials/:id/status - toggle material active status
app.route('/:id/status').patch(authenticate, controller.toggleMaterialStatus);

// GET /api/materials/search?q=query - search materials
app.route('/search').get(authenticate, controller.searchMaterials);

// POST /api/materials/bulk-import - bulk import materials
app.route('/bulk-import').post(authenticate, controller.bulkImportMaterials);

// GET /api/materials/export - export materials to CSV
app.route('/export').get(authenticate, controller.exportMaterials);

module.exports = app; 