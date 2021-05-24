"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const Budget = sequelize.define(
    "Budget",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      pos: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      project_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      price: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      vat: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      budget_category_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      budget_type_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      budget_status_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      project_scene_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      project_shooting_day_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      description: {
        type: DataTypes.TEXT,
        defaultValue: 0
      },
      supplier_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      supplier_job_title_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      account_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      },
      comments: {
        type: DataTypes.TEXT,
        defaultValue: ""
      },
      attachments: {
        type: DataTypes.JSON,
        defaultValue: []
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
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      number2: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      number3: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "budget"
    }
  );
  Budget.associate = ({ Project, Supplier, BudgetCategory, BudgetType, BudgetStatus, ProjectScene, ProjectShootingDay }) => {
    Budget.belongsTo(Project, { foreignKey: "project_id", as: "project" });
    //Budget.belongsTo(Supplier, { foreignKey: { name: "supplier_id", allowNull: true }});
    Budget.belongsTo(BudgetCategory, {foreignKey: { name: "budget_category_id", allowNull: true }});
    Budget.belongsTo(BudgetType, {foreignKey: { name: "budget_type_id", allowNull: true }});
    Budget.belongsTo(BudgetStatus, {foreignKey: { name: "budget_status_id", allowNull: true }});
    //Budget.belongsTo(ProjectScene, {foreignKey: { name: "project_scene_id", allowNull: true }});
    //Budget.belongsTo(ProjectShootingDay, {foreignKey: { name: "project_shooting_day_id", allowNull: true }});
  };
  return Budget;
};
