'use strict';
import DataTypes from 'sequelize';

module.exports = (sequelize, Sequelize) => {
	const User = sequelize.define(
		'User',
		{
			id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true
			},
			key: {
				type: DataTypes.TEXT,
				defaultValue: ''
			},
			company_id: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			},
			country_id: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			},
			first_name: {
				type: DataTypes.TEXT,
				defaultValue: ''
			},
			last_name: {
				type: DataTypes.TEXT,
				defaultValue: ''
			},
			email: {
				type: DataTypes.STRING,
				unique: true
			},
			password: {
				type: DataTypes.TEXT,
				defaultValue: ''
			},
			/*verify_email_token: {
				type: DataTypes.TEXT,
				defaultValue: ''
			},*/
			permission_status_id: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			},
			permission_type_id: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			},
			supplier_job_title_id: {
				type: DataTypes.INTEGER,
				defaultValue: 0
			},
			projects: {
				type: DataTypes.JSON,
				defaultValue: []
			},
			attachments: {
				type: DataTypes.JSON,
				defaultValue: []
			}
		},
		{
			charset: 'utf8',
			collate: 'utf8_general_ci',
			timestamps: true,
			tableName: 'user'
		}
	);
	User.associate = ({ Company, Country, Task }) => {
		//User.belongsTo(Company, { foreignKey: "company_id", as: "company" });
		User.belongsTo(Country, { foreignKey: "country_id", as: "country" });
		//User.hasMany(Task);
	};
	return User;
};
