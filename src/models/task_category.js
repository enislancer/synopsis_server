"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const TaskCategory = sequelize.define(
    "TaskCategory",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      supplier_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      shooting_day_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      task_category: {
        type: DataTypes.TEXT,
        defaultValue: ""
      },
      task_category_name: {
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
      tableName: "task_category"
    }
  );
	TaskCategory.associate = ({ User, Project }) => {
		TaskCategory.belongsTo(Project, { foreignKey: "project_id", as: "project" });
	};
  return TaskCategory;
};
