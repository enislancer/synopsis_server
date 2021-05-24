"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const ProjectStatus = sequelize.define(
    "ProjectStatus",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      project_status: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ''
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "project_status"
    }
  );
  return ProjectStatus;
};
