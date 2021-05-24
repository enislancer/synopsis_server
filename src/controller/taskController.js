import moment from 'moment';
const sequelize = require('../models');
const { User, Task, TaskTitle, Project, TaskCategory, TaskType, TaskStatus, Supplier, Budget, Payment, Character, ProjectScript, ProjectShootingDay } = sequelize.models;
var path = require('path');
var apikey = require("apikeygen").apikey;
var awsSDK = require('../utils/awsSDK')
import utils from '../utils/utils';
import projectController from '../controller/projectController';

const TaskController = {

	getAll: async (req, res, next) => {
		try {
			let task = null;
			task = await Task.findAll({
				/*order: [
					['pos', 'ASC']
				]*/
			});
			task = task.sort(function(a, b) {
				return a.pos - b.pos;
			});
			res.json(task);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	getProjectTasks: async (req, res, next) => {
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

			//let task = null;
			//task = await task.findAll({ where: { project_id: project_id } });
			const task = await Task.findAll({
				where: { project_id: project_id }/*,
				order: [
					['pos', 'ASC']
				]*/
			});

			task = task.sort(function(a, b) {
				return a.pos - b.pos;
			});

			res.json(task);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	getTask: async (req, res, next) => {
		try {
			let task_id = parseInt(req.params.task_id);

			if (isNaN(task_id) || (task_id <= 0)) {
				task_id = 0;
			}

			if (task_id <= 0) {
				return res.json({
					response: 2,
					err: 'No Task Id'
				})
			}

			let task = null;
			task = await Task.findOne({ where: { id: task_id } });
			res.json(task);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	create: async (req, res, next) => {
		try {
			console.log('Task Create:',req.body)
			let task_id = parseInt(req.body.task_id);
			let pos = parseInt(req.body.pos);
			let task_name = req.body.task_name;
			let project_id = parseInt(req.body.project_id);
			let task_category_id = parseInt(req.body.task_category_id);
			let task_type_id = req.body.task_type_id;
			let task_status_id = req.body.task_status_id;
			let supplier_id = parseInt(req.body.supplier_id);
			let character_id = parseInt(req.body.character_id);
			//let scene_id = parseInt(req.body.scene_id);
			//let shooting_day_id = parseInt(req.body.shooting_day_id);
			let synofsis = req.body.synofsis;
			let location = req.body.location;
			let price = parseInt(req.body.price);
			let comments = req.body.comments;
			let parent_task_id = parseInt(req.body.parent_task_id);
			let due_date = req.body.due_date;
			let project_scene_id = parseInt(req.body.project_scene_id);
			let project_shooting_day_id = parseInt(req.body.project_shooting_day_id);
			let project_scene_text = req.body.project_scene_text;
			let project_scene_location = req.body.project_scene_location;
			let text1 = req.body.text1;
			let text2 = req.body.text2;
			let text3 = req.body.text3;
			let number1 = parseInt(req.body.number1);
			let number2 = parseInt(req.body.number2);
			let number3 = parseInt(req.body.number3);

			if (!task_id || isNaN(task_id) || (task_id <= 0)) {
				task_id = 0;
			}

			if (!task_category_id || isNaN(task_category_id) || (task_category_id <= 0)) {
				task_category_id = null;
			}

			if (!pos || isNaN(pos) || (pos <= 0)) {
				pos = 0;
			}

			if (isNaN(supplier_id) || (supplier_id <= 0)) {
				supplier_id = null;
			}

			if (isNaN(character_id) || (character_id <= 0)) {
				character_id = null;
			}

			// if (!scene_id || isNaN(scene_id) || (scene_id <= 0)) {
			// 	scene_id = null;
			// }

			// if (!shooting_day_id || isNaN(shooting_day_id) || (shooting_day_id <= 0)) {
			// 	shooting_day_id = null;
			// }

			if (!synofsis) {
				synofsis = null;
			}

			if (!location) {
				location = null;
			}

			if (isNaN(project_scene_id) || (project_scene_id <= 0)) {
				project_scene_id = null;
			}

			if (isNaN(project_shooting_day_id) || (project_shooting_day_id <= 0)) {
				project_shooting_day_id = null;
			}

			if (!project_scene_text) {
				project_scene_text = null;
			}

			if (!project_scene_location) {
				project_scene_location = null;
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

			let project = null;
			if (project_id  > 0) {
				project = await Project.findOne({where: { id: project_id }});
			}

			let company_id = 0;
			if (project) {
				company_id = project.company_id;
			}

			if ((task_id <= 0) && !project) {
				return res.json({
					response: 2,
					err: 'No project found'
				})
			}

			let params = {
			}
			if (pos && !isNaN(pos) && (pos > 0)) {
				params = {...params, pos: pos}
			}
			if (task_name && (task_name.length > 0)) {
				params = {...params, task_name: task_name}
			}
			if (project_id && !isNaN(project_id) && (project_id > 0)) {
				params = {...params, project_id: project_id}
			}
			//if (task_category_id && !isNaN(task_category_id) && (task_category_id > 0)) {
				params = {...params, task_category_id: task_category_id}
			//}
			//if ((task_type_id == null) || (task_type_id && (task_type_id > 0))) {
				params = {...params, task_type_id: task_type_id}
			//}
			//if ((task_status_id == null) || (task_status_id && (task_status_id > 0))) {
				params = {...params, task_status_id: task_status_id}
			//}
			params = {...params, supplier_id: supplier_id}
			params = {...params, character_id: character_id}
			if (price && !isNaN(price) && (price > 0)) {
				params = {...params, price: price}
			}
			if (comments && (comments.length > 0)) {
				params = {...params, comments: comments}
			}
			// if (scene_id && (scene_id.length > 0)) {
			// 	params = {...params, scene_id: scene_id}
			// }
			// if (shooting_day_id && (shooting_day_id.length > 0)) {
			// 	params = {...params, shooting_day_id: shooting_day_id}
			// }
			if (synofsis && (synofsis.length > 0)) {
				params = {...params, synofsis: synofsis}
			}
			if (location && (location.length > 0)) {
				params = {...params, location: location}
			}
			if (parent_task_id && !isNaN(parent_task_id) && (parent_task_id > 0)) {
				params = {...params, parent_task_id: parent_task_id}
			} else {
				params = {...params, parent_task_id: 0}
			}
			if (due_date) {
				params = {...params, due_date: due_date}
			}
			if (project_scene_id) {
				params = {...params, project_scene_id: project_scene_id}
			}
			if (project_shooting_day_id) {
				params = {...params, project_shooting_day_id: project_shooting_day_id}
			}
			if (project_scene_text) {
				params = {...params, project_scene_text: project_scene_text}
			}
			if (project_scene_location) {
				params = {...params, project_scene_location: project_scene_location}
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

			let supplier = null;
			if (supplier_id && (supplier_id > 0)) {
				supplier = await Supplier.findOne({where: { id: supplier_id }})
			}

			let supplier_name = '';
			if (supplier && supplier.supplier_name) {
				supplier_name = supplier.supplier_name;
			}

			let task = null;
			if (task_id > 0) {
				task = await Task.findOne({ where: { id: task_id }})
			}
			if ((task_id > 0) && task) {
				if (task && (task.supplier_id != supplier_id)) {

					let task_category_obj = await TaskCategory.findOne({where: { id: task.task_category_id }});
					if (task_category_obj && task_category_obj.dataValues) {
						let color = '';
						let params2 = {
							supplier_id: supplier_id,
							project_id: project_id,
							task_category: task_category_obj.dataValues.task_category,
							task_category_name: task_category_obj.dataValues.task_category_name,
							shooting_day_id: task_category_obj.dataValues.shooting_day_id,
							color: color
						}

						let task_category_obj2 = null
						if (supplier_id && (supplier_id > 0)) {
							task_category_obj2 = await TaskCategory.findOne({where: { supplier_id: supplier_id, project_id: project_id, task_category: task_category_obj.dataValues.task_category }});
						}
			
						let task_category_id = 0;
						if (task_category_obj2 && (task_category_obj2.dataValues.id > 0)) {
							task_category_id = task_category_obj2.dataValues.id;
						} else {
							task_category_obj2 = await TaskCategory.create(params2);
							if (task_category_obj2) {
								task_category_obj2 = task_category_obj2.dataValues;
								task_category_id = task_category_obj2.id;
							}
						}
						params = {...params, task_category_id: task_category_id}
					}

					// Update projects script props;
					let project_script_result = null;
					if (task.project_scene_id > 0) {
						let chapter_number = parseInt(task.project_scene_id / 100);
						let scene_number = parseInt((parseInt(task.project_scene_id) - parseInt(task.project_scene_id / 100)) / 100);
		
						let update_data = false;
						let project_script = await ProjectScript.findOne({where: { project_id: project_id, chapter_number: chapter_number }});
						if (project_script && project_script.script) {
							let script = project_script.script;
							if (script) {

								for (var i = 0; i < script.scenes.length; i++) {
									let scene = script.scenes[i];
									if (scene && (scene.chapter_number == chapter_number) && (scene.scene_number == scene_number)) {
										for (var j = 0; j < scene.props.length; j++) {
											let prop = scene.props[j];
											if (prop && (prop.def == task.task_name) && (prop.supplier_id == task.supplier_id)) {
												scene.props[j].supplier_id = supplier_id;
												if (supplier_name && (supplier_name.length > 0)) {
													scene.props[j].supplier_name = supplier_name;
												}
												update_data = true;
											}
										}

										for (var j = 0; j < scene.makeups.length; j++) {
											let makeup = scene.makeups[j];
											if (makeup && (makeup.def == task.task_name) && (makeup.supplier_id == task.supplier_id)) {
												scene.makeups[j].supplier_id = supplier_id;
												if (supplier_name && (supplier_name.length > 0)) {
													scene.makeups[j].supplier_name = supplier_name;
												}
												update_data = true;
											}
										}

										for (var i = 0; j < scene.clothes.length; j++) {
											let cloth = scene.clothes[j];
											if (cloth && (cloth.def == task.task_name) && (cloth.supplier_id == task.supplier_id)) {
												scene.clothes[j].supplier_id = supplier_id;	
												if (supplier_name && (supplier_name.length > 0)) {
													scene.clothes[j].supplier_name = supplier_name;
												}
												update_data = true;
											}
										}

										for (var i = 0; j < scene.specials.length; j++) {
											let specials = scene.specials[j];
											if (specials && (specials.def == task.task_name) && (specials.supplier_id == task.supplier_id)) {
												scene.specials[j].supplier_id = supplier_id;	
												if (supplier_name && (supplier_name.length > 0)) {
													scene.specials[j].supplier_name = supplier_name;
												}
												update_data = true;
											}
										}

										for (var i = 0; j < scene.others.length; j++) {
											let other = scene.others[j];
											if (other && (other.def == task.task_name) && (other.supplier_id == task.supplier_id)) {
												scene.others[j].supplier_id = supplier_id;	
												if (supplier_name && (supplier_name.length > 0)) {
													scene.others[j].supplier_name = supplier_name;
												}
												update_data = true;
											}
										}
									}
								}

								if (update_data) {
									let script_params = {
										script: script
									}
									project_script_result = await ProjectScript.update(script_params, {where: { project_id: project_id, chapter_number: chapter_number }});

									const project_scene_list = [];//await ProjectScene.findAll({where: { project_id: project_id }});
									const project_script_list = await ProjectScript.findAll({where: { project_id: project_id }});
						
									if (project_script_list) {
										for (var j = 0; j < project_script_list.length; j++) {
											let project_script = project_script_list[j].dataValues;
						
											if (project_script && project_script.script && project_script.script.scenes && (project_script.script.scenes.length > 0)) {
												for (var k = 0; k < project_script.script.scenes .length; k++) {
													let scene = project_script.script.scenes[k];
													if (scene) {
														project_scene_list.push(scene)
													}
												}
											}
										}
									}
						

									if (project_scene_list && (project_scene_list.length > 0)) {

										let project_shooting_day = await ProjectShootingDay.findAll({ 
											where: { project_id: project_id }/*, 
											order: [
												['pos', 'ASC']
											]*/
										});
										project_shooting_day = project_shooting_day.sort(function(a, b) {
											return a.pos - b.pos;
										});							
										for (var j = 0; j < project_shooting_day.length; j++) {
											let shooting_day_obj = project_shooting_day[j].dataValues;
											if (shooting_day_obj && shooting_day_obj.shooting_day) {
												let shooting_day = shooting_day_obj.shooting_day;
												let update_shooting_day = false;
												if (shooting_day && shooting_day.scenes && (shooting_day.scenes.length > 0)) {
													for (var k = 0; k < shooting_day.scenes.length; k++) {
														let scene = shooting_day.scenes[k];
														if (scene) {
															for (var k1 = 0; k1 < scene.length; k1++) {
																let scene1 = scene[k1];
																if (scene1) {
																	for (var l = 0; l < project_scene_list.length; l++) {
																		let project_scene = project_scene_list[l];
																		if (project_scene && 
																			(project_scene.chapter_number == scene1.chapter_number) &&
																			(project_scene.scene_number == scene1.scene_number)
																			) {
																			shooting_day.scenes[k][k1] = project_scene;
																			update_shooting_day = true;
																		}
																	}
																}
															}
														}
													}
												}
												if (update_shooting_day) {
													let params1 = {
														project_id: project_id,
														max_shooting_days: shooting_day_obj.max_shooting_days,
														params: shooting_day_obj.params,
														shooting_day: shooting_day
													}
													let project_shooting_day = await ProjectShootingDay.update(params1, {where: { id: shooting_day_obj.id }});
												}				
											}
										}
									}
								}
							}
						}
					}
				}
				task = await Task.update(params, {where: { id: task_id }});
				task = await Task.findOne({ where: { id: task_id }})
				if (task) {
					task = task.dataValues;
				}
			} else {
				task = await Task.create(params);
				if (task) {
					task = task.dataValues;
				}
			}

			let task_types = await TaskType.findAll({})
			let task_statuses = await TaskStatus.findAll({})

			if (task_types && (task_types.length > 0)) {
				for (let index3 = 0; index3 < task_types.length; index3++) {
					let task_type = task_types[index3].dataValues;
					if (task_type && (task_type.id == task.task_type_id)) {
						task = {...task, type: task_type.task_type}
					}
				}
			}

			if (task_statuses && (task_statuses.length > 0)) {
				for (let index3 = 0; index3 < task_statuses.length; index3++) {
					let task_status = task_statuses[index3].dataValues;
					if (task_status && (task_status.id == task.task_status_id)) {
						task = {...task, status: task_status.task_status}
					}
				}
			}

			/*if (task_category_id > 0) {
				let task_category = await TaskCategory.findOne({where: { id: task_category_id }});
				if (task_category) {
					if (task.color) {
						task.color = task_category.color;
					} else {
						task = {...task, color: task_category.color}
					}
				}
			}*/

			//let org_task = {...task, 'description': task.task_name, 'listId': task.task_category_id}

			//let tasks = await Task.findAll({ where: { project_id: project_id }});
			let suppliers = await Supplier.findAll({where: { company_id: company_id }});
			let budgets = await Budget.findAll({ where: { project_id: project_id }});
			/*for(var i in budgets) {
				var budget = budgets[i];
				if (budget) {
					let payments = await Payment.findAll({ where: { project_id: project_id, budget_id: budget.id }});
					budgets[i] = {...budgets[i], payments: payments}
				}
			}*/
			utils.getProjectTask(project_id, project, function (err, tasks) {
				if (err) {
					return res.json({
						response: 3,
						err: err
					})
				} else {
					let respose = {
						project_id: project_id,
						task: task,
						tasks: tasks
					}
		
					return res.json(respose)
				}
			});
			
		} catch (err) {
			//next(err);
			console.log('err:',err)
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	createTaskList: async (req, res, next) => {
		try {
			//console.log('createTaskList:',req.body)
			let tasks = req.body;

			if (tasks && (tasks.length > 0)) {

				async function getData() {
					for(var i in tasks) {
						var task_obj = tasks[i];
						//console.log('task:',task_obj)
						if (task_obj /*&& task_obj.task_name && (task_obj.task_name.length > 0)*/) {
							let task_id = parseInt(task_obj.task_id);
							let pos = parseInt(task_obj.pos);
							let task_name = task_obj.task_name;
							let project_id = parseInt(task_obj.project_id);
							let task_category_id = parseInt(task_obj.task_category_id);
							let task_type_id = task_obj.task_type_id;
							let task_status_id = task_obj.task_status_id;
							let supplier_id = parseInt(task_obj.supplier_id);
							let character_id = parseInt(task_obj.character_id);
							let scene_id = parseInt(task_obj.scene_id);
							let shooting_day_id = parseInt(task_obj.shooting_day_id);
							let price = parseInt(task_obj.price);
							let comments = task_obj.comments;
							let parent_task_id = parseInt(task_obj.parent_task_id);
							let due_date = task_obj.due_date;
							let attachments = task_obj.attachments;
							let text1 = task_obj.text1;
							let text2 = task_obj.text2;
							let text3 = task_obj.text3;
							let number1 = parseInt(task_obj.number1);
							let number2 = parseInt(task_obj.number2);
							let number3 = parseInt(task_obj.number3);
				
							if (!task_id || isNaN(task_id) || (task_id <= 0)) {
								task_id = 0;
							}

							if (!pos || isNaN(pos) || (pos <= 0)) {
								pos = 0;
							}
							
							if (isNaN(supplier_id) || (supplier_id <= 0)) {
								supplier_id = null;
							}

							if (isNaN(character_id) || (character_id <= 0)) {
								character_id = null;
							}

							if (isNaN(scene_id) || (scene_id <= 0)) {
								scene_id = null;
							}
				
							if (isNaN(shooting_day_id) || (shooting_day_id <= 0)) {
								shooting_day_id = null;
							}
				
							if (!task_type_id) {
								task_type_id = null;
							}
				
							if (!task_status_id) {
								task_status_id = null;
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
				
							let project = null;
							if (project_id  > 0) {
								project = await Project.findOne({where: { id: project_id }});
							}

							let params = {
							}
							if (pos && !isNaN(pos) && (pos > 0)) {
								params = {...params, pos: pos}
							}
							if (task_name && (task_name.length > 0)) {
								params = {...params, task_name: task_name}
							}
							if (project_id && !isNaN(project_id) && (project_id > 0)) {
								params = {...params, project_id: project_id}
							}
							//if (task_category_id && !isNaN(task_category_id) && (task_category_id > 0)) {
								params = {...params, task_category_id: task_category_id}
							//}
							//if ((task_type_id == null) || (task_type_id && (task_type_id > 0))) {
								params = {...params, task_type_id: task_type_id}
							//}
							//if ((task_status_id == null) || (task_status_id && (task_status_id > 0))) {
								params = {...params, task_status_id: task_status_id}
							//}
							params = {...params, supplier_id: supplier_id}
							params = {...params, character_id: character_id}
							if (price && !isNaN(price) && (price > 0)) {
								params = {...params, price: price}
							}
							if (comments && (comments.length > 0)) {
								params = {...params, comments: comments}
							}
							if (scene_id && (scene_id.length > 0)) {
								params = {...params, scene_id: scene_id}
							}
							if (shooting_day_id && (shooting_day_id.length > 0)) {
								params = {...params, shooting_day_id: shooting_day_id}
							}				
							if (parent_task_id && !isNaN(parent_task_id) && (parent_task_id > 0)) {
								params = {...params, parent_task_id: parent_task_id}
							} else {
								params = {...params, parent_task_id: 0}
							}
							if (due_date) {
								params = {...params, due_date: due_date}
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

							if (task_id > 0) {
								const response = await Task.update(params, {where: { id: task_id }});
							} else {
								if (project) {
									const response = await Task.create(params);
								}
							}
						}
					}
					return;
				}
			
				getData()
				.then(() => {
					console.log('Load tasks:',tasks.length)

					//res.json(task);
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

	updateParent: async (req, res, next) => {
		try {
			let task_id = parseInt(req.body.task_id);
			let parent_task_id = parseInt(req.body.parent_task_id);

			if (isNaN(task_id) || (task_id <= 0)) {
				task_id = null;
				return res.json({
					response: 2,
					err: "No task id"
				})
			}

			if (isNaN(parent_task_id) || (parent_task_id <= 0)) {
				parent_task_id = 0;
			}

			console.log('Update Parent:',req.body)

			const response = await Task.update({parent_task_id: parent_task_id}, {where: {id: task_id}});

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

	delete: async (req, res, next) => {
		try {
			let task_id = parseInt(req.body.task_id);

			if (isNaN(task_id) || (task_id <= 0)) {
				task_id = null;
				return res.json({
					response: 2,
					err: "No task id"
				})
			}

			console.log('delete:',task_id)

			let task = null;
			if (task_id > 0) {
				task = await Task.findOne({ where: { id: task_id }})
			}

			const response = await Task.destroy({
				where: { id: task_id },
				force: true
			})

			if ((task_id > 0) && task) {

				// Update projects script props;
				let project_script_result = null;
				if (task.project_scene_id > 0) {
					let chapter_number = parseInt(task.project_scene_id / 100);
					let scene_number = parseInt((parseInt(task.project_scene_id) - parseInt(task.project_scene_id / 100)) / 100);
	
					let update_data = false;
					let project_script = await ProjectScript.findOne({where: { project_id: task.project_id, chapter_number: chapter_number }});
					if (project_script && project_script.script) {
						let script = project_script.script;
						if (script) {

							for (var i = 0; i < script.scenes.length; i++) {
								let scene = script.scenes[i];
								if (scene && (scene.chapter_number == chapter_number) && (scene.scene_number == scene_number)) {
									for (var j = 0; j < scene.props.length; j++) {
										let prop = scene.props[j];
										if (prop && (prop.def == task.task_name) && (prop.supplier_id == task.supplier_id)) {
											//script.scenes[i].props.splice(j, 1);
											scene.props[j].supplier_id = 0;
											scene.props[j].supplier_name = '';
											update_data = true;
										}
									}

									for (var j = 0; j < scene.makeups.length; j++) {
										let makeups = scene.makeups[j];
										if (makeups && (makeups.def == task.task_name) && (makeups.supplier_id == task.supplier_id)) {
											scene.makeups[j].supplier_id = 0;
											scene.makeups[j].supplier_name = '';
											update_data = true;
										}
									}

									for (var i = 0; j < scene.clothes.length; j++) {
										let cloth = scene.clothes[j];
										if (cloth && (cloth.def == task.task_name) && (cloth.supplier_id == task.supplier_id)) {
											scene.clothes[j].supplier_id = 0;
											scene.clothes[j].supplier_name = '';
											update_data = true;
										}
									}

									for (var i = 0; j < scene.specials.length; j++) {
										let specials = scene.specials[j];
										if (specials && (specials.def == task.task_name) && (specials.supplier_id == task.supplier_id)) {
											scene.specials[j].supplier_id = 0;
											scene.specials[j].supplier_name = '';
											update_data = true;
										}
									}

									for (var i = 0; j < scene.others.length; j++) {
										let other = scene.others[j];
										if (other && (other.def == task.task_name) && (other.supplier_id == task.supplier_id)) {
											scene.others[j].supplier_id = 0;
											scene.others[j].supplier_name = '';
											update_data = true;
										}
									}
								}
							}

							if (update_data) {
								let script_params = {
									script: script
								}
								project_script_result = await ProjectScript.update(script_params, {where: { project_id: task.project_id, chapter_number: chapter_number }});

								const project_scene_list = [];//await ProjectScene.findAll({where: { project_id: task.project_id }});
								const project_script_list = await ProjectScript.findAll({where: { project_id: task.project_id }});
					
								if (project_script_list) {
									for (var j = 0; j < project_script_list.length; j++) {
										let project_script = project_script_list[j].dataValues;
					
										if (project_script && project_script.script && project_script.script.scenes && (project_script.script.scenes.length > 0)) {
											for (var k = 0; k < project_script.script.scenes .length; k++) {
												let scene = project_script.script.scenes[k];
												if (scene) {
													project_scene_list.push(scene)
												}
											}
										}
									}
								}
					

								if (project_scene_list && (project_scene_list.length > 0)) {

									let project_shooting_day = await ProjectShootingDay.findAll({ 
										where: { project_id: project_id }/*, 
										order: [
											['pos', 'ASC']
										]*/
									});
									project_shooting_day = project_shooting_day.sort(function(a, b) {
										return a.pos - b.pos;
									});
									for (var j = 0; j < project_shooting_day.length; j++) {
										let shooting_day_obj = project_shooting_day[j].dataValues;
										if (shooting_day_obj && shooting_day_obj.shooting_day) {
											let shooting_day = shooting_day_obj.shooting_day;
											let update_shooting_day = false;
											if (shooting_day && shooting_day.scenes && (shooting_day.scenes.length > 0)) {
												for (var k = 0; k < shooting_day.scenes.length; k++) {
													let scene = shooting_day.scenes[k];
													if (scene) {
														for (var k1 = 0; k1 < scene.length; k1++) {
															let scene1 = scene[k1];
															if (scene1) {
																for (var l = 0; l < project_scene_list.length; l++) {
																	let project_scene = project_scene_list[l];
																	if (project_scene && 
																		(project_scene.chapter_number == scene1.chapter_number) &&
																		(project_scene.scene_number == scene1.scene_number)
																		) {
																		shooting_day.scenes[k][k1] = project_scene;
																		update_shooting_day = true;
																	}
																}
															}
														}
													}
												}
											}
											if (update_shooting_day) {
												let params1 = {
													project_id: task.project_id,
													max_shooting_days: shooting_day_obj.max_shooting_days,
													params: shooting_day_obj.params,
													shooting_day: shooting_day
												}
												let project_shooting_day = await ProjectShootingDay.update(params1, {where: { id: shooting_day_obj.id }});
											}				
										}
									}
								}
							}
						}
					}
				}

				if (task.shooting_day_id > 0) {

					let project_shooting_day = await ProjectShootingDay.findAll({ where: { project_id: project_id } , 
						order: [
							['pos', 'ASC']
						]
					});
					project_shooting_day = project_shooting_day.sort(function(a, b) {
						return a.pos - b.pos;
					});
					for (var j = 0; j < project_shooting_day.length; j++) {
						let shooting_day_obj = project_shooting_day[j].dataValues;
						if (shooting_day_obj && shooting_day_obj.shooting_day) {
							let shooting_day = shooting_day_obj.shooting_day;
							let update_shooting_day = false;
							if (shooting_day && shooting_day.tasks && (shooting_day.tasks.length > 0)) {
								for (var k = 0; k < shooting_day.tasks.length; k++) {
									let task1 = shooting_day.tasks[k];
									if (task1 && (task1.def == task.task_name) && (task1.supplier_id == task.supplier_id)) {
										//shooting_day.tasks.splice(k, 1);
										shooting_day.tasks.supplier_id = 0;
										shooting_day.tasks.supplier_name = '';
										update_shooting_day = true;
									}
								}
							}
							if (update_shooting_day) {
								let params1 = {
									project_id: task.project_id,
									max_shooting_days: shooting_day_obj.max_shooting_days,
									params: shooting_day_obj.params,
									shooting_day: shooting_day
								}
								let project_shooting_day = await ProjectShootingDay.update(params1, {where: { id: shooting_day_obj.id }});
							}				
						}
					}
				}
			} else {
			}

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

	deleteTaskList: async (req, res, next) => {
		try {

			let tasks = req.body;
			if (tasks && (tasks.length > 0)) {
				for (let index = 0; index < tasks.length; index++) {
					let task_id = parseInt(tasks[index]);

					if (isNaN(task_id) || (task_id <= 0)) {
						task_id = null;
						return res.json({
							response: 2,
							err: "No task id"
						})
					}

					console.log('delete:',task_id)

					const response = await Task.destroy({
						where: { id: task_id },
						force: true
					})
				}
			}
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

	getAllProjectUsersTask: async (req, res, next) => {

		try {

			let project_id = parseInt(req.params.project_id);
			let with_task = parseInt(req.params.with_task);

			if (!project_id || isNaN(project_id) || (project_id <= 0)) {
				project_id = null;
				return res.json({
					response: 2,
					err: "No project id"
				})
			}

			if (!with_task || isNaN(with_task) || (with_task <= 0)) {
				with_task = 0;
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

			//console.log('project:',project)
			let company_id = parseInt(project.dataValues.company_id);
			let country_id = parseInt(project.dataValues.country_id);

			//let suppliers = await Supplier.findAll({ where: { company_id: company_id } });

			//let task_category = await TaskCategory.findAll({});

			//let new_suppliers = [];

			//let task_types = await TaskType.findAll({})
			//let task_statuses = await TaskStatus.findAll({})

			/*let task_title_vals = await TaskTitle.findAll({where: { project_id: project_id }})

			let task_title = {
				text1: null,
				text2: null,
				text3: null,				
				number1: null,				
				number2: null,				
				number3: null				
			}
			if (task_title_vals) {
				if (task_title_vals.text1 && (task_title_vals.text1.length > 0)) {
					task_title.text1 = task_title_vals.text1
				}
				if (task_title_vals.text2 && (task_title_vals.text2.length > 0)) {
					task_title.text2 = task_title_vals.text2
				}
				if (task_title_vals.text3 && (task_title_vals.text3.length > 0)) {
					task_title.text3 = task_title_vals.text3
				}
				if (task_title_vals.number1 && (task_title_vals.number1.length > 0)) {
					task_title.number1 = task_title_vals.number1
				}
				if (task_title_vals.number2 && (task_title_vals.number2.length > 0)) {
					task_title.number2 = task_title_vals.number2
				}
				if (task_title_vals.number3 && (task_title_vals.number3.length > 0)) {
					task_title.number3 = task_title_vals.number3
				}
			}*/

			let suppliers = await Supplier.findAll({where: { company_id: company_id }});
			let budgets = await Budget.findAll({ where: { project_id: project_id }});
			/*for(var i in budgets) {
				var budget = budgets[i];
				if (budget) {
					let payments = await Payment.findAll({ where: { project_id: project_id, budget_id: budget.id }});
					budgets[i] = {...budgets[i], payments: payments}
				}
			}*/
			utils.getProjectTask(project_id, project, function (err, tasks) {
				if (err) {
					return res.json({
						response: 3,
						err: err
					})
				} else {
					let respose = {
						project_id: project_id,
						//shooting_days: project_shooting_day_list,
						tasks: tasks,
						suppliers: suppliers,
						budgets: budgets
					}

					return res.json(respose)
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

	getAllTaskFiles: async (req, res, next) => {
		try {
			let task_id = parseInt(req.params.task_id);

			if (isNaN(task_id) || (task_id <= 0)) {
				task_id = null;
				return res.json({
					response: 2,
					err: "No task id"
				})
			}

			let task = null;
			if (task_id  > 0) {
				task = await Task.findOne({where: { id: task_id }});
			}

			if (!task) {
				return res.json({
					response: 2,
					err: 'No task found'
				})
			}

			return res.json(task.attachments)						

		} catch (error) {
			return res.json({
				response: 1,
				err: error
			})
		}
	},

	fileAdd: async (req, res, next) => {
		try {
			let task_id = parseInt(req.body.task_id);
			let text = req.body.text;

			if (!text) {
				text = '';
			}

			if (isNaN(task_id) || (task_id <= 0)) {
				task_id = null;
				return res.json({
					response: 2,
					err: "No task id"
				})
			}

			let task = await Task.findOne({where: { id: task_id }});

			if (!task) {
				return res.json({
					response: 2,
					err: 'No task found'
				})
			}

			if (task) {
				task = task.dataValues;
			}

			let attachments = task.attachments;

			var folder = 't/'+task_id+'/'

			let is_add_file_to_s3 = false;

			async function addFileToS3(file_path) {
				return new Promise(async (resolve,reject)=>{

					console.log('Task File Upload:',file_path)
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
				const response = await Task.update({attachments: attachments}, {where: { id: task_id }});
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
			let task_id = parseInt(req.body.task_id);
			let file_id = req.body.file_id;
			let file_name = req.body.file_name;

			if (isNaN(task_id) || (task_id <= 0)) {
				task_id = null;
				return res.json({
					response: 2,
					err: "No task id"
				})
			}

			console.log('Task File Delete:',task_id)

			const task = await Task.findOne({where: { id: task_id }});

			if (!task) {
				return res.json({
					response: 2,
					err: 'No task found'
				})
			}

			let attachments = task.attachments;

			{
				var folder = 't/'+task_id+'/'

				console.log('Task File Delete:',file_name)
				awsSDK.delete_file_from_s3 (folder ,file_name, async function(err, result) {

					if (err) {
						console.log('err:', err);
						return res.json({
							response: 1,
							err: err
						})
					} else {

						var filtered = attachments.filter(function(el) { return el.file_id != file_id; }); 

						const response = await Task.update({attachments: filtered}, {where: { id: task_id }});

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

	getTaskCategory: async (req, res, next) => {
		try {
			let supplier_id = parseInt(req.params.supplier_id);
			let project_id = parseInt(req.params.project_id);	
			
			if (isNaN(supplier_id) || (supplier_id <= 0)) {
				supplier_id = null;
			}

			if (!supplier_id) {
				return res.json({
					response: 2,
					err: "No supplier id"
				})
			}

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = null;
				return res.json({
					response: 2,
					err: "No project id"
				})
			}
			
			const task_category_list = await TaskCategory.findOne({where: { supplier_id: supplier_id, project_id: project_id }});
			res.json(task_category_list);

		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	addTaskCategory: async (req, res, next) => {
		try {
			let task_category_id = parseInt(req.body.task_category_id);
			let supplier_id = parseInt(req.body.supplier_id);
			let project_id = parseInt(req.body.project_id);
			let task_category = req.body.task_category;
			let color = req.body.color;

			if (isNaN(task_category_id) || (task_category_id <= 0)) {
				task_category_id = 0;
			}

			if (isNaN(supplier_id) || (supplier_id <= 0)) {
				supplier_id = null;
			}

			if (!supplier_id) {
				return res.json({
					response: 2,
					err: "No supplier id"
				})
			}

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = null;
				return res.json({
					response: 2,
					err: "No project id"
				})
			}
			
			if (!color) {
				color = utils.getColor();
			}

			let task_category_result = null;
			let params = {
				supplier_id: supplier_id,
				project_id: project_id,
				task_category: task_category,
				color: color
			}
			if (task_category_id > 0) {
				task_category_result = await TaskCategory.update(params, {where: { id: task_category_id }});
				task_category_result = params;
			} else {
				task_category_result = await TaskCategory.create(params);
				if (task_category_result) {
					task_category_result = task_category_result.dataValues;
				}
			}

			//res.json(task);
			return res.json({
				response: 0,
				err: "",
				task_category: task_category_result
			})
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	deleteTaskCategory: async (req, res, next) => {
		try {
			let task_category_id = parseInt(req.body.task_category_id);

			if (isNaN(task_category_id) || (task_category_id <= 0)) {
				task_category_id = null;
				return res.json({
					response: 2,
					err: "No task category id"
				})
			}

			console.log('Delete Task Category:',task_category_id)

			const response = await TaskCategory.destroy({
				where: { id: task_category_id },
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

	getTaskType: async (req, res, next) => {
		try {
			const task_type_list = await TaskType.findAll({});
			res.json(task_type_list);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	addTaskType: async (req, res, next) => {
		try {

			let task_type_id = parseInt(req.body.task_type_id);
			let task_type = req.body.task_type;

			if (isNaN(task_type_id) || (task_type_id <= 0)) {
				task_type_id = 0;
			}

			let response = null;
			if (task_type_id > 0) {
				response = await TaskType.update({
					task_type: task_type
				}, {where: { id: task_type_id }});
				response = {task_type: task_type};
			} else {
				response = await TaskType.create({
					task_type: task_type
				});
				if (response) {
					response = response.dataValues;
				}
			}

			//res.json(task);
			return res.json({
				response: 0,
				err: "",
				task_type: response
			})
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	deleteTaskType: async (req, res, next) => {
		try {
			let task_type_id = parseInt(req.body.task_type_id);

			if (isNaN(task_type_id) || (task_type_id <= 0)) {
				task_type_id = null;
				return res.json({
					response: 2,
					err: "No task type id"
				})
			}

			console.log('Delete Task Type:',task_type_id)

			const response = await TaskType.destroy({
				where: { id: task_type_id },
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

	getTaskStatus: async (req, res, next) => {
		try {
			const task_status_list = await TaskStatus.findAll({});
			res.json(task_status_list);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	addTaskStatus: async (req, res, next) => {
		try {

			let task_status_id = parseInt(req.body.task_status_id);
			let task_status = req.body.task_status;

			if (isNaN(task_status_id) || (task_status_id <= 0)) {
				task_status_id = 0;
			}

			let response = null;
			if (task_status_id > 0) {
				response = await TaskStatus.update({
					task_status: task_status
				}, {where: { id: task_status_id }});
				response = {task_type: task_type};
			} else {
				response = await TaskStatus.create({
					task_status: task_status
				});
				if (response) {
					response = response.dataValues;
				}
			}

			//res.json(task);
			return res.json({
				response: 0,
				err: "",
				task_type: response
			})
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	deleteTaskStatus: async (req, res, next) => {
		try {
			let task_status_id = parseInt(req.body.task_status_id);

			if (isNaN(task_status_id) || (task_status_id <= 0)) {
				task_status_id = null;
				return res.json({
					response: 2,
					err: "No task status id"
				})
			}

			console.log('Delete Task Status:',task_status_id)

			const response = await TaskStatus.destroy({
				where: { id: task_status_id },
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

	getTaskTitle: async (req, res, next) => {
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
				const task_title = await TaskTitle.findAll({where: {project_id: project_id}});
				res.json(task_title);
			} else {
				let task_title = [];
				res.json(task_title);
			}
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	createTaskTitle: async (req, res, next) => {
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

			let task_categories = null;
			let task_category = null;
			if (category_id  > 0) {
				task_category = await TaskCategory.findOne({where: { id: category_id, project_id: project_id }});
			} else {
				task_categories = await TaskCategory.findAll({where: { project_id: project_id }});
			}

			if (!task_categories && !task_category) {
				return res.json({
					response: 3,
					err: 'No task category found'
				})
			}

			let task_title = null;
			let task_titles = null;
			if (category_id  > 0) {
				task_title = await TaskTitle.findOne({where: { project_id: project_id, category_id: category_id }});
			} else {
				task_titles = await TaskTitle.findAll({where: { project_id: project_id }});
			}

			if ((!category_id || (category_id <= 0)) && 
				task_titles && (task_titles.length > 0)) {
				return res.json({
					response: 4,
					err: 'Task tilte exist'
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
				if (task_title) {
					task_title = await TaskTitle.update(params, {where: { project_id: project_id, category_id: category_id }});
					task_title = params;
				} else {
					if (!task_title) {
						task_title = await TaskTitle.create(params_create);
						if (task_title) {
							task_title = task_title.dataValues;
						}
					}
				}

				return res.json({
					response: 0,
					err: ""
				})
			} else {
				async function getData() {
					for(var i in task_categories) {
						var category = task_categories[i];
						if (category && (category.id > 0)) {
							let params_create_obj = {category_id: category.id, ...params_create};
							let task_title_obj = await TaskTitle.create(params_create_obj);
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

	deleteTaskTitle: async (req, res, next) => {
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

			let task_categories = null;
			let task_category = null;
			if (category_id  > 0) {
				task_category = await TaskCategory.findOne({where: { id: category_id, project_id: project_id }});
			} else {
				task_categories = await TaskCategory.findAll({where: { project_id: project_id }});
			}

			if (category_id  > 0) {
				/*let task_title = await TaskTitle.findOne({where: { project_id: project_id, category_id: category_id }});
				if (task_title) {
					return res.json({
						response: 3,
						err: "Task title is not empty"
					})
				}*/

				const response = await TaskTitle.destroy({
					where: { project_id: project_id, category_id: category_id },
					force: true
				})
	
				return res.json({
					response: 0,
					err: ""
				})
	
			} else {
				/*let task_title = await TaskTitle.findOne({where: { project_id: project_id }});
				if (task_title) {
					return res.json({
						response: 3,
						err: "Task title is not empty"
					})
				}*/

				const response = await TaskTitle.destroy({
					where: { project_id: project_id },
					force: true
				})

				/*async function getData() {
					for(var i in task_categories) {
						var category = task_categories[i];
						if (category && (category.id > 0)) {
							const response = await TaskTitle.destroy({
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

export default TaskController;
