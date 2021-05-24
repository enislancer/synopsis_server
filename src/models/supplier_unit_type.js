"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const SupplierUnitType = sequelize.define(
    "SupplierUnitType",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      supplier_unit_type: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: ""
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "supplier_unit_type"
    }
  );
  SupplierUnitType.associate = ({ Company }) => {
    SupplierUnitType.belongsTo(Company, { foreignKey: "company_id", as: "company" });
  };
  return SupplierUnitType;
};
