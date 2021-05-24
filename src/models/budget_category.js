"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const BudgetCategory = sequelize.define(
    "BudgetCategory",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      /*project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },*/
      budget_category: {
        type: DataTypes.TEXT,
        defaultValue: ""
      },
      color: {
        type: DataTypes.TEXT,
        defaultValue: ""
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "budget_category"
    }
  );
	// BudgetCategory.associate = ({ User, Project }) => {
	// 	BudgetCategory.belongsTo(Project, { foreignKey: "project_id", as: "project" });
	// };
  return BudgetCategory;
};
