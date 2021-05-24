"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const UserInviteCode = sequelize.define(
    "UserInviteCode",
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
      tableName: "user_invite_code"
    }
  );
  return UserInviteCode;
};
