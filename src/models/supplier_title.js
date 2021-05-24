"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const SupplierTitle = sequelize.define(
    "SupplierTitle",
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
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
      },
      number2: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
      },
      number3: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
      },
      percentage1: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
      },
      percentage2: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
      },
      percentage3: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "supplier_title"
    }
  );
  SupplierTitle.associate = ({ Company }) => {
    SupplierTitle.belongsTo(Company, { foreignKey: "company_id", as: "company" });
  };
  return SupplierTitle;
};
