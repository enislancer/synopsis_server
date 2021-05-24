"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const ProjectScene = sequelize.define(
    "ProjectScene",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      scene_number: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      chapter_number: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      scene_name: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ''
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ''
      },
      time: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ''
      },
      location: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ''
      },
      eighth: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1
      },
      props: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },
      clothes: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },
      specials: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },
      others: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },
      extras: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      extras_text: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ''
      },
      bits: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      bits_text: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ''
      },
      scene_duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      scene_status_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      screen_time: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ''
      },
      raw_time: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ''
      },
      script_pages: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ''
      },
      camera_card: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ''
      },
      sound_card: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ''
      },
      latitude: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0
      },
      longitude: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0
      },
      comments: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ''
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "project_scene"
    }
  );
  ProjectScene.associate = ({ Project }) => {
    ProjectScene.belongsTo(Project, { foreignKey: "project_id", as: "project" });
  };
  return ProjectScene;
};
