module.exports = (sequelize, DataTypes) => {
  const LabReport = sequelize.define(
    "LabReport",
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      client: DataTypes.STRING,
      attention: DataTypes.STRING,
      work_order: DataTypes.STRING,
      reference: DataTypes.STRING,
      report_date: DataTypes.DATE,
      project_number: DataTypes.STRING,
      project_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "projects",
          key: "id",
        },
      },
    },
    {
      tableName: "lab_reports",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

  LabReport.associate = function (models) {
    LabReport.belongsTo(models.Project, {
      foreignKey: "project_id",
      as: "project",
    });
    LabReport.hasMany(models.LabReportResult, {
      foreignKey: "lab_report_id",
      as: "results",
    });
  };

  return LabReport;
};
