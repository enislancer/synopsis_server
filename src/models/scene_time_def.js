"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const SceneTimeDef = sequelize.define(
    "SceneTimeDef",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      scene_time: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ''
      },
      scene_time_type: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      max_shooting_scenes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      max_shooting_scenes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      max_shooting_duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      default_scene_time: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      color: {
        type: DataTypes.TEXT,
        defaultValue: '#ffffff'
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "scene_time_def"
    }
  );
  return SceneTimeDef;
};
