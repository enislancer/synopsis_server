"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const SupplierJobTitle = sequelize.define(
    "SupplierJobTitle",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      supplier_job_title: {
        type: DataTypes.TEXT,
        defaultValue: ""
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "supplier_job_title"
    }
  );

  return SupplierJobTitle;
};
