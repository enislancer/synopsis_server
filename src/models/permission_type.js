"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const PermissionType = sequelize.define(
    "PermissionType",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      permission_type: {
        type: DataTypes.TEXT,
        defaultValue: ""
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "permission_type"
    }
  );

  return PermissionType;
};
