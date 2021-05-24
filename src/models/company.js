"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const Company = sequelize.define(
    "Company",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      company_name: {
        type: DataTypes.TEXT,
        defaultValue: ''
      },
      url: {
        type: DataTypes.TEXT,
        defaultValue: ''
      },
      company_info: {
        type: DataTypes.JSON,
        defaultValue: {}
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "company"
    }
  );
  return Company;
};
