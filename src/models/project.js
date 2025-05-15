module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('Project', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: {
      allowNull: true,
      type: DataTypes.STRING
    },
    site_name: {
      allowNull: true,
      type: DataTypes.STRING
    },
    site_email: {
      allowNull: true,
      type: DataTypes.STRING
    },
    status: {
      allowNull: true,
      type: DataTypes.STRING
    },
    report_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    location_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pm_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    technician_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    start_date: {
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
    Project.belongsTo(models.User, { foreignKey: 'technician_id', as: 'technician' });
    Project.belongsTo(models.Customer, { foreignKey: 'customer_id', as: 'company' });
    Project.belongsTo(models.Location, { foreignKey: 'location_id', as: 'location' });
    Project.belongsTo(models.Report, { foreignKey: 'report_id', as: 'report' }); // Assuming Report has project_id
  };

  return Project;
};