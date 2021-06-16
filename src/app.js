//require('dotenv').config({ path: __dirname + `/.env` });
import express from 'express';
const winston = require('winston');
const cors = require('cors')
import routes from './routes';
import bodyParser from 'body-parser';
import passport from 'passport';
//import * as models from './models';
import { JWT_SECRET, JWT_COOKIE_NAME } from './controller/AuthController';
import AppError from './utils/AppError';
import utils from './utils/utils';
var config = require('./config/config');
var apikey = require("apikeygen").apikey;
const path = require('path');

const session = require('express-session');
const httpStatus = require('http-status');
// const HttpStatus = require('http-status-codes');

const sequelize = require('./models');
const { TaskCategory, TaskType, TaskStatus, TaskTitle, SupplierProject, SupplierTitle, SupplierDepartment, SupplierJobTitle, SupplierType, SupplierUnitType, BudgetCategory, SupplierCategory, BudgetType, BudgetStatus, BudgetTitle, ProjectScene, Company, Project, Task, Budget, Supplier, User, State, Country, Props, Makeups, Clothes, Specials, Others, ProjectStatus, SceneStatus, SceneLocation, ScenePlace, SceneTime, SceneTimeDef, SceneTimeBank, SceneLocationBank, SceneTimeBankRef, SceneLocationBankRef, PermissionType, PermissionStatus } = sequelize.models;

const app = express();
// const config_env = {
// 	env: process.env.NODE_ENV !== 'production' ? 'development' : 'production'
// };

const formData = require('express-form-data')
app.use(formData.parse())
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb'}));
global.serveStaticpath = __dirname +'/public'
app.use( express.static(__dirname +'/public'));


//app.use(session({ secret: JWT_SECRET }));
app.use(session({
    secret: JWT_SECRET,
    name: JWT_COOKIE_NAME,
    //store: sessionStore, // connect-mongo session store
    proxy: true,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cors())


winston.add(
	new winston.transports.Console({
		level: 'info',
		format: winston.format.combine(winston.format.colorize({ level: true }), winston.format.simple())
	})
);
app.set('x-powered-by', false);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
	res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, authorization, Authorization'
	);
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
	res.header('Access-Control-Allow-Credentials', true);
	next();
});

routes(app);

const errorConverter = (err, req, res, next) => {
	let error = err;
	if (!(error instanceof AppError)) {
		const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
		const message = error.message || httpStatus[statusCode];
		error = new AppError(statusCode, message, false, err.stack);
	}
	next(error);
};

const errorHandler = (err, req, res, next) => {
	let { statusCode, message } = err;
	//if (config_env.env === 'production' && !err.isOperational) {
		statusCode = httpStatus.INTERNAL_SERVER_ERROR;
		message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
	//}

	res.locals.errorMessage = err.message;

	console.log('errorHandler');
	console.log(err);
	const response = {
		code: statusCode,
		message,
		...(config.env === 'development' && { stack: err.stack })
	}

	if (config.env === 'development') {
		//logger.error(err)
		console.log('Error:',err);
	}

	res.status(statusCode).json(response);
};

app.use(errorConverter);
app.use(errorHandler);

var alter = config.init_db;

// let location = 'I+N~T.'
// location = location.replace(/['"`-~=+!@#$%^&*(){}]/g, '');
// location = location.replace(/[.]/g, '');
// location = location.replace(/[,]/g, '');
//location = location.replace(/['"`.,-~=+!@#$%^&*(){}]/g, '');

// let char = 'Dudu Ring'
// let name = char.toLowerCase().trim()
// let name1 = name.trim();

