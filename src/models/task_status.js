"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const TaskStatus = sequelize.define(
    "TaskStatus",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      task_status: {
        type: DataTypes.TEXT,
        defaultValue: ""
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "task_status"
    }
  );

  return TaskStatus;
};
