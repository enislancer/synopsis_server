"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const TaskTitle = sequelize.define(
    "TaskTitle",
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
        defaultValue: null
      },
      text2: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
      },
      text3: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
      },
      number1: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
      },
      number2: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
      },
      number3: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "task_title"
    }
  );
  TaskTitle.associate = ({ Project, TaskCategory }) => {
    TaskTitle.belongsTo(Project, { foreignKey: "project_id", as: "project" });
    TaskTitle.belongsTo(TaskCategory, { foreignKey: "task_category_id", as: "task_category" });
  };
  return TaskTitle;
};
