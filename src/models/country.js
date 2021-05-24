"use strict";
import DataTypes from "sequelize";

module.exports = (sequelize, Sequelize) => {
  const Country = sequelize.define(
    "Country",
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.TEXT,
        defaultValue: ""
      },
      short_name: {
        type: DataTypes.TEXT,
        defaultValue: ""
      },
      phone_prefix: {
        type: DataTypes.TEXT,
        defaultValue: ""
      },
      vat: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      state_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      }
    },
    {
      charset: 'utf8',
      collate: 'utf8_general_ci',
      timestamps: true,
      tableName: "country"
    }
  );
  Country.associate = ({ State }) => {
    Country.belongsTo(State, { foreignKey: "state_id", as: "state" });
  };
  return Country;
};
