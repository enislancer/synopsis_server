"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const Project = sequelize.define(
    "Project",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      company_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      country_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      project_name: {
        type: DataTypes.TEXT,
        defaultValue: ""
      },
      project_status_id: {
        type: DataTypes.TEXT,
        defaultValue: ""
      },
      date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      date_end: {
        type: DataTypes.DATE,
        allowNull: true
      },
      budget: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      max_shooting_days: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      limitations: {
        type: DataTypes.JSON,
        defaultValue: null
      },      
      params: {
        type: DataTypes.JSON,
        defaultValue: []
      },
      attachments: {
        type: DataTypes.JSON,
        defaultValue: []
      },
      img_path: {
        type: DataTypes.TEXT,
        defaultValue: ""
      },
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "project"
    }
  );
	Project.associate = ({ Company, Country }) => {
		Project.belongsTo(Company, { foreignKey: "company_id", as: "company" });
		Project.belongsTo(Country, { foreignKey: "country_id", as: "country" });
	};
  return Project;
};
