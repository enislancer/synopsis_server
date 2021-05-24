"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const Task = sequelize.define(
    "Task",
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
      task_name: {
        type: DataTypes.TEXT,
        defaultValue: ""
      },
      project_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      task_category_id: {
        type: DataTypes.INTEGER,
        defaultValue: null
      },
      task_type_id: {
        type: DataTypes.INTEGER,
        defaultValue: null
      },
      task_status_id: {
        type: DataTypes.INTEGER,
        defaultValue: null
      },
      project_scene_id: {
        type: DataTypes.INTEGER,
        defaultValue: null
      },
      project_shooting_day_id: {
        type: DataTypes.INTEGER,
        defaultValue: null
      },
      project_scene_text: {
        type: DataTypes.TEXT,
        defaultValue: ''
      },
      project_scene_location: {
        type: DataTypes.TEXT,
        defaultValue: ''
      },
      supplier_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      },
      character_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      price: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      script: {
        type: DataTypes.JSON,
        defaultValue: []
      },
      comments: {
        type: DataTypes.TEXT,
        defaultValue: ""
      },
      parent_task_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true
      },
      due_date: {
        type: DataTypes.DATE,
        allowNull: true
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
      tableName: "task"
    }
  );
  Task.associate = ({ Project, Supplier, Character, TaskCategory, TaskType, TaskStatus, ProjectScene, ProjectShootingDay, User }) => {
    Task.belongsTo(Project, { foreignKey: "project_id", as: "project" });
    Task.belongsTo(Supplier, {foreignKey: { name: "supplier_id", allowNull: true }});
    Task.belongsTo(Character, {foreignKey: { name: "character_id", allowNull: true }});
    Task.belongsTo(TaskCategory, {foreignKey: { name: "task_category_id", allowNull: true }});
    Task.belongsTo(TaskType, {foreignKey: { name: "task_type_id", allowNull: true }});
    Task.belongsTo(TaskStatus, {foreignKey: { name: "task_status_id", allowNull: true }});
    //Task.belongsTo(ProjectScene, {foreignKey: { name: "project_scene_id", allowNull: true }});
    //Task.belongsTo(ProjectShootingDay, {foreignKey: { name: "project_shooting_day_id", allowNull: true }});
  };
  return Task;
};