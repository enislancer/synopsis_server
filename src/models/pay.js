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
			payment_id: {
				type: DataTypes.TEXT
			},
			company_id: {
				type: DataTypes.INTEGER,
				allowNull: false
			},

			amount: {
				type: DataTypes.TEXT
			},
			payer_email: {
				type: DataTypes.TEXT
			},
			payer_first_name: {
				type: DataTypes.TEXT
			},

			payer_last_name: {
				type: DataTypes.TEXT
			},
			payer_paypal_id: {
				type: DataTypes.TEXT
			},
			payer_country: {
				type: DataTypes.TEXT
			},
			credits: {
				type: DataTypes.INTEGER
			}
		},
		{
			charset: 'utf8',
			collate: 'utf8_general_ci',
			timestamps: true,
			tableName: 'payments'
		}
	);

	return Payment;
	//   model.create({  });
};
