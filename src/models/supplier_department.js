"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const SupplierDepartment = sequelize.define(
    "SupplierDepartment",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      supplier_department: {
        type: DataTypes.TEXT,
        defaultValue: ""
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "supplier_department"
    }
  );

  return SupplierDepartment;
};
