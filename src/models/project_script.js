"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const ProjectScript = sequelize.define(
    "ProjectScript",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      chapter_number: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      script: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
      },
      characters: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },
      extras: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      attachments: {
        type: DataTypes.JSON,
        defaultValue: []
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "project_script"
    }
  );
  ProjectScript.associate = ({ Project }) => {
    ProjectScript.belongsTo(Project, { foreignKey: "project_id", as: "project" });
  };
  return ProjectScript;
};
