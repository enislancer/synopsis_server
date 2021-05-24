"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const Character = sequelize.define(
    "Character",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      character_name: {
        type: DataTypes.TEXT,
        defaultValue: ""
      },
      character_type: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      project_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      supplier_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      associated_num: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      character_count: {
        type: DataTypes.INTEGER,
        defaultValue: 1
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "character"
    }
  );
  // Character.associate = ({ Company }) => {
  //   Project.belongsTo(Company, { foreignKey: "company_id", as: "company" });
  // };
  return Character;
};
