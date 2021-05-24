"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const Others = sequelize.define(
    "Others",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      word: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: ""
      },
      company: {
        type: DataTypes.JSON,
        defaultValue: null
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "others"
    }
  );
  return Others;
};
