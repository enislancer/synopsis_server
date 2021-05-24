"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const SupplierProject = sequelize.define(
    "SupplierProject",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      project_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      supplier_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      budget_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      characters: {
        type: DataTypes.JSON,
        defaultValue: []
      },
      supplier_unit_type_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      supplier_unit_cost: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true
      }, 
      end_date: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "supplier_project"
    }
  );
	SupplierProject.associate = ({ Project, Supplier }) => {
		SupplierProject.belongsTo(Project, { foreignKey: "project_id", as: "project" });
		SupplierProject.belongsTo(Supplier, { foreignKey: "supplier_id", as: "supplier" });
  };
  return SupplierProject;
};
