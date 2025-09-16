module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    name: {
      allowNull: true,
      type: DataTypes.STRING
    },
    project_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    report_template_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    assessment_due_to: {
      allowNull: true,
      type: DataTypes.STRING
    },
    date_of_loss: {
      allowNull: true,
      type: DataTypes.DATE
    },
    date_of_assessment: {
      allowNull: true,
      type: DataTypes.DATE
    },
    answers: {
      allowNull: true,
      type: DataTypes.JSON
    },
    photos: {
      allowNull: true,
      type: DataTypes.JSON
    },
    status: {
      type: DataTypes.BOOLEAN
    },
    pm_feedback: {
      allowNull: true,
      type: DataTypes.TEXT
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
    tableName: 'reports',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  Report.associate = models => {
    Report.belongsTo(models.Project, { foreignKey: 'project_id', as: 'project' });
    Report.belongsTo(models.ReportTemplate, { foreignKey: 'report_template_id', as: 'template' });
  };

  return Report;
};