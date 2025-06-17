module.exports = (sequelize, DataTypes) => {
  const ReportTemplate = sequelize.define('ReportTemplate', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    schema: {
      type: DataTypes.JSON, // The structure/fields expected in this type
      allowNull: true
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'report_templates',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  ReportTemplate.associate = models => {
    ReportTemplate.hasMany(models.Project, { foreignKey: 'report_template_id', as: 'projects' });
    ReportTemplate.hasMany(models.Report, { foreignKey: 'report_template_id', as: 'reports' });
  };

  return ReportTemplate;
};
