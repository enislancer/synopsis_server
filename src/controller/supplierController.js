import moment from 'moment';
const sequelize = require('../models');
const { Supplier, SupplierProject, Project, SupplierType, SupplierCategory, BudgetCategory, SupplierDepartment, SupplierJobTitle, SupplierUnitType, SupplierTitle, Company, Character, Budget, Payment, TaskCategory, Task } = sequelize.models;
var path = require('path');
var apikey = require("apikeygen").apikey;
var awsSDK = require('../utils/awsSDK')
var utils = require('../utils/utils')

const SupplierController = {

	getAll: async (req, res, next) => {
		try {

			const suppliers_list = await Supplier.findAll({
				/*order: [
					['pos', 'ASC']
				]*/
			});
			suppliers_list = suppliers_list.sort(function(a, b) {
				return a.pos - b.pos;
			});

			let suppliers = [];
			for(var i in suppliers_list) {
				var supplier = suppliers_list[i].dataValues;
				if (supplier) {
					let supplier_project = await SupplierProject.findOne({ where: { supplier_id: supplier.id, project_id: project_id } });
					if (supplier_project) {
						if (supplier_project.supplier_unit_type_id && (supplier_project.supplier_unit_type_id > 0)) {
							supplier.supplier_unit_type_id = supplier_project.supplier_unit_type_id;
						}
						if (supplier_project.supplier_unit_cost && (supplier_project.supplier_unit_cost > 0)) {
							supplier.supplier_unit_cost = supplier_project.supplier_unit_cost;
						}
						if (supplier_project.start_date && (supplier_project.start_date > 0)) {
							supplier.start_date = supplier_project.start_date;
						}
						if (supplier_project.end_date && (supplier_project.end_date > 0)) {
							supplier.end_date = supplier_project.end_date;
						}
					}
					suppliers.push(supplier);
				}
			}

			res.json(suppliers);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	getSupplier: async (req, res, next) => {
		try {
			let supplier_id = parseInt(req.params.supplier_id);

			if (isNaN(supplier_id) || (supplier_id <= 0)) {
				supplier_id = 0;
			}

			if (supplier_id <= 0) {
				return res.json({
					response: 2,
					err: 'No Supplier Id'
				})
			}

			let supplier = null;
			supplier = await Supplier.findOne({ where: { id: supplier_id } });
			if (supplier) {
				let supplier_project = await SupplierProject.findAll({ where: { supplier_id: supplier_id } });
				supplier = {...supplier, projects: supplier_project}
			}
			res.json(supplier);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	getCompanySuppliers: async (req, res, next) => {
		try {
			let project_id = parseInt(req.params.project_id);

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = null;
				return res.json({
					response: 2,
					err: "No project Id"
				})
			}

			let project = null;
			if (project_id  > 0) {
				project = await Project.findOne({where: { id: project_id }});
			}

			if (!project) {
				return res.json({
					response: 2,
					err: 'Project not found.'
				})
			}

			let company_id = project.company_id;

			let supplier_title = await SupplierTitle.findOne({where: { project_id: project_id }})

			let supplier_departments = await SupplierDepartment.findAll({})
			let supplier_job_titles = await SupplierJobTitle.findAll({})
			let supplier_unit_types = await SupplierUnitType.findAll({})
			let supplier_types = await SupplierType.findAll({})

			const suppliers_list = await Supplier.findAll({ 
				where: { company_id: company_id }/*,
				order: [
					['pos', 'ASC']
				]*/
			});
			suppliers_list = suppliers_list.sort(function(a, b) {
				return a.pos - b.pos;
			});

			let suppliers = [];
			for(var i in suppliers_list) {
				var supplier = suppliers_list[i].dataValues;
				if (supplier) {
					let supplier_project = await SupplierProject.findOne({ where: { supplier_id: supplier.id, project_id: project_id } });
					if (supplier_project) {
						if (supplier_project.supplier_unit_type_id && (supplier_project.supplier_unit_type_id > 0)) {
							supplier.supplier_unit_type_id = supplier_project.supplier_unit_type_id;
						}
						if (supplier_project.supplier_unit_cost && (supplier_project.supplier_unit_cost > 0)) {
							supplier.supplier_unit_cost = supplier_project.supplier_unit_cost;
						}
						if (supplier_project.start_date && (supplier_project.start_date > 0)) {
							supplier.start_date = supplier_project.start_date;
						}
						if (supplier_project.end_date && (supplier_project.end_date > 0)) {
							supplier.end_date = supplier_project.end_date;
						}
					}
					suppliers.push(supplier);
				}
			}

			let supplier_list = {
				supplier_title: supplier_title,
				suppliers: {default:[], canban: []}
			}
			for(var i in suppliers) {
				var supplier = suppliers[i].dataValues;
				if (supplier) {
					for(var j in supplier_departments) {
						var supplier_department = supplier_departments[j];
						if (supplier_department && (supplier.supplier_department_id == supplier_department.id)) {
							supplier = {...supplier, supplier_department: supplier_department.supplier_department}
							break;
						}
					}
					for(var k in supplier_job_titles) {
						var supplier_job_title = supplier_job_titles[k];
						if (supplier_job_title && (supplier.supplier_job_title_id == supplier_job_title.id)) {
							supplier = {...supplier, supplier_job_title: supplier_job_title.supplier_job_title}
							break;
						}
					}
					for(var l in supplier_unit_types) {
						var supplier_unit_type = supplier_unit_types[l];
						if (supplier_unit_type && (supplier.supplier_unit_type_id == supplier_unit_type.id)) {
							supplier = {...supplier, supplier_unit_type: supplier_unit_type.supplier_unit_type}
							break;
						}
					}
					for(var l in supplier_types) {
						var supplier_type = supplier_types[l];
						if (supplier_type && (supplier.supplier_type_id == supplier_type.id)) {
							supplier = {...supplier, type: supplier_type.supplier_type}
							break;
						}
					}

					// let supplier_job_title_id = 0;
					// if (supplier && (supplier.supplier_job_title_id > 0)) {
					// 	supplier_job_title_id = supplier.supplier_job_title_id;
					// }
					
					// let supplier_job_title = null;
					// if (supplier_job_title_id && (supplier_job_title_id > 0)) {
					// 	supplier_job_title = await SupplierJobTitle.findOne({where: { id: supplier_job_title_id }})
					// }

					// let supplier_job_title_name = '';
					// if (supplier_job_title && supplier_job_title.supplier_job_title) {
					// 	supplier_job_title_name = supplier_job_title.supplier_job_title;
					// }

					// if (supplier_job_title_name && (supplier_job_title_name.length > 0)) {
					// 	supplier = {...supplier, supplier_job_title: supplier_job_title_name}
					// }

					let text1 = supplier.text1;
					if (supplier_title && supplier_title.text1) {
						supplier = {...supplier, text1: text1}
					}

					let text2 = supplier.text2;
					if (supplier_title && supplier_title.text2) {
						supplier = {...supplier, text2: text2}
					}

					let text3 = supplier.text3;
					if (supplier_title && supplier_title.text3) {
						supplier = {...supplier, text3: text3}
					}

					let number1 = supplier.number1;
					if (supplier_title && supplier_title.number1) {
						supplier = {...supplier, number1: number1}
					}

					let number2 = supplier.number2;
					if (supplier_title && supplier_title.number2) {
						supplier = {...supplier, number2: number2}
					}

					let number3 = supplier.number3;
					if (supplier_title && supplier_title.number3) {
						supplier = {...supplier, number3: number3}
					}

					let percentage1 = supplier.percentage1;
					if (supplier_title && supplier_title.percentage1) {
						supplier = {...supplier, percentage1: percentage1}
					}

					let percentage2 = supplier.percentage2;
					if (supplier_title && supplier_title.percentage2) {
						supplier = {...supplier, percentage2: percentage2}
					}

					let percentage3 = supplier.percentage3;
					if (supplier_title && supplier_title.percentage3) {
						supplier = {...supplier, percentage3: percentage3}
					}

					supplier_list.suppliers.default.push(supplier);
				}
			}

			res.json(supplier_list);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	getAllProjectSuppliers: async (req, res, next) => {
		try {
			let project_id = parseInt(req.params.project_id);

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = null;
				return res.json({
					response: 2,
					err: "No project Id"
				})
			}

			utils.getAllProjectSuppliers(project_id, function (err, suppliers) {
				if (err) {
					return res.json({
						response: 3,
						err: err
					})
				} else {
					return res.json(suppliers)
				}
			});
		} catch (error) {
			console.log('error:',error)
			return res.json({
				response: 1,
				err: error
			})
		}
	},

	create: async (req, res, next) => {
		try {

			let supplier_id = parseInt(req.body.supplier_id);
			let pos = parseInt(req.body.pos);
			let supplier_name = req.body.supplier_name;
			let company_id = parseInt(req.body.company_id);
			let project_id = parseInt(req.body.project_id);
			let supplier_type_id = parseInt(req.body.supplier_type_id);
			let supplier_department_id = parseInt(req.body.supplier_department_id);
			let service_description = req.body.service_description;
			let contact_name = req.body.contact_name;
			let phone = req.body.phone;
			let email = req.body.email;
			let comments = req.body.comments;
			let budget_comments = req.body.budget_comments;
			let supplier_job_title_id = parseInt(req.body.supplier_job_title_id);
			let supplier_unit_type_id = parseInt(req.body.supplier_unit_type_id);
			let supplier_unit_cost = parseInt(req.body.supplier_unit_cost);
			let supplier_category_id = parseInt(req.body.supplier_category_id);
			let start_date = req.body.start_date;
			let end_date = req.body.end_date;
			let agency = req.body.agency;
			let pickup = req.body.pickup;
			let site = req.body.site;
			let end_time = req.body.end_time;
			let post_comments = req.body.post_comments;
			let attachments = req.body.attachments;
			let text1 = req.body.text1;
			let text2 = req.body.text2;
			let text3 = req.body.text3;
			let number1 = parseInt(req.body.number1);
			let number2 = parseInt(req.body.number2);
			let number3 = parseInt(req.body.number3);
			let percentage1 = parseInt(req.body.percentage1);
			let percentage2 = parseInt(req.body.percentage2);
			let percentage3 = parseInt(req.body.percentage3);

			if (!supplier_id || isNaN(supplier_id) || (supplier_id <= 0)) {
				supplier_id = 0;
			}
			if (!pos || isNaN(pos) || (pos <= 0)) {
				pos = 0;
			}

			if (isNaN(supplier_type_id) || (supplier_type_id && (supplier_type_id <= 0))) {
				supplier_type_id = null;
			}

			if (isNaN(supplier_department_id) || (supplier_department_id && (supplier_department_id <= 0))) {
				supplier_department_id = null;
			}

			if (isNaN(supplier_job_title_id) || (supplier_job_title_id && (supplier_job_title_id <= 0))) {
				supplier_job_title_id = null;
			}

			if (isNaN(supplier_unit_type_id) || (supplier_unit_type_id && (supplier_unit_type_id <= 0))) {
				supplier_unit_type_id = null;
			}

			if (isNaN(supplier_unit_cost) || (supplier_unit_cost && (supplier_unit_cost <= 0))) {
				supplier_unit_cost = null;
			}

			if (isNaN(supplier_category_id) || (supplier_category_id && (supplier_category_id <= 0))) {
				supplier_category_id = null;
			}

			if (isNaN(project_id) || (project_id && (project_id <= 0))) {
				project_id = null;
			}
			
			if (!start_date) {
				start_date = null;
			}

			if (!end_date) {
				end_date = null;
			}

			if (!agency) {
				agency = null;
			}

			if (!pickup) {
				pickup = null;
			}

			if (!site) {
				site = null;
			}

			if (!end_time) {
				end_time = null;
			}

			if (!post_comments) {
				post_comments = null;
			}

			if (!company_id || isNaN(company_id) || (company_id <= 0)) {
				company_id = null;
				return res.json({
					response: 2,
					err: "No company id"
				})
			}

			let company = null;
			if (company_id > 0) {
				company = await Company.findOne({where: { id: company_id }});
			}

			if ((supplier_id <= 0) && !company) {
				return res.json({
					response: 2,
					err: 'No company found'
				})
			}

			let params = {
			}
			if (pos && !isNaN(pos) && (pos > 0)) {
				params = {...params, pos: pos}
			}
			if (supplier_name && (supplier_name.length > 0)) {
				params = {...params, supplier_name: supplier_name}
			}
			if (company_id && !isNaN(company_id) && (company_id > 0)) {
				params = {...params, company_id: company_id}
			}
			if (service_description && (service_description.length > 0)) {
				params = {...params, service_description: service_description}
			}
			if (contact_name && (contact_name.length > 0)) {
				params = {...params, contact_name: contact_name}
			}
			if (phone && (phone.length > 0)) {
				params = {...params, phone: phone}
			}
			if (email && (email.length > 0)) {
				params = {...params, email: email}
			}
			if (comments && (comments.length > 0)) {
				params = {...params, comments: comments}
			}
			if (budget_comments && (budget_comments.length > 0)) {
				params = {...params, budget_comments: budget_comments}
			}
			if ((supplier_type_id == null) || (supplier_type_id && (supplier_type_id > 0))) {
				params = {...params, supplier_type_id: supplier_type_id}
			}
			if ((supplier_department_id == null) || (supplier_department_id && (supplier_department_id > 0))) {
				params = {...params, supplier_department_id: supplier_department_id}
			}
			if (supplier_unit_type_id && (supplier_unit_type_id > 0)) {
				params = {...params, supplier_unit_type_id: supplier_unit_type_id}
			}
			if (supplier_unit_cost && (supplier_unit_cost > 0)) {
				params = {...params, supplier_unit_cost: supplier_unit_cost}
			}
			if (supplier_category_id && (supplier_category_id > 0)) {
				params = {...params, supplier_category_id: supplier_category_id}
			}
			if (agency) {
				params = {...params, agency: agency}
			}
			if (pickup) {
				params = {...params, pickup: pickup}
			}
			if (site) {
				params = {...params, site: site}
			}
			if (end_time) {
				params = {...params, end_time: end_time}
			}
			if (post_comments) {
				params = {...params, post_comments: post_comments}
			}

			let supplier_job_title_obj = null;
			if (supplier_job_title_id && (supplier_job_title_id > 0)) {
				params = {...params, supplier_job_title_id: supplier_job_title_id}
			} else {
				/*if (supplier_id > 0) {
					let supplier_obj = await Supplier.findOne({ where: { id: supplier_id }})
					if (!supplier_obj || !supplier_obj.supplier_job_title || (supplier_obj.supplier_job_title <= 0)) {
						if (supplier_name && (supplier_name.length > 0)) {
							supplier_job_title_obj = await SupplierJobTitle.create({
								supplier_job_title: supplier_name
							});
							if (supplier_job_title_obj) {
								supplier_job_title_id = supplier_job_title_obj.dataValues.id;
								params = {...params, supplier_job_title_id: supplier_job_title_id}
							}
						}
					}
				}*/
			}
			if (start_date) {
				params = {...params, start_date: start_date}
			}
			if (end_date) {
				params = {...params, end_date: end_date}
			}
			if (text1 && (text1.length > 0)) {
				params = {...params, text1: text1}
			}
			if (text2 && (text2.length > 0)) {
				params = {...params, text2: text2}
			}
			if (text3 && (text3.length > 0)) {
				params = {...params, text3: text3}
			}
			if (number1 && !isNaN(number1) && (number1 > 0)) {
				params = {...params, number1: number1}
			}
			if (number2 && !isNaN(number2) && (number2 > 0)) {
				params = {...params, number2: number2}
			}
			if (number3 && !isNaN(number3) && (number3 > 0)) {
				params = {...params, number3: number3}
			}
			if (percentage1 && !isNaN(percentage1) && (percentage1 > 0)) {
				params = {...params, percentage1: percentage1}
			}
			if (percentage2 && !isNaN(percentage2) && (percentage2 > 0)) {
				params = {...params, percentage2: percentage2}
			}
			if (percentage3 && !isNaN(percentage3) && (percentage3 > 0)) {
				params = {...params, percentage3: percentage3}
			}

			let supplier = null;
			if (supplier_id > 0) {
				supplier = await Supplier.update(params, {where: { id: supplier_id }});
				supplier = await Supplier.findOne({ where: { id: supplier_id }})
				if (supplier) {
					supplier = supplier.dataValues;
				}
			} else {
				supplier = await Supplier.create(params);
				if (supplier) {
					supplier = supplier.dataValues;
				}
			}

			let supplier_departments = await SupplierDepartment.findAll({})
			let supplier_job_titles = await SupplierJobTitle.findAll({})
			let supplier_unit_types = await SupplierUnitType.findAll({})
			let supplier_types = await SupplierType.findAll({})

			if (supplier_departments && (supplier_departments.length > 0)) {
				for (let index3 = 0; index3 < supplier_departments.length; index3++) {
					let supplier_department = supplier_departments[index3].dataValues;
					if (supplier_department && (supplier_department.id == supplier.supplier_department_id)) {
						supplier = {...supplier, supplier_department: supplier_department.supplier_department}
					}
				}
			}

			if (supplier_job_titles && (supplier_job_titles.length > 0)) {
				for (let index3 = 0; index3 < supplier_job_titles.length; index3++) {
					let supplier_job_title = supplier_job_titles[index3].dataValues;
					if (supplier_job_title && (supplier_job_title.id == supplier.supplier_job_title_id)) {
						supplier = {...supplier, supplier_job_title: supplier_job_title.supplier_job_title}
					}
				}
			}				

			if (supplier_unit_types && (supplier_unit_types.length > 0)) {
				for (let index3 = 0; index3 < supplier_unit_types.length; index3++) {
					let supplier_unit_type = supplier_unit_types[index3].dataValues;
					if (supplier_unit_type && (supplier_unit_type.id == supplier.supplier_unit_type_id)) {
						supplier = {...supplier, supplier_unit_type: supplier_unit_type.supplier_unit_type}
					}
				}
			}				
	
			if (supplier_types && (supplier_types.length > 0)) {
				for (let index3 = 0; index3 < supplier_types.length; index3++) {
					let supplier_type = supplier_types[index3].dataValues;
					if (supplier_type && (supplier_type.id == supplier.supplier_type_id)) {
						supplier = {...supplier, supplier_type_id: supplier_type.id, type: supplier_type.supplier_type}
					}
				}
			}				
	
			supplier = {...supplier, job_title: supplier_job_title_obj}

			/*if (supplier_category_id > 0) {
				let supplier_category = await SupplierCategory.findOne({where: { id: supplier_category_id }});
				if (supplier_category) {
					if (supplier.color) {
						supplier.color = supplier_category.color;
					} else {
						supplier = {...supplier, color: supplier_category.color}
					}
				}
			}*/

			let budget_id = 0;
			if ((supplier_id <= 0) && supplier && (supplier.id > 0) && (project_id > 0)) {

				//let supplier_departments = await SupplierDepartment.findAll({})
				let supplier_job_titles = await SupplierJobTitle.findAll({})
				//let supplier_unit_types = await SupplierUnitType.findAll({})
				//let supplier_types = await SupplierType.findAll({})

				let supplier_category_list = await SupplierCategory.findAll({});
				let budget_category_list = await BudgetCategory.findAll({});
				
				let budget_type_id = 1;
				let budget_status_id = 1;
				let budget_category_id = 1;
				let supplier_job_title_id = 1;
				let supplier_job_title = '';
				let supplier_category_id = 0;
				let supplier_name = '';
				let supplier_category = '';
				if (supplier.supplier_job_title_id && (supplier.supplier_job_title_id > 0)) {
					supplier_job_title_id = supplier.supplier_job_title_id;
				}
				if (supplier.supplier_name && (supplier.supplier_name > 0)) {
					supplier_name = supplier.supplier_name;
				}
				if (supplier.supplier_category_id && (supplier.supplier_category_id > 0)) {
					supplier_category_id = supplier.supplier_category_id;
				}

				for(var k in supplier_job_titles) {
					var supplier_job_title_obj1 = supplier_job_titles[k];
					if (supplier_job_title_obj1 && (supplier.supplier_job_title_id == supplier_job_title_obj1.id)) {
						supplier_job_title = supplier_job_title_obj1.supplier_job_title;
					}
				}

				for(var k in supplier_category_list) {
					var supplier_category_obj1 = supplier_category_list[k];
					if (supplier_category_obj1 && (supplier.supplier_category_id == supplier_category_obj1.id)) {
						supplier_category = supplier_category_obj1.supplier_category;
					}
				}

				for(var k in budget_category_list) {
					var budget_category_obj = budget_category_list[k];
					if (budget_category_obj && (budget_category_obj.budget_category == supplier_category)) {
						budget_category_id = budget_category_obj.id;
					}
				}

				let budget = {
					budget_name: supplier_name,
					project_id: project_id,
					budget_category_id: budget_category_id,
					budget_type_id: budget_type_id,
					budget_status_id: budget_status_id,
					project_scene_id: 0,
					supplier_id: supplier.id,
					supplier_job_title_id: supplier_job_title_id,
					price: 0,
					comments: '',
					description: supplier_job_title,
					attachments: []
				}

				let budget_result = await Budget.create(budget);
				if (budget_result && (budget_result.id > 0)) {
					budget_id = budget_result.id;
					//supplier_project = await SupplierProject.update({budget_id: budget_result.id}, {where: { project_id: project_id, supplier_id: supplier.supplier_id }});
				}
			}

			if (project_id && (project_id > 0)) {

				let supplier_unit_type_id = parseInt(supplier.supplier_unit_type_id);
				let supplier_unit_cost = parseInt(supplier.supplier_unit_cost);
				let start_date = supplier.start_date;
				let end_date = supplier.end_date;
				let characters = [];

				let params1 = {
					project_id: project_id,
					supplier_id: supplier.id,
					characters: characters,
					supplier_unit_type_id: supplier_unit_type_id,
					supplier_unit_cost: supplier_unit_cost,
					start_date: start_date,
					end_date: end_date
				}

				let params2 = {
					project_id: project_id,
					supplier_id: supplier.id,
					budget_id: budget_id,
					characters: characters,
					supplier_unit_type_id: supplier_unit_type_id,
					supplier_unit_cost: supplier_unit_cost,
					start_date: start_date,
					end_date: end_date
				}

				let supplier_project = await SupplierProject.findOne({ where: { supplier_id: supplier.id, project_id: project_id } });
				if (supplier_project) {
					supplier_project = await SupplierProject.update(params1, {where: { project_id: project_id, supplier_id: supplier.id }});
					supplier_project = await SupplierProject.findOne({ where: { project_id: project_id, supplier_id: supplier.id }})
					if (supplier_project) {
						supplier_project = supplier_project.dataValues;
					}

					if (supplier_project && (supplier_project.budget_id > 0)) {

						let supplier_job_titles = await SupplierJobTitle.findAll({})
						let supplier_category_list = await SupplierCategory.findAll({});
						let budget_category_list = await BudgetCategory.findAll({});
						
						let budget_type_id = 1;
						let budget_status_id = 1;
						let budget_category_id = 1;
						let supplier_job_title_id = 1;
						let supplier_job_title = '';
						let supplier_category_id = 0;
						let supplier_name = '';
						let supplier_category = '';
						if (supplier.supplier_job_title_id && (supplier.supplier_job_title_id > 0)) {
							supplier_job_title_id = supplier.supplier_job_title_id;
						}
						if (supplier.supplier_name && (supplier.supplier_name > 0)) {
							supplier_name = supplier.supplier_name;
						}
						if (supplier.supplier_category_id && (supplier.supplier_category_id > 0)) {
							supplier_category_id = supplier.supplier_category_id;
						}

						for(var k in supplier_job_titles) {
							var supplier_job_title_obj1 = supplier_job_titles[k];
							if (supplier_job_title_obj1 && (supplier.supplier_job_title_id == supplier_job_title_obj1.id)) {
								supplier_job_title = supplier_job_title_obj1.supplier_job_title;
							}
						}

						for(var k in supplier_category_list) {
							var supplier_category_obj1 = supplier_category_list[k];
							if (supplier_category_obj1 && (supplier.supplier_category_id == supplier_category_obj1.id)) {
								supplier_category = supplier_category_obj1.supplier_category;
							}
						}

						for(var k in budget_category_list) {
							var budget_category_obj = budget_category_list[k];
							if (budget_category_obj && (budget_category_obj.budget_category == supplier_category)) {
								budget_category_id = budget_category_obj.id;
							}
						}

						let budget = {
							budget_name: supplier_name,
							project_id: project_id,
							budget_category_id: budget_category_id,
							budget_type_id: budget_type_id,
							budget_status_id: budget_status_id,
							project_scene_id: 0,
							supplier_id: supplier.id,
							supplier_job_title_id: supplier_job_title_id,
							price: 0,
							comments: '',
							description: supplier_job_title,
							attachments: []
						}

						let budget_result = await Budget.update(budget, {where: { id: supplier_project.budget_id }});
					}
				} else {
					supplier_project = await SupplierProject.create(params2);
					if (supplier_project) {
						supplier_project = supplier_project.dataValues;
					}
				}

				return res.json({
					response: 0,
					err: "",
					supplier: supplier,
					suppliers: null
				})

				/*utils.getAllProjectSuppliers(project_id, function (err, suppliers) {
					if (err) {
						return res.json({
							response: 3,
							err: err
						})
					} else {

						return res.json({
							response: 0,
							err: "",
							supplier: supplier,
							suppliers: suppliers
						})
					}
				});*/
			} else {
				return res.json({
					response: 0,
					err: "",
					supplier: supplier,
					suppliers: null
				})
			}
		} catch (err) {
			//next(err);
			console.log(err)
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	createSupplierList: async (req, res, next) => {
		try {
			var suppliers = req.body
			if (suppliers && (suppliers.length > 0)) {
				async function getData() {
					for(var i in suppliers) {
						var supplier_obj = suppliers[i];
						if (supplier_obj /*&& supplier_obj.supplier_name && (supplier_obj.supplier_name.length > 0)*/) {
							let supplier_id = parseInt(supplier_obj.supplier_id);
							let pos = parseInt(supplier_obj.pos);
							let supplier_name = supplier_obj.supplier_name;
							let company_id = parseInt(supplier_obj.company_id);
							let supplier_department_id = supplier_obj.supplier_department_id;
							let service_description = supplier_obj.service_description;
							let contact_name = supplier_obj.contact_name;
							let phone = supplier_obj.phone;
							let email = supplier_obj.email;
							let comments = supplier_obj.comments;
							let budget_comments = supplier_obj.budget_comments;
							let supplier_job_title_id = supplier_obj.supplier_job_title_id;
							let start_date = supplier_obj.start_date;
							let end_date = supplier_obj.end_date;
							let agency = supplier_obj.agency;
							let pickup = supplier_obj.pickup;
							let site = supplier_obj.site;
							let end_time = supplier_obj.end_time;
							let post_comments = supplier_obj.post_comments;
							let attachments = supplier_obj.attachments;

							if (!supplier_id || isNaN(supplier_id) || (supplier_id <= 0)) {
								supplier_id = 0;
							}
							if (!pos || isNaN(pos) || (pos <= 0)) {
								pos = 0;
							}

							if (!supplier_department_id) {
								supplier_department_id = null;
							}
				
							if (!supplier_job_title_id) {
								supplier_job_title_id = null;
							}

							if (!start_date) {
								start_date = null;
							}
				
							if (!end_date) {
								end_date = null;
							}
				
							if (!agency) {
								agency = null;
							}
				
							if (!pickup) {
								pickup = null;
							}
				
							if (!site) {
								site = null;
							}
				
							if (!end_time) {
								end_time = null;
							}
				
							if (!post_comments) {
								post_comments = null;
							}
				
							if (!company_id || isNaN(company_id) || (company_id <= 0)) {
								company_id = null;
								return res.json({
									response: 2,
									err: "No company id"
								})
							}				
				
							let company = null;
							if (company_id > 0) {
								company = await Company.findOne({where: { id: company_id }});
							}
				
							if ((supplier_id <= 0) && !company) {
								return res.json({
									response: 2,
									err: 'No company found'
								})
							}

							let params = {
							}
							if (pos && !isNaN(pos) && (pos > 0)) {
								params = {...params, pos: pos}
							}
							if (supplier_name && (supplier_name.length > 0)) {
								params = {...params, supplier_name: supplier_name}
							}
							if (company_id && !isNaN(company_id) && (company_id > 0)) {
								params = {...params, company_id: company_id}
							}
							if (service_description && (service_description.length > 0)) {
								params = {...params, service_description: service_description}
							}
							if (contact_name && (contact_name.length > 0)) {
								params = {...params, contact_name: contact_name}
							}
							if (phone && (phone.length > 0)) {
								params = {...params, phone: phone}
							}
							if (email && (email.length > 0)) {
								params = {...params, email: email}
							}
							if (comments && (comments.length > 0)) {
								params = {...params, comments: comments}
							}
							if (budget_comments && (budget_comments.length > 0)) {
								params = {...params, budget_comments: budget_comments}
							}
							//if ((supplier_department_id == null) || (supplier_department_id && (supplier_department_id > 0))) {
								params = {...params, supplier_department_id: supplier_department_id}
							//}
							//if ((supplier_job_title_id == null) || (supplier_job_title_id && (supplier_job_title_id > 0))) {
								params = {...params, supplier_job_title_id: supplier_job_title_id}
							//}
							if (start_date) {
								params = {...params, start_date: start_date}
							}
							if (end_date) {
								params = {...params, end_date: end_date}
							}
							if (agency) {
								params = {...params, agency: agency}
							}
							if (pickup) {
								params = {...params, pickup: pickup}
							}
							if (site) {
								params = {...params, site: site}
							}
							if (end_time) {
								params = {...params, end_time: end_time}
							}
							if (post_comments) {
								params = {...params, post_comments: post_comments}
							}								
							if (supplier_id > 0) {
								const query = await Supplier.update(params, {where: { id: supplier_id }});
							} else {
								const query = await Supplier.create(params);
							}
						}
					}
					return;
				}
			
				getData()
				.then(() => {
					return res.json({
						response: 0,
						err: "",
					})
				})
			}
		} catch (err) {
			console.log('err:',err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	delete: async (req, res, next) => {
		try {
			let supplier_id = parseInt(req.body.supplier_id);

			if (isNaN(supplier_id) || (supplier_id <= 0)) {
				supplier_id = null;
				return res.json({
					response: 2,
					err: 'No supplier id'
				})
			}

			console.log('delete:',supplier_id)

			const response1 = await Budget.destroy({
				where: { supplier_id: supplier_id },
				force: true
			})

			const response2 = await Payment.update({supplier_id: 0},
				{ where: { supplier_id: supplier_id } }
			)

			const response3 = await Character.update({supplier_id: 0},
				{ where: { supplier_id: supplier_id } }
			)

			const response4 = await TaskCategory.update({supplier_id: 0},
				{ where: { supplier_id: supplier_id } }
			)

			const response5 = await Task.update({supplier_id: null},
				{ where: { supplier_id: supplier_id } }
			)

			const response6 = await SupplierProject.destroy({
				where: { supplier_id: supplier_id },
				force: true
			})

			const response7 = await Supplier.destroy({
				where: { id: supplier_id },
				force: true
			})

			return res.json({
				response: 0,
				err: ""
			})
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	getAllSupplierFiles: async (req, res, next) => {
		try {
			let supplier_id = parseInt(req.params.supplier_id);

			if (isNaN(supplier_id) || (supplier_id <= 0)) {
				supplier_id = null;
				return res.json({
					response: 2,
					err: "No supplier id"
				})
			}

			let supplier = null;
			if (supplier_id  > 0) {
				supplier = await Supplier.findOne({where: { id: supplier_id }});
			}

			if (!supplier) {
				return res.json({
					response: 2,
					err: 'No supplier found'
				})
			}

			return res.json(supplier.attachments)						

		} catch (error) {
			return res.json({
				response: 1,
				err: error
			})
		}
	},

	fileAdd: async (req, res, next) => {
		try {
			let supplier_id = parseInt(req.body.supplier_id);
			let text = req.body.text;

			if (!text) {
				text = '';
			}

			if (isNaN(supplier_id) || (supplier_id <= 0)) {
				supplier_id = null;
				return res.json({
					response: 2,
					err: 'No supplier id'
				})
			}

			const supplier = await Supplier.findOne({where: { id: supplier_id }});

			if (!supplier) {
				return res.json({
					response: 2,
					err: 'No supplier found'
				})
			}

			let attachments = supplier.attachments;

			var folder = 'supplier/'+supplier_id+'/'

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
				const response = await Supplier.update({attachments: attachments}, {where: { id: supplier_id }});
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
			let supplier_id = parseInt(req.body.supplier_id);
			let file_id = req.body.file_id;
			let file_name = req.body.file_name;

			if (isNaN(supplier_id) || (supplier_id <= 0)) {
				supplier_id = null;
				return res.json({
					response: 2,
					err: 'No supplier id'
				})
			}

			console.log('Supplier File Delete:',supplier_id)

			const supplier = await Supplier.findOne({where: { id: supplier_id }});

			if (!supplier) {
				return res.json({
					response: 2,
					err: 'No supplier found'
				})
			}

			let attachments = supplier.attachments;

			{
				var folder = 'supplier/'+supplier_id+'/'

				console.log('Supplier File Delete:',file_name)
				awsSDK.delete_file_from_s3 (folder ,file_name, async function(err, result) {

					if (err) {
						console.log('err:', err);
						return res.json({
							response: 1,
							err: err
						})
					} else {

						var filtered = attachments.filter(function(el) { return el.file_id != file_id; }); 

						const response = await Supplier.update({attachments: filtered}, {where: { id: supplier_id }});

						//res.json(supplier);
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
	},

	getSupplierCategory: async (req, res, next) => {
		try {
			const supplier_category_list = await SupplierCategory.findAll({});
			res.json(supplier_category_list);

		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	addSupplierCategory: async (req, res, next) => {
		try {
			let supplier_category_id = parseInt(req.body.supplier_category_id);
			let supplier_category = req.body.supplier_category;
			let color = req.body.color;

			if (isNaN(supplier_category_id) || (supplier_category_id <= 0)) {
				supplier_category_id = 0;
			}

			if (!color) {
				color = utils.getColor();
			}

			let supplier_category_result = null;
			let params = {
				supplier_category: supplier_category,
				color: color
			}
			if (supplier_category_id > 0) {
				supplier_category_result = await SupplierCategory.update(params, {where: { id: supplier_category_id }});
				supplier_category_result = params;
			} else {
				supplier_category_result = await SupplierCategory.create(params);
				if (supplier_category_result) {
					supplier_category_result = supplier_category_result.dataValues;
				}
			}

			return res.json({
				response: 0,
				err: "",
				supplier_category: supplier_category_result
			})
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	deleteSupplierCategory: async (req, res, next) => {
		try {
			let supplier_category_id = parseInt(req.body.supplier_category_id);

			if (isNaN(supplier_category_id) || (supplier_category_id <= 0)) {
				supplier_category_id = null;
				return res.json({
					response: 2,
					err: "No supplier category id"
				})
			}

			console.log('Delete Supplier Category:',supplier_category_id)

			const response = await SupplierCategory.destroy({
				where: { id: supplier_category_id },
				force: true
			})

			return res.json({
				response: 0,
				err: ""
			})
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	getSupplierType: async (req, res, next) => {
		try {
			const supplier_type_list = await SupplierType.findAll({});
			res.json(supplier_type_list);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	addSupplierType: async (req, res, next) => {
		try {

			let supplier_type_id = parseInt(req.body.supplier_type_id);
			let supplier_type = req.body.supplier_type;

			if (isNaN(supplier_type_id) || (supplier_type_id <= 0)) {
				supplier_type_id = 0;
			}

			let response = null;
			if (supplier_type_id > 0) {
				response = await SupplierType.update({
					supplier_type: supplier_type
				}, {where: { id: supplier_type_id }});
				response = {supplier_type: supplier_type}
			} else {
				response = await SupplierType.create({
					supplier_type: supplier_type
				});
				if (response) {
					response = response.dataValues;
				}
			}

			return res.json({
				response: 0,
				err: "",
				supplier_type: response
			})
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	deleteSupplierType: async (req, res, next) => {
		try {
			let supplier_type_id = parseInt(req.body.supplier_type_id);

			if (isNaN(supplier_type_id) || (supplier_type_id <= 0)) {
				supplier_type_id = null;
				return res.json({
					response: 2,
					err: "No supplier type id"
				})
			}

			console.log('Delete Supplier Type:',supplier_type_id)

			const response = await SupplierType.destroy({
				where: { id: supplier_type_id },
				force: true
			})

			return res.json({
				response: 0,
				err: ""
			})
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	getSupplierUnitType: async (req, res, next) => {
		try {
			const supplier_unit_type_list = await SupplierUnitType.findAll({});
			res.json(supplier_unit_type_list);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	addSupplierUnitType: async (req, res, next) => {
		try {

			let supplier_unit_type_id = parseInt(req.body.supplier_unit_type_id);
			let supplier_unit_type = req.body.supplier_unit_type;

			if (isNaN(supplier_unit_type_id) || (supplier_unit_type_id <= 0)) {
				supplier_unit_type_id = 0;
			}

			let response = null;
			if (supplier_unit_type_id > 0) {
				response = await SupplierUnitType.update({
					supplier_unit_type: supplier_unit_type
				}, {where: { id: supplier_unit_type_id }});
				response = {supplier_unit_type: supplier_unit_type}
			} else {
				response = await SupplierUnitType.create({
					supplier_unit_type: supplier_unit_type
				});
				if (response) {
					response = response.dataValues;
				}
			}

			return res.json({
				response: 0,
				err: "",
				supplier_unit_type: response
			})
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	deleteSupplierUnitType: async (req, res, next) => {
		try {
			let supplier_unit_type_id = parseInt(req.body.supplier_unit_type_id);

			if (isNaN(supplier_unit_type_id) || (supplier_unit_type_id <= 0)) {
				supplier_unit_type_id = null;
				return res.json({
					response: 2,
					err: "No supplier unit type id"
				})
			}

			console.log('Delete Supplier Unit Type:',supplier_unit_type_id)

			const response = await SupplierUnitType.destroy({
				where: { id: supplier_unit_type_id },
				force: true
			})

			return res.json({
				response: 0,
				err: ""
			})
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	getSupplierDepartment: async (req, res, next) => {
		try {
			const supplier_department_list = await SupplierDepartment.findAll({});
			res.json(supplier_department_list);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	addSupplierDepartment: async (req, res, next) => {
		try {

			let supplier_department_id = parseInt(req.body.supplier_department_id);
			let supplier_department = req.body.supplier_department;

			if (isNaN(supplier_department_id) || (supplier_department_id <= 0)) {
				supplier_department_id = 0;
			}

			let response = null;
			if (supplier_department_id > 0) {
				response = await SupplierDepartment.update({
					supplier_department: supplier_department
				}, {where: { id: supplier_department_id }});
				response = {supplier_department: supplier_department}
			} else {
				response = await SupplierDepartment.create({
					supplier_department: supplier_department
				});
				if (response) {
					response = response.dataValues;
				}
			}

			return res.json({
				response: 0,
				err: "",
				supplier_department: response
			})
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	deleteSupplierDepartment: async (req, res, next) => {
		try {
			let supplier_department_id = parseInt(req.body.supplier_department_id);

			if (isNaN(supplier_department_id) || (supplier_department_id <= 0)) {
				supplier_department_id = null;
				return res.json({
					response: 2,
					err: "No supplier department id"
				})
			}

			console.log('Delete Supplier Department:',supplier_department_id)

			const response = await SupplierDepartment.destroy({
				where: { id: supplier_department_id },
				force: true
			})

			return res.json({
				response: 0,
				err: ""
			})
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	getSupplierJobTitle: async (req, res, next) => {
		try {
			const supplier_job_title_list = await SupplierJobTitle.findAll({});
			res.json(supplier_job_title_list);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	addSupplierJobTitle: async (req, res, next) => {
		try {

			let supplier_job_title_id = parseInt(req.body.supplier_job_title_id);
			let supplier_job_title = req.body.supplier_job_title;

			if (isNaN(supplier_job_title_id) || (supplier_job_title_id <= 0)) {
				supplier_job_title_id = 0;
			}

			let response = null;
			if (supplier_job_title_id > 0) {
				response = await SupplierJobTitle.update({
					supplier_job_title: supplier_job_title
				}, {where: { id: supplier_job_title_id }});
				response = {supplier_department: supplier_department}
			} else {
				response = await SupplierJobTitle.create({
					supplier_job_title: supplier_job_title
				});
				if (response) {
					response = response.dataValues;
				}
			}

			return res.json({
				response: 0,
				err: "",
				supplier_job_title: response
			})
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	deleteSupplierJobTitle: async (req, res, next) => {
		try {
			let supplier_job_title_id = parseInt(req.body.supplier_job_title_id);

			if (isNaN(supplier_job_title_id) || (supplier_job_title_id <= 0)) {
				supplier_job_title_id = null;
				return res.json({
					response: 2,
					err: "No Supplier status id"
				})
			}

			console.log('Delete Supplier Status:',supplier_job_title_id)

			const response = await SupplierJobTitle.destroy({
				where: { id: supplier_job_title_id },
				force: true
			})

			return res.json({
				response: 0,
				err: ""
			})
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	getSupplierTitle: async (req, res, next) => {
		try {
			let project_id = parseInt(req.params.project_id);

			if (!project_id || isNaN(project_id) || (project_id <= 0)) {
				project_id = null;
				return res.json({
					response: 2,
					err: "No project id"
				})
			}
			
			if (project_id) {
				const supplier_title = await SupplierTitle.findAll({where: {project_id: project_id}});
				res.json(supplier_title);
			} else {
				let supplier_title = [];
				res.json(supplier_title);
			}
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	createSupplierTitle: async (req, res, next) => {
		try {
			let project_id = parseInt(req.body.project_id);
			let category_id = parseInt(req.body.category_id);
			let text1 = req.body.text1;
			let text2 = req.body.text2;
			let text3 = req.body.text3;
			let number1 = req.body.number1;
			let number2 = req.body.number2;
			let number3 = req.body.number3;
			let percentage1 = req.body.percentage1;
			let percentage2 = req.body.percentage2;
			let percentage3 = req.body.percentage3;

			if (!project_id || isNaN(project_id) || (project_id <= 0)) {
				project_id = 0;
			}

			if (!project_id || isNaN(project_id) || (project_id <= 0)) {
				category_id = 0;
			}

			let project = null;
			if (project_id  > 0) {
				project = await Project.findOne({where: { id: project_id }});
			}

			if (!project || !project_id || (project_id == 0)) {
				return res.json({
					response: 2,
					err: 'No project found'
				})
			}

			let supplier_title = await SupplierTitle.findOne({where: { project_id: project_id }});

			let params = {
				project_id: project_id,
				category_id: category_id
			}
			let params_create = {
				project_id: project_id,
				category_id: category_id
			}
			if (text1 || (text1 == null)) {
				params = {...params, text1: text1}
			}
			if (text2 || (text2 == null)) {
				params = {...params, text2: text2}
			}
			if (text3 || (text3 == null)) {
				params = {...params, text3: text3}
			}
			if (number1 || (number1 == null)) {
				params = {...params, number1: number1}
			}
			if (number2 || (number2 == null)) {
				params = {...params, number2: number2}
			}
			if (number3 || (number3 == null)) {
				params = {...params, number3: number3}
			}
			if (percentage1 || (percentage1 == null)) {
				params = {...params, percentage1: percentage1}
			}
			if (percentage2 || (percentage2 == null)) {
				params = {...params, percentage2: percentage2}
			}
			if (percentage3 || (percentage3 == null)) {
				params = {...params, percentage3: percentage3}
			}
			params_create = {project_id: project_id, ...params};

			if (supplier_title) {
				supplier_title = await SupplierTitle.update(params, {where: { project_id: project_id, category_id: category_id }});
				supplier_title = params;
			} else {
				if (!supplier_title) {
					supplier_title = await SupplierTitle.create(params_create);
					if (supplier_title) {
						supplier_title = supplier_title.dataValues;
					}
				}
			}

			return res.json({
				response: 0,
				err: ""
			})
		} catch (err) {
			//next(err);
			console.log('err:',err)
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	deleteSupplierTitle: async (req, res, next) => {
		try {
			let project_id = parseInt(req.body.project_id);

			if (!project_id || isNaN(project_id) || (project_id <= 0)) {
				project_id = null;
				return res.json({
					response: 2,
					err: "No project id"
				})
			}

			const response = await SupplierTitle.destroy({
				where: { project_id: project_id },
				force: true
			})

			return res.json({
				response: 0,
				err: ""
			})
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	}
};


export default SupplierController;
