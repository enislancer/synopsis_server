'use strict';
import DataTypes from 'sequelize';

module.exports = (sequelize, Sequelize) => {
	const Payment = sequelize.define(
		'Payment',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			project_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
				defaultValue: 0
			},
			supplier_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
				defaultValue: 0
			},
			amount_paid: {
				type: DataTypes.INTEGER,
				allowNull: true,
				defaultValue: 0
			},
			budget_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
				defaultValue: 0
			},
			accounting_id: {
				type: DataTypes.INTEGER,
				allowNull: true,
				defaultValue: 0
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true,
				defaultValue: ''
			},
			paid_to: {
				type: DataTypes.TEXT,
				allowNull: true,
				defaultValue: ''
			},
			tax_id: {
				type: DataTypes.TEXT,
				allowNull: true,
				defaultValue: ''
			},
			date: {
				type: DataTypes.TEXT,
				allowNull: true,
				defaultValue: ''
			},
			comment: {
				type: DataTypes.TEXT,
				allowNull: true,
				defaultValue: ''
			}
		},
		{
			charset: 'utf8',
			collate: 'utf8_general_ci',
			timestamps: true,
			tableName: 'payment'
		}
	);
	Payment.associate = ({ Project, Supplier, Budget }) => {
		Payment.belongsTo(Project, { foreignKey: "project_id", as: "project" });
		Payment.belongsTo(Supplier, { foreignKey: "supplier_id", as: "supplier" });
		Payment.belongsTo(Budget, { foreignKey: "budget_id", as: "budget" });
	};

	return Payment;
	//   model.create({  });
};
