module.exports = (sequelize, DataTypes) => {
  const LabReportResult = sequelize.define(
    "LabReportResult",
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      lab_report_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "lab_reports",
          key: "id",
        },
      },
      parameter: DataTypes.STRING,
      units: DataTypes.STRING,
      mrl: DataTypes.STRING,
      value: DataTypes.STRING,
    },
    {
      tableName: "lab_report_results",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      paranoid: true,
      deletedAt: "deleted_at",
    }
  );

  LabReportResult.associate = function (models) {
    LabReportResult.belongsTo(models.LabReport, {
      foreignKey: "lab_report_id",
      as: "labReport",
    });
  };

  return LabReportResult;
};
