const APIError = require("../helpers/apiError");
const {
  CREATED,
  RECORD_CREATED,
  OK,
  RECORD_DELETED,
  NOT_FOUND,
  NO_RECORD_FOUND,
  RECORD_UPDATED,
  RECORDS_FOUND,
  NOT_ACCESS,
  BAD_REQUEST,
  VALIDATION_ERROR,
} = require("../helpers/constants");
const { ErrorHandler } = require("../helpers/errorHandler");
const { useFilter } = require("../helpers/pagination");
const { sequelize, Material, User, Sequelize } = require("../models");
const csv = require('csv-parser');
const fs = require('fs');
const { Parser } = require('json2csv');

// GET /api/materials/all - fetch all materials
exports.getAllMaterials = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
    
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Material.findAndCountAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      order: [[sortBy, sortOrder]],
      // limit: parseInt(limit),
      // offset: parseInt(offset),
      where: {
        is_active: true
      }
    });

    const totalPages = Math.ceil(count / limit);
    
    return res.status(OK).json({
      status: OK,
      message: RECORDS_FOUND,
      data: {
        materials: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    return ErrorHandler(error, req, res, next);
  }
};

// GET /api/materials/standard - fetch only standard materials
exports.getStandardMaterials = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'ASC' } = req.query;
    
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Material.findAndCountAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      where: {
        type: 'standard',
        is_active: true
      }
    });

    const totalPages = Math.ceil(count / limit);
    
    return res.status(OK).json({
      status: OK,
      message: RECORDS_FOUND,
      data: {
        materials: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    return ErrorHandler(error, req, res, next);
  }
};

// GET /api/materials/custom - fetch only custom materials
exports.getCustomMaterials = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
    
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Material.findAndCountAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      order: [[sortBy, sortOrder]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      where: {
        type: 'custom',
        is_active: true
      }
    });

    const totalPages = Math.ceil(count / limit);
    
    return res.status(OK).json({
      status: OK,
      message: RECORDS_FOUND,
      data: {
        materials: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    return ErrorHandler(error, req, res, next);
  }
};

// POST /api/materials/add - add new custom material
exports.addMaterial = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { user } = req;
    const { name, type = 'custom' } = req.body;

    if (!name || name.trim() === '') {
      const ApiError = new APIError(VALIDATION_ERROR, 'Material name is required', BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    // Check if material with same name already exists
    const existingMaterial = await Material.findOne({
      where: {
        name: name.trim(),
        is_active: true
      }
    });

    if (existingMaterial) {
      const ApiError = new APIError('Material already exists', null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    const material = await Material.create(
      {
        name: name.trim(),
        type: type,
        created_by: user.id,
        is_active: true
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(CREATED).json({
      status: CREATED,
      message: RECORD_CREATED,
      data: material
    });
  } catch (error) {
    await transaction.rollback();
    return ErrorHandler(error, req, res, next);
  }
};

// PUT /api/materials/edit/:id - update material
exports.updateMaterial = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { name, type } = req.body;

    if (!name || name.trim() === '') {
      const ApiError = new APIError(VALIDATION_ERROR, 'Material name is required', BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    const material = await Material.findByPk(id);
    
    if (!material) {
      const ApiError = new APIError(NO_RECORD_FOUND, 'Material not found', NOT_FOUND);
      return ErrorHandler(ApiError, req, res, next);
    }

    // Check if material with same name already exists (excluding current material)
    const existingMaterial = await Material.findOne({
      where: {
        name: name.trim(),
        is_active: true,
        id: { [Sequelize.Op.ne]: id }
      }
    });

    if (existingMaterial) {
      const ApiError = new APIError('Material with this name already exists', null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    await material.update(
      {
        name: name.trim(),
        ...(type && { type })
      },
      { transaction }
    );

    await transaction.commit();

    return res.status(OK).json({
      status: OK,
      message: RECORD_UPDATED,
      data: material
    });
  } catch (error) {
    await transaction.rollback();
    return ErrorHandler(error, req, res, next);
  }
};

// DELETE /api/materials/delete/:id - remove custom material
exports.deleteMaterial = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const material = await Material.findByPk(id);
    
    if (!material) {
      const ApiError = new APIError(NO_RECORD_FOUND, 'Material not found', NOT_FOUND);
      return ErrorHandler(ApiError, req, res, next);
    }

    if (material.type === 'standard') {
      const ApiError = new APIError('Cannot delete standard materials', null, BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    await material.update({ is_active: false }, { transaction });

    await transaction.commit();

    return res.status(OK).json({
      status: OK,
      message: RECORD_DELETED,
      data: { id }
    });
  } catch (error) {
    await transaction.rollback();
    return ErrorHandler(error, req, res, next);
  }
};

// PATCH /api/materials/:id/status - toggle material active status
exports.toggleMaterialStatus = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;

    const material = await Material.findByPk(id);
    
    if (!material) {
      const ApiError = new APIError(NO_RECORD_FOUND, 'Material not found', NOT_FOUND);
      return ErrorHandler(ApiError, req, res, next);
    }

    await material.update(
      { is_active: !material.is_active },
      { transaction }
    );

    await transaction.commit();

    return res.status(OK).json({
      status: OK,
      message: RECORD_UPDATED,
      data: {
        id,
        is_active: material.is_active
      }
    });
  } catch (error) {
    await transaction.rollback();
    return ErrorHandler(error, req, res, next);
  }
};

// GET /api/materials/search?q=query - search materials
exports.searchMaterials = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10, type } = req.query;
    
    if (!q || q.trim() === '') {
      const ApiError = new APIError(VALIDATION_ERROR, 'Search query is required', BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    const offset = (page - 1) * limit;
    
    const whereClause = {
      name: { [Sequelize.Op.like]: `%${q.trim()}%` },
      is_active: true
    };

    if (type) {
      whereClause.type = type;
    }

    const { count, rows } = await Material.findAndCountAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }
      ],
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      where: whereClause
    });

    const totalPages = Math.ceil(count / limit);
    
    return res.status(OK).json({
      status: OK,
      message: RECORDS_FOUND,
      data: {
        materials: rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    return ErrorHandler(error, req, res, next);
  }
};

// POST /api/materials/bulk-import - bulk import materials
exports.bulkImportMaterials = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { user } = req;
    const { materials } = req.body;

    if (!materials || !Array.isArray(materials) || materials.length === 0) {
      const ApiError = new APIError(VALIDATION_ERROR, 'Materials array is required', BAD_REQUEST);
      return ErrorHandler(ApiError, req, res, next);
    }

    const results = {
      success: [],
      errors: []
    };

    for (const materialData of materials) {
      try {
        const { name, type = 'custom' } = materialData;

        if (!name || name.trim() === '') {
          results.errors.push({
            name: name || 'Unknown',
            error: 'Material name is required'
          });
          continue;
        }

        // Check if material already exists
        const existingMaterial = await Material.findOne({
          where: {
            name: name.trim(),
            is_active: true
          }
        });

        if (existingMaterial) {
          results.errors.push({
            name: name.trim(),
            error: 'Material already exists'
          });
          continue;
        }

        const material = await Material.create(
          {
            name: name.trim(),
            type: type,
            created_by: user.id,
            is_active: true
          },
          { transaction }
        );

        results.success.push(material);
      } catch (error) {
        results.errors.push({
          name: materialData.name || 'Unknown',
          error: error.message
        });
      }
    }

    await transaction.commit();

    return res.status(CREATED).json({
      status: CREATED,
      message: 'Bulk import completed',
      data: results
    });
  } catch (error) {
    await transaction.rollback();
    return ErrorHandler(error, req, res, next);
  }
};

// GET /api/materials/export - export materials to CSV
exports.exportMaterials = async (req, res, next) => {
  try {
    const { type } = req.query;
    
    const whereClause = {
      is_active: true
    };

    if (type) {
      whereClause.type = type;
    }

    const materials = await Material.findAll({
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['first_name', 'last_name', 'email']
        }
      ],
      order: [['name', 'ASC']],
      where: whereClause
    });

    const csvData = materials.map(material => ({
      id: material.id,
      name: material.name,
      type: material.type,
      is_active: material.is_active ? 'Yes' : 'No',
      created_by: material.creator ? `${material.creator.first_name} ${material.creator.last_name}` : 'N/A',
      created_at: material.created_at,
      updated_at: material.updated_at
    }));

    const fields = ['id', 'name', 'type', 'is_active', 'created_by', 'created_at', 'updated_at'];
    const parser = new Parser({ fields });
    const csv = parser.parse(csvData);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=materials-${Date.now()}.csv`);
    
    return res.status(OK).send(csv);
  } catch (error) {
    return ErrorHandler(error, req, res, next);
  }
}; 