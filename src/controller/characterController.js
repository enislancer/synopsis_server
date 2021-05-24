import moment from 'moment';
const sequelize = require('../models');
const { User, Character, SupplierProject, ProjectScript, ProjectShootingDay } = sequelize.models;
const { Op } = require("sequelize");

import taskController from './taskController';
import budgetController from './budgetController';
var path = require('path');
var apikey = require("apikeygen").apikey;
var awsSDK = require('../utils/awsSDK')
import file from '../utils/file';
const extractwords = require('extractwords');

const CharacterController = {

	getAll: async (req, res, next) => {
		try {
			let character = null;
			character = await Character.findAll({});
			res.json(character);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	getCharacter: async (req, res, next) => {
		try {
			let character_id = parseInt(req.params.character_id);

			if (isNaN(character_id) || (character_id <= 0)) {
				character_id = 0;
			}

			if (character_id <= 0) {
				return res.json({
					response: 2,
					err: 'No Character Id'
				})
			}

			let character = null;
			character = await Character.findOne({ where: { id: character_id } });
			res.json(character);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	create: async (req, res, next) => {
		
		try {
			let character_id = req.body.character_id == 'undefined' ? 0 : parseInt(Number(req.body.character_id));
			let character_name = req.body.character_name == 'undefined' ? 0 : req.body.character_name;
			let character_type = req.body.character_type == 'undefined' ? 0 : parseInt(Number(req.body.character_type));
			let project_id = req.body.company_id == 'undefined' ? 0 : parseInt(Number(req.body.project_id));
			let supplier_id = req.body.company_id == 'undefined' ? 0 : parseInt(Number(req.body.supplier_id));
			let associated_num = req.body.company_id == 'undefined' ? 0 : parseInt(Number(req.body.associated_num));
			let project_scene_id = req.body.project_scene_id == 'undefined' ? 0 : parseInt(Number(req.body.project_scene_id));
			let add_character_supplier_to_shooting_days = req.body.add_character_supplier_to_shooting_days == 'undefined' ? 0 : parseInt(Number(req.body.add_character_supplier_to_shooting_days));

			if (isNaN(character_id) || (character_id <= 0)) {
				character_id = 0;
			}

			if (isNaN(add_character_supplier_to_shooting_days) || (add_character_supplier_to_shooting_days <= 0)) {
				add_character_supplier_to_shooting_days = 0;
			}

			if (!character_name) {
				character_name = null;
			}

			// if (isNaN(character_type) || (character_type <= 0)) {
			// 	character_type = null;
			// }

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = null;
			}

			// if (isNaN(supplier_id) || (supplier_id < 0)) {
			// 	supplier_id = null;
			// }

			console.log('Character Create:',req.body)

			let params = {
			}
			if (character_name && (character_name.length > 0)) {
				params = {...params, character_name: character_name}
			}

			let update_character_type = false;
			if (isNaN(character_type) || (character_type < 0)) {
				character_type = null;
			} else {
				update_character_type = true;
				params = {...params, character_type: character_type}
			}

			if (project_id) {
				params = {...params, project_id: project_id}
			}

			if (isNaN(supplier_id) || (supplier_id < 0)) {
				supplier_id = 0;
			} else {
				params = {...params, supplier_id: supplier_id}
			}
			
			if (isNaN(associated_num) || (associated_num < 0)) {
				associated_num = 0;
			} else {
				params = {...params, associated_num: associated_num}
			}

			let character = null;
			if (character_id > 0) {
				character = await Character.update(params, {where: { id: character_id }});
				character = await Character.findOne({ where: { id: character_id }})
				if (character) {
					character = character.dataValues;
				}
			} else {
				character = await Character.create(params);
				if (character) {
					character = character.dataValues;
				}
			}

			//if (tasks && (tasks.length > 0)) {
			//	await taskController.createTaskList(req, res, next);
			//}

			if (character) {
				character = {...character, character_id: character.id}
				character_id = character.id;
			}

			if ((project_scene_id && !isNaN(project_scene_id) && (project_scene_id > 0)) || 
				(!isNaN(add_character_supplier_to_shooting_days) && (add_character_supplier_to_shooting_days == 1))) {
				let project_script = await ProjectScript.findAll({where: { project_id: project_id }});
				for (var i = 0; i < project_script.length; i++) {
					let script = project_script[i].dataValues.script;
					if (script) {
						let update_data = false;
						let found = false;
						if (script.characters) {
							for (var j = 0; j < script.characters.length; j++) {
								let character1 = script.characters[j];
								if (character1 && (character1.character_id == character_id)) {
									found = true;
									if (update_character_type) {
										script.characters[j].character_type = character_type;
										update_data = true;
									}
									if (add_character_supplier_to_shooting_days == 1) {
										script.characters[j].supplier_id = supplier_id;
										update_data = true;
									}
								}
							}
						}
						if (!found) {
							script.characters.push(character)
							update_data = true;
						}
						for (var i1 = 0; i1 < script.scenes.length; i1++) {
							let scene = script.scenes[i1];

							if (scene && 
								((scene.project_scene_id == project_scene_id) || (add_character_supplier_to_shooting_days == 1))) {
								found = false;
								if (scene.characters && (scene.characters.length > 0)) {
									for (var l = 0; l < scene.characters.length; l++) {
										let character1 = scene.characters[l];
										if (character1 && (character1.character_id == character_id)) {
											found = true;
											if (update_character_type) {
												scene.characters[l].character_type = character_type;
												update_data = true;
											}
											if (add_character_supplier_to_shooting_days == 1) {
												scene.characters[l].supplier_id = supplier_id;
												update_data = true;
											}
										}
									}
								}
								if (!found) {
									script.scenes[i1].characters.push(character)
									update_data = true;
								}
							}
						}

						if (update_data) {
							let script_params = {
								script: script
							}
							//let project_script_result = await ProjectScript.update(script_params, {where: { id: script.id }});
							let project_script_result = await ProjectScript.update(script_params, {where: { project_id: project_id, chapter_number: script.chapter_number }});
						}	
					}
				}

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
							let update_shooting_day = false;
							for (var k = 0; k < shooting_day.scenes.length; k++) {
								let scene = shooting_day.scenes[k];												
								if (scene) {
									for (var k1 = 0; k1 < scene.length; k1++) {
										let scene1 = scene[k1];
										let found = false;
										if (scene1 && 
											((scene1.project_scene_id == project_scene_id) || (add_character_supplier_to_shooting_days == 1))) {
											if (scene1 && scene1.characters && (scene1.characters.length > 0)) {
												for (var l = 0; l < scene1.characters.length; l++) {
													let character1 = scene1.characters[l];
													if (character1 && (character1.character_id == character_id)) {
														found = true;
														if (update_character_type) {
															scene1.characters[l].character_type = character_type;
															update_shooting_day = true;
														}
														if (add_character_supplier_to_shooting_days == 1) {
															scene1.characters[l].supplier_id = supplier_id;
															update_shooting_day = true;
														}
													}
												}
											}
											if (!found) {
												shooting_day.scenes[k][k1].characters.push(character);
												update_shooting_day = true;
											}
										}
									}
								}
							}
							if (update_shooting_day) {
								let params1 = {
									shooting_day: shooting_day
								}
								let project_shooting_day = await ProjectShootingDay.update(params1, {where: { id: shooting_day_obj.id }});
							}
						}
					}
				}
			}

			return res.json({
				response: 0,
				err: "",
				character: character
			})
		} catch (err) {
			console.log(err)
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	delete: async (req, res, next) => {
		try {
			let character_id = parseInt(req.body.character_id);
			let project_id = parseInt(req.body.project_id);
			let delete_from_character = parseInt(req.body.delete_from_character);
			let delete_from_script = parseInt(req.body.delete_from_script); // If 1 then change character to director def - TBD
			let delete_from_shooting_day = parseInt(req.body.delete_from_shooting_day);

			if (isNaN(character_id) || (character_id <= 0)) {
				character_id = null;
				return res.json({
					response: 2,
					err: "No character id"
				})
			}

			/*character = await Character.findOne({ where: { id: character_id } });
			if (character && character.dataValues) {
				character = character.dataValues
			}*/

			console.log('Character Delete:',character_id)

			let character = await Character.findOne({ where: { id: character_id } });
			let character_name = '';
			if (character && character.dataValues) {
				character_name = character.dataValues.character_name;
			}

			if (delete_from_character && (delete_from_character > 0)) {
				const response = await Character.destroy({
					where: { id: character_id },
					force: true
				})
			}

			if (delete_from_script && (delete_from_script > 0)) {
				let project_script = await ProjectScript.findAll({where: { project_id: project_id }});
				for (var i = 0; i < project_script.length; i++) {
					let script = project_script[i].dataValues.script;
					if (script) {
						let update_data = false;
						if (script.characters && (script.characters.length > 0)) {
							for (var j = 0; j < script.characters.length; j++) {
								let character = script.characters[j];
								if (character && (character.character_id == character_id)) {
									let arr = script.characters.splice(i,1)
									if (arr && (arr.length > 0)) {
										update_data = true;
									}
								}
							}
						}
						if (script.scenes && (script.scenes.length > 0)) {
							for (var i1 = 0; i1 < script.scenes.length; i1++) {
								let scene = script.scenes[i1];

								let update = false;
								if (scene && scene.characters && (scene.characters.length > 0)) {
									for (var l = 0; l < scene.characters.length; l++) {
										let character = scene.characters[l];
										if (character && (character.character_id == character_id)) {
											let arr = script.scenes[i1].characters.splice(i,1)
											if (arr && (arr.length > 0)) {
												update_data = true;
												update = true;
											}
										}
									}
								}
								if (update) {
									if (scene && scene.script && (scene.script.length > 0)) {
										if (scene.script && (scene.script.length > 0)) {
											//scene.script.forEach(async(script_obj) => {
											for(var b in scene.script) {
												var script_obj = scene.script[b];
	
												if (script_obj && (script_obj.type == 'character') && (script_obj.character == character_name)) {
													scene.script[b].type = 'def';
													let text = script_obj.character+'\n'+script_obj.text;
													scene.script[b].text = text;
													scene.script[b].character = '';
												}
											}
										}
									}	
								}
							}
						}

						if (update_data) {
							let script_params = {
								script: script
							}
							//let project_script_result = await ProjectScript.update(script_params, {where: { id: script.id }});
							let project_script_result = await ProjectScript.update(script_params, {where: { project_id: project_id, chapter_number: script.chapter_number }});
						}	
					}
				}
			}					

			if (delete_from_shooting_day && (delete_from_shooting_day > 0)) {

				let project_shooting_day = await ProjectShootingDay.findAll({ 
					where: { project_id: project_id }/*, 
					order: [
						['pos', 'ASC']
					]*/
				});
				project_shooting_day = project_shooting_day.sort(function(a, b) {
					return a.pos - b.pos;
				});
				if (project_shooting_day && (project_shooting_day.length > 0)) {
					for (var j = 0; j < project_shooting_day.length; j++) {
						let shooting_day_obj = project_shooting_day[j].dataValues;
						if (shooting_day_obj && shooting_day_obj.shooting_day) {
							let shooting_day = shooting_day_obj.shooting_day;
							let update_shooting_day = false;
							if (shooting_day && shooting_day.scenes && (shooting_day.scenes.length > 0)) {
								let update_shooting_day = false;
								for (var k = 0; k < shooting_day.scenes.length; k++) {
									let scene = shooting_day.scenes[k];												
									if (scene) {
										for (var k1 = 0; k1 < scene.length; k1++) {
											let scene1 = scene[k1];
											if (scene1 && scene1.characters && (scene1.characters.length > 0)) {
												for (var l = 0; l < scene1.characters.length; l++) {
													let character = scene1.characters[l];
													if (character && (character.character_id == character_id)) {
														let arr = shooting_day.scenes[k][k1].characters.splice(l,1)
														if (arr && (arr.length > 0)) {
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
										shooting_day: shooting_day
									}
									let project_shooting_day = await ProjectShootingDay.update(params1, {where: { id: shooting_day_obj.id }});
								}
							}
						}
					}
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

	delete_characters: async (req, res, next) => {
		try {
			let characters = req.body;

			if (characters && (characters.length > 0)) {

				for (var i = 0; i < characters.length; i++) {
							
					let character_id = parseInt(characters[i]);

					if (isNaN(character_id) || (character_id <= 0)) {
						character_id = null;
						return res.json({
							response: 2,
							err: "No character id"
						})
					}

					console.log('Character Delete:',character_id)

					const response = await Character.destroy({
						where: { id: character_id },
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
	}
};

export default CharacterController;
