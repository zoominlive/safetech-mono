module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    project_no: {
      allowNull: true,
      type: DataTypes.STRING,
    },
    name: {
      allowNull: true,
      type: DataTypes.STRING
    },
    site_name: {
      allowNull: true,
      type: DataTypes.STRING
    },
    site_contact_name: {
      allowNull: true,
      type: DataTypes.STRING
    },
    site_contact_title : {
      allowNull: true,
      type: DataTypes.STRING
    },
    project_type: {
      allowNull: true,
      type: DataTypes.STRING
    },
    site_email: {
      allowNull: true,
      type: DataTypes.STRING
    },
    status: {
      allowNull: true,
      type: DataTypes.STRING,
      validate: {
        isIn: [["New", "In Progress", "PM Review", "Complete"]],
      },
      // Only these values are allowed
    },
    report_template_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    location_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    specific_location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pm_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    technician_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    start_date: {
      allowNull: true,
      type: DataTypes.DATE
    },
    end_date: {
      allowNull: true,
      type: DataTypes.DATE
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  },
  {
    tableName: 'projects',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  Project.associate = models => {
    Project.belongsTo(models.User, { foreignKey: 'pm_id', as: 'pm' });
    // Legacy single technician association (kept temporarily for backward compatibility)
    Project.belongsTo(models.User, { foreignKey: 'technician_id', as: 'technician' });
    // New many-to-many technicians association
    Project.belongsToMany(models.User, {
      through: 'project_technicians',
      foreignKey: 'project_id',
      otherKey: 'user_id',
      as: 'technicians'
    });
    Project.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'company' });
    Project.belongsTo(models.Location, { foreignKey: 'location_id', as: 'location' });
    Project.belongsTo(models.ReportTemplate, { foreignKey: 'report_template_id', as: 'reportTemplate' });
    Project.hasMany(models.Report, { foreignKey: 'project_id', as: 'reports' });
    // Site drawings
    Project.hasMany(models.ProjectDrawing, { foreignKey: 'project_id', as: 'ProjectDrawings' });
  };

  return Project;
};