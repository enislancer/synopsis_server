"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const UserNotification = sequelize.define(
    "UserNotification",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      from_user_id: {
        type: DataTypes.INTEGER,
				defaultValue: 0,
        allowNull: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
				defaultValue: 0,
        allowNull: true,
      },
      user_email: {
        type: DataTypes.TEXT,
				defaultValue: '',
        allowNull: true,
      },
      task_id: {
        type: DataTypes.INTEGER,
				defaultValue: 0,
        allowNull: true,
      },
      notification: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "user_notification"
    }
  );
  /*Task.associate = ({ User }) => {
    Task.belongsTo(User, { foreignKey: "user_id", as: "user" });
  };*/
  return UserNotification;
};
