"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const PermissionStatus = sequelize.define(
    "PermissionStatus",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      permission_status: {
        type: DataTypes.TEXT,
        defaultValue: ""
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "permission_status"
    }
  );

  return PermissionStatus;
};
