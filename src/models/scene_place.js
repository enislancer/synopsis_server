"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const ScenePlace = sequelize.define(
    "ScenePlace",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      scene_place: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ''
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "scene_place"
    }
  );
  return ScenePlace;
};
