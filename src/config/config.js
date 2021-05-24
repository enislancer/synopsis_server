const { add } = require("winston");
const prodConfig = require("./prod")
module.exports = {

	server_port: 3000,
	init_db: false,
	env: 0, // ( 0 - local, 1 - dev, 2 - prod )

	db_name: 'imgn',

	db_path_local: '127.0.0.1',
	db_root_local: 'root',
	db_pass_local: '',

	db_path_dev: 'imgn-database-1.cvtylkjc9pqm.us-east-1.rds.amazonaws.com',
	db_root_dev: 'admin',
	db_pass_dev: 'stav1122',

	db_path_prod: 'database-imgn-1.c8jwzhyu8acw.us-east-2.rds.amazonaws.com',
	db_root_prod: 'admin',
	db_pass_prod: 'stav1122',

	breakdown_server: true,
	script_breakdown_server_ip_local: 'http://localhost:8000/',
	script_breakdown_server_ip_dev: 'http://scrip-breakdown-dev.us-east-1.elasticbeanstalk.com/', // Dev
	script_breakdown_server_ip_prod: 'http://scriptbreakdown.us-east-2.elasticbeanstalk.com/', // Prod
	//script_breakdown_server_ip: 'http://3.129.189.94:3010/',
	script_breakdown_server_port: 8000,

	default_scene_time_min: 30,
	max_day_duration: 8,
	max_night_duration: 3,
	max_shooting_duration: 8,
	//env: 'development',

	aws_config: {
		accessKeyId: 'AKIAJPH5OEC3JDFW5CSA',
		secretAccessKey: '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',
		region: 'us-east-2'
	},
	a1ws_apiVersion: '2010-08-01',

	redis_host: 'redis-17871.c8.us-east-1-3.ec2.cloud.redislabs.com',
	redis_port: 17871,
	redis_pass: 'stavring1!',

	s3: 1,
	aws_access_key_id: 'AKIAJPH5OEC3JDFW5CSA',
	aws_secret_access_key: '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',
	aws_access_key_id_deepnen: 'AKIAJVIHZQ6R7VWVS3OA',
	aws_secret_access_key_deepnen: '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',
	s3_bucket_name: 'imgn',
	s3_url_prefix: 'https://imgn.s3.us-east-2.amazonaws.com/',

	mailer_provider: 'gmail',
	mailer_host: 'smtp.gmail.com',
	mailer_params: {
		//user: 'david@deepnen.com',
		//pass: 'ogmenti20'
		//pass: 'stav1122'
		//user: 'ring.dudu@gmail.com',
		//pass: 'stav00))'
		//user: 'davidring8@gmail.com',
		//pass: 'stavring'
		user: 'info@imgn.co',
		pass: 'stav1122'
	}/*,
	...(
		process.env.NODE_ENV === "production" ?
		prodConfig : {}
	)*/
}