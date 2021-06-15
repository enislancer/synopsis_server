"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const ProjectShootingDay = sequelize.define(
    "ProjectShootingDay",
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
        defaultValue: 0
      },
      pos: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      params: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
      },
      team_hours : 
      {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: 
        {
          call: '',
          early_call: '',
          early_call_suppliers: [],
          breakfast_start: '',
          breakfast_end: '',
          lunch_start: '',
          lunch_end: '',
          wrap: '',
          first_shoot: '',
          over_time: '',
          finished: '',
          finished_suppliers: [],
          comments: ''
        }
      },
      shooting_day: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
      },
      additional_expenses: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [] // [{def: ,price: ,comment:}]
      },
      general_comments: {
        type: DataTypes.TEXT,
        defaultValue: ''
      },
      post_shooting_day: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {
          team_hours: {
            call: '',
            early_call: '',
            early_call_suppliers: [],
            breakfast_start: '',
            breakfast_end: '',
            lunch_start: '',
            lunch_end: '',
            wrap: '',
            first_shoot: '',
            over_time: '',
            finished: '',
            finished_suppliers: [],
            comments: ''
          }, //team_hours
          locations: null, //team_hours_location
          actors: null, // to do
          employees: null,
          extra_expenses: null
          //scenes: '', // to do
          //general: '' // to do
        }
      },      
      tasks: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },
      scene_pos: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
      },
      suppliers: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
      },
      date: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "project_shooting_day"
    }
  );
  ProjectShootingDay.associate = ({ Project }) => {
    ProjectShootingDay.belongsTo(Project, { foreignKey: "project_id", as: "project" });
  };
  return ProjectShootingDay;
};
