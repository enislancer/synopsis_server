"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const SupplierCategory = sequelize.define(
    "SupplierCategory",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      /*project_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },*/
      supplier_category: {
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
      tableName: "supplier_category"
    }
  );
	// SupplierCategory.associate = ({ User, Project }) => {
	// 	SupplierCategory.belongsTo(Project, { foreignKey: "project_id", as: "project" });
	// };
  return SupplierCategory;
};
