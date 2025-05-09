module.exports = (sequelize, DataTypes) => {
  const Location = sequelize.define('Location', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    active: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: true 
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    }
  },
  {
    tableName: 'locations',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  });

  Location.associate = models => {
    Location.hasMany(models.Project, { foreignKey: 'pm_id', as: 'managedProjects' });
  };

  return Location;
};