module.exports = (sequelize, DataTypes) => {
  const ProjectTechnician = sequelize.define('ProjectTechnician', {
    id: {
      allowNull: false,
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    project_id: {
      allowNull: false,
      type: DataTypes.UUID,
    },
    user_id: {
      allowNull: false,
      type: DataTypes.UUID,
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    }
  }, {
    tableName: 'project_technicians',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  ProjectTechnician.associate = (models) => {
    // Association handled via belongsToMany on Project and User
  };

  return ProjectTechnician;
};


