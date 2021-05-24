import moment from 'moment';
import utils from '../utils/utils';
const sequelize = require('../models');
const { Country, Budget, BudgetCategory, BudgetTitle, Project, BudgetType, BudgetStatus, Payment, Supplier, SupplierJobTitle } = sequelize.models;
var path = require('path');
var apikey = require("apikeygen").apikey;
var awsSDK = require('../utils/awsSDK')

const BudgetController = {
	
	getAll: async (req, res, next) => {
		try {
			let budget = null;
			budget = await Budget.findAll({
				/*order: [
					['pos', 'ASC']
				]*/
			});
			budget = budget.sort(function(a, b) {
				return a.pos - b.pos;
			});
			res.json(budget);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	getProjectBudgets: async (req, res, next) => {
		try {
			let project_id = parseInt(req.params.project_id);

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = 0;
			}

			if (project_id <= 0) {
				return res.json({
					response: 2,
					err: 'No Project Id'
				})
			}

			let budget = null;
			//budget = await Budget.findAll({ where: { project_id: project_id } });
			budget = await Budget.findAll({ 
				where: { project_id: project_id }/*, 
				order: [
					['pos', 'ASC']
				]*/
			});


			budget = budget.sort(function(a, b) {
				return a.pos - b.pos;
			});

			res.json(budget);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	getBudget: async (req, res, next) => {
		try {
			let budget_id = parseInt(req.params.budget_id);

			if (isNaN(budget_id) || (budget_id <= 0)) {
				budget_id = 0;
			}

			if (budget_id <= 0) {
				return res.json({
					response: 2,
					err: 'No Budget Id'
				})
			}

			let budget = null;
			budget = await Budget.findOne({ where: { id: budget_id } });
			if (budget) {
				budget = budget.dataValues;
			}

			res.json(budget);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	create: async (req, res, next) => {

		try {
			let budget_id = parseInt(req.body.budget_id);
			let pos = parseInt(req.body.pos);
			let project_id = parseInt(req.body.project_id);
			let price = parseInt(req.body.price);
			//let vat = parseInt(req.body.vat);
			let budget_type_id = req.body.budget_type_id;
			let budget_status_id = req.body.budget_status_id;
			let budget_category_id = req.body.budget_category_id;
			let account_id = parseInt(req.body.account_id);
			let quantity = parseInt(req.body.quantity);
			let comments = req.body.comments;
			let description = req.body.description;
			let supplier_id = parseInt(req.body.supplier_id);
			let supplier_job_title_id = parseInt(req.body.supplier_job_title_id);
			let project_scene_id = parseInt(req.body.project_scene_id);
			let project_shooting_day_id = parseInt(req.body.project_shooting_day_id);
			let attachments = req.body.attachments;
			let text1 = req.body.text1;
			let text2 = req.body.text2;
			let text3 = req.body.text3;
			let number1 = parseInt(req.body.number1);
			let number2 = parseInt(req.body.number2);
			let number3 = parseInt(req.body.number3);

			if (!budget_id || isNaN(budget_id) || (budget_id <= 0)) {
				budget_id = 0;
			}
			if (!pos || isNaN(pos) || (pos <= 0)) {
				pos = 0;
			}
			if (isNaN(supplier_id) || (supplier_id <= 0)) {
				supplier_id = null;
			}
			if (isNaN(supplier_job_title_id) || (supplier_job_title_id <= 0)) {
				supplier_job_title_id = null;
			}
			if (isNaN(number1)) {
				number1 = null;
			}
			if (isNaN(number2)) {
				number2 = null;
			}
			if (isNaN(number3)) {
				number3 = null;
			}

			if (!budget_type_id) {
				budget_type_id = null;
			}

			if (!budget_status_id) {
				budget_status_id = null;
			}
			
			if (!budget_category_id) {
				budget_category_id = null;
			}
			
			if (isNaN(account_id)) {
				account_id = null;
			}

			if (isNaN(quantity) || (quantity <= 0)) {
				quantity = null;
			}

			if (isNaN(project_scene_id) || (project_scene_id <= 0)) {
				project_scene_id = null;
			}

			if (isNaN(project_shooting_day_id) || (project_shooting_day_id <= 0)) {
				project_shooting_day_id = null;
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

			const country = await Country.findOne({where: { id: project.country_id }});
			let vat_precent = 0;
			if (country) {
				vat_precent = country.vat;
				if (country.state && country.state.vat)
				vat_precent = country.state.vat;
			}

			let vat = ((price * vat_precent) / 100);

			let params = {
			}
			if (pos && !isNaN(pos) && (pos > 0)) {
				params = {...params, pos: pos}
			}
			if (project_id && !isNaN(project_id) && (project_id > 0)) {
				params = {...params, project_id: project_id}
			}
			if (price && !isNaN(price) && (price > 0)) {
				params = {...params, price: price}
			}
			//if ((budget_type_id == null) || (budget_type_id && (budget_type_id > 0))) {
				params = {...params, budget_type_id: budget_type_id}
			//}
			//if ((budget_status_id == null) || (budget_status_id && (budget_status_id > 0))) {
				params = {...params, budget_status_id: budget_status_id}
			//}
			//if (budget_category_id) {
				params = {...params, budget_category_id: budget_category_id}
			//}
			if (description && (description.length > 0)) {
				params = {...params, description: description}
			}
			//if (supplier_id && (supplier_id > 0)) {
				params = {...params, supplier_id: supplier_id}
			//}
			if (supplier_job_title_id && (supplier_job_title_id> 0)) {
				params = {...params, supplier_job_title_id: supplier_job_title_id}
			}
			if (account_id) {
				params = {...params, account_id: account_id}
			}
			if (quantity) {
				params = {...params, quantity: quantity}
			}
			if (project_scene_id) {
				params = {...params, project_scene_id: project_scene_id}
			}
			if (project_shooting_day_id) {
				params = {...params, project_shooting_day_id: project_shooting_day_id}
			}
			if (comments && (comments.length > 0)) {
				params = {...params, comments: comments}
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

			let budget = null;
			if (budget_id > 0) {
				budget = await Budget.update(params, {where: { id: budget_id }});
				budget = await Budget.findOne({ where: { id: budget_id }})
				if (budget) {
					budget = budget.dataValues;
				}
			} else {
				budget = await Budget.create(params);
				if (budget) {
					budget = budget.dataValues;
				}
			}

			let budget_types = await BudgetType.findAll({})
			let budget_statuses = await BudgetStatus.findAll({})

			if (budget_types && (budget_types.length > 0)) {
				for (let index3 = 0; index3 < budget_types.length; index3++) {
					let budget_type = budget_types[index3].dataValues;
					if (budget_type && (budget_type.id == budget.budget_type_id)) {
						budget = {...budget, budget_type: budget_type.budget_type}
					}
				}
			}

			if (budget_statuses && (budget_statuses.length > 0)) {
				for (let index3 = 0; index3 < budget_statuses.length; index3++) {
					let budget_status = budget_statuses[index3].dataValues;
					if (budget_status && (budget_status.id == budget.budget_status_id)) {
						budget = {...budget, budget_status: budget_status.budget_status}
					}
				}
			}

			let supplier = null;
			if (supplier_id && (supplier_id > 0)) {
				supplier = await Supplier.findOne({where: { id: supplier_id }})
			}

			let supplier_name = '';
			if (supplier && supplier.supplier_name) {
				supplier_name = supplier.supplier_name;
			}

			if (supplier && (supplier.supplier_job_title_id > 0)) {
				supplier_job_title_id = supplier.supplier_job_title_id;
			}
			
			let supplier_job_title_obj = null;
			if (supplier_job_title_id && (supplier_job_title_id > 0)) {
				supplier_job_title_obj = await SupplierJobTitle.findOne({where: { id: supplier_job_title_id }})
			}

			let supplier_job_title = '';
			if (supplier_job_title_obj && supplier_job_title_obj.supplier_job_title) {
				supplier_job_title = supplier_job_title_obj.supplier_job_title;
			}

			if (budget) {
				if (budget.supplier_name) {
					if (supplier_name && (supplier_name.length > 0)) {
						budget.supplier_name = supplier_name;
					}
				} else {
					budget = {...budget, supplier_name: supplier_name}
				}
				if (budget.supplier_job_title_id) {
					if (supplier_job_title_id && (supplier_job_title_id > 0)) {
						budget.supplier_job_title_id = supplier_job_title_id;
					}
				} else {
					budget = {...budget, supplier_job_title_id: supplier_job_title_id}
				}
				if (budget.supplier_job_title) {
					if (supplier_job_title && (supplier_job_title.length > 0)) {
						budget.supplier_job_title = supplier_job_title;
					}
				} else {
					budget = {...budget, supplier_job_title: supplier_job_title}
				}

				/*if (budget_category_id > 0) {
					let budget_category = await BudgetCategory.findOne({where: { id: budget_category_id }});
					if (budget_category) {
						if (budget.color) {
							budget.color = budget_category.color;
						} else {
							budget = {...budget, color: budget_category.color}
						}
					}
				}*/
			}
			//res.json(budget);
			return res.json({
				response: 0,
				err: "",
				budget: budget
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

	createBudgetList: async (req, res, next) => {
		try {
			//console.log('createBudgetList:',req.body)
			let budgets = req.body;

			if (budgets && (budgets.length > 0)) {

				async function getData() {
					for(var i in budgets) {
						var budget_obj = budgets[i];
						//console.log('budget:',budget_obj)
						if (budget_obj) {
							let budget_id = parseInt(budget_obj.budget_id);
							let pos = parseInt(budget_obj.pos);
							let project_id = parseInt(budget_obj.project_id);
							let price = parseInt(budget_obj.price);
							//let vat = parseInt(budget_obj.vat);
							let budget_type_id = budget_obj.budget_type_id;
							let budget_status_id = budget_obj.budget_status_id;
							let budget_category_id = budget_obj.budget_category_id;
							let account_id = parseInt(budget_obj.account_id);
							let quantity = parseInt(req.body.quantity);
							let comments = budget_obj.comments;
							let description = budget_obj.description;
							let supplier_id = parseInt(budget_obj.supplier_id);
							let attachments = budget_obj.attachments;
							let text1 = budget_obj.text1;
							let text2 = budget_obj.text2;
							let text3 = budget_obj.text3;
							let number1 = parseInt(budget_obj.number1);
							let number2 = parseInt(budget_obj.number2);
							let number3 = parseInt(budget_obj.number3);

							if (!budget_id || isNaN(budget_id) || (budget_id <= 0)) {
								budget_id = 0;
							}
							if (!pos || isNaN(pos) || (pos <= 0)) {
								pos = 0;
							}
							if (isNaN(supplier_id) || (supplier_id <= 0)) {
								supplier_id = null;
							}
							if (isNaN(number1)) {
								number1 = null;
							}
							if (isNaN(number2)) {
								number2 = null;
							}
							if (isNaN(number3)) {
								number3 = null;
							}
							
							if (isNaN(account_id)) {
								account_id = null;
							}

							if (isNaN(quantity) || (quantity <= 0)) {
								quantity = null;
							}
											
							if (!budget_type_id) {
								budget_type_id = null;
							}
				
							if (!budget_status_id) {
								budget_status_id = null;
							}
							
							if (!budget_category_id) {
								budget_category_id = null;
							}
							
							let project = null;
							if (project_id  > 0) {
								project = await Project.findOne({where: { id: project_id }});
							}
				
							const country = await Country.findOne({where: { id: project.country_id }});
							let vat_precent = 0;
							if (country) {
								vat_precent = country.vat;
								if (country.state && country.state.vat)
								vat_precent = country.state.vat;
							}
				
							let vat = ((price * vat_precent) / 100);
				
							let params = {
							}
							if (pos && !isNaN(pos) && (pos > 0)) {
								params = {...params, pos: pos}
							}
							if (project_id && !isNaN(project_id) && (project_id > 0)) {
								params = {...params, project_id: project_id}
							}
							if (price && !isNaN(price) && (price > 0)) {
								params = {...params, price: price}
							}
							//if ((budget_type_id == null) || (budget_type_id && (budget_type_id > 0))) {
								params = {...params, budget_type_id: budget_type_id}
							//}
							//if ((budget_status_id == null) || (budget_status_id && (budget_status_id > 0))) {
								params = {...params, budget_status_id: budget_status_id}
							//}
							//if (budget_category_id) {
								params = {...params, budget_category_id: budget_category_id}
							//}
							if (description && (description.length > 0)) {
								params = {...params, description: description}
							}
							params = {...params, supplier_id: supplier_id}
							if (account_id) {
								params = {...params, account_id: account_id}
							}
							if (quantity) {
								params = {...params, quantity: quantity}
							}
							if (comments && (comments.length > 0)) {
								params = {...params, comments: comments}
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
			
							let budget_table = null;
							if (project && (budget_id > 0)) {
								budget_table = await Budget.update(params, {where: { id: budget_id }});
							} else {
								if (project) {
									budget_table = await Budget.create(params);
									if (budget_table) {
										budget_table = budget_table.dataValues;
									}
								}
							}
						}
					}
					return;
				}
			
				getData()
				.then(() => {
					console.log('Load budgets:',budgets.length)

					return res.json({
						response: 0,
						err: ""
					})
				})
			}
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	delete: async (req, res, next) => {
		try {
			let budget_id = parseInt(req.body.budget_id);

			if (isNaN(budget_id) || (budget_id <= 0)) {
				budget_id = null;
				return res.json({
					response: 2,
					err: "No budget id"
				})
			}

			console.log('delete:',budget_id)

			const response = await Budget.destroy({
				where: { id: budget_id },
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

	getAllProjectBudgets: async (req, res, next) => {
		try {
			let project_id = parseInt(req.params.project_id);

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
					err: 'Project not found.'
				})
			}

			let budget_category_list = [];

			let budget_types = await BudgetType.findAll({})
			let budget_statuses = await BudgetStatus.findAll({})
			let budget_category = await BudgetCategory.findAll({});

			async function getProjectBudgets(project_id) {

				return new Promise(async (resolve,reject)=>{

					let has_budgets = false;
					if (budget_category) {

						for (let index = 0; index < budget_category.length; index++) {
							let budget_category_item = budget_category[index].dataValues;

							if (budget_category_item) {
								
								let budget_title = await BudgetTitle.findOne({where: { project_id: project_id, category_id: budget_category_item.id }})

								budget_category_item = {...budget_category_item,
												budget_title: budget_title,
												budgets: {default:[], canban: []}
											}

								let budgets = await Budget.findAll({ 
									where: { project_id: project_id }/*,
									order: [
										['pos', 'ASC']
									]*/
								});

								budgets = budgets.sort(function(a, b) {
									return a.pos - b.pos;
								});
					
								if (budgets && (budgets.length > 0)) {
									has_budgets = true;
									for (let index2 = 0; index2 < budgets.length; index2++) {
										let budget = budgets[index2].dataValues;

										if (budget && (budget.budget_category_id == budget_category_item.id)) {

											let supplier_id = 0;
											if (budget.supplier_id > 0) {
												supplier_id = budget.supplier_id;
											}
											
											let supplier = null;
											if (supplier_id && (supplier_id > 0)) {
												supplier = await Supplier.findOne({where: { id: supplier_id }})
											}

											let supplier_name = '';
											if (supplier && supplier.supplier_name) {
												supplier_name = supplier.supplier_name;
											}

											let supplier_job_title_id = 0;
											if (supplier && (supplier.supplier_job_title_id > 0)) {
												supplier_job_title_id = supplier.supplier_job_title_id;
											}
											
											let supplier_job_title = null;
											if (supplier_job_title_id && (supplier_job_title_id > 0)) {
												supplier_job_title = await SupplierJobTitle.findOne({where: { id: supplier_job_title_id }})
											}

											let supplier_job_title_name = '';
											if (supplier_job_title && supplier_job_title.supplier_job_title) {
												supplier_job_title_name = supplier_job_title.supplier_job_title;
											}

											if (budget_types && (budget_types.length > 0)) {
												for (let index3 = 0; index3 < budget_types.length; index3++) {
													let budget_type = budget_types[index3].dataValues;
													if (budget_type && (budget_type.id == budget.budget_type_id)) {
														budget = {...budget, budget_type: budget_type.budget_type}
													}
												}
											}

											if (budget_statuses && (budget_statuses.length > 0)) {
												for (let index3 = 0; index3 < budget_statuses.length; index3++) {
													let budget_status = budget_statuses[index3].dataValues;
													if (budget_status && (budget_status.id == budget.budget_status_id)) {
														budget = {...budget, budget_status: budget_status.budget_status}
													}
												}
											}
											
											let budget_status_id = 0;
											if (budget.budget_status_id > 0) {
												budget_status_id = budget.budget_status_id;
											}
											let budget_status = '';
											if (budget.budget_status) {
												budget_status = budget.budget_status;
											}
											let budget_type_id = 0;
											if (budget.budget_type_id > 0) {
												budget_type_id = budget.budget_type_id;
											}
											let budget_type = '';
											if (budget.budget_type) {
												budget_type = budget.budget_type;
											}

											let payments = await Payment.findAll({ where: { project_id: project_id, budget_id: budget.id } });

											let new_budget = {
												'listId': budget_category_item.id,
												'color': budget_category_item.color,
												'id': budget.id,
												'project_id': budget.project_id,
												'pos': budget.pos,
												'expense-description': budget.description,
												'type_id': budget_type_id,
												'type': budget_type,
												'price': budget.price,
												'vat': budget.vat,
												'supplier_id': supplier_id,
												'supplier_name': supplier_name,
												'supplier_job_title_id': supplier_job_title_id,
												'supplier_job_title': supplier_job_title_name,
												'account_id': budget.account_id,
												'quantity': budget.quantity,
												'status_id': budget_status_id,
												'comments': budget.comments,
												'status': budget_status,
												'attachments': budget.attachments,
												'category_id': budget.category_id,
												'category': budget.category,
												'payments': payments
											}

											let text1 = budget.text1;
											if (budget_title && budget_title.text1) {
												new_budget = {...new_budget, text1: text1}
											}

											let text2 = budget.text2;
											if (budget_title && budget_title.text2) {
												new_budget = {...new_budget, text2: text2}
											}

											let text3 = budget.text3;
											if (budget_title && budget_title.text3) {
												new_budget = {...new_budget, text3: text3}
											}

											let number1 = budget.number1;
											if (budget_title && budget_title.number1) {
												new_budget = {...new_budget, number1: number1}
											}

											let number2 = budget.number2;
											if (budget_title && budget_title.number2) {
												new_budget = {...new_budget, number2: number2}
											}

											let number3 = budget.number3;
											if (budget_title && budget_title.number3) {
												new_budget = {...new_budget, number3: number3}
											}

											budget_category_item.budgets.default.push(new_budget)
										}
									}
									if (1 || 
										(budget_category_item && budget_category_item.budgets && 
										(
											(budget_category_item.budgets.default && (budget_category_item.budgets.default.length > 0)) ||
											(budget_category_item.budgets.canban && (budget_category_item.budgets.canban.length > 0))
										))) {
										budget_category_list.push(budget_category_item);
									}
								} else {
									budget_category_list.push(budget_category_item);
								}
							} else {
							}
						}
					}
					resolve();					  
				})
			}
		
			const pormises = []
			pormises.push(getProjectBudgets(project_id))
			/*if (users && (users.length > 0)) {
			  for (var i = 0; i < users.length; i++) {				
				pormises.push(getUserBudgets(project_id))
			  }
			}*/
			await Promise.all(pormises)

			return res.json(budget_category_list)

		} catch (error) {
			console.log('error:',error)
			return res.json({
				response: 1,
				err: error
			})
		}
	},

	getAllBudgetFiles: async (req, res, next) => {
		try {
			let budget_id = parseInt(req.params.budget_id);

			if (isNaN(budget_id) || (budget_id <= 0)) {
				budget_id = null;
				return res.json({
					response: 2,
					err: "No budget id"
				})
			}

			let budget = null;
			if (budget_id  > 0) {
				budget = await Budget.findOne({where: { id: budget_id }});
			}

			if (!budget) {
				return res.json({
					response: 2,
					err: 'No budget found'
				})
			}

			return res.json(budget.attachments)						

		} catch (error) {
			return res.json({
				response: 1,
				err: error
			})
		}
	},

	fileAdd: async (req, res, next) => {
		try {
			let budget_id = parseInt(req.body.budget_id);
			let text = req.body.text;

			if (!text) {
				text = '';
			}

			if (isNaN(budget_id) || (budget_id <= 0)) {
				budget_id = null;
				return res.json({
					response: 2,
					err: "No budget id"
				})
			}

			const budget = await Budget.findOne({where: { id: budget_id }});

			if (!budget) {
				return res.json({
					response: 2,
					err: 'No budget found'
				})
			}

			let attachments = budget.attachments;

			var folder = 'budget/'+budget_id+'/'

			let is_add_file_to_s3 = false;

			async function addFileToS3(file_path) {
				return new Promise(async (resolve,reject)=>{

					console.log('Budget File Upload:',file_path)
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
				const response = await Budget.update({attachments: attachments}, {where: { id: budget_id }});
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
			let budget_id = parseInt(req.body.budget_id);
			let file_id = req.body.file_id;
			let file_name = req.body.file_name;

			if (isNaN(budget_id) || (budget_id <= 0)) {
				budget_id = null;
				return res.json({
					response: 2,
					err: "No budget id"
				})
			}

			console.log('Budget File Delete:',budget_id)

			const budget = await Budget.findOne({where: { id: budget_id }});

			if (!budget) {
				return res.json({
					response: 2,
					err: 'No budget found'
				})
			}

			let attachments = budget.attachments;

			{
				var folder = 'budget/'+budget_id+'/'

				console.log('Budget File Delete:',file_name)
				awsSDK.delete_file_from_s3 (folder ,file_name, async function(err, result) {

					if (err) {
						console.log('err:', err);
						return res.json({
							response: 1,
							err: err
						})
					} else {

						var filtered = attachments.filter(function(el) { return el.file_id != file_id; }); 

						const response = await Budget.update({attachments: filtered}, {where: { id: budget_id }});

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

	getBudgetCategory: async (req, res, next) => {
		try {
			const budget_category_list = await BudgetCategory.findAll({});
			res.json(budget_category_list);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	addBudgetCategory: async (req, res, next) => {
		try {
			let budget_category_id = parseInt(req.body.budget_category_id);
			let budget_category = req.body.budget_category;
			let color = req.body.color;

			if (isNaN(budget_category_id) || (budget_category_id <= 0)) {
				budget_category_id = 0;
			}

			if (!color) {
				color = utils.getColor();
			}

			let budget_category_result = null;
			let params = {
				budget_category: budget_category,
				color: color
			}

			if (budget_category_id > 0) {
				budget_category_result = await BudgetCategory.update(params, {where: { id: budget_category_id }});
				budget_category_result = params;
			} else {
				budget_category_result = await BudgetCategory.create(params);
				if (budget_category_result) {
					budget_category_result = budget_category_result.dataValues;
				}
			}

			//res.json(budget);
			return res.json({
				response: 0,
				err: "",
				budget_category: budget_category_result
			})
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	deleteBudgetCategory: async (req, res, next) => {
		try {
			let budget_category_id = parseInt(req.body.budget_category_id);

			if (isNaN(budget_category_id) || (budget_category_id <= 0)) {
				budget_category_id = null;
				return res.json({
					response: 2,
					err: "No budget category id"
				})
			}

			console.log('Delete budget Category:',budget_category_id)

			const response = await BudgetCategory.destroy({
				where: { id: budget_category_id },
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

	getBudgetType: async (req, res, next) => {
		try {
			const budget_type_list = await BudgetType.findAll({});
			res.json(budget_type_list);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	addBudgetType: async (req, res, next) => {
		try {
			let budget_type_id = parseInt(req.body.budget_type);
			let budget_type = req.body.budget_type;
			
			if (isNaN(budget_type_id) || (budget_type_id <= 0)) {
				budget_type_id = 0;
			}

			let response = null;
			if (budget_type_id > 0) {
				response = await BudgetType.update({
					budget_type: budget_type
				}, {where: { id: budget_type_id }});
				response = {budget_type: budget_type}
			} else {
				response = await BudgetType.create({
					budget_type: budget_type
				});
				if (response) {
					response = response.dataValues;
				}
			}

			//res.json(budget);
			return res.json({
				response: 0,
				err: "",
				budget_type: response
			})
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	deleteBudgetType: async (req, res, next) => {
		try {
			let budget_type_id = parseInt(req.body.budget_type_id);

			if (isNaN(budget_type_id) || (budget_type_id <= 0)) {
				budget_type_id = null;
				return res.json({
					response: 2,
					err: "No budget type id"
				})
			}

			console.log('Delete Budget Type:',budget_type_id)

			const response = await BudgetType.destroy({
				where: { id: budget_type_id },
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

	getBudgetStatus: async (req, res, next) => {
		try {
			const budget_status_list = await BudgetStatus.findAll({});
			res.json(budget_status_list);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	addBudgetStatus: async (req, res, next) => {
		try {

			let budget_status_id = parseInt(req.body.budget_status_id);
			let budget_status = req.body.budget_status;

			if (isNaN(budget_status_id) || (budget_status_id <= 0)) {
				budget_status_id = 0;
			}

			let response = null;
			if (budget_status_id > 0) {
				response = await BudgetStatus.update({
					budget_status: budget_status
				}, {where: { id: budget_status_id }});
				response = {budget_status: budget_status}
			} else {
				response = await BudgetStatus.create({
					budget_status: budget_status
				});
				if (response) {
					response = response.dataValues;
				}
			}

			//res.json(budget);
			return res.json({
				response: 0,
				err: "",
				budget_status: response
			})
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	deleteBudgetStatus: async (req, res, next) => {
		try {
			let budget_status_id = parseInt(req.body.budget_status_id);

			if (isNaN(budget_status_id) || (budget_status_id <= 0)) {
				budget_status_id = null;
				return res.json({
					response: 2,
					err: "No budget status id"
				})
			}

			console.log('Delete Budget Status:',budget_status_id)

			const response = await BudgetStatus.destroy({
				where: { id: budget_status_id },
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

	getBudgetTitle: async (req, res, next) => {
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
				const budget_title = await BudgetTitle.findAll({where: {project_id: project_id}});
				res.json(budget_title);
			} else {
				let budget_title = [];
				res.json(budget_title);
			}
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	createBudgetTitle: async (req, res, next) => {
		try {
			let project_id = parseInt(req.body.project_id);
			let category_id = parseInt(req.body.category_id);
			let text1 = req.body.text1;
			let text2 = req.body.text2;
			let text3 = req.body.text3;
			let number1 = req.body.number1;
			let number2 = req.body.number2;
			let number3 = req.body.number3;

			if (!project_id || isNaN(project_id) || (project_id <= 0)) {
				project_id = 0;
			}

			if (!category_id || isNaN(category_id) || (category_id <= 0)) {
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

			let budget_categories = null;
			let budget_category = null;
			if (category_id  > 0) {
				budget_category = await BudgetCategory.findOne({where: { id: category_id }});
			} else {
				budget_categories = await BudgetCategory.findAll({});
			}

			if (!budget_categories && !budget_category) {
				return res.json({
					response: 3,
					err: 'No budget category found'
				})
			}

			let budget_title = null;
			let budget_titles = null;
			if (category_id  > 0) {
				budget_title = await BudgetTitle.findOne({where: { project_id: project_id, category_id: category_id }});
			} else {
				budget_titles = await BudgetTitle.findAll({where: { project_id: project_id }});
			}

			if ((!category_id || (category_id <= 0)) && 
				budget_titles && (budget_titles.length > 0)) {
				return res.json({
					response: 4,
					err: 'Budget tilte exist'
				})
			}

			let params = {
			}
			let params_create = {
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
			params_create = {project_id: project_id, ...params};
			if (category_id > 0) {
				params_create = {category_id: category_id, ...params_create};
			}

			if (category_id > 0) {
				if (budget_title) {
					budget_title = await BudgetTitle.update(params, {where: { project_id: project_id, category_id: category_id }});
					budget_title = params;
				} else {
					if (!budget_title) {
						budget_title = await BudgetTitle.create(params_create);
						if (budget_title) {
							budget_title = budget_title.dataValues;
						}
					}
				}

				return res.json({
					response: 0,
					err: ""
				})
			} else {
				async function getData() {
					for(var i in budget_categories) {
						var category = budget_categories[i];
						if (category && (category.id > 0)) {
							let params_create_obj = {category_id: category.id, ...params_create};
							let budget_title_obj = await BudgetTitle.create(params_create_obj);
						}
					}
					return;
				}

				getData()
				.then(() => {
					return res.json({
						response: 0,
						err: ""
					})
				})

			}
		} catch (err) {
			//next(err);
			console.log('err:',err)
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	deleteBudgetTitle: async (req, res, next) => {
		try {
			let project_id = parseInt(req.body.project_id);
			let category_id = parseInt(req.body.category_id);

			if (!project_id || isNaN(project_id) || (project_id <= 0)) {
				project_id = null;
				return res.json({
					response: 2,
					err: "No project id"
				})
			}

			if (!category_id || isNaN(category_id) || (category_id <= 0)) {
				category_id = 0;
			}

			let budget_categories = null;
			let budget_category = null;
			if (category_id  > 0) {
				budget_category = await BudgetCategory.findOne({where: { id: category_id }});
			} else {
				budget_categories = await BudgetCategory.findAll({});
			}

			if (category_id  > 0) {
				/*let budget_title = await BudgetTitle.findOne({where: { project_id: project_id, category_id: category_id }});
				if (budget_title) {
					return res.json({
						response: 3,
						err: "Budget title is not empty"
					})
				}*/

				const response = await BudgetTitle.destroy({
					where: { project_id: project_id, category_id: category_id },
					force: true
				})
	
				return res.json({
					response: 0,
					err: ""
				})
	
			} else {
				/*let budget_title = await BudgetTitle.findOne({where: { project_id: project_id }});
				if (budget_title) {
					return res.json({
						response: 3,
						err: "Budget title is not empty"
					})
				}*/

				const response = await BudgetTitle.destroy({
					where: { project_id: project_id },
					force: true
				})

				/*async function getData() {
					for(var i in budget_categories) {
						var category = budget_categories[i];
						if (category && (category.id > 0)) {
							const response = await BudgetTitle.destroy({
								where: { project_id: project_id, category_id: category.id },
								force: true
							})
						}
					}
					return;
				}

				getData()
				.then(() => {
					return res.json({
						response: 0,
						err: ""
					})
				})*/
				return res.json({
					response: 0,
					err: ""
				})
			}
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	}
};

export default BudgetController;
