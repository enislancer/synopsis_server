"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const Supplier = sequelize.define(
    "Supplier",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      company_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      email: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: ""
      },
      pos: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      company_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      supplier_name: {
        type: DataTypes.TEXT,
        defaultValue: ""
      },
      supplier_type_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      supplier_department_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      supplier_job_title_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      supplier_unit_type_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      supplier_unit_cost: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      supplier_category_id: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      agency: {
        type: DataTypes.TEXT,
        defaultValue: ''
      },
      pickup: {
        type: DataTypes.TEXT,
        defaultValue: ''
      },
      site: {
        type: DataTypes.TEXT,
        defaultValue: ''
      },
      end_time: {
        type: DataTypes.TEXT,
        defaultValue: ''
      },
      post_comments: {
        type: DataTypes.TEXT,
        defaultValue: ''
      },
      service_description: {
        type: DataTypes.TEXT,
        defaultValue: ""
      },
      contact_name: {
        type: DataTypes.TEXT,
        defaultValue: ""
      },
      phone: {
        type: DataTypes.TEXT,
        defaultValue: ""
      },
      comments: {
        type: DataTypes.TEXT,
        defaultValue: ""
      },
      budget_comments: {
        type: DataTypes.TEXT,
        defaultValue: ""
      },
      attachments: {
        type: DataTypes.JSON,
        defaultValue: {}
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true
      }, 
      end_date: {
        type: DataTypes.DATE,
        allowNull: true
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
      },
      percentage1: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 125
      },
      percentage2: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 150
      },
      percentage3: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1
      }      
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "supplier"
    }
  );
	Supplier.associate = ({ Company, SupplierDepartment, SupplierJobTitle, SupplierType, SupplierCategory, SupplierUnitType }) => {
		Supplier.belongsTo(Company, { foreignKey: "company_id", as: "company" });
    Supplier.belongsTo(SupplierDepartment, {foreignKey: { name: "supplier_department_id", allowNull: true }});
    //Supplier.belongsTo(SupplierJobTitle, {foreignKey: { name: "supplier_job_title_id", allowNull: true }});
    Supplier.belongsTo(SupplierType, {foreignKey: { name: "supplier_type_id", allowNull: true }});
    Supplier.belongsTo(SupplierCategory, {foreignKey: { name: "supplier_category_id", allowNull: true }});
    //Supplier.belongsTo(SupplierUnitType, {foreignKey: { name: "supplier_unit_type_id", allowNull: true }});
  };
  return Supplier;
};