(async () => {

	await sequelize.sync({ alter: alter }); // If (alter: true), initialize data base (force: true  delete data)

	if (alter) {

		await sequelize.sync({ force: true }); // If (alter: true), initialize data base (force: true  delete data)

		let state_list = [{
			name: 'New York',
			shourt_name: 'NY',
			phone_prefix: '001',
			vat: 10
		}, {
			name: 'California',
			shourt_name: 'CL',
			phone_prefix: '001',
			vat: 10
		}];

		let country_list = [{
			name: 'Israel',
			shourt_name: 'IL',
			phone_prefix: '972',
			vat: 17,
			state_id: 1
		}, {
			name: 'USA',
			shourt_name: 'US',
			phone_prefix: '001',
			vat: 10,
			state_id: 1
		}];

		/*let props_list = [
			{word: 'אוזניה'},
			{word: 'אזניה'},
			{word: 'אוזניות'},																							
			{word: 'אזניות'},																							
			{word: 'אינטרקום'},																							
			{word: 'אתר'},																							
			{word: 'אתרים'},																							
			{word: 'בובה'},																							
			{word: 'בובות'},																							
			{word: 'בננה'},																							
			{word: 'גבינה'},																							
			{word: 'דף'},																							
			{word: 'דפים'},																							
			{word: 'הודעה'},																							
			{word: 'המשקפיים'},																							
			{word: 'חפץ'},																							
			{word: 'חפצים'},																							
			{word: 'חתיכה'},																							
			{word: 'טייק'},																							
			{word: 'טלפון'},																							
			{word: 'ינשוף'},																							
			{word: 'כדור'},																							
			{word: 'כוננית'},																							
			{word: 'כוס חד פעמית'},																							
			{word: 'כוס'},																							
			{word: 'כוסות'},																							
			{word: 'כיסא'},																							
			{word: 'כיסוי'},																							
			{word: 'לפטופ'},																							
			{word: 'מדפסת'},																							
			{word: 'מזמרה'},																							
			{word: 'מחשב'},																							
			{word: 'מטאטא'},																							
			{word: 'מטאטאים'},																							
			{word: 'מכשיר'},																							
			{word: 'מסמכים'},																							
			{word: 'מצגות'},																							
			{word: 'מצגת'},																							
			{word: 'מראה'},																							
			{word: 'משקפי תלת מימד'},
			{word: 'משקפי'},																							
			{word: 'משקפיים'},																							
			{word: 'משקפים'},																							
			{word: 'נייד'},																							
			{word: 'ניילון'},																							
			{word: 'סורק'},																							
			{word: 'סלוגן'},																							
			{word: 'ספר'},																							
			{word: 'ספרים'},																							
			{word: 'סרטון'},																							
			{word: 'סירטון'},																							
			{word: 'עוגיה'},																							
			{word: 'עוגיות'},																							
			{word: 'עוגייה'},																							
			{word: 'פוף'},																							
			{word: 'פופים'},																							
			{word: 'פיצה'},																							
			{word: 'פיצות'},																							
			{word: 'פלזמה'},																							
			{word: 'פסלון'},																							
			{word: 'צלחת'},																							
			{word: 'צלחות'},																							
			{word: 'צמר'},																							
			{word: 'צעיף'},																							
			{word: 'צעיפים'},																							
			{word: 'קופסא'},																							
			{word: 'קופסאות'},																							
			{word: 'קוראסון'},																							
			{word: 'קורות'},																							
			{word: 'קלמנטינה'},																							
			{word: 'קלמנטינות'},																							
			{word: 'קפה'},																							
			{word: 'קרואסון'},
			{word: 'קרמיקה'},
			{word: 'קרמיקות'},
			{word: 'רהיט'},
			{word: 'רהיטים'},
			{word: 'שולחן'},
			{word: 'שולחנות'},
			{word: 'שוקולדים'},
			{word: 'שוקולד'},
			{word: 'שייק'},
			{word: 'שייקים'},
			{word: 'שעון'},
			{word: 'שעונים'},
			{word: 'שקיות'},
			{word: 'שקית'},
			{word: 'שרפרף'},
			{word: 'תה'},
			{word: 'תיק'},
			{word: 'תיקים'},
			{word: 'תמונה'},
			{word: 'תמונות'},
			{word: 'תמונת'},
			{word: 'תמר'},
			{word: 'תנשמת'},
			{word: 'תפריטים'},
			{word: 'תפריט'}
		];

		let makeups_list = [
			{word: 'אלף'}
		]

		let clothes_list = [
			{word: 'שימלה'}
		]

		let others_list = [
			{word: 'הגברה'}
		]

		let specials_list = [
			{word: 'מסוק'}
		]*/

		/*let scene_location = [{
			project_id: 1,
			scene_location: 'פנים' 
		}, { 
			project_id: 1,
			scene_location: 'חוץ'
		}, {
			project_id: 2,
			scene_location: 'פנים' 
		}, { 
			project_id: 2,
			scene_location: 'חוץ' 
		}];*/

		/*let scene_time_bank = [{
			scene_time: 'DAY',
			scene_time_count: 5
		}, {
			scene_time: 'NIGHT',
			scene_time_count: 5
		}, {
			scene_time: 'יום',
			scene_time_count: 5
		}, {
			scene_time: 'לילה',
			scene_time_count: 5
		}]

		let scene_location_bank = [{
			scene_location: 'INT',
			scene_location_count: 5
		}, {
			scene_location: 'EXT',
			scene_location_count: 5
		}, {
			scene_location: 'פנים',
			scene_location_count: 5
		}, {
			scene_location: 'חוץ',
			scene_location_count: 5
		}]*/

		let day_duration = config.max_day_duration * 60;
		let night_duration = config.max_night_duration * 60;
		let default_scene_time = config.default_scene_time_min;
		let scene_time_def = [{
			scene_time: 'יום',
			scene_time_type: 0,
			max_shooting_scenes: 8,
			max_shooting_duration: day_duration,
			default_scene_time: default_scene_time,
			color: '#fff6f3'
		}, {
			scene_time: 'ויום',
			scene_time_type: 0,
			max_shooting_scenes: 8,
			max_shooting_duration: day_duration,
			default_scene_time: default_scene_time,
			color: '#fff6f3'
		}, {
			scene_time: 'בוקר',
			scene_time_type: 0,
			max_shooting_scenes: 8,
			max_shooting_duration: day_duration,
			default_scene_time: default_scene_time,
			color: '#fff6f3'
		}, {
			scene_time: 'בקר',
			scene_time_type: 0,
			max_shooting_scenes: 8,
			max_shooting_duration: day_duration,
			default_scene_time: default_scene_time,
			color: '#fff6f3'
		}, {
			scene_time: 'בקר מוקדם',
			scene_time_type: 0,
			max_shooting_scenes: 8,
			max_shooting_duration: day_duration,
			default_scene_time: default_scene_time,
			color: '#fff6f3'
		}, {
			scene_time: 'בוקר מוקדם',
			scene_time_type: 0,
			max_shooting_scenes: 8,
			max_shooting_duration: day_duration,
			default_scene_time: default_scene_time,
			color: '#fff6f3'
		}, {
			scene_time: 'לילה',
			scene_time_type: 1,
			max_shooting_scenes: 4,
			max_shooting_duration: night_duration,
			default_scene_time: default_scene_time,
			color: '#e5e9ed'
		}, {
			scene_time: 'ולילה',
			scene_time_type: 1,
			max_shooting_scenes: 4,
			max_shooting_duration: night_duration,
			default_scene_time: default_scene_time,
			color: '#e5e9ed'
		}, {
			scene_time: 'ערב',
			scene_time_type: 1,
			max_shooting_scenes: 4,
			max_shooting_duration: night_duration,
			default_scene_time: default_scene_time,
			color: '#92969a'
		}, {
			scene_time: 'DAY',
			scene_time_type: 0,
			max_shooting_scenes: 8,
			max_shooting_duration: day_duration,
			default_scene_time: default_scene_time,
			color: '#fff6f3'
		}, {
			scene_time: 'MORNING',
			scene_time_type: 0,
			max_shooting_scenes: 8,
			max_shooting_duration: day_duration,
			default_scene_time: default_scene_time,
			color: '#fff6f3'
		}, {
			scene_time: 'SUNRISE',
			scene_time_type: 0,
			max_shooting_scenes: 8,
			max_shooting_duration: day_duration,
			default_scene_time: default_scene_time,
			color: '#fff6f3'
		}, {
			scene_time: 'CONTINUOUS',
			scene_time_type: 0,
			max_shooting_scenes: 8,
			max_shooting_duration: day_duration,
			default_scene_time: default_scene_time,
			color: '#fff6f3'
		}, {
			scene_time: 'AFTERNOON',
			scene_time_type: 1,
			max_shooting_scenes: 4,
			max_shooting_duration: night_duration,
			default_scene_time: default_scene_time,
			color: '#92969a'
		}, {
			scene_time: 'EVENING',
			scene_time_type: 1,
			max_shooting_scenes: 4,
			max_shooting_duration: night_duration,
			default_scene_time: default_scene_time,
			color: '#92969a'
		}, {
			scene_time: 'DAWN',
			scene_time_type: 1,
			max_shooting_scenes: 4,
			max_shooting_duration: night_duration,
			default_scene_time: default_scene_time,
			color: '#92969a'
		}, {
			scene_time: 'DUSK',
			scene_time_type: 1,
			max_shooting_scenes: 4,
			max_shooting_duration: night_duration,
			default_scene_time: default_scene_time,
			color: '#92969a'
		}, {
			scene_time: 'NIGHT',
			scene_time_type: 1,
			max_shooting_scenes: 4,
			max_shooting_duration: night_duration,
			default_scene_time: default_scene_time,
			color: '#e5e9ed'
		}];

		/*MOMENTS LATER
		CONTINUOUS
		LATER
		PASSENGER AREA
		GLOBEMASTER
		HALLWAY
		INTERCUT
		RESUME*/
	
		let scene_status_list = [
			{ scene_status: 'Done' },
			{ scene_status: 'Not Shoot' },
			{ scene_status: 'Partly Shoot' },
			{ scene_status: 'Disable' }
		]

		let project_status_list = [
			{ project_status: 'Active' },
			{ project_status: 'Done' },
			{ project_status: 'Delete' }
		]

		let task_type_list = [
			{ task_type: 'Task Type 1' },
			{ task_type: 'Task Type 2' },
			{ task_type: 'Task Type 3' },
			{ task_type: 'Task Type 4' },
			{ task_type: 'Task Type 5' }
		];

		let task_status_list = [
			{ task_status: 'Active' },
			{ task_status: 'Done' }
		];

		/*let task_title_list = [{ 
			project_id: 1,
			category_id: 1,
			text1: 'Text Title 1',
			text2: 'Text Title 2',
			text3: null,
			number1: 'Number Title 1',
			number2: 'Number Title 2',
			number3: null
		}, { 
			project_id: 1,
			category_id: 2,
			text1: 'Text Title 1',
			text2: 'Text Title 2',
			text3: null,
			number1: 'Number Title 1',
			number2: 'Number Title 2',
			number3: null
		}, { 
			project_id: 2,
			category_id: 3,
			text1: 'Text Title 1',
			text2: 'Text Title 2',
			text3: null,
			number1: 'Number Title 1',
			number2: 'Number Title 2',
			number3: null
		}, {
			project_id: 2,
			category_id: 4,
			text1: 'Text Title 1',
			text2: 'Text Title 2',
			text3: null,
			number1: 'Number Title 1',
			number2: 'Number Title 2',
			number3: null
		}];*/

		/*let budget_title_list = [{ 
			project_id: 1,
			category_id: 1,
			text1: 'Text Title 1',
			text2: 'Text Title 2',
			text3: null,
			number1: 'Number Title 1',
			number2: 'Number Title 2',
			number3: null
		}, { 
			project_id: 1,
			category_id: 2,
			text1: 'Text Title 1',
			text2: 'Text Title 2',
			text3: null,
			number1: 'Number Title 1',
			number2: 'Number Title 2',
			number3: null
		}, {
			project_id: 2,
			category_id: 3,
			text1: 'Text Title 1',
			text2: 'Text Title 2',
			text3: null,
			number1: 'Number Title 1',
			number2: 'Number Title 2',
			number3: null
		}, {
			project_id: 2,
			category_id: 4,
			text1: 'Text Title 1',
			text2: 'Text Title 2',
			text3: null,
			number1: 'Number Title 1',
			number2: 'Number Title 2',
			number3: null
		}];*/

		/*let supplier_title_list = [{ 
			project_id: 1,
			category_id: 1,
			text1: 'Text Title 1',
			text2: 'Text Title 2',
			text3: null,
			number1: 'Number Title 1',
			number2: 'Number Title 2',
			number3: null
		}, { 
			project_id: 1,
			category_id: 2,
			text1: 'Text Title 1',
			text2: 'Text Title 2',
			text3: null,
			number1: 'Number Title 1',
			number2: 'Number Title 2',
			number3: null
		}, { 
			project_id: 2,
			category_id: 1,
			text1: 'Text Title 1',
			text2: 'Text Title 2',
			text3: null,
			number1: 'Number Title 1',
			number2: 'Number Title 2',
			number3: null
		}, { 
			project_id: 2,
			category_id: 2,
			text1: 'Text Title 1',
			text2: 'Text Title 2',
			text3: null,
			number1: 'Number Title 1',
			number2: 'Number Title 2',
			number3: null
		}];*/

		let supplier_department_list = [
			{ supplier_department: 'שחקנים' },
			{ supplier_department: 'הפקה' },
			{ supplier_department: 'טכני' },
			{ supplier_department: 'ארט' }
		];

		let permission_type_list = [
			{ permission_type: 'admin' },
			{ permission_type: 'manager' },
			{ permission_type: 'member' },
			{ permission_type: 'imgn_admin' }
		];

		let permission_status_list = [
			{ permission_status: 'pending' },
			{ permission_status: 'approved' },
			{ permission_status: 'suspended' },
			{ permission_status: 'delete' }
		];

		let supplier_job_title_list = [
			{ supplier_job_title: 'שחקן ראשי' },
			{ supplier_job_title: 'שחקן משנה' },
			{ supplier_job_title: 'ניצב' },
			{ supplier_job_title: 'מפיק' },
			{ supplier_job_title: 'מתאמת הפקה' },
			{ supplier_job_title: 'מנהל הפקה' },
			{ supplier_job_title: 'מנהל לוקיישנים' },
			{ supplier_job_title: 'עוזר הפקה' },
			{ supplier_job_title: 'ראנר' },
			{ supplier_job_title: 'נערת מים' },
			{ supplier_job_title: 'צלם' },
			{ supplier_job_title: 'עוזר צלם' },
			{ supplier_job_title: 'גריפ' },
			{ supplier_job_title: 'מקליט' },
			{ supplier_job_title: 'ארט דיירקטור' },
			{ supplier_job_title: 'סט דרסר' },
			{ supplier_job_title: 'פרופסמן' },
			{ supplier_job_title: 'עוזר ארט' },
			{ supplier_job_title: 'מעצבת תלבושות' },
			{ supplier_job_title: 'מאפרת' },
			{ supplier_job_title: 'עוזרת מאפרת' },
			{ supplier_job_title: 'ספר' }
		];

		let supplier_unit_type_list = [
			{supplier_unit_type: 'daily'},
			{supplier_unit_type: 'monthly'},
			{supplier_unit_type: 'project'}
		];

		let supplier_type_list = [
			{supplier_type: 'supplier type 1'},
			{supplier_type: 'supplier type 2'}
		];

		let budget_type_list = [
			{ budget_type: 'Budget Type 1' },
			{ budget_type: 'Budget Type 2' },
			{ budget_type: 'Budget Type 3' },
			{ budget_type: 'Budget Type 4' },
			{ budget_type: 'Budget Type 5' }
		];

		let budget_status_list = [
			{ budget_status: 'Budget Status 1' },
			{ budget_status: 'Budget Status 2' },
			{ budget_status: 'Budget Status 3' },
			{ budget_status: 'Budget Status 4' }
		];

		let companies = [{
			url: 'https://www.hsil.tv',
			company_name: 'Hertzelia Studios',
			company_info: {},
			is_disable: 0,
			account_type: 0
		},{
			url: 'http://www.transfax.co.il/',
			company_name: 'Transfax',
			company_info: {},
			is_disable: 0,
			account_type: 0
		}];

		/*let supplier_project = [{
			project_id: 1,
			supplier_id: 1
		}, {
			project_id: 1,
			supplier_id: 3
		}, {
			project_id: 1,
			supplier_id: 4
		}, {
			project_id: 1,
			supplier_id: 5
		}, {
			project_id: 1,
			supplier_id: 6
		}, {
			project_id: 1,
			supplier_id: 7
		}, {
			project_id: 1,
			supplier_id: 8
		}, {
			project_id: 1,
			supplier_id: 9
		}, {
			project_id: 1,
			supplier_id: 10
		}, {
			project_id: 1,
			supplier_id: 11
		}, {
			project_id: 1,
			supplier_id: 12
		}, {
			project_id: 1,
			supplier_id: 13
		}, {
			project_id: 1,
			supplier_id: 14
		}, {
			project_id: 1,
			supplier_id: 15
		}, {
			project_id: 1,
			supplier_id: 16
		}, {
			project_id: 1,
			supplier_id: 17
		}, {
			project_id: 1,
			supplier_id: 18
		}, {
			project_id: 1,
			supplier_id: 19
		}, {
			project_id: 1,
			supplier_id: 20
		}, {
			project_id: 1,
			supplier_id: 21
		}, {
			project_id: 1,
			supplier_id: 22
		}, {
			project_id: 1,
			supplier_id: 23
		}, {
			project_id: 2,
			supplier_id: 1
		}, {
			project_id: 2,
			supplier_id: 3
		}, {
			project_id: 2,
			supplier_id: 4
		}, {
			project_id: 2,
			supplier_id: 5
		}, {
			project_id: 2,
			supplier_id: 6
		}, {
			project_id: 2,
			supplier_id: 7
		}, {
			project_id: 2,
			supplier_id: 8
		}, {
			project_id: 2,
			supplier_id: 9
		}, {
			project_id: 2,
			supplier_id: 10
		}, {
			project_id: 2,
			supplier_id: 11
		}, {
			project_id: 2,
			supplier_id: 12
		}, {
			project_id: 2,
			supplier_id: 13
		}, {
			project_id: 2,
			supplier_id: 14
		}, {
			project_id: 2,
			supplier_id: 15
		}, {
			project_id: 2,
			supplier_id: 16
		}, {
			project_id: 2,
			supplier_id: 17
		}, {
			project_id: 2,
			supplier_id: 18
		}, {
			project_id: 2,
			supplier_id: 19
		}, {
			project_id: 2,
			supplier_id: 20
		}, {
			project_id: 2,
			supplier_id: 21
		}, {
			project_id: 2,
			supplier_id: 22
		}, {
			project_id: 2,
			supplier_id: 23
		}]*/

		/*let suppliers = [{
			supplier_name: 'יוגב',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 1,
			supplier_job_title_id: 1,
			supplier_category_id: 1,
			service_description: 'שחקן',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '050-123-4678',
			email: 'u@gmail.com',
			comments: 'comments',
			attachments: []
		}, {
			supplier_name: 'ארז',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 1,
			supplier_job_title_id: 2,
			supplier_category_id: 1,
			service_description: 'שחקן משנה',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '050-864-2285',
			email: 'v@gmail.com',
			comments: 'comments',
			attachments: []
		}, {
			supplier_name: 'עדי',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 1,
			supplier_job_title_id: 3,
			supplier_category_id: 1,
			service_description: 'ניצב/ביט',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '050-952-5546',
			email: 'w@gmail.com',
			comments: 'comments',
			attachments: []
		}, {
			supplier_name: 'אביגדור',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 2,
			supplier_job_title_id: 4,
			supplier_category_id: 2,
			service_description: 'הפקה',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '050-864-2285',
			email: 'x@gmail.com',
			comments: 'comments',
			attachments: []
		}, {
			supplier_name: 'איתי',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 2,
			supplier_job_title_id: 5,
			supplier_category_id: 2,
			service_description: 'מתאמת הפקה',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '050-952-5546',
			email: 's@gmail.com',
			comments: 'comments',
			attachments: []
		}, {
			supplier_name: 'עומר',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 2,
			supplier_job_title_id: 6,
			supplier_category_id: 2,
			service_description: 'מנהל הפקה',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '050-123-4678',
			email: 'f@gmail.com',
			comments: 'comments',
			attachments: []
		}, {
			supplier_name: 'אורן',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 2,
			supplier_job_title_id: 7,
			supplier_category_id: 2,
			service_description: 'מנהל לוקיישנים',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '050-952-5546',
			email: 'g@gmail.com',
			comments: 'comments',
			attachments: []
		}, {
			supplier_name: 'נוי',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 2,
			supplier_job_title_id: 8,
			supplier_category_id: 2,
			service_description: 'עוזר הפקה',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '050-864-2285',
			email: 'h@gmail.com',
			comments: 'comments',
			attachments: []
		}, {
			supplier_name: 'דורון',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 2,
			supplier_job_title_id: 8,
			supplier_category_id: 2,
			service_description: 'עוזר הפקה',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '050-952-5546',
			email: 'i@gmail.com',
			comments: 'comments',
			attachments: []
		}, {
			supplier_name: 'דור',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 3,
			supplier_job_title_id: 9,
			supplier_category_id: 2,
			service_description: 'ראנר',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '050-864-2285',
			email: 'j@gmail.com',
			comments: 'comments',
			attachments: []
		}, {
			supplier_name: 'אלברט',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 3,
			supplier_job_title_id: 10,
			supplier_category_id: 2,
			service_description: 'נער/ת מים',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '050-123-4678',
			email: 'k@gmail.com',
			comments: 'comments',
			attachments: []
		}, {
			supplier_name: 'דידי',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 3,
			supplier_job_title_id: 11,
			supplier_category_id: 3,
			service_description: 'צלם',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '050-952-5546',
			email: 'l@gmail.com',
			comments: 'comments',
			attachments: []
		}, {
			supplier_name: 'בועז',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 3,
			supplier_job_title_id: 12,
			supplier_category_id: 3,
			service_description: 'עוזר צלם',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '050-864-2285',
			email: 'm@gmail.com',
			comments: 'comments',
			attachments: []
		}, {
			supplier_name: 'עמרי',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 3,
			supplier_job_title_id: 13,
			supplier_category_id: 3,
			service_description: 'גריפ',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '050-952-5546',
			email: 'n@gmail.com',
			comments: 'comments',
			attachments: []
		}, {
			supplier_name: 'מתן',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 3,
			supplier_job_title_id: 14,
			supplier_category_id: 3,
			service_description: 'מקליט',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '050-864-2285',
			email: 'o@gmail.com',
			comments: 'comments',
			attachments: []
		}, {
			supplier_name: 'גלי',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 4,
			supplier_job_title_id: 15,
			supplier_category_id: 3,
			service_description: 'ארט',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '050-123-4678',
			email: 'p@gmail.com',
			comments: 'comments',
			attachments: []
		}, {
			supplier_name: 'נחשון',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 4,
			supplier_job_title_id: 16,
			supplier_category_id: 3,
			service_description: 'ארט',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '050-864-2285',
			email: 'q@gmail.com',
			comments: 'comments',
			attachments: []
		}, {
			supplier_name: 'ירון',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 4,
			supplier_job_title_id: 17,
			supplier_category_id: 3,
			service_description: 'ארט',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '050-952-5546',
			email: 'r@gmail.com',
			comments: 'comments',
			attachments: []
		}, {
			supplier_name: 'רונן',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 4,
			supplier_job_title_id: 18,
			supplier_category_id: 3,
			service_description: 'ארט',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '050-864-2285',
			email: 's@gmail.com',
			comments: 'comments',
			attachments: []
		}, {
			supplier_name: 'אלחנן',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 4,
			supplier_job_title_id: 19,
			supplier_category_id: 3,
			service_description: 'ארט',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '050-123-4678',
			email: 't@gmail.com',
			comments: 'comments',
			attachments: []
		}, {
			supplier_name: 'צרי',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 4,
			supplier_job_title_id: 20,
			supplier_category_id: 3,
			service_description: 'ארט',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '050-864-2285',
			email: 'x@gmail.com',
			comments: 'comments',
			attachments: []
		}, {
			supplier_name: 'רן',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 4,
			supplier_job_title_id: 21,
			supplier_category_id: 3,
			service_description: 'ארט',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '050-952-5546',
			email: 'v@gmail.com',
			comments: 'comments',
			attachments: []
		}, {
			supplier_name: 'טל',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 4,
			supplier_job_title_id: 22,
			supplier_category_id: 3,
			service_description: 'ארט',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '050-123-4678',
			email: 'z@gmail.com',
			comments: 'comments',
			attachments: []
		}]*/

		let suppliers = [{
			supplier_name: '',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 1,
			supplier_job_title_id: 1,
			supplier_category_id: 1,
			service_description: '',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '',
			email: '',
			comments: '',
			attachments: []
		}, {
			supplier_name: '',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 1,
			supplier_job_title_id: 2,
			supplier_category_id: 1,
			service_description: '',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '',
			email: '',
			comments: '',
			attachments: []
		}, {
			supplier_name: '',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 1,
			supplier_job_title_id: 3,
			supplier_category_id: 1,
			service_description: '',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '',
			email: '',
			comments: '',
			attachments: []
		}, {
			supplier_name: '',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 2,
			supplier_job_title_id: 4,
			supplier_category_id: 2,
			service_description: '',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '',
			email: '',
			comments: '',
			attachments: []
		}, {
			supplier_name: '',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 2,
			supplier_job_title_id: 5,
			supplier_category_id: 2,
			service_description: '',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '',
			email: '',
			comments: '',
			attachments: []
		}, {
			supplier_name: '',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 2,
			supplier_job_title_id: 6,
			supplier_category_id: 2,
			service_description: '',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '',
			email: '',
			comments: '',
			attachments: []
		}, {
			supplier_name: '',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 2,
			supplier_job_title_id: 7,
			supplier_category_id: 2,
			service_description: '',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '',
			email: '',
			comments: '',
			attachments: []
		}, {
			supplier_name: '',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 2,
			supplier_job_title_id: 8,
			supplier_category_id: 2,
			service_description: '',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '',
			email: '',
			comments: '',
			attachments: []
		}, {
			supplier_name: '',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 2,
			supplier_job_title_id: 8,
			supplier_category_id: 2,
			service_description: '',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '',
			email: '',
			comments: '',
			attachments: []
		}, {
			supplier_name: '',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 3,
			supplier_job_title_id: 9,
			supplier_category_id: 2,
			service_description: '',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '',
			email: '',
			comments: '',
			attachments: []
		}, {
			supplier_name: '',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 3,
			supplier_job_title_id: 10,
			supplier_category_id: 2,
			service_description: '',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '',
			email: '',
			comments: '',
			attachments: []
		}, {
			supplier_name: '',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 3,
			supplier_job_title_id: 11,
			supplier_category_id: 3,
			service_description: '',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '',
			email: '',
			comments: '',
			attachments: []
		}, {
			supplier_name: '',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 3,
			supplier_job_title_id: 12,
			supplier_category_id: 3,
			service_description: '',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '',
			email: '',
			comments: '',
			attachments: []
		}, {
			supplier_name: '',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 3,
			supplier_job_title_id: 13,
			supplier_category_id: 3,
			service_description: '',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '',
			email: '',
			comments: '',
			attachments: []
		}, {
			supplier_name: '',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 3,
			supplier_job_title_id: 14,
			supplier_category_id: 3,
			service_description: '',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '',
			email: '',
			comments: '',
			attachments: []
		}, {
			supplier_name: '',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 4,
			supplier_job_title_id: 15,
			supplier_category_id: 3,
			service_description: '',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '',
			email: '',
			comments: '',
			attachments: []
		}, {
			supplier_name: '',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 4,
			supplier_job_title_id: 16,
			supplier_category_id: 3,
			service_description: '',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '',
			email: '',
			comments: '',
			attachments: []
		}, {
			supplier_name: '',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 4,
			supplier_job_title_id: 17,
			supplier_category_id: 3,
			service_description: '',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '',
			email: '',
			comments: '',
			attachments: []
		}, {
			supplier_name: '',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 4,
			supplier_job_title_id: 18,
			supplier_category_id: 3,
			service_description: '',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '',
			email: '',
			comments: '',
			attachments: []
		}, {
			supplier_name: '',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 4,
			supplier_job_title_id: 19,
			supplier_category_id: 3,
			service_description: '',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '',
			email: '',
			comments: '',
			attachments: []
		}, {
			supplier_name: '',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 4,
			supplier_job_title_id: 20,
			supplier_category_id: 3,
			service_description: '',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '',
			email: '',
			comments: '',
			attachments: []
		}, {
			supplier_name: '',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 4,
			supplier_job_title_id: 21,
			supplier_category_id: 3,
			service_description: '',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '',
			email: '',
			comments: '',
			attachments: []
		}, {
			supplier_name: '',
			company_id: 1,
			supplier_type_id: 1,
			supplier_department_id: 4,
			supplier_job_title_id: 22,
			supplier_category_id: 3,
			service_description: '',
			supplier_unit_type_id: 1,
			supplier_unit_cost: 100,
			contact_name: '',
			phone: '',
			email: '',
			comments: '',
			attachments: []
		}]
		
		let users = [{
			company_id: 1,
			country_id: 1,
			first_name: 'David',
			last_name: 'Ring',
			email: 'ring.dudu@gmail.com',
			password: '123456',
			permission_type_id: 1,
			key: apikey(10)
		}, {
			company_id: 1,
			country_id: 1,
			first_name: 'IMGN',
			last_name: '',
			email: 'imgntest@gmail.com',
			password: '123456',
			permission_type_id: 1,
			key: apikey(10)
		}, {
			company_id: 1,
			country_id: 1,
			first_name: 'Yaron',
			last_name: 'Kleiner',
			email: 'yklainer@gmail.com',
			password: '123456',
			permission_type_id: 1,
			key: apikey(10)
		}, {
			company_id: 1,
			country_id: 1,
			first_name: 'David',
			last_name: 'Ring',
			email: 'davidring8@gmail.com',
			password: '123456',
			permission_type_id: 1,
			key: apikey(10)
		}, {
			company_id: 2,
			country_id: 2,
			first_name: 'Michael',
			last_name: 'Rozenbaun',
			email: 'michael@transfax.co.il',
			password: '123456',
			permission_type_id: 1,
			key: apikey(10)
		}, {
			company_id: 2,
			country_id: 2,
			first_name: 'Jonathan',
			last_name: 'Rozenbaun',
			email: 'jr@transfax.co.il',
			password: '123456',
			permission_type_id: 1,
			key: apikey(10)
		}, {
			company_id: 2,
			country_id: 2,
			first_name: 'Yaron',
			last_name: 'Klainer',
			email: 'yaron@imgn.co',
			password: '123456',
			permission_type_id: 1,
			key: apikey(10)
		}]

		/*let task_category_list = [{
			user_id: 1,
			supplier_id: 1,
			project_id: 1,
			task_category: '1',
			task_category_name: 'Category1',
			color: utils.getColor()
		}, {
			user_id: 1,
			supplier_id: 1,
			project_id: 1,
			task_category: '2',
			task_category_name: 'Category2',
			color: utils.getColor()
		}, {
			user_id: 2,
			supplier_id: 2,
			project_id: 2,
			task_category: '1',
			task_category_name: 'Category1',
			color: utils.getColor()
		}, {
			user_id: 2,
			supplier_id: 2,
			project_id: 2,
			task_category: '2',
			task_category_name: 'Category2',
			color: utils.getColor()
		}];*/

		let budget_category_list = [{
			budget_category: 'Actors',
			color: utils.getColor()
		}, {
			budget_category: 'Production',
			color: utils.getColor()
		}, {
			budget_category: 'Technical',
			color: utils.getColor()
		}];

		let supplier_category_list = [{
			supplier_category: 'Actors',
			color: utils.getColor()
		}, {
			supplier_category: 'Production',
			color: utils.getColor()
		}, {
			supplier_category: 'Technical',
			color: utils.getColor()
		}];

		/*let tasks = [{
			task_name: 'task1',
			project_id: 1,
			task_category_id: 1,
			task_type_id: 1,
			task_status_id: 1,
			project_scene_id: 1,
			supplier_id: 1,
			character_id: null,
			price: 100,
			user_id: 1,
			comments: 'comments1',
			parent_task_id: 0,
			due_date: '2010-09-01',
			attachments: []
		}, {
			task_name: 'task2',
			project_id: 1,
			task_category_id: 1,
			task_type_id: 1,
			task_status_id: 1,
			project_scene_id: 1,
			supplier_id: 1,
			character_id: null,
			price: 100,
			user_id: 1,
			comments: 'comments2',
			parent_task_id: 0,
			due_date: '2010-09-01',
			attachments: []
		}, {
			task_name: 'task3',
			project_id: 1,
			task_category_id: 2,
			task_type_id: 1,
			task_status_id: 1,
			project_scene_id: 1,
			supplier_id: 1,
			character_id: null,
			price: 100,
			user_id: 1,
			comments: 'comments3',
			parent_task_id: 0,
			due_date: '2010-09-01',
			attachments: []
		}, {
			task_name: 'task4',
			project_id: 2,
			task_category_id: 2,
			task_type_id: 1,
			task_status_id: 1,
			project_scene_id: 1,
			supplier_id: 1,
			character_id: null,
			price: 100,
			user_id: 1,
			comments: 'comments3',
			parent_task_id: 0,
			due_date: '2010-09-01',
			attachments: []
		}, {
			task_name: 'task5',
			project_id: 2,
			task_category_id: 2,
			task_type_id: 1,
			task_status_id: 1,
			project_scene_id: 1,
			supplier_id: 1,
			character_id: null,
			price: 100,
			user_id: 2,
			comments: 'comments3',
			parent_task_id: 0,
			due_date: '2010-09-01',
			attachments: []
		}, {
			task_name: 'task6',
			project_id: 1,
			task_category_id: 2,
			task_type_id: 1,
			task_status_id: 1,
			project_scene_id: 1,
			supplier_id: 1,
			character_id: null,
			price: 100,
			user_id: 1,
			comments: 'comments3',
			parent_task_id: 2,
			due_date: '2010-09-01',
			attachments: []
		}, {
			task_name: 'task7',
			project_id: 1,
			task_category_id: 2,
			task_type_id: 1,
			task_status_id: 1,
			project_scene_id: 1,
			supplier_id: 1,
			character_id: null,
			price: 100,
			user_id: 1,
			comments: 'comments3',
			parent_task_id: 2,
			due_date: '2010-09-01',
			attachments: []
		}]*/

		/*let budgets = [{
			budget_name: 'budget1',
			project_id: 1,
			budget_category_id: 1,
			budget_type_id: 1,
			budget_status_id: 1,
			project_scene_id: 1,
			supplier_id: 1,
			supplier_job_title_id: 0,
			price: 100,
			comments: 'comments1',
			attachments: []
		}, {
			budget_name: 'budget2',
			project_id: 1,
			budget_category_id: 1,
			budget_type_id: 1,
			budget_status_id: 1,
			project_scene_id: 1,
			supplier_id: 1,
			supplier_job_title_id: 0,
			price: 100,
			comments: 'comments2',
			attachments: []
		}, {
			budget_name: 'budget3',
			project_id: 1,
			budget_category_id: 2,
			budget_type_id: 1,
			budget_status_id: 1,
			project_scene_id: 1,
			supplier_id: 1,
			supplier_job_title_id: 0,
			price: 100,
			comments: 'comments3',
			attachments: []
		}, {
			budget_name: 'budget4',
			project_id: 2,
			budget_category_id: 2,
			budget_type_id: 1,
			budget_status_id: 1,
			project_scene_id: 1,
			supplier_id: 1,
			supplier_job_title_id: 0,
			price: 100,
			comments: 'comments3',
			attachments: []
		}, {
			budget_name: 'budget5',
			project_id: 2,
			budget_category_id: 2,
			budget_type_id: 1,
			budget_status_id: 1,
			project_scene_id: 1,
			supplier_id: 1,
			supplier_job_title_id: 0,
			price: 100,
			comments: 'comments3',
			attachments: []
		}]*/

		try {
			await sequelize.sync({ force: true }).then(async () => {

				await State.bulkCreate(state_list, { validate: true }
					).then(() => {
						console.log('State created');
					}).catch((err) => {
						console.log('failed to create State');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});

				await Country.bulkCreate(country_list, { validate: true }
					).then(() => {
						console.log('Country created');
					}).catch((err) => {
						console.log('failed to create Country');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});

				/*await Props.bulkCreate(props_list, { validate: true }
					).then(() => {
						console.log('Props created');
					}).catch((err) => {
						console.log('failed to create Props');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});

				await Makeups.bulkCreate(makeups_list, { validate: true }
					).then(() => {
						console.log('Makeups created');
					}).catch((err) => {
						console.log('failed to create Makeups');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});

				await Clothes.bulkCreate(clothes_list, { validate: true }
					).then(() => {
						console.log('Clothes created');
					}).catch((err) => {
						console.log('failed to create Clothes');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});

				await Specials.bulkCreate(specials_list, { validate: true }
					).then(() => {
						console.log('Specials created');
					}).catch((err) => {
						console.log('failed to create Specials');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});
	
				await Others.bulkCreate(others_list, { validate: true }
					).then(() => {
						console.log('Others created');
					}).catch((err) => {
						console.log('failed to create Others');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});*/
	
				// await SceneLocation.bulkCreate(scene_location, { validate: true }
				// 	).then(() => {
				// 		console.log('SceneLocation created');
				// 	}).catch((err) => {
				// 		console.log('failed to create SceneLocation');
				// 		console.log(err);
				// 	}).finally(() => {
				// 		//sequelize.close();
				// 	});

				
				/*await SceneTimeBank.bulkCreate(scene_time_bank, { validate: true }
					).then(() => {
						console.log('SceneTimeBank created');
					}).catch((err) => {
						console.log('failed to create SceneTimeBank');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});

				await SceneLocationBank.bulkCreate(scene_location_bank, { validate: true }
					).then(() => {
						console.log('SceneLocationBank created');
					}).catch((err) => {
						console.log('failed to create SceneLocationBank');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});*/
	
				await SceneTimeDef.bulkCreate(scene_time_def, { validate: true }
					).then(() => {
						console.log('SceneTimeDef created');
					}).catch((err) => {
						console.log('failed to create SceneTimeDef');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});
			
				await SceneStatus.bulkCreate(scene_status_list, { validate: true }
					).then(() => {
						console.log('SceneStatus created');
					}).catch((err) => {
						console.log('failed to create SceneStatus');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});

				await ProjectStatus.bulkCreate(project_status_list, { validate: true }
					).then(() => {
						console.log('ProjectStatus created');
					}).catch((err) => {
						console.log('failed to create ProjectStatus');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});

				await TaskType.bulkCreate(task_type_list, { validate: true }
					).then(() => {
						console.log('TaskType created');
					}).catch((err) => {
						console.log('failed to create TaskType');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});
						
				await TaskStatus.bulkCreate(task_status_list, { validate: true }
					).then(() => {
						console.log('TaskStatus created');
					}).catch((err) => {
						console.log('failed to create TaskStatus');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});
						
				await SupplierDepartment.bulkCreate(supplier_department_list, { validate: true }
					).then(() => {
						console.log('SupplierDepartment created');
					}).catch((err) => {
						console.log('failed to create SupplierDepartment');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});

				await PermissionType.bulkCreate(permission_type_list, { validate: true }
					).then(() => {
						console.log('PermissionType created');
					}).catch((err) => {
						console.log('failed to create PermissionType');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});
	
				await PermissionStatus.bulkCreate(permission_status_list, { validate: true }
					).then(() => {
						console.log('PermissionStatus created');
					}).catch((err) => {
						console.log('failed to create PermissionStatus');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});


				await SupplierJobTitle.bulkCreate(supplier_job_title_list, { validate: true }
					).then(() => {
						console.log('SupplierJobTitle created');
					}).catch((err) => {
						console.log('failed to create SupplierJobTitle');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});
			
				await SupplierUnitType.bulkCreate(supplier_unit_type_list, { validate: true }
					).then(() => {
						console.log('SupplierUnitType created');
					}).catch((err) => {
						console.log('failed to create SupplierUnitType');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});

				await SupplierType.bulkCreate(supplier_type_list, { validate: true }
					).then(() => {
						console.log('SupplierType created');
					}).catch((err) => {
						console.log('failed to create SupplierType');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});
		
				await BudgetType.bulkCreate(budget_type_list, { validate: true }
					).then(() => {
						console.log('BudgetType created');
					}).catch((err) => {
						console.log('failed to create BudgetType');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});
			
				await BudgetStatus.bulkCreate(budget_status_list, { validate: true }
					).then(() => {
						console.log('BudgetStatus created');
					}).catch((err) => {
						console.log('failed to create BudgetStatus');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});
						
				await Company.bulkCreate(companies, { validate: true }
					).then(() => {
						console.log('Company created');
					}).catch((err) => {
						console.log('failed to create Company');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});

				await User.bulkCreate(users, { validate: true }
					).then(() => {
						console.log('User created');
					}).catch((err) => {
						console.log('failed to create User');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});
		
				/*await Project.bulkCreate(projects, { validate: true }
					).then(() => {
						console.log('Project created');
					}).catch((err) => {
						console.log('failed to create Project');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});*/

				await SupplierCategory.bulkCreate(supplier_category_list, { validate: true }
					).then(() => {
						console.log('SupplierCategory created');
					}).catch((err) => {
						console.log('failed to create SupplierCategory');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});
	
				await Supplier.bulkCreate(suppliers, { validate: true }
					).then(() => {
						console.log('Supplier created');
					}).catch((err) => {
						console.log('failed to create Supplier');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});

				/*await SupplierProject.bulkCreate(supplier_project, { validate: true }
					).then(() => {
						console.log('SupplierProject created');
					}).catch((err) => {
						console.log('failed to create SupplierProject');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});*/

				/*await ProjectScene.bulkCreate(project_scene_list, { validate: true }
					).then(() => {
						console.log('Project Scene created');
					}).catch((err) => {
						console.log('failed to create Project Scene');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});*/
		
				/*await TaskCategory.bulkCreate(task_category_list, { validate: true }
					).then(() => {
						console.log('TaskCategory created');
					}).catch((err) => {
						console.log('failed to create TaskCategory');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});*/

				await BudgetCategory.bulkCreate(budget_category_list, { validate: true }
					).then(() => {
						console.log('BudgetCategory created');
					}).catch((err) => {
						console.log('failed to create BudgetCategory');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});
	
				/*await TaskTitle.bulkCreate(task_title_list, { validate: true }
					).then(() => {
						console.log('TaskTitle created');
					}).catch((err) => {
						console.log('failed to create TaskTitle');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});

				await BudgetTitle.bulkCreate(budget_title_list, { validate: true }
					).then(() => {
						console.log('BudgetTitle created');
					}).catch((err) => {
						console.log('failed to create BudgetTitle');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});

				await SupplierTitle.bulkCreate(supplier_title_list, { validate: true }
					).then(() => {
						console.log('SupplierTitle created');
					}).catch((err) => {
						console.log('failed to create SupplierTitle');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});*/
		
				/*await Task.bulkCreate(tasks, { validate: true }
					).then(() => {
						console.log('Task created');
					}).catch((err) => {
						console.log('failed to create Task');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});*/

				/*await Budget.bulkCreate(budgets, { validate: true }
					).then(() => {
						console.log('Budget created');
					}).catch((err) => {
						console.log('failed to create Budget');
						console.log(err);
					}).finally(() => {
						//sequelize.close();
					});*/
			})
		} catch (err) {
			console.log('err:',err);
		}

	}

	try {
		const port = process.env.PORT || config.server_port;
		await new Promise((resolve, reject) =>
			require('http')
				.Server(app)
				.listen(port, () => {
					winston.info(`API listening on port ${port}!`);
					resolve();
				})
				.on('error', reject)
		);
		winston.info('server is running...');
	} catch (err) {
		console.log('err:',err);
	}
})();
