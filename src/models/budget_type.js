"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const BudgetType = sequelize.define(
    "BudgetType",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      budget_type: {
        type: DataTypes.TEXT,
        defaultValue: ""
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "budget_type"
    }
  );

  return BudgetType;
};
