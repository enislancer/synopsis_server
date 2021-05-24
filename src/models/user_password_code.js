"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const UserPasswordCode = sequelize.define(
    "UserPasswordCode",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
			email: {
				type: DataTypes.STRING,
        unique: true
      },
      code: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "user_password_code"
    }
  );
  return UserPasswordCode;
};
