module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
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
    Report.hasMany(models.Project, { foreignKey: 'report_id', as: 'projects' });
  };

  return Report;
};