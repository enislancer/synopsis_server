"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const SceneTimeBank = sequelize.define(
    "SceneTimeBank",
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
      scene_time_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "scene_time_bank"
    }
  );
  return SceneTimeBank;
};
