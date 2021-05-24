"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const BudgetTitle = sequelize.define(
    "BudgetTitle",
    {
      project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      text1: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
      },
      text2: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
      },
      text3: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
      },
      number1: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
      },
      number2: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
      },
      number3: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "budget_title"
    }
  );
  BudgetTitle.associate = ({ Project, BudgetCategory }) => {
    BudgetTitle.belongsTo(Project, { foreignKey: "project_id", as: "project" });
    //BudgetTitle.belongsTo(BudgetCategory, { foreignKey: "budget_category_id", as: "budget_category" });
  };
  return BudgetTitle;
};
