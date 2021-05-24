"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const TaskType = sequelize.define(
    "TaskType",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      task_type: {
        type: DataTypes.TEXT,
        defaultValue: ""
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "task_type"
    }
  );

  return TaskType;
};
