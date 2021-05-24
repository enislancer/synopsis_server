"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const SceneLocationBank = sequelize.define(
    "SceneLocationBank",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      scene_location: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ''
      },
      scene_location_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "scene_location_bank"
    }
  );
  return SceneLocationBank;
};
