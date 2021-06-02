const { add } = require("winston");
const prodConfig = require("./prod")
module.exports = {

	server_port: 3000,
	init_db: false,
	env: 0, // ( 0 - local, 1 - dev, 2 - prod )

	db_name: 'imgn',


	db_path_local: 'synopsis-db.cxrrvbjsckdc.us-east-2.rds.amazonaws.com',
	db_root_local: 'admin',
	db_pass_local: 'Creative25',

	breakdown_server: true,
	
	script_breakdown_server_ip_local: 'http://scrip-breakdown-dev.us-east-1.elasticbeanstalk.com/', // Dev
	script_breakdown_server_port: 8000,

	default_scene_time_min: 30,
	max_day_duration: 8,
	max_night_duration: 3,
	max_shooting_duration: 8,
	env: 'development',

	
}
