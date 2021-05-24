"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const SceneLocation = sequelize.define(
    "SceneLocation",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      project_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      scene_location: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ''
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "scene_location"
    }
  );
  SceneLocation.associate = ({ Project }) => {
    SceneLocation.belongsTo(Project, { foreignKey: "project_id", as: "project" });
  };
  return SceneLocation;
};
