"use strict";
const Sequelize = require("sequelize");
var config = require('../config/config');

const fs = require('fs');
const rdsCa = fs.readFileSync(__dirname + '/../../key/imgn-key.pem');

let db_name = config.db_name;
let host = config.db_path_local;
let root = config.db_root_local;
let pass = config.db_pass_local;
if (config.env == 1) {
  host = config.db_path_dev;
  root = config.db_root_dev;
  pass = config.db_pass_dev;
} else {
  if (config.env == 2) {
    host = config.db_path_prod;
    root = config.db_root_prod;
    pass = config.db_pass_prod;
  }
}


const sequelize = new Sequelize(
    db_name, 
    root,
    pass, {
	host: host,
  dialect: "mysql",
  port: 3306
  /*dialectOptions: {
    ssl: {
      rejectUnauthorized: true,
      ca: [rdsCa]
    }
  }
  logging: console.log,
  maxConcurrentQueries: 100,
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      rejectUnauthorized: true,
      ca: [rdsCa]
    }
  },
  pool: { maxConnections: 5, maxIdleTime: 30 },
  language: 'en'*/
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection secceded')
  })
  .catch(err => {
    console.log('Connection failed:',err)
  })

Object.values(
  require("require-all")({
    dirname: __dirname,
    filter: (filename) => {
      if (!filename.endsWith(".js")) return false;
      if (filename == "index.js") return false;
      if (filename == "utils.js") return false;
      return filename;
    },
  })
).forEach((controller) => controller(sequelize, Sequelize));

Object.values(sequelize.models)
  .filter(({ associate }) => associate)
  .forEach((model) => model.associate(sequelize.models));

module.exports = sequelize;
