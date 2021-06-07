import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import validator from 'validator';
import * as bcrypt from 'bcrypt-nodejs';
import { v4 as uuidv4 } from 'uuid';
import sendEmail from '../utils/sendEmail.util';
import { compareHash } from '../utils/compareHash';
import mailer from '../utils/mailer'
import * as jwt from 'jsonwebtoken';
import AppError from '../utils/AppError';
import utils from '../utils/utils';
const httpStatus = require('http-status');
var config = require('../config/config');

const JWT_SECRET = 'yt-secret-';
const sequelize = require('../models');
const { User, Supplier, Project, Company, Task, TaskCategory, TaskType, TaskTitle, TaskStatus, Budget, BudgetCategory, BudgetTitle, BudgetType, BudgetStatus, UserNotification, PermissionType, PermissionStatus, SupplierJobTitle, UserPasswordCode, UserInviteCode } = sequelize.models;
const { Op } = require("sequelize");

var path = require('path');
var apikey = require("apikeygen").apikey;
var awsSDK = require('../utils/awsSDK')

const expTokenHours = 4;

const UserController = {
	
	register: async (req, res, next) => {
		try {

			let admin_user_id = parseInt(req.body.admin_user_id);
			let email = req.body.email;
			let password = req.body.password;
			let company_id = req.body.company_id;
			let company_name = req.body.company_name;
			let country_id = req.body.country_id;
			let first_name = req.body.first_name;
			let last_name = req.body.last_name;
			let permission_type_id = req.body.permission_type_id;
			let permission_status_id = req.body.permission_status_id;
			let supplier_job_title_id = req.body.supplier_job_title_id;
			let projects = req.body.projects;
			let attachments = req.body.attachments;
			let code = parseInt(req.body.code);

			console.log('Register:',email)

			let user = await User.findOne({ where: { email: email } });

			if (user) {
				console.log('User already exist.');
				return res.json({
					response: 1,
					err: "User already exist."
				})
			}

			let user_admin = null;
			if (admin_user_id && !isNaN(admin_user_id) && (admin_user_id > 0)) {
				user_admin = await User.findOne({ where: { id: admin_user_id } });
			}

			let company = null;
			if ((!admin_user_id || (admin_user_id && (admin_user_id <= 0))) &&
				company_name && 
				(company_name.length > 0) && 
				(!company_id || (company_id && (company_id <= 0)))) {
					
				company = await Company.create({company_name: company_name});
				if (company) {
					company = company.dataValues;
					company_id = company.id;
				}
			}

			if (admin_user_id > 0) {
				if (!user_admin) {
					return res.json({
						response: 1,
						err: "No admin user."
					})
				} else {
					if (user_admin) {
						company_id = user_admin.company_id;
					}
					if (user_admin && (user_admin.permission_type_id != 1)) {
						console.log('User have no permission.');
						return res.json({
							response: 1,
							err: "User have no permission."
						})
					}
				}
			}

			if (!company) {
				company = await Company.findOne({ where: { id: company_id } });
			}

			if (!company) {
				console.log('Company dont exist.');
				return res.json({
					response: 2,
					err: "Company dont exist."
				})
			}

			let user_invite_code = await UserInviteCode.findOne({ where: { email: email } });

			if (user_invite_code) {
				let user = await UserInviteCode.destroy({
					where: { email: email },
					force: true
				})

				if (code && (code > 0) && (code != user_invite_code.code)) {
					if (code && (code > 0)) {
						return res.json({
							response: 2,
							err: "User invitation invalid."
						})
					}
				}
			} else {
				if (code && (code > 0)) {
					return res.json({
						response: 2,
						err: "User invitation invalid."
					})
				}
			}

			const verify_email_token = uuidv4();

			let permission_type_list = await PermissionType.findAll({});
			let permission_status_list = await PermissionStatus.findAll({});
			let supplier_job_title_list = await SupplierJobTitle.findAll({});

			if (!permission_type_id) {
				permission_type_id = 1 // Admin
			}
			if (!permission_status_id) {
				permission_status_id = 1
			}
			let permission_type = '';
			for(let i = 0; i < permission_type_list.length; i++) {
				let type = permission_type_list[i].dataValues;
				if (type && type.permission_type && (type.id == permission_type_id)) {
					permission_type = type.permission_type
					permission_type_id = type.id;
				}
			}

			let permission_status = '';
			//let permission_status_id = 0;
			for(let i = 0; i < permission_status_list.length; i++) {
				let status = permission_status_list[i].dataValues;
				if (status && status.permission_status && (status.id == permission_status_id)) {
					permission_status = status.permission_status
					permission_status_id = status.id
				}
			}

			let supplier_job_title = '';
			//let supplier_job_title_id = 0;
			for(let i = 0; i < supplier_job_title_list.length; i++) {
				let job_title = supplier_job_title_list[i].dataValues;
				if (job_title && job_title.supplier_job_title && (job_title.id == supplier_job_title_id)) {
					supplier_job_title = job_title.supplier_job_title
					supplier_job_title_id = job_title.id
				}
			}

			let projects1 = [];
			if (projects) {
				projects1 = projects;
			}
			let attachments1 = [];
			if (attachments) {
				attachments1 = attachments;
			}

			var key = apikey(10);

			let user1 = {
				key: key,
				email: email,
				password: bcrypt.hashSync(password),
				//verify_email_token: verify_email_token,
				company_id: company_id,
				country_id: country_id,
				first_name: first_name,
				last_name: last_name,
				permission_type_id: permission_type_id,
				permission_type: permission_type,
				permission_status_id: permission_status_id,
				permission_status: permission_status,
				supplier_job_title_id: supplier_job_title_id,
				supplier_job_title: supplier_job_title,
				projects: projects1,
				attachments: attachments1
			}

			let user2 = {
				key: key,
				email: email,
				company_id: company_id,
				country_id: country_id,
				first_name: first_name,
				last_name: last_name,
				permission_type_id: permission_type_id,
				permission_type: permission_type,
				permission_status_id: permission_status_id,
				permission_status: permission_status,
				supplier_job_title_id: supplier_job_title_id,
				supplier_job_title: supplier_job_title,
				projects: projects1,
				attachments: attachments1
			}
			
			let new_user = await User.create(user1);
			if (new_user) {
				new_user = new_user.dataValues;
			}
				
			//console.log(`sendEmail to ${email}`);
			//let subject = 'Verify your email';

			let user_id = new_user.id;

			user2 = {...user2, id: user_id}

			let verify_email = false;
			if (verify_email) {
				let API_URL = 'http://localhost:3000/imgn/api/v1';
				let link = `${API_URL}/user/verifyEmail?verify_email_token=${verify_email_token}`;
				let subject = "Please confirm your Email account";
				let html = "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>";
				let text =  '';
				var body = `Dear IMGN customer,
		
						Please confirm your Email account.
		
						Sincerely,
						IMGN Team`;

				mailer.send_mail(email, subject, body, html, function (error, result) {
					return res.json({
						response: 0,
						err: "",
						token: jwtSign({ user_id, email, company_id, country_id, key }),
						user: user2
					})
				})		
			} else {
				return res.json({
					response: 0,
					err: "",
					token: jwtSign({ user_id, email, company_id, country_id, key }),
					user: user2
				})
			}

			/*await sendEmail(req, res, email, 'davidring8@gmail.com', subject, 'verify', verify_email_token, link, function (error, response) {
				return res.json({
					response: 0,
					err: "",
					token: jwtSign({ user_id, email, company_id, country_id, key }),
					user: user2
				})
			});*/

			/*mailer.send_mail(email, subject, body, html, function (error, result) {
				if (error) {
				  //return res.status(404).json(error)
				}
				return res.status(200).json({code: code})
			})*/

			//return done(null, false, { response: 1 });

			return;

			passport.authenticate('local-signup', function (err, user, info) {
				if (err) {
					//return next(err);
					return res.json({
						response: 1,
						err: err
					})
				}

				//res.json({ success: true });
				if (!user) {
					if (info !== undefined) {
						return res.json({
							response: 1,
							err: info.message 
						});
					}
				}

				req.logIn({ user }, function (err) {
					if (err) {
						//res.json(err);
						return res.json({
							response: 1,
							err: err
						});
					}

					return res.json({ user });
				});
			})(req, res, next);
		} catch (error) {
			//next(error);
			console.log('error:',error)
			return res.json({
				response: 3,
				err: error 
			});
		}
	},

	login: async (req, res, next) => {
		try {
			let email = req.body.email;
			let password = req.body.password;

			console.log('Login:',email)

			//let user = await User.findOne({ email: email });
			let user = await User.findOne({ where: { email: email } });
			
			if (!user) {
				//res.redirect(userCompany.company.url + '/wp-admin/admin.php?page=Imgn');
				//res.redirect(userCompany.company.url);
				console.log('User dont exist.');
				return res.json({
					response: 1,
					err: "User dont exist."
				})
			}

			/*let company = user.dataValues.company_id;

			if (!company) {
				console.log('Company dont exist.');
				return res.json({
					response: 2,
					err: "Company dont exist."
				})
			}*/

			let permission_type_list = await PermissionType.findAll({});
			let permission_status_list = await PermissionStatus.findAll({});
			let supplier_job_title_list = await SupplierJobTitle.findAll({});

			let permission_type = '';
			let permission_type_id = 0;
			for(let i = 0; i < permission_type_list.length; i++) {
				let type = permission_type_list[i].dataValues;
				if (type && type.permission_type && (type.id == user.dataValues.permission_type_id)) {
					permission_type = type.permission_type
					permission_type_id = type.id;
				}
			}

			let permission_status = '';
			let permission_status_id = 0;
			for(let i = 0; i < permission_status_list.length; i++) {
				let status = permission_status_list[i].dataValues;
				if (status && status.permission_status && (status.id == user.dataValues.permission_status_id)) {
					permission_status = status.permission_status
					permission_status_id = status.id
				}
			}

			let supplier_job_title = '';
			let supplier_job_title_id = 0;
			for(let i = 0; i < supplier_job_title_list.length; i++) {
				let job_title = supplier_job_title_list[i].dataValues;
				if (job_title && job_title.supplier_job_title && (job_title.id == user.dataValues.supplier_job_title_id)) {
					supplier_job_title = job_title.supplier_job_title
					supplier_job_title_id = job_title.id
				}
			}

			let user2 = {
				id: user.dataValues.id,
				email: user.dataValues.email,
				company_id: user.dataValues.company_id,
				country_id: user.dataValues.country_id,
				first_name: user.dataValues.first_name,
				last_name: user.dataValues.last_name,
				permission_type_id: permission_type_id,
				permission_type: permission_type,
				permission_status_id: permission_status_id,
				permission_status: permission_status,
				supplier_job_title_id: supplier_job_title_id,
				supplier_job_title: supplier_job_title,
				projects: user.dataValues.projects,
				attachments: user.dataValues.attachments
			}

			let user_id = user.dataValues.id;
			let user_email = user.dataValues.email;
			let company_id = user.dataValues.company_id;
			let country_id = user.dataValues.country_id;

			let isMatch = false;
			try {
				isMatch = await compareHash(password, user.dataValues.password);
			} catch (error) {
			}

			if ((password == user.dataValues.password) || isMatch) {

				var user_notifications = [] 

				let user_id = parseInt(user.dataValues.id);
				let user_email = user.dataValues.email;
				let key = user.dataValues.key;
	
				if (!user_id || isNaN(user_id) || (user_id <= 0)) {
					user_id = null;
				}
	
				if (!user_email || (user_email && (user_email.length == 0))) {
					user_email = null;
				}
	
				if (!user_id && !user_email) {
					return res.json({
						response: 2,
						err: "No user id or email"
					})
				}
	
				let user_notifications1 = [];
				if (user_id && (user_id > 0)) {
					user_notifications1 = await UserNotification.findAll({ where: { user_id: user_id } });
					
					if (user_notifications1 && (user_notifications1.length > 0)) {
	
						const response = await UserNotification.destroy({
							where: { user_id: user_id },
							force: true
						})
					}
	
				}
	
				let user_notifications2 = [];
				if (user_email && (user_email.length > 0)) {
					user_notifications2 = await UserNotification.findAll({ where: { user_email: user_email } });
					
					if (user_notifications2 && (user_notifications2.length > 0)) {
	
						const response = await UserNotification.destroy({
							where: { user_email: user_email },
							force: true
						})
					}
				}
				
				user_notifications1.forEach(user_notification => {
					user_notifications.push(user_notification);
				});
				
				user_notifications2.forEach(user_notification => {
					user_notifications.push(user_notification);
				});
	
				let notifications = [];
				for(let a = 0; a < user_notifications.length; a++) {
					let notification = user_notifications[a].dataValues;
					if (notification) {
						if (notification && notification.from_user_id && (notification.from_user_id > 0)) {
							let user = await User.findOne({where: { id: notification.from_user_id }})
							if (user) {
								user = user.dataValues;
								let first_name = '';
								if (user.first_name && (user.first_name.length > 0)) {
									first_name = user.first_name;
								}
								let last_name = '';
								if (user.last_name && (user.last_name.length > 0)) {
									last_name = user.last_name;
								}
								let name = ''
								if (first_name && last_name && (first_name.length > 0) && (last_name.length > 0)) {
									name = first_name + ' ' + last_name;
								} else {
									name = first_name + last_name;
								}
								if (name && (name.length > 0)) {
									notification = {...notification, from_user_name: name}
								} else {
									notification = {...notification, from_user_name: ''}
								}
							}
						}

						notifications.push(notification);
					}
				}

				return res.json({
					response: 0,
					err: '',
					token: jwtSign({ user_id, user_email, company_id, country_id, key }),
					user: user2,
					notifications: notifications
				})
			}
		} catch (error) {
			return res.json({
				response: 1,
				err: error
			})
		}
	},

	updateProfile: async (req, res, next) => {
		try {

			let user_id = parseInt(req.body.user_id);
			let admin_user_id = parseInt(req.body.admin_user_id);
			let email = req.body.email;
			//let password = req.body.password;
			let company_id = req.body.company_id;
			let country_id = req.body.country_id;
			let first_name = req.body.first_name;
			let last_name = req.body.last_name;
			let permission_type_id = req.body.permission_type_id;
			let permission_status_id = req.body.permission_status_id;
			let supplier_job_title_id = req.body.supplier_job_title_id;
			let projects = req.body.projects;
			let attachments = req.body.attachments;

			let user1 = null;
			if (email && (email.length > 0)) {
				user1 = await User.findOne({ where: { email: email } });
			}

			let user2 = null;
			if (user_id && !isNaN(user_id) && (user_id > 0)) {
				user2 = await User.findOne({ where: { id: user_id } });
			}

			let user_admin = null;
			if (admin_user_id && !isNaN(admin_user_id) && (admin_user_id > 0)) {
				user_admin = await User.findOne({ where: { id: admin_user_id } });
			}

			if ((admin_user_id > 0) && user_admin && (user_admin.permission_type_id >= 2) && (user_admin.permission_type_id <= 3)) {
				console.log('User have no permission.');
				return res.json({
					response: 1,
					err: "User have no permission."
				})
			}

			let user = null;
			if (user1) {
				user = user1.dataValues;
			} else {
				if (user2) {
					user = user2.dataValues;
				}
			}

			if (!user) {
				console.log('User not exist.');
				return res.json({
					response: 1,
					err: "User not exist."
				})
			}

			if (!company_id || (company_id && (company_id <= 0))) {
				company_id = user.company_id;
			}
			let company = await Company.findOne({ where: { id: company_id } });

			if (!company) {
				console.log('Company dont exist.');
				return res.json({
					response: 2,
					err: "Company dont exist."
				})
			}

			user_id = user.id;

			let params = {
			}
			if (email && (email.length > 0)) {
				params = {...params, email: email}
			}
			// if (password && (password.length > 0)) {
			// 	params = {...params, password: bcrypt.hashSync(password)}
			// }
			if (company_id && !isNaN(company_id) && (company_id > 0)) {
				params = {...params, company_id: company_id}
			}
			if (country_id && !isNaN(country_id) && (country_id > 0)) {
				params = {...params, country_id: country_id}
			}
			if (first_name && (first_name.length > 0)) {
				params = {...params, first_name: first_name}
			}
			if (last_name && (last_name.length > 0)) {
				params = {...params, last_name: last_name}
			}
			if (permission_type_id && !isNaN(permission_type_id) && (permission_type_id > 0)) {
				params = {...params, permission_type_id: permission_type_id}
			}
			if (permission_status_id && !isNaN(permission_status_id) && (permission_status_id > 0)) {
				params = {...params, permission_status_id: permission_status_id}
			}
			if (supplier_job_title_id && !isNaN(supplier_job_title_id) && (supplier_job_title_id > 0)) {
				params = {...params, supplier_job_title_id: supplier_job_title_id}
			}
			if (projects) {
				params = {...params, projects: projects}
			}
			if (attachments) {
				params = {...params, attachments: attachments}
			}

			var folder = 'user/'+user_id+'/'

			let is_add_file_to_s3 = false;

			async function addFileToS3(file_path) {
				return new Promise(async (resolve,reject)=>{

					console.log('Supplier File Upload:',file_path)
					var name = path.basename(file_path);
					var file_end = name.split('.')[1];
					var file_name = apikey(10)+ "."+file_end;
					awsSDK.upload_file_to_s3(file_path, folder, file_name, file_end, async function(err, result) {

						if (err) {
							console.log('err:', err);
							return res.json({
								response: 1,
								err: err
							})
						} else {

							var obj = {
								file_name: file_name,
								file_id: result.id,
								file_url: result.url
							}
							attachments.push(obj)

							is_add_file_to_s3 = true;

							resolve();					  
						}
					})
				})
			}

			const pormises = []
			let index = 0;
			while (req.files[index] && req.files[index].path && (req.files[index].path.length > 0)) {
				pormises.push(addFileToS3(req.files[index].path))
				index++;
			}
			await Promise.all(pormises)

			let permission_type_list = await PermissionType.findAll({});
			let permission_status_list = await PermissionStatus.findAll({});
			let supplier_job_title_list = await SupplierJobTitle.findAll({});

			if (!permission_type_id) {
				permission_type_id = 1 // Admin
			}
			if (!permission_status_id) {
				permission_status_id = 1
			}
			let permission_type = '';
			for(let i = 0; i < permission_type_list.length; i++) {
				let type = permission_type_list[i].dataValues;
				if (type && type.permission_type && (type.id == permission_type_id)) {
					permission_type = type.permission_type
					permission_type_id = type.id;
				}
			}

			let permission_status = '';
			//let permission_status_id = 0;
			for(let i = 0; i < permission_status_list.length; i++) {
				let status = permission_status_list[i].dataValues;
				if (status && status.permission_status && (status.id == permission_status_id)) {
					permission_status = status.permission_status
					permission_status_id = status.id
				}
			}

			let supplier_job_title = '';
			//let supplier_job_title_id = 0;
			for(let i = 0; i < supplier_job_title_list.length; i++) {
				let job_title = supplier_job_title_list[i].dataValues;
				if (job_title && job_title.supplier_job_title && (job_title.id == supplier_job_title_id)) {
					supplier_job_title = job_title.supplier_job_title
					supplier_job_title_id = job_title.id
				}
			}

			const response = await User.update(params, {where: { id: user_id }});
			user = await User.findOne({ where: { id: user_id } });

			if (user && user.password) {
				user.password = '';
			}

			return res.json({
				response: 0,
				err: '',
				user: user
			});
			
		} catch (error) {
			//next(error);
			console.log('error:',error)
			return res.json({
				response: 3,
				err: error 
			});
		}
	},

	updateProfileProject: async (req, res, next) => {
		try {

			let user_id = parseInt(req.body.user_id);
			let admin_user_id = parseInt(req.body.admin_user_id);
			let projects = req.body.projects;

			let user = null;
			if (user_id && !isNaN(user_id) && (user_id > 0)) {
				user = await User.findOne({ where: { id: user_id } });
			}

			let user_admin = null;
			if (admin_user_id && !isNaN(admin_user_id) && (admin_user_id > 0)) {
				user_admin = await User.findOne({ where: { id: admin_user_id } });
			}

			if ((admin_user_id > 0) && user_admin && (user_admin.permission_type_id >= 2) && (user_admin.permission_type_id <= 3)) {
				console.log('User have no permission.');
				return res.json({
					response: 1,
					err: "User have no permission."
				})
			}

			if (!user) {
				console.log('User not exist.');
				return res.json({
					response: 1,
					err: "User not exist."
				})
			}

			if (!company_id || (company_id && (company_id <= 0))) {
				company_id = user.company_id;
			}
			let company = await Company.findOne({ where: { id: company_id } });

			if (!company) {
				console.log('Company dont exist.');
				return res.json({
					response: 2,
					err: "Company dont exist."
				})
			}

			user_id = user.id;
			let projects_list = user.projects;

			if (!projects_list) {
				projects_list = []
			}
			if (projects && (projects.length > 0)) {
				for(let i = 0; i < projects.length; i++) {
					let project = projects[i];
					if (project) {
						projects_list.push(project);
					}
				}
			}

			let params = {
			}
			if (projects_list && (projects_list.length > 0)) {
				params = {...params, projects: projects_list}
				const response = await User.update(params, {where: { id: user_id }});
				user = await User.findOne({ where: { id: user_id } });
			}

			if (user && user.password) {
				user.password = '';
			}

			return res.json({
				response: 0,
				err: '',
				user: user
			});
			
		} catch (error) {
			//next(error);
			console.log('error:',error)
			return res.json({
				response: 3,
				err: error 
			});
		}
	},

	verifyEmail: async (req, res, next) => {
		try {
			let verify_email_token = req.body.verify_email_token;

			if (!verify_email_token) {
				throw new Error('Invalid token 1');
			}

			let user = await User.findOne({ where: { verify_email_token } });

			if (!user) {
				//res.redirect(userCompany.company.url + '/wp-admin/admin.php?page=Imgn');
				//res.redirect(userCompany.company.url);
				console.log('Invalid token 2');
				return res.json({
					response: 1,
					err: "No User"
				})
			}

			await user.update({ verify_email_token: null });

			/*const userCompany = await UserCompany.findOne({
				where: {
					user_id: user.id
				},
				include: [
					{
						association: 'company',
						attributes: ['url'],
						model: Company,
						required: false
					}
				]
			});*/

			//res.redirect(userCompany.Company.url + '/wp-admin/admin.php?page=Imgn&verifiedEmail');
			//res.redirect(userCompany.Company.url);
			return res.json({
				response: 0,
				err: ""
			})
		} catch (error) {
			console.log(error);
			//res.redirect('Https://imgn.co');
			return res.json({
				response: 1,
				err: error
			})
			//next(error);
		}
	},

	verify: async (req, res, next) => {
		try {
			if((req.protocol+"://"+req.get('host'))==("http://"+host))
			{
				console.log("Domain is matched. Information is from Authentic email");
				if(req.query.id==rand)
				{
					console.log("email is verified");
					return res.end("<h1>Email "+mailOptions.to+" is been Successfully verified");
				}
				else
				{
					console.log("email is not verified");
					return res.end("<h1>Bad Request</h1>");
				}
			}
			else
			{
				return res.end("<h1>Request is from unknown source");
			}

			return res.json({
				response: 0,
				err: ""
			})
		} catch (error) {
			return res.json({
				response: 1,
				err: error
			})
		}
	},

	retrievePassword: async (req, res, next) => {

		var email = req.body.email;
		if (email) {
		  email = email.toLowerCase();
		} else {
		  email = ''
		}
		//var user_email = req.body.user_email;
		//var subject = req.body.subject;
		//var body = req.body.body;
	  
		console.log('retrieve-password:',email)
	  
		//if (email && (email.length > 0) && user_email && (user_email.length > 0) && (email == user_email)) {
		if (!email || (email.length <= 2)) {
		  	console.log('email not valid:',email)
		  	return res.json({
				response: 1,
				err: "No email"
			})
		}

		var num = utils.getRandomInt(900000)+100000;
		var code = String(num);

		let user = await UserPasswordCode.findOne({ where: { email: email } });
		if (user) {
			const response = await UserPasswordCode.update({code: code}, {where: { email: email }});
		} else {
			const response = await UserPasswordCode.create({code: code, email: email});
		}

		{
			var site_name = 'IMGN';
			var logo_url = 'https://static.wixstatic.com/media/4e15f0_2f4b238c02fc44e9914c0a571b3eb21f~mv2.png/v1/fill/w_181,h_38,al_c,q_80,usm_0.66_1.00_0.01/4e15f0_2f4b238c02fc44e9914c0a571b3eb21f~mv2.webp';
			var imgn_url = 'https://www.imgn.ai';
			var imgn_url1 = 'http://www.imgn.ai';
			var subject = `Retrieve your password on ${site_name}`
			var html = `
			<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
			<html xmlns="http://www.w3.org/1999/xhtml">
			<head>
				<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
				<title>Password Security Code</title>
				<style>
					body {
						background-color: #FFFFFF; padding: 0; margin: 0;
					}
				</style>
			</head>
			<body style="background-color: #FFFFFF; padding: 0; margin: 0;">
			<table border="0" cellpadding="0" cellspacing="10" height="100%" bgcolor="#FFFFFF" width="100%" style="max-width: 650px;" id="bodyTable">
				<tr>
					<td align="center" valign="top">
						<table border="0" cellpadding="0" cellspacing="0" width="100%" id="emailContainer" style="font-family:Arial; color: #333333;">
							<!-- Logo -->
							<!--<tr>
								<td align="left" valign="top" colspan="2" style="border-bottom: 1px solid #CCCCCC; padding-bottom: 10px;">
									<img alt="${imgn_url}" border="0" src="${logo_url}/assets/images/common/demo/logo.png" title="${site_name}" class="sitelogo" width="60%" style="max-width:250px;" />
								</td>
							</tr>-->
							<!-- Title -->
							<tr>
								<td align="left" valign="top" colspan="2" style="border-bottom: 1px solid #CCCCCC; padding: 20px 0 10px 0;">
									<span style="font-size: 18px; font-weight: normal;">PASSWORD SECURITY CODE</span>
								</td>
							</tr>
							<!-- Messages -->
							<tr>
								<td align="left" valign="top" colspan="2" style="padding-top: 10px;">
									<span style="font-size: 12px; line-height: 1.5; color: #333333;">
										Dear IMGN customer
										We have sent you this email in response to your request to set a new password on ${site_name}.
										In order to complete the process, please insert the following security code to the application.
										<br/><br/>
										Security Code: ${code}
										<br/><br/>
										We recommend that you keep your password secure and not share it with anyone.
										<br/><br/>
										${site_name} Customer Service
									</span>
								</td>
							</tr>
						</table>
					</td>
				</tr>
			</table>
			</body>
			</html>
			`
			var body = `Dear IMGN customer,
	
					At your request to set a new password, IMGN send you a security code.
					Your code is: ${code}
	
					Sincerely,
					IMGN Team`;
		
			mailer.send_mail(email, subject, body, html, function (error, result) {
			if (error) {
				//return res.status(404).json(error)
			}
			//return res.status(200).json(result)
			//var image_html = `<p align="center"><img src="" width="400" /></p>`
			/*res.writeHead(200, { 'Content-Type': 'text/html' });
			res.write(body);
			res.end();*/
	
			//return res.status(200).json('Send Security Code')
			return res.status(200).json({code: code})
			})
		}	  
	},
	
	confirmSecurityCode: async (req, res, next) => {
		var email = req.body.email;
		if (email) {
		  email = email.toLowerCase();
		} else {
		  email = ''
		}
		var code = req.body.code;

		if (!email || !code || (email.length <= 2)) {
			console.log('email not valid:',email)
			return res.json({
				response: 1,
				err: "No email"
		  	})
	 	}
	
		let user = await UserPasswordCode.findOne({ where: { email: email } });
		if (user) {
			if (user.code == code) {
				return res.json({
					response: 0,
					err: "",
					code: user
				})
			} else {
				return res.json({
					response: 1,
					err: "Wrong code",
					code: user
				})
			}
		} else {
			return res.json({
				response: 1,
				err: "Client is not at password-update mode",
				code: user
			})
		}
	},
	
	updatePassword: async (req, res, next) => {
		var email = req.body.email;
		if (email) {
		  email = email.toLowerCase();
		} else {
		  email = ''
		}
		var code = req.body.code;
		var password = req.body.password;

		if (!email || !code || !password || (password.length <= 0) || (email.length <= 2)) {
			console.log('email not valid:',email)
			return res.json({
				response: 1,
				err: "No email"
		  	})
	 	}

		let user = await UserPasswordCode.findOne({ where: { email: email } });

		if (user) {
			if (user.code == code) {
				let user = await UserPasswordCode.destroy({
					where: { email: email },
					force: true
				})

				let password_enc = bcrypt.hashSync(password);

				let new_user = await User.update({password: password_enc}, {where: { email: email }});
				new_user = await User.findOne({ where: { email: email } });

				if (new_user) {
					new_user = new_user.dataValues;
				}
				if (new_user && new_user.password) {
					new_user.password = '';
				}

				return res.json({
					response: 0,
					err: "",
					user: new_user
				})
			} else {
				return res.json({
					response: 1,
					err: "Password code not found"
				})
			}
		} else {
			return res.json({
				response: 1,
				err: "Client is not at password-update mode"
			})
		}
	},
	
	changePassword: async (req, res, next) => {
	  
		const { errors, isValid } = validateChangePassword(req.body);
		
		if(!isValid) {
			return res.status(400).json(errors);
		}
	  
		var email = req.body.email;
		if (email) {
		  email = email.toLowerCase();
		} else {
		  email = ''
		}
		var old_password = req.body.old_password;
		var new_password = req.body.new_password;
	  
		let user = await User.findOne({ where: { email: email } });

		if (!user) {
			console.log('User not found:',email)
			return res.json({
				response: 1,
				err: "User not found"
		  	})
	 	}


		 let isMatch = false;
		 try {
			 isMatch = await compareHash(old_password, user.dataValues.password);
		 } catch (error) {
		 }

		 if ((password == user.dataValues.password) || isMatch) {

			let user = await UserPasswordCode.destroy({
				where: { email: email },
				force: true
			})

			let password_enc = bcrypt.hashSync(new_password);

			let new_user = await User.update({password: password_enc}, {where: { email: email }});
			if (new_user) {
				new_user = new_user.dataValues;
			}
		} else {
			return res.json({
				response: 1,
				err: "Password code not found",
				code: user
			})
		}
	},
	  
	/*forgotPassword: async (req, res, next) => {
		try {
			let verify_email_token = req.body.verify_email_token;

			if (!verify_email_token) {
				throw new Error('Invalid token 1');
			}

			let user = await User.findOne({ where: { verify_email_token } });

			if (!user) {
				//res.redirect(userCompany.company.url + '/wp-admin/admin.php?page=Imgn');
				//res.redirect(userCompany.company.url);
				console.log('Invalid token 2');
				return res.json({
					response: 1,
					err: "No User"
				})
			}

			await user.update({ verify_email_token: null });

			//res.redirect(userCompany.Company.url + '/wp-admin/admin.php?page=Imgn&verifiedEmail');
			//res.redirect(userCompany.Company.url);
			return res.json({
				response: 0,
				err: ""
			})
		} catch (error) {
			console.log(error);
			//res.redirect('Https://imgn.co');
			return res.json({
				response: 1,
				err: error
			})
			//next(error);
		}
	},*/

	projectAdd: async (req, res, next) => {
		var admin_user_id = parseInt(req.body.admin_user_id);
		var user_id = parseInt(req.body.user_id);
		var project_id = parseInt(req.body.project_id);

		if (isNaN(project_id) || (project_id <= 0)) {
			project_id = null;
			return res.json({
				response: 2,
				err: "No project id"
			})
		}

		let project = null;
		if (project_id  > 0) {
			project = await Project.findOne({where: { id: project_id }});
		}

		if (!project) {
			return res.json({
				response: 2,
				err: 'No project found'
			})
		}
		
		let user_admin = null;
		if (admin_user_id && !isNaN(admin_user_id) && (admin_user_id > 0)) {
			user_admin = await User.findOne({ where: { id: admin_user_id } });
		}

		if ((admin_user_id > 0) && user_admin && (user_admin.permission_type_id >= 2) && (user_admin.permission_type_id <= 3)) {
			console.log('User have no permission.');
			return res.json({
				response: 1,
				err: "User have no permission."
			})
		}

		let user = null;
		if (user_id && !isNaN(user_id) && (user_id > 0)) {
			user = await User.findOne({ where: { id: user_id } });
			if (user && user.dataValues) {
				user = user.dataValues;
			}
		}

		if (user) {
			let found = false;
			if (user.projects && (user.projects.length > 0)) {
				for(let a = 0; a < user.projects.length; a++) {
					let id = user.projects[a];
					if (id && (id > 0) && (id == project_id)) {
						found = true;
					}
				}
				if (!found) {
					user.projects.push(project_id)
				}
			} else {
				user.projects = [project_id]
			}
			if (!found) {
				const response = await User.update({projects: projects}, {where: { id: user.id }});
			}
		}

		return res.json({
			response: 0,
			err: ''
		})
	},

	projectRemove: async (req, res, next) => {
		var admin_user_id = parseInt(req.body.admin_user_id);
		var user_id = parseInt(req.body.user_id);
		var project_id = parseInt(req.body.project_id);

		if (isNaN(project_id) || (project_id <= 0)) {
			project_id = null;
			return res.json({
				response: 2,
				err: "No project id"
			})
		}

		let project = null;
		if (project_id  > 0) {
			project = await Project.findOne({where: { id: project_id }});
		}

		if (!project) {
			return res.json({
				response: 2,
				err: 'No project found'
			})
		}
		
		let user_admin = null;
		if (admin_user_id && !isNaN(admin_user_id) && (admin_user_id > 0)) {
			user_admin = await User.findOne({ where: { id: admin_user_id } });
		}

		if ((admin_user_id > 0) && user_admin && (user_admin.permission_type_id >= 2) && (user_admin.permission_type_id <= 3)) {
			console.log('User have no permission.');
			return res.json({
				response: 1,
				err: "User have no permission."
			})
		}

		let user = null;
		if (user_id && !isNaN(user_id) && (user_id > 0)) {
			user = await User.findOne({ where: { id: user_id } });
			if (user && user.dataValues) {
				user = user.dataValues;
			}
		}

		if (user) {
			let found = false;
			if (user.projects && (user.projects.length > 0)) {
				for(let a = 0; ((a < user.projects.length) && !found); a++) {
					let id = user.projects[a];
					if (id && (id > 0) && (id == project_id)) {
						found = true;
						let projects_arr = user.projects.splice(a,1);
					}
				}
			}
			if (found) {
				const response = await User.update({projects: projects}, {where: { id: user.id }});
			}
		}

		return res.json({
			response: 0,
			err: ''
		})
	},

	projectNameEdit: async (req, res, next) => {
		
		
			let project_name = req.body.project_name;
			let project_id = parseInt(req.body.project_id);
			
			let result = await Project.update({project_name:project_name}, {where: { id: project_id}});
			if (result) {
				let project = await Project.findOne({where: {id: project_id}})
				if (project)
					return res.json({
						response: 0,
						err: "",
						project: project
					})
			}
			else{
				return res.json({
					response: 1,
					err: "No item",
					
				})
			}
			

		
	},

	inviteUser: async (req, res, next) => {

		var user_id = parseInt(req.body.user_id);
		var project_id = parseInt(req.body.project_id);
		var email = req.body.email;

		if (isNaN(project_id) || (project_id <= 0)) {
			project_id = null;
			return res.json({
				response: 2,
				err: "No project id"
			})
		}

		let project = null;
		if (project_id  > 0) {
			project = await Project.findOne({where: { id: project_id }});
		}

		if (!project) {
			return res.json({
				response: 2,
				err: 'No project found'
			})
		}

		//var name = req.body.name;
		if (email) {
			email = email.toLowerCase();
		} else {
			email = ''
		}

		if (!user_id || isNaN(user_id) || (user_id <= 0)) {
			user_id = null;
		}

		//var user_email = req.body.user_email;
		//var subject = req.body.subject;
		//var body = req.body.body;
		
		console.log('retrieve-password:',email)
		
		//if (email && (email.length > 0) && user_email && (user_email.length > 0) && (email == user_email)) {
		if (!user_id) {
			console.log('No user id:',email)
			return res.json({
				response: 1,
				err: "No user id"
			})
		}

		if (!email || (email.length <= 2)) {
				console.log('email not valid:',email)
				return res.json({
				response: 1,
				err: "No email"
			})
		}

		let user = await User.findOne({where: { id: user_id }})
		if (user) {
			user = user.dataValues;
			let company_id = user.company_id;
			let company_name = user.company_name;
			let user_name = user.first_name + ' ' + user.last_name;
			var num = utils.getRandomInt(900000)+100000;
			var code = String(num);

			let user1 = await UserInviteCode.findOne({ where: { email: email } });
			if (user1) {
				const response = await UserInviteCode.update({code: code}, {where: { email: email }});
			} else {
				const response = await UserInviteCode.create({code: code, email: email});
			}

			let global = `https://api.imgn.co/register/${company_id}/${email}/${code}/${user_id}/${project_id}`
			let local = `http://localhost:8080/register/${company_id}/${email}/${code}/${user_id}/${project_id}`

			{
				var site_name = 'IMGN';
				var logo_url = 'https://static.wixstatic.com/media/4e15f0_2f4b238c02fc44e9914c0a571b3eb21f~mv2.png/v1/fill/w_181,h_38,al_c,q_80,usm_0.66_1.00_0.01/4e15f0_2f4b238c02fc44e9914c0a571b3eb21f~mv2.webp';
				var imgn_url = 'https://www.imgn.ai';
				var imgn_url1 = 'http://www.imgn.ai';
				var subject = `Invitation to ${site_name}`
				var html = `
				<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
				<html xmlns="http://www.w3.org/1999/xhtml">
				<head>
					<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
					<title>Password Security Code</title>
					<style>
						body {
							background-color: #FFFFFF; padding: 0; margin: 0;
						}
					</style>
				</head>
				<body style="background-color: #FFFFFF; padding: 0; margin: 0;">
				<table border="0" cellpadding="0" cellspacing="10" height="100%" bgcolor="#FFFFFF" width="100%" style="max-width: 650px;" id="bodyTable">
					<tr>
						<td align="center" valign="top">
							<table border="0" cellpadding="0" cellspacing="0" width="100%" id="emailContainer" style="font-family:Arial; color: #333333;">
								<!-- Logo -->
								<!--<tr>
									<td align="left" valign="top" colspan="2" style="border-bottom: 1px solid #CCCCCC; padding-bottom: 10px;">
										<img alt="${imgn_url}" border="0" src="${logo_url}/assets/images/common/demo/logo.png" title="${site_name}" class="sitelogo" width="60%" style="max-width:250px;" />
									</td>
								</tr>-->
								<!-- Title -->
								<tr>
									<td align="left" valign="top" colspan="2" style="border-bottom: 1px solid #CCCCCC; padding: 20px 0 10px 0;">
										<span style="font-size: 18px; font-weight: normal;">PASSWORD SECURITY CODE</span>
									</td>
								</tr>
								<!-- Messages -->
								<tr>
									<td align="left" valign="top" colspan="2" style="padding-top: 10px;">
										<span style="font-size: 12px; line-height: 1.5; color: #333333;">
											Dear ${site_name} customer
											<br/>
											<br/>
											${user_name} has invited you to join ${company_name} production.
											<!--To register and join, please press on the <a href="https://api.imgn.co/imgn/api/v1/user/acceptInvitation/${company_id}/${email}/${code}/${user_id}">Invitation Link.</a>-->
											<!--To register please copy the following security code to the registration form.
											Your code is: ${code}-->
											<br/>
											Globl: To register and join, please press on the <a href="${global}">Invitation Link.</a>
											<br/>
											Local: To register and join, please press on the <a href="${local}">Invitation Link.</a>
											<br/>
											<br/>
											Welcome:)
											<br/><br/>
											${site_name} Customer Service
										</span>
									</td>
								</tr>
							</table>
						</td>
					</tr>
				</table>
				</body>
				</html>
				`
				var body = `Dear IMGN customer,
		
						At your request to set a new password, IMGN send you a security code.
						Your code is: ${code}
		
						Sincerely,
						IMGN Team`;
			
				mailer.send_mail(email, subject, body, html, function (error, result) {
					if (error) {
						//return res.status(404).json(error)
					}
					//return res.status(200).json(result)
					//var image_html = `<p align="center"><img src="" width="400" /></p>`
					/*res.writeHead(200, { 'Content-Type': 'text/html' });
					res.write(body);
					res.end();*/
			
					//return res.status(200).json('Send Security Code')
					return res.json({
						response: 0,
						err: ""
					})
		
					/*return res.status(200).json({
						code: code,
						global: global,
						local: local
					})*/
				})
			}
		}
	},
	
	acceptInvitation: async (req, res, next) => {
		let company_id = parseInt(req.params.company_id);
		let email = req.params.email;
		let code = parseInt(req.params.code);

		// Verify user code and redirect user to registration form
	},

	getAllCompanyUsers: async (req, res, next) => {
		try {
			let company_id = parseInt(req.params.company_id);

			if (isNaN(company_id) || (company_id <= 0)) {
				company_id = null;
				return res.json({
					response: 2,
					err: "No company id"
				})
			}

			let users = await User.findAll({ where: { company_id: company_id } });

			return res.json(users)
		} catch (error) {
			return res.json({
				response: 1,
				err: error
			})
		}
	},

	getUserName:async (req, res, next) => {
		try {
			let user_name = req.params.user_name;
			console.log('getUserName:',user_name)

			if (!user_name) {
				user_name = null;
				return res.json({
					response: 2,
					err: "No user name"
				})
			}

			let users = await User.findAll({
				where: {
					[Op.or]: [{first_name: user_name}, {last_name: user_name}]
				}
			});
			// SELECT * FROM post WHERE first_name = user_name OR last_name = user_name;
			
			return res.json(users)

		} catch (error) {
			console.log('error:',error)
			return res.json({
				response: 1,
				err: error
			})
		}
	},

	fetchUserNotification:async (req, res, next) => {

		var user_notifications = [] 
		try {
			let user_id = parseInt(req.body.user_id);
			let user_email = req.body.user_email;

			if (!user_id || isNaN(user_id) || (user_id <= 0)) {
				user_id = null;
			}

			if (!user_email || (user_email && (user_email.length == 0))) {
				user_email = null;
			}

			if (!user_id && !user_email) {
				return res.json({
					response: 2,
					err: "No user id or email"
				})
			}

			let user_notifications1 = [];
			if (user_id && (user_id > 0)) {
				user_notifications1 = await UserNotification.findAll({ where: { user_id: user_id } });
				
				if (user_notifications1 && (user_notifications1.length > 0)) {

					const response = await UserNotification.destroy({
						where: { user_id: user_id },
						force: true
					})
				}

			}

			let user_notifications2 = [];
			if (user_email && (user_email.length > 0)) {
				user_notifications2 = await UserNotification.findAll({ where: { user_email: user_email } });
				
				if (user_notifications2 && (user_notifications2.length > 0)) {

					const response = await UserNotification.destroy({
						where: { user_email: user_email },
						force: true
					})
				}
			}
			
			user_notifications1.forEach(user_notification => {
				user_notifications.push(user_notification);
			}); 
			
			user_notifications2.forEach(user_notification => {
				user_notifications.push(user_notification);
			}); 

			let notifications = [];
			for(let a = 0; a < user_notifications.length; a++) {
				let notification = user_notifications[a].dataValues;
				if (notification) {
					if (notification && notification.from_user_id && (notification.from_user_id > 0)) {
						let user = await User.findOne({where: { id: notification.from_user_id }})
						if (user) {
							user = user.dataValues;
							let first_name = '';
							if (user.first_name && (user.first_name.length > 0)) {
								first_name = user.first_name;
							}
							let last_name = '';
							if (user.last_name && (user.last_name.length > 0)) {
								last_name = user.last_name;
							}
							let name = ''
							if (first_name && last_name && (first_name.length > 0) && (last_name.length > 0)) {
								name = first_name + ' ' + last_name;
							} else {
								name = first_name + last_name;
							}
							if (name && (name.length > 0)) {
								notification = {...notification, from_user_name: name}
							} else {
								notification = {...notification, from_user_name: ''}
							}
						}
					}
					notifications.push(notification);
				}
			}

			return res.json(notifications)

		} catch (error) {
			return res.json(user_notifications)
		}
	},

	addUserNotification: async (req, res, next) => {
		try {
			let from_user_id = parseInt(req.body.from_user_id);
			let user_id = parseInt(req.body.user_id);
			let task_id = parseInt(req.body.task_id);
			let notification = req.body.notification;

			if (!from_user_id || isNaN(from_user_id) || (from_user_id <= 0)) {
				from_user_id = 0;
				/*return res.json({
					response: 2,
					err: "No user id"
				})*/
			}

			if (!user_id || isNaN(user_id) || (user_id <= 0)) {
				user_id = 0;
			}

			let user_notification = await UserNotification.create({
				from_user_id: from_user_id,
				user_id: user_id,
				task_id: task_id,
				notification: notification,
			});
			if (user_notification) {
				user_notification = user_notification.dataValues;
			}

			return res.json({
				response: 0,
				err: '',
				user_notification: user_notification
			})
		} catch (error) {
			console.log('error:',error)
			return res.json({
				response: 1,
				err: error
			})
		}
	},

	addUserNotifications: async (req, res, next) => {
		try {
			let notifications = req.body;

			for (let index = 0; index < notifications.length; index++) {
				let notification = notifications[index];

				if (notification) {
					let from_user_id = parseInt(notification.from_user_id);
					let user_id = parseInt(notification.user_id);
					let task_id = parseInt(notification.task_id);
					let notification = notification.notification;

					if (!from_user_id || isNaN(from_user_id) || (from_user_id <= 0)) {
						from_user_id = 0;
						/*return res.json({
							response: 2,
							err: "No user id"
						})*/
					}

					if (!user_id || isNaN(user_id) || (user_id <= 0)) {
						user_id = 0;
					}

					let user = await UserNotification.create({
						from_user_id: from_user_id,
						user_id: user_id,
						task_id: task_id,
						notification: notification,
					});
				}
			}

			return res.json({
				response: 0,
				err: ''
			})
	
		} catch (error) {
			console.log('error:',error)
			return res.json({
				response: 1,
				err: error
			})
		}
	},

	deleteUserNotification: async (req, res, next) => {
		try {
			let user_id = parseInt(req.body.user_id);

			if (isNaN(user_id) || (user_id <= 0)) {
				user_id = null;
				return res.json({
					response: 2,
					err: "No user id"
				})
			}

			const response = await UserNotification.destroy({
				where: { user_id: user_id },
				force: true
			})

			return res.json({
				response: 0,
				err: ''
			})
	
		} catch (error) {
			return res.json({
				response: 1,
				err: error
			})
		}
	},

	addUserSupplierNotification: async (req, res, next) => {
		try {
			let from_user_id = parseInt(req.body.from_user_id);
			let supplier_id = parseInt(req.body.supplier_id);
			let task_id = parseInt(req.body.task_id);
			let notification = req.body.notification;

			if (!from_user_id || isNaN(from_user_id) || (from_user_id <= 0)) {
				from_user_id = 0;
				/*return res.json({
					response: 2,
					err: "No user id"
				})*/
			}

			if (!supplier_id || isNaN(supplier_id) || (supplier_id <= 0)) {
				supplier_id = 0;
			}

			let supplier = null;
			if (supplier_id && (supplier_id > 0)) {
				supplier = await Supplier.findOne({where: { id: supplier_id }})
				if (supplier) {
					supplier = supplier.dataValues;
				}
			}

			if (supplier && supplier.email && (supplier.email.length > 2)) {

				let user = await User.findOne({where: { email: supplier.email }})
				if (user) {
					user = user.dataValues;
				}

				if (user && user.id && (user.id > 0)) {
					let user_notification = await UserNotification.create({
						from_user_id: from_user_id,
						user_id: user.id,
						task_id: task_id,
						notification: notification,
					});
					if (user_notification) {
						user_notification = user_notification.dataValues;
					}
		
					return res.json({
						response: 0,
						err: '',
						user_notification: user_notification
					})
				}
			}

			return res.json({
				response: 2,
				err: 'Notification failed'
			})
		} catch (error) {
			console.log('error:',error)
			return res.json({
				response: 1,
				err: error
			})
		}
	},

	getAllUserFiles: async (req, res, next) => {
		try {
			let user_id = parseInt(req.params.user_id);

			if (isNaN(user_id) || (user_id <= 0)) {
				user_id = null;
				return res.json({
					response: 2,
					err: "No user id"
				})
			}

			let user = null;
			if (user_id  > 0) {
				user = await User.findOne({where: { id: user_id }});
			}

			if (!user) {
				return res.json({
					response: 2,
					err: 'No user found'
				})
			}

			return res.json(user.attachments)						

		} catch (error) {
			return res.json({
				response: 1,
				err: error
			})
		}
	},

	fileAdd: async (req, res, next) => {
		try {
			let user_id = parseInt(req.body.user_id);
			let text = req.body.text;

			if (!text) {
				text = '';
			}

			if (isNaN(user_id) || (user_id <= 0)) {
				user_id = null;
				return res.json({
					response: 2,
					err: 'No user id'
				})
			}

			const user = await User.findOne({where: { id: user_id }});

			if (!user) {
				return res.json({
					response: 2,
					err: 'No user found'
				})
			}

			let attachments = user.attachments;

			var folder = 'user/'+user_id+'/'

			let is_add_file_to_s3 = false;

			async function addFileToS3(path) {
				return new Promise(async (resolve,reject)=>{

					console.log('User File Upload:',path)
					var name = path.basename(path);
					var file_end = name.split('.')[1];
					var file_name = apikey(10)+ "."+file_end;
					awsSDK.upload_file_to_s3(path, folder, file_name, file_end, async function(err, result) {

						if (err) {
							console.log('err:', err);
							return res.json({
								response: 1,
								err: err
							})
						} else {

							var obj = {
								file_name: file_name,
								file_id: result.id,
								file_url: result.url,
								text: text
							}
							attachments.push(obj)

							is_add_file_to_s3 = true;

							resolve();					  
						}
					})
				})
			}

			const pormises = []
			let index = 0;
			while (req.files[index] && req.files[index].path && (req.files[index].path.length > 0)) {
				pormises.push(addFileToS3(req.files[index].path))
				index++;
			}
			await Promise.all(pormises)

			if (is_add_file_to_s3) {
				const response = await User.update({attachments: attachments}, {where: { id: user_id }});
			}

			return res.json({
				response: 0,
				err: "",
				attachments: attachments
			})						
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	fileDelete: async (req, res, next) => {
		try {
			let user_id = parseInt(req.body.user_id);
			let file_id = req.body.file_id;
			let file_name = req.body.file_name;

			if (isNaN(user_id) || (user_id <= 0)) {
				user_id = null;
				return res.json({
					response: 2,
					err: 'No user id'
				})
			}

			console.log('User File Delete:',user_id)

			const user = await User.findOne({where: { id: user_id }});

			if (!user) {
				return res.json({
					response: 2,
					err: 'No user found'
				})
			}

			let attachments = user.attachments;

			{
				var folder = 'user/'+user_id+'/'

				console.log('User File Delete:',file_name)
				awsSDK.delete_file_from_s3 (folder ,file_name, async function(err, result) {

					if (err) {
						console.log('err:', err);
						return res.json({
							response: 1,
							err: err
						})
					} else {

						var filtered = attachments.filter(function(el) { return el.file_id != file_id; }); 

						const response = await User.update({attachments: filtered}, {where: { id: user_id }});

						//res.json(user);
						return res.json({
							response: 0,
							err: "",
							attachments: filtered
						})						
					}
				})
			}
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	}
};

passport.use(
	'local-signup',
	new LocalStrategy({ passReqToCallback: true }, async (req, username1, password1, done) => {
		try {
			let { username, password, ...company } = req.body;

			if (!validator.isEmail(username)) {
				throw new AppError(httpStatus.BAD_REQUEST, 'Not A Valid Email');
			}

			const verify_email_token = uuidv4();

			let user = await User.findOne({ where: { email: username } });

			if (user) {
				throw new AppError(httpStatus.BAD_REQUEST, 'User already exist.');
			}

			user = await User.create({
				email: username,
				verify_email_token,
				password: bcrypt.hashSync(password)
			});
			if (user) {
				user = user.dataValues;
			}

			let companyModel = await Company.findOne({ where: { url: company.url } });

			if (!companyModel) {
				companyModel = await company.create(company);
				if (companyModel) {
					companyModel = companyModel.dataValues;
				}
			}

			//UserCompany.create({ company_id: companyModel.id, user_id: user.id });

			let link = `${process.env.API_URL}/user/verifyEmail?verify_email_token=${verify_email_token}`;

			console.log(`sendEmail to ${username}`);
			await sendEmail(username, 'info@imgn.co', 'Verify your email', 'verify', {
				email: username,
				link: link
			});

			return done(null, false, { success: 1 });
		} catch (error) {
			return done(error);
		}
	})
);

// Use the LocalStrategy within Passport to login/”signin” user.
passport.use(
	new LocalStrategy({ passReqToCallback: true }, async (req, username, password, done) => {
		try {
			let company = req.body;
			//let userCompany;

			if (!validator.isEmail(username)) {
				throw new AppError(httpStatus.BAD_REQUEST, 'Not A Valid Email');
			}

			const user = await User.findOne({ where: { email: username } });

			if (!user) {
				throw new AppError(httpStatus.FORBIDDEN, 'Invalid username and/or password');
			}

			if (user.verify_email_token) {
				throw new AppError(httpStatus.FORBIDDEN, "You didn't verify your account, please check your email.");
			}

			let isMatch = false;
			try {
				isMatch = await compareHash(password, user.dataValues.password);
			} catch (error) {
			}
   
			if (!isMatch) {
				throw new AppError(httpStatus.FORBIDDEN, 'Invalid username and/or password');
			}

			let companyModel = await Company.findOne({ where: { url: company.url } });

			if (!companyModel) {
				companyModel = await Company.create(company);
				if (companyModel) {
					companyModel = companyModel.dataValues;
				}
				//userCompany = await UserCompany.create({ company_id: companyModel.id, user_id: user.id });
			}

			/*if (!userCompany) {
				userCompany = await UserCompany.findOne({ where: { company_id: companyModel.id, user_id: user.id } });
			}*/

			return done(null, { user, company: companyModel/*, userCompany*/ });
		} catch (error) {
			done(error);
		}
	})
);

passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (user, done) {
	done(null, user);
});

const jwtSign = ({ user_id, user_email, company_id, country_id, key }) => {

	const token = jwt.sign(
		{
			exp: Math.floor(Date.now() / 1000) + (60 * 60 * config.exp_token_hours),
			data: {
				//id: userCompany.id,
				user_id: user_id,
				user_email: user_email,
				company_id: company_id,
				country_id: country_id,
				key: key
			}
		},
		JWT_SECRET
	);

	return token;
};

export default UserController;
