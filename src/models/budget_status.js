"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const BudgetStatus = sequelize.define(
    "BudgetStatus",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      budget_status: {
        type: DataTypes.TEXT,
        defaultValue: ""
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "budget_status"
    }
  );

  return BudgetStatus;
};
