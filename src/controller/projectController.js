import moment from 'moment';
const sequelize = require('../models');
const { User, SupplierCategory, SupplierProject, SupplierJobTitle, BudgetCategory, Project, ProjectScene, ProjectScript, Character, Supplier, Budget, Task, TaskCategory, TaskType, TaskStatus, TaskTitle, BudgetType, BudgetStatus, Props, Makeups, Clothes, Specials, Others, SceneLocation, SceneLocationBank, SceneLocationBankRef, SceneTime, ScenePlace, SceneTimeDef, SceneTimeBank, SceneTimeBankRef, SceneStatus, ProjectStatus, ProjectShootingDay/*, ProjectShootingDayScene*/ } = sequelize.models;
const { Op } = require("sequelize");

import taskController from './taskController';
import budgetController from './budgetController';
var path = require('path');
var apikey = require("apikeygen").apikey;
var awsSDK = require('../utils/awsSDK')
import file from '../utils/file';
import utils from '../utils/utils';
import config from '../config/config';
const extractwords = require('extractwords');
// var SummaryTool = require('node-summary');
// let SummarizerManager = require("node-summarizer").SummarizerManager;

// Sort list acording to chapter number
function sortByChepterNumber(property) {
	return function (a,b) {
		if(a[property] && b[property] && (a[property] > b[property]))
			return 1;
		else if(a[property] && b[property] && (a[property] < b[property]))
			return -1;
		else if(!a[property] || !b[property])
			return 0;

		return 0;
	}
}

function deleteFileFromS3(folder, file_name) {
	return new Promise((resolve,reject)=>{
		//console.log('file_name:',file_name)
		awsSDK.delete_file_from_s3(folder ,file_name, function(err, result) {
			resolve();
		})
	})
}


async function emptyS3Directory(project_id) {
	if (project_id && (project_id > 0)) {
		var folder = 'app/f/p/'+project_id+'/'
		awsSDK.emptyS3Directory(folder);
		const response = await Project.update({attachments: []}, {where: { id: project_id }});
		// if (chapter_number && (chapter_number > 0)) {
		// 	var filtered_script = script_attachments.filter(function(el) { return el.file_id != file_id; });
		// 	const response2 = await ProjectScript.update({attachments: filtered_script}, {where: { project_id: project_id, chapter_number: chapter_number }});
		// }
	}
}

function getSceneId(chapter_number, scene_number) {
	let scene_id = 0
	let cn = parseInt(chapter_number);
	if (isNaN(cn)) {
		cn = 0;
	}
	let sn = parseInt(scene_number);
	if (isNaN(sn)) {
		sn = 0;
	}
	if (scene_number < 10) {
		scene_id = (cn * 100) + sn;
	} else {
		scene_id = (cn * 10) + sn;
	}
	return scene_id;
}

function compare(arr1, arr2) {

	let finalarray = [];

	arr1.forEach((e1) => {arr2.forEach((e2) => {
			if (e1 && e1.character_name &&
				e2 && e2.character_name &&
				e1.character_name == e2.character_name) {
				finalarray.push(e1)
			}
		})
	});

	return finalarray;
}

function deg2rad(deg) {
	return deg * (Math.PI/180)
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {

	if (
		(lat1 < 0.00001) ||
		(lon1 < 0.00001) ||
		(lat2 < 0.00001) ||
		(lon2 < 0.00001)) {
		return 0;
	}

	var R = 6371; // Radius of the earth in km
	var dLat = deg2rad(lat2-lat1);  // deg2rad below
	var dLon = deg2rad(lon2-lon1); 
	var a = 
	  	Math.sin(dLat/2) * Math.sin(dLat/2) +
	  	Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
	  	Math.sin(dLon/2) * Math.sin(dLon/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	var d = R * c; // Distance in km
	return d;
}

/*let findSceneWithLeastMostActorAppearance = (scenes, valeName = 'character_name', valeType = 'character_type') => {
    const failValue = -1
    
    if(!Array.isArray(scenes)) return failValue
    
    // Rank number of appearences and number of actors in scene
    let appearences = {}
    const sceneIndexByActorName = {}

	    scenes.forEach( (scene, index) => {
        if(!Array.isArray(scene)) return failValue

        scene.forEach( (element) => {
            if(!element.hasOwnProperty(valeName)) return failValue
            sceneIndexByActorName[element[valeName]] =  sceneIndexByActorName[element[valeName]] || index
			sceneIndexByActorName[element[valeName]] = sceneIndexByActorName[element[valeName]].length > scene.length ? index : sceneIndexByActorName[element[valeName]]

			let weight = 1;
			if (actor && actor[valeType] && (parseInt(actor[valeType]) == 0)) {
				weight = 100;
			} else {
				if (actor && actor[valeType] && (parseInt(actor[valeType]) == 1)) {
					weight = 1;
				}
			}

            appearences[element[valeName]] = (((appearences[element[valeName]] || 0) + 1 + (scene.length / 100)) * weight);
        })
    })

    // Convert appearnces dict to two tuples array
    appearences = Object.keys(appearences).map( key => { return [key, appearences[key]] })

    // Sort array by number of appearnences 
    let result = appearences.sort( (first, second) => { return first[1] -  second[1] }) [0][0]

    return sceneIndexByActorName[result]
}*/

let findSceneWithLeastMostActorAppearance = (scenes, valeName = 'character_name', valeType = 'character_type') => {

	let type = 'character_type';

    // Validate
	if(!Array.isArray(scenes)) {
		return -1;
        //throw new Error("scene arguments shoul'd be an Array of Arrays of Objects containing name property")
	}    
    
    // Rank number of appearences and number of actors in scene
    let appearences = {}

    scenes.forEach( scene => {
		if(!Array.isArray(scene)) {
			return -1;
			//throw new Error("scene arguments shoul'd be an Array of Arrays of Objects containing name property")
		}

        scene.forEach( actor => {
			if(!actor.hasOwnProperty(valeName)) {
				return -1;
				//throw new Error("scene arguments shoul'd be an Array of Arrays of Objects containing name property")
			}

			let weight = 1;
			if (actor && actor[valeType] && (parseInt(actor[valeType]) == 0)) {
				weight = 10;
			} else {
				if (actor && actor[valeType] && (parseInt(actor[valeType]) == 1)) {
					weight = 1;
				}
			}
            appearences[actor[valeName]] = ((appearences[actor[valeName]] || 0) + 1 + (scene.length / 100)) * weight;
        })
    })

    // Convert appearnces dict to two tuples array
    appearences = Object.keys(appearences).map( key => { return [key, appearences[key]] })

	let leastmostActorName = [];
	// Sort array by number of appearnences
	if (appearences && (appearences.length > 0)) {
	    leastmostActorName = appearences.sort( (first, second) => { return first[1] -  second[1] }) [0][0]
	}

    // Locate index of the scene containing selected name with the highest number of actors
    var selectedScene
    var selectedSceneIndex
    var i = 0
    for(const scene of scenes) {
        for(const actor of scene) {
            if(actor[valeName] === leastmostActorName) {
                selectedScene = selectedScene || scene;
				selectedSceneIndex = selectedSceneIndex || i;
				if (selectedScene.length < scene.length) {
					selectedScene = selectedScene;
					selectedSceneIndex = selectedSceneIndex;
				} else {
					selectedScene = scene;
					selectedSceneIndex = i;
				}
                //selectedScene = selectedScene.length < scene.length ? selectedScene : scene
                //selectedSceneIndex = selectedScene.length < scene.length ? selectedSceneIndex : i
            }
        }
        i++
    }
    return selectedSceneIndex
}

async function compareCharacters(character_obj1, character_obj2, character_list) {

	if (!character_obj1 || !character_obj2) {
		return false;
	}

	if (character_obj1.character_name.toLowerCase().trim() == character_obj2.character_name.toLowerCase().trim()) {
		return true;
	}

	if (character_list && (character_list.length > 0)) {
		if (character_obj1 && 
			character_obj1.associated_num && 
			(character_obj1.associated_num > 0)) {
			for (var j2 = 0; j2 < character_list.length; j2++) {
				let char2 = character_list[j2].dataValues;
				if (char2 && 
					(char2.id != character_obj1.id) && 
					char2.associated_num && 
					(char2.associated_num > 0) &&
					(char2.associated_num == character_obj1.associated_num)
					) {
						if (char2.character_name.toLowerCase().trim() == character_obj2.character_name.toLowerCase().trim()) {
							return true;
					}
				}
			}
		}

		if (character_obj2 && 
			character_obj2.associated_num && 
			(character_obj2.associated_num > 0)) {
			for (var j2 = 0; j2 < character_list.length; j2++) {
				let char2 = character_list[j2].dataValues;
				if (char2 && 
					(char2.id != character_obj2.id) && 
					char2.associated_num && 
					(char2.associated_num > 0) &&
					(char2.associated_num == character_obj2.associated_num)
					) {
						if (char2.character_name.toLowerCase().trim() == character_obj1.character_name.toLowerCase().trim()) {
							return true;
					}
				}
			}
		}
	}

	return false;
}

function getNamesScore(names1, names2) {

	try {
		// Get matched following words inside the shooting days names
		let match_count = 0
		let line_count = (names1.length + names2.length) / 2;
		if (names1 && (names1.length > 0)) {
			for (var i4 = 0; i4 < names1.length; i4++) {
				let names1_line = names1[i4];
				if (names1_line && (names1_line.length > 0)) {
					let words_arr1 = extractwords(names1_line, {lowercase: true, punctuation: true});
					if (words_arr1 && (words_arr1.length > 0)) {
						for (var i5 = 0; i5 < words_arr1.length; i5++) {
							let word1 = words_arr1[i5];
							if (word1 && (word1.length > 0)) {
								if (names2 && (names2.length > 0)) {
									for (var i6 = 0; i6 < names2.length; i6++) {
										let names2_line = names2[i6];
										if (names2_line && (names2_line.length > 0)) {
											var match = names2_line.indexOf(word1);
											if (match >= 0) {
												match_count += words_arr1.length - i4;
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}
		let match_count_avg = match_count;
		if (line_count > 1) {
			match_count_avg /= line_count;
		}
		return match_count_avg;
	} catch (err) {
		return 0;
	}
}

async function buildProjectScenesSchedule (project_id, scenes, cb) {
	//let project_id = parseInt(req.body.project_id);
	//let max_shooting_days = parseInt(req.body.max_shooting_days);
	//let project_params = req.body.params;

	try {

		if (isNaN(project_id) || (project_id <= 0)) {
			project_id = 0;
		} else {
		}

		let project = null;
		if (project_id > 0) {
			//project = await Project.update(params, {where: { id: project_id }});
			project = await Project.findOne({ where: { id: project_id }})
			if (project) {
				project = project.dataValues;
			}
		}
		
		let limitations = null;
		if (project && project.limitations && project.limitations.limitations) {
			limitations = project.limitations.limitations;
		}
		
		const task_status_list = await TaskStatus.findAll({});
		let task_status_active_id = 1;
		if (task_status_list) {
			for (var j = 0; j < task_status_list.length; j++) {
				let task_status = task_status_list[j].dataValues;
				if (task_status.task_status == 'Active') {
					task_status_active_id = task_status.id;
				}
			}
		}

		let scene_location = await SceneLocation.findAll({where: { project_id: project_id }});
		let scene_time = await SceneTime.findAll({where: { project_id: project_id }});
		let scene_status = await SceneStatus.findAll({});

		let shooting_days_list = [];

		const response2 = await ProjectShootingDay.destroy({
			where: { project_id: project_id },
			force: true
		})

		const response3 = await Task.destroy({
			where: { project_id: project_id },
			force: true
		})

		const response4 = await TaskCategory.destroy({
			where: { project_id: project_id },
			force: true
		})

		let company_id = project ? project.company_id : 0;
		let character_list = await Character.findAll({where: { project_id: project_id }});

		/*for (var j1 = 0; j1 < character_list.length; j1++) {
			let char1 = character_list[j1].dataValues;
			if (char1 && char1.associated_num && (char1.associated_num > 0)) {
				for (var j2 = 0; j2 < character_list.length; j2++) {
					let char2 = character_list[j2].dataValues;
					if (char2 && 
						(char2.id != char1.id) && 
						char2.associated_num && 
						(char2.associated_num > 0) &&
						(char2.associated_num == char1.associated_num)
						) {
					}
				}
			}
		}*/

		character_list = character_list.sort(function(a, b) {
			return b.character_count - a.character_count;
		});

		if (scenes && scenes.groups && (scenes.groups.length > 0)) {
			for (var i1 = 0; i1 < scenes.groups.length; i1++) {
				let scene_list = scenes.groups[i1];
				if (scene_list && (scene_list.length > 0)) {
					let last_shooting_day_obj = null;
					for (var i2 = 0; i2 < scene_list.length; i2++) {
						let project_scene = scene_list[i2];
						let scene_found = false
						if (project_scene) {

							// Add character_type & supplier_id
							if (project_scene.characters && (project_scene.characters.length > 0)) {
								for (var j1 = 0; j1 < project_scene.characters.length; j1++) {
									let character_obj1 = project_scene.characters[j1];
									if (character_obj1) {
										for (var j2 = 0; j2 < character_list.length; j2++) {
											let character_obj2 = character_list[j2].dataValues;
											let compare = compareCharacters(character_obj1, character_obj2, character_list);
											if (character_obj2 && compare) {
												if (project_scene.characters[j1].character_type) {
													project_scene.characters[j1].character_type = character_obj2.character_type;
												} else {
													project_scene.characters[j1] = {...project_scene.characters[j1], character_type: character_obj2.character_type}
												}
												if (1 || (project_scene.characters[j1].supplier_id)) {
													project_scene.characters[j1].supplier_id = character_obj2.supplier_id;
												} else {
													project_scene.characters[j1] = {...project_scene.characters[j1], supplier_id: character_obj2.supplier_id}
												}
											}
										}
									}
								}
							}

							let name = project_scene.name;//.toLowerCase().trim();
							let name_trim = name.toLowerCase();
							//name_trim = name_trim.replace(/[.,-~=+!@#$%^&*(){}]/g, '');
							name_trim = name_trim.replace(/[-~=+!@#$%^&*(){}]/g, '');
							name_trim = name_trim.replace(/[,]/g, '');
							name_trim = name_trim.replace(/[.]/g, '');
							let scene_name = name_trim;
							name_trim = name_trim.replace(/[' ']/g, '');
							let location = project_scene.location;
							let location_found = false;
							for (var i = 0; i < scene_location.length; i++) {
								let location1 = scene_location[i].dataValues.scene_location;
								if (location1 && (location1.length > 0) && project_scene.location && (project_scene.location.length > 0)) {
									if (
										project_scene.location.toLowerCase().trim().includes(location1.toLowerCase().trim()) ||
										location1.toLowerCase().trim().includes(project_scene.location.toLowerCase().trim())
									) {
										//location = location;
										location_found = true;
									}
								}
							}
							if (!location_found) {
								location = scene_location[0].dataValues.scene_location;
								project_scene.location = location;
							}
							
							let time = project_scene.time;
							let time_type = project_scene.time_type;
							let time_found = false;
							for (var i = 0; i < scene_time.length; i++) {
								let time1 = scene_time[i].dataValues.scene_time;
								let time_type1 = scene_time[i].dataValues.scene_time_type;
								if (time1 && (time1.length > 0) && project_scene.time && (project_scene.time.length > 0)) {
									//if (project_scene.time == time1) {
									if (
										(project_scene.time.toLowerCase().trim().includes(time.toLowerCase().trim())) || 
										(time.toLowerCase().trim().includes(project_scene.time.toLowerCase().trim()))
									) { 
										if (!time_found) {
											time_found = true;
											time_type = time_type1;
										}
									}
								}
							}
							if (!time_found) {
								time = scene_time[0].dataValues.scene_time;
								time_type = scene_time[0].dataValues.scene_time_type;
								let time_id = scene_time[0].dataValues.id;
								project_scene.time = time;
								project_scene.time_type = time_type;
								project_scene.time_id = time_id;
							}

							if (project_scene && !project_scene.pos) {
								project_scene = {...project_scene, pos: 0}
								scene_found = false
							}

							let scene_id = '';
							if (project_scene.scene_id_number || (project_scene.scene_id_number && (project_scene.scene_id_number.length > 0))) {
								scene_id = project_scene.scene_id_number;
							} else {
								scene_id = getSceneId(project_scene.chapter_number, project_scene.scene_number);
							}

							if (project_scene.scene_id_number) {
								project_scene.scene_id_number = scene_id;
							} else {
								project_scene = {...project_scene, scene_id: scene_id}
								scene_found = false
							}

							if (last_shooting_day_obj) {
								
								let time_found = false;
								let time_found0 = false;
								let time_found1 = false;		
								for (var ii = 0; ii < scene_time.length; ii++) {
									let time = scene_time[ii].dataValues.scene_time;
									let time_type = scene_time[ii].dataValues.scene_time_type;
									let time_id = scene_time[ii].dataValues.id;
									let max_shooting_scenes = scene_time[ii].dataValues.max_shooting_scenes;
									let max_shooting_duration = scene_time[ii].dataValues.max_shooting_duration;
									let scene_duration = scene_time[ii].dataValues.default_scene_duration;
									if (time_type >= 0) {
										if (project_scene.time_type == time_type) {

											time_found = true;

											if (((time_type == 0) && !time_found0) ||
												((time_type == 1) && !time_found1))
											{
												if (time_type == 0) {
													time_found0 = true;
												} else {
													time_found1 = true;
												}
		
												//When scene name == shooting day name:
												//	If shooting time == shooting time:

												if (project_scene && !project_scene.time_id) {
													project_scene = {...project_scene, time_id: time_id}
													scene_found = false
												}

												let add_scene = false;
												if ((max_shooting_scenes > 0) && (last_shooting_day_obj.scenes[time_type].length < max_shooting_scenes))
													{
													scene_found = true;

													let scenes = last_shooting_day_obj.scenes[time_type];
													let shooting_duration = 0
													for(let a = 0; a < scenes.length; a++) {
														shooting_duration += scenes[a].scene_duration;
													}

													//If shooting duration < max shooting duration:
													//	Add scene to shooting day.
									

													if (1 || 
														((shooting_duration + project_scene.scene_duration) <= max_shooting_duration)) {
														let len = last_shooting_day_obj.scenes[time_type].length;

														let found1 = false;
														if (last_shooting_day_obj.location && (last_shooting_day_obj.location.length > 0)) {
															for (var i3 = 0; i3 < last_shooting_day_obj.location.length; i3++) {
																let shooting_day_location = last_shooting_day_obj.location[i3];
																if (shooting_day_location && (shooting_day_location.length > 0)) {
																	if (location.toLowerCase().trim() == shooting_day_location.toLowerCase().trim()) {
																		found1 = true;
																	}
																}
															}
														}
														if (!found1) {
															last_shooting_day_obj.location.push(location.toLowerCase().trim())
														}

														let found2 = false;
														if (last_shooting_day_obj.name_trim && (last_shooting_day_obj.name_trim.length > 0)) {
															for (var i3 = 0; i3 < last_shooting_day_obj.name_trim.length; i3++) {
																let shooting_day_name_trim = last_shooting_day_obj.name_trim[i3];
																if (shooting_day_name_trim && (shooting_day_name_trim.length > 0)) {
																	if (name_trim.toLowerCase().trim() == shooting_day_name_trim.toLowerCase().trim()) {
																		found2 = true;
																	}
																}
															}
														}
														if (!found2) {
															last_shooting_day_obj.name_trim.push(name_trim.toLowerCase().trim())
															last_shooting_day_obj.name_day.push(scene_name.toLowerCase())
														}

														last_shooting_day_obj.scenes[time_type].push(project_scene);
														add_scene = true;
													}
												} else {
												}

												if (!add_scene) {

													let shooting_duration = 0;
													let scenes = last_shooting_day_obj.scenes[time_type];
													let characters_arr = []
													for(let a = 0; a < scenes.length; a++) {
														let characters = scenes[a].characters;
														//characters_arr.push(characters);
														let characters1 = [];
														for(let a1 = 0; a1 < characters.length; a1++) {
															let character = characters[a1];
															if (character) {
																characters1.push(character);
															}
														}
														let location_chararcter = {
															project_id: project_id,
															supplier_id: 0,
															character_id: 99999,
															character_name: scenes[a].location,
															character_type: 0
														}
														characters1.push(location_chararcter)
														characters_arr.push(characters1);
														shooting_duration += scenes[a].scene_duration;
													}
													let project_scene_characters = project_scene.characters;
													//characters_arr.push(project_scene_characters);
													let characters2 = [];
													for(let a1 = 0; a1 < project_scene_characters.length; a1++) {
														let character = project_scene_characters[a1];
														if (character) {
															characters2.push(character);
														}
													}
													let location_chararcter2 = {
														project_id: project_id,
														supplier_id: 0,
														character_id: 99999,
														character_name: project_scene.location,
														character_type: 0
													}
													characters2.push(location_chararcter2)
													characters_arr.push(characters2);
													shooting_duration += project_scene.scene_duration;

													//Find Scene with Least Most Actor Appearance
														//Remove scene from shooting day.
													//Create shooting day with scene name.
													// Add scene to shooting day
													let index = findSceneWithLeastMostActorAppearance(characters_arr, 'character_name', 'character_type');

													if ((index >= 0) && (index < scenes.length)) {
														let scene1 = last_shooting_day_obj.scenes[time_type][index];
														if (scene1 && ((shooting_duration - scene1.scene_duration) <= max_shooting_duration)) {
															let arr = last_shooting_day_obj.scenes[time_type].splice(index,1)
															let project_scene1 = project_scene;
															last_shooting_day_obj.scenes[time_type].push(project_scene1)

															if (arr && (arr.length > 0)) {
																project_scene = arr[0];
																scene_found = false
															}
															
															let found1 = false;
															if (last_shooting_day_obj.location && (last_shooting_day_obj.location.length > 0)) {
																for (var i3 = 0; i3 < last_shooting_day_obj.location.length; i3++) {
																	let shooting_day_location = last_shooting_day_obj.location[i3];
																	if (shooting_day_location && (shooting_day_location.length > 0)) {
																		if (location.toLowerCase().trim() == shooting_day_location.toLowerCase().trim()) {
																			found1 = true;
																		}
																	}
																}
															}
															if (!found1) {
																last_shooting_day_obj.location.push(location.toLowerCase().trim())
															}

															let found2 = false;
															if (last_shooting_day_obj.name_trim && (last_shooting_day_obj.name_trim.length > 0)) {
																for (var i3 = 0; i3 < last_shooting_day_obj.name_trim.length; i3++) {
																	let shooting_day_name_trim = last_shooting_day_obj.name_trim[i3];
																	if (shooting_day_name_trim && (shooting_day_name_trim.length > 0)) {
																		if (name_trim.toLowerCase().trim() == shooting_day_name_trim.toLowerCase().trim()) {
																			found2 = true;
																		}
																	}
																}
															}
															if (!found2) {
																last_shooting_day_obj.name_trim.push(name_trim.toLowerCase().trim())
																last_shooting_day_obj.name_day.push(scene_name.toLowerCase())
															}
														} else {
															scene_found = false;
														}
													}
												}
											}
										}
									}
								}
							}

							if (!scene_found) {
								// Create shooting day with scene name
								// Add scene to shooting day
								let location_arr = []
								let name_trim_arr = []
								let name_arr = []
								location_arr.push(project_scene.location.toLowerCase().trim());
								name_arr.push(scene_name.toLowerCase());
								name_trim_arr.push(name_trim.toLowerCase().trim());
								let shooting_day_obj = {
									name: project_scene.name,//.toLowerCase().trim(),
									name_day: name_arr,
									name_trim: name_trim_arr,
									location: location_arr,
									scenes: []
								}
								// expand to have the correct amount or rows
								if (project_scene.time_type == 0) {
									shooting_day_obj.scenes.push([project_scene]);
									shooting_day_obj.scenes.push([]);
								} else {
									shooting_day_obj.scenes.push([]);
									shooting_day_obj.scenes.push([project_scene]);
								}
								shooting_days_list.push(shooting_day_obj);
								last_shooting_day_obj = shooting_day_obj;
							}
						}
					}
				}
			}
	
			// Union for shooting days
			let max_scenes = 0;
			let max_day_scenes = 0;
			let max_night_scenes = 0;

			let update1 = false;
			let update2 = false;
			for (var i = 0; i < scene_time.length; i++) {
				let time = scene_time[i].dataValues.scene_time;
				let time_type = scene_time[i].dataValues.scene_time_type;
				let max_shooting_scenes = scene_time[i].dataValues.max_shooting_scenes;
				if (time_type == 0) {
					if (!update1) {
						update1 = true;
						max_scenes += max_shooting_scenes;
						max_day_scenes = max_shooting_scenes;
					}
				} else {
					if (!update2) {
						update2 = true;
						max_scenes += max_shooting_scenes;
						max_night_scenes = max_shooting_scenes;
					}
				}
			}

			// Merge days when both days scenes < max shooting duration
			// function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2)
			let touch = false; // Disable Merge
			while (touch) {
				touch = false;
				for (var j = 0; ((j < shooting_days_list.length) && !touch); j++) {
					let shooting_day_obj1 = shooting_days_list[j];
					if (!touch && shooting_day_obj1 && shooting_day_obj1.scenes &&
						(shooting_day_obj1.scenes.length > 0) &&
						(shooting_day_obj1.scenes[0] && (shooting_day_obj1.scenes[0].length <= max_day_scenes)) &&
						(shooting_day_obj1.scenes[1] && (shooting_day_obj1.scenes[1].length <= max_night_scenes))
						) {

						let day_count1 = 0;
						let night_count1 = 0;
						let total_count1 = 0;
						for (var l = 0; l < shooting_day_obj1.scenes.length; l++) {
						// inner loop applies to sub-arrays
							if (l == 0) {
								day_count1 = shooting_day_obj1.scenes[l].length;
							} else {
								night_count1 = shooting_day_obj1.scenes[l].length;
							}
						}
						total_count1 = day_count1 + night_count1;

						for (var jj = 0; ((jj < shooting_days_list.length) && !touch); jj++) {
							let shooting_day_obj2 = shooting_days_list[jj];

							let found_location = false;
							if (shooting_day_obj2) {
								if (shooting_day_obj1.location && (shooting_day_obj1.location.length > 0)) {
									for (var i3 = 0; i3 < shooting_day_obj1.location.length; i3++) {
										let shooting_day_location1 = shooting_day_obj1.location[i3];
										if (shooting_day_location1 && (shooting_day_location1.length > 0)) {
											if (shooting_day_obj2.location && (shooting_day_obj2.location.length > 0)) {
												for (var i4 = 0; i4 < shooting_day_obj2.location.length; i4++) {
													let shooting_day_location2 = shooting_day_obj2.location[i4];
													if (shooting_day_location2 && (shooting_day_location2.length > 0)) {
														if (shooting_day_location1.toLowerCase().trim() == shooting_day_location2.toLowerCase().trim()) {
															found_location = true;
														}
													}
												}
											}
										}
									}
								}
							}

							if (shooting_day_obj2 && shooting_day_obj2.scenes &&
								(shooting_day_obj1 != shooting_day_obj2) && 
								(shooting_day_obj2.scenes.length > 0) &&
								(shooting_day_obj2.scenes[0] && (shooting_day_obj2.scenes[0].length <= max_day_scenes)) &&
								(shooting_day_obj2.scenes[1] && (shooting_day_obj2.scenes[1].length <= max_night_scenes)) &&
								found_location
								) {
		
								let day_count2 = 0;
								let night_count2 = 0;
								let total_count2 = 0;
								for (var k = 0; k < shooting_day_obj2.scenes.length; k++) {
								// inner loop applies to sub-arrays
									if (k == 0) {
										day_count2 = shooting_day_obj2.scenes[k].length;
									} else {
										night_count2 = shooting_day_obj2.scenes[k].length;
									}
								}
								total_count2 = day_count2 + night_count2;

								if (!touch &&
									((max_shooting_days > 0) && (shooting_days_list.length > max_shooting_days))
									||
									(((total_count1 + total_count2) <= max_scenes) &&
									((day_count1 + day_count2) <= max_day_scenes) &&
									((night_count1 + night_count2) <= max_night_scenes))
									)
								{
									
									touch = true;
									for (var l1 = 0; l1 < shooting_day_obj2.scenes.length; l1++) {
										for (var m1 = 0; m1 < shooting_day_obj2.scenes[l1].length; m1++) {
											let scene1 = shooting_day_obj2.scenes[l1][m1];
											shooting_days_list[j].scenes[l1].push(scene1);
										}
									}

									let location_arr = [];
									if (shooting_day_obj1.location && (shooting_day_obj1.location.length > 0)) {
										for (var i3 = 0; i3 < shooting_day_obj1.location.length; i3++) {
											let shooting_day_location1 = shooting_day_obj1.location[i3];
											if (shooting_day_location1 && (shooting_day_location1.length > 0)) {
												location_arr.push(shooting_day_location1);
											}
										}
									}
									if (shooting_day_obj2.location && (shooting_day_obj2.location.length > 0)) {
										for (var i4 = 0; i4 < shooting_day_obj2.location.length; i4++) {
											let shooting_day_location2 = shooting_day_obj2.location[i4];
											if (shooting_day_location2 && (shooting_day_location2.length > 0)) {
												location_arr.push(shooting_day_location2);
											}
										}
									}
									if (location_arr && (location_arr.length > 0)) {
										location_arr = location_arr.filter((obj, pos, arr) => {
											return arr.map(mapObj => mapObj).indexOf(obj) == pos;
										});
									}

									shooting_days_list[j].location = location_arr;
									shooting_days_list = shooting_days_list.filter(item => item != shooting_day_obj2)
								}
							}
						}
					}
				}
			}

			for (var j = 0; j < shooting_days_list.length; j++) {
				let shooting_day_obj = shooting_days_list[j];
				if (shooting_day_obj && shooting_day_obj.scenes && (shooting_day_obj.scenes.length > 0)) {
											
					let first_scene = shooting_day_obj.scenes[0][0];

					// Add breaks to shooting days
					let location_index = 0;
					if (first_scene) {
						for (var i = 0; i < scene_location.length; i++) {
							let location = scene_location[i].dataValues.scene_location;
							if (location && (location.length > 0) && first_scene.location && (first_scene.location.length > 0)) {
								if (
									first_scene.location.toLowerCase().trim().includes(location.toLowerCase().trim()) ||
									location.toLowerCase().trim().includes(first_scene.location.toLowerCase().trim())
								) {
									location_index = i;
								}
							}
						}
					}

					let shooting_hours = {
						inside: { start: '06:00', end: '20:00'},
						outside: { start: '06:00', end: '18:00'}
					};
					let breakfast = {
						inside: { start: '06:00', end: '06:30'},
						outside: { start: '06:00', end: '06:30'}
					};
					let lunch = {
						inside: { start: '13:00', end: '13:30'},
						outside: { start: '13:00', end: '13:30'}
					};
					let project_params = [
						{
							type: 'shooting_hours',
							inside: { start: '06:00', end: '20:00'},
							outside: { start: '06:00', end: '18:00'}
						},{
							type: 'breakfast',
							inside: { start: '06:00', end: '06:30'},
							outside: { start: '06:00', end: '06:30'}
						},{
							type: 'lunch',
							inside: { start: '13:00', end: '13:30'},
							outside: { start: '13:00', end: '13:30'}
						},{
							type: 'dinner',
							inside: { start: '17:30', end: '18:00'},
							outside: { start: '17:30', end: '18:00'}
						},{
							type: 'times',
							times: [{
								time: 'day',
								inside: { start: '06:00', end: '17:00'},
								outside: { start: '06:00', end: '17:00'}
							},{
								time: 'night',
								inside: { start: '17:30', end: '21:00'},
								outside: { start: '17:30', end: '21:00'}
							}]
						}
					]
					/*for (var i = 0; i < project_params.length; i++) {
						let Break = project_params[i];
						if (Break) {
							switch (Break.type) {
								case 'shooting_hours':
									shooting_hours = Break;
									break;
								case 'breakfast':
									breakfast = Break;
									break;
								case 'lunch':
									lunch = Break;
									break;
							}
						}
					}*/
					
					// Add suppliers & actors & total scenes
					let call = (location_index == 0) ? shooting_hours.inside.start : shooting_hours.outside.start;
					let finished = (location_index == 0) ? shooting_hours.inside.end : shooting_hours.outside.end;
					let breakfast_row = (location_index == 0) ? breakfast.inside : breakfast.outside;
					let lunch_row = (location_index == 0) ? lunch.inside : lunch.outside;

					let team_hours = {
						call: call,
						early_call: '',
						early_call_suppliers: [],
						breakfast_start: breakfast_row.start,
						breakfast_end: breakfast_row.end,
						lunch_start: lunch_row.start,
						lunch_end: lunch_row.end,	
						wrap: '',
						first_shoot: '',
						over_time: '',
						finished: finished,
						finished_suppliers: [],
						comments: ''
					}

					// Get locations
					// Get employees
					let locations = []

					for (var k = 0; k < shooting_day_obj.scenes.length; k++) {
						for (var l = 0; l < shooting_day_obj.scenes[k].length; l++) {
							let scene_obj = shooting_day_obj.scenes[k][l];
							if (scene_obj) {
								locations.push({
									location_def: scene_obj.name,//.toLowerCase().trim(),
									location: scene_obj.location,
									time: scene_obj.time,
									time_type: scene_obj.time_type
								})

								if (scene_obj.pos) {
									shooting_day_obj.scenes[k][l].pos = l;
								} else {
									shooting_day_obj.scenes[k][l] = {...shooting_day_obj.scenes[k][l], pos: l};
								}
							}
						}
					}

					// Get actors & total scenes
					let actors = []
					let total_scenes = []
					for (var k = 0; k < shooting_day_obj.scenes.length; k++) {
						for (var l = 0; l < shooting_day_obj.scenes[k].length; l++) {
							let scene = shooting_day_obj.scenes[k][l];
							if (scene) {
								total_scenes.push(scene);
							}
							if (scene && scene.characters && (scene.characters.length > 0)) {
								for (var m = 0; m < scene.characters.length; m++) {
									let character = scene.characters[m];
									if (character && character.supplier_id && (character.supplier_id > 0)) {
										let supplier = await Supplier.findOne({where: { id: character.supplier_id }})
										if (supplier) {
											supplier = supplier.dataValues;
											let found = false;
											if (actors && (actors.length > 0)) {
												for (var n = 0; n < actors.length; n++) {
													let actor = actors[n];
													if (actor && (actor.id == supplier.id)) {
														let char = {
															character_id: character.id,
															character_name: character.character_name//.toLowerCase().trim()
														}
														if (actor.characters) {
															actor.characters.push(char.character_name/*.toLowerCase().trim()*/);
															found = true;
														}
													}
												}
											}
											if (!found) {
												if (supplier.characters) {
													supplier.characters = characters;
												} else {
													// supplier = {...supplier, characters: [{
													// 		character_id: character.id,
													// 		character_name: character.character_name//.toLowerCase().trim()
													// 	}]
													// }
													supplier = {...supplier, characters: [character.character_name/*.toLowerCase().trim()*/]}
												}

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
	
												actors.push(supplier);
	
												/*let actor = {
													actor_id: supplier.id,
													actor_name: supplier.supplier_name,//.toLowerCase().trim(),
													characters: [{
														character_id: character.id,
														character_name: character.character_name//.toLowerCase().trim()
													}],
													agency: supplier.agency,
													pickup: supplier.pickup,
													site: supplier.site,
													end_time: supplier.end_time,
													hours: 0,
													extra_hours: 0
												}
												actors.push(actor);*/
											}

											if (supplier.characters && (supplier.characters.length > 0)) {
												supplier.characters = supplier.characters.filter((obj, pos, arr) => {
													return arr.map(mapObj => mapObj).indexOf(obj) == pos;
												});
											}
										}
									}
								}
							}
						}
					}
					actors = actors.filter((obj, pos, arr) => {
						return arr.map(mapObj => mapObj.id).indexOf(obj.id) == pos;
					});

					let employees = []
					let suppliers1 = shooting_day_obj.suppliers;
					if (suppliers1 && (suppliers1.length > 0)) {
						for (var m = 0; m < suppliers1.length; m++) {
							let supplier_id = suppliers1[m];
							if (supplier_id && (supplier_id > 0)) {
								let supplier = await Supplier.findOne({where: { id: supplier_id }})
								if (supplier) {
									let employee = {
										id: supplier.id,
										supplier_id: supplier.id,
										supplier_name: supplier.supplier_name,
										pickup: supplier.pickup,
										site: supplier.site,
										end_time: supplier.end_time,
										hours: supplier.hours,
										extra_hours: supplier.extra_hours,
										post_comments: supplier.post_comments
									}
									employees.push(employee);
								}
							}
						}
					}
					/*let suppliers = await Supplier.findAll({where: { company_id: company_id }})
					suppliers = suppliers.splice(1,suppliers.length);
					for (var m = 0; m < suppliers.length; m++) {
						let supplier = suppliers[m];
						if (supplier) {
							let employee = {
								id: supplier.id,
								supplier_id: supplier.id,
								supplier_name: supplier.supplier_name,//.toLowerCase().trim(),
								pickup: supplier.pickup,
								site: supplier.site,
								end_time: supplier.end_time,
								hours: supplier.hours,
								extra_hours: supplier.extra_hours,
								post_comments: supplier.post_comments
							}
							employees.push(employee);
						}
					}*/

					locations = locations.map(item => {
						return {
							location_def: item.location_def,
							set_name: '',
							time: item.time,
							location: item.location,
							comments: ''
						}
					}),

					locations = locations.filter((obj, pos, arr) => {
						return arr.map(mapObj => mapObj.location_def).indexOf(obj.location_def) == pos;
					});

					let extra_expenses = [];
					let post_shooting_day = {
						//scenes: total_scenes,
						team_hours: team_hours,
						locations: locations,
						actors: actors,
						employees: employees,
						extra_expenses: extra_expenses
					}
					let location = '';
					if (first_scene && first_scene.location) {
						location = first_scene.location;
					}
					let params1 = {
						project_id: project_id,
						max_shooting_days: 0,
						params: project_params,
						post_shooting_day: post_shooting_day,
						shooting_day: shooting_day_obj,
						scene_pos: null,
						location: location
					}

					let project_shooting_day = await ProjectShootingDay.create(params1);
					if (project_shooting_day) {
						project_shooting_day = project_shooting_day.dataValues;
					}
					let shooting_day_id = project_shooting_day.id;

					// Add TaskCategory & Tasks (props, makeups, clothes, othes)
					let update_scene = false;
					for (var k = 0; k < shooting_day_obj.scenes.length; k++) {
						// inner loop applies to sub-arrays
						//let arr1 = shooting_day_obj.scenes[k];
						// for (var l = 0; l < shooting_day_obj.scenes[k].length; l++) {
						// 	let scene_obj = shooting_day_obj.scenes[k][l];
						// }
						if (shooting_day_obj.scenes[k] && (shooting_day_obj.scenes[k].length > 0)) {
							shooting_day_obj.scenes[k] = shooting_day_obj.scenes[k].sort(function(a, b) {
								return a.scene_id_number - b.scene_id_number;
							});
							//let arr2 = shooting_day_obj.scenes[k];
							for (var l = 0; l < shooting_day_obj.scenes[k].length; l++) {
								let scene_obj = shooting_day_obj.scenes[k][l];
								if (scene_obj) {

									update_scene = true;
									shooting_day_obj.scenes[k][l] = {...shooting_day_obj.scenes[k][l], shooting_day_id: shooting_day_id};

									let params2 = {
										project_id: project_id,
										project_shooting_day_id: shooting_day_id,
										scene_number: scene_obj.scene_number,
										chapter_number: scene_obj.chapter_number,
										scene: scene_obj,
									}
						
									// let project_shooting_day_scene = await ProjectShootingDayScene.create(params2);
									// if (project_shooting_day_scene) {
									// 	project_shooting_day_scene = project_shooting_day_scene.dataValues;
									// }

									let scene_id = 0;
									if (scene_obj) {
										scene_id = getSceneId(scene_obj.chapter_number, scene_obj.scene_number);
										if (scene_obj.scene_id_number || (scene_obj.scene_id_number && (scene_obj.scene_id_number.length > 0))) {
											scene_id = scene_obj.scene_id_number;
										}
									}

									let supplier_id = null;
									let character_id = null;
									let task_name = '';
									if (scene_obj && scene_obj.props && (scene_obj.props.length > 0)) {
										
										for (var m = 0; m < scene_obj.props.length; m++) {
											let prop = scene_obj.props[m];											
											if (prop) {
												task_name += prop.def + ','

												if ((prop.supplier_id > 0) || (prop.character_id > 0)) {
							
													if (!supplier_id) {
														supplier_id = prop.supplier_id;
														if (!supplier_id || (supplier_id && (supplier_id <= 0))) {
															supplier_id = null
														}
													}

													if (!character_id) {
														character_id = prop.character_id;
														if (!character_id || (character_id && (character_id <= 0))) {
															character_id = null
														}
													}
												}
											}
										}
									}
									
									if (task_name.length > 1) {

										// Add task category if not exist
										let category_name = '';
										if (shooting_day_obj) {
											category_name = shooting_day_obj.name.toLowerCase().trim() + ' - ' + shooting_day_obj.location[0];
										}
				
										let task_category_obj = null;
										let color = '';
										let params = {
											supplier_id: supplier_id,
											project_id: project_id,
											task_category: shooting_day_id,
											task_category_name: category_name,
											shooting_day_id: shooting_day_id,
											color: color
										}

										if (supplier_id && (supplier_id > 0)) {
											task_category_obj = await TaskCategory.findOne({where: { supplier_id: supplier_id, project_id: project_id, task_category: category_name }});
										}
							
										let task_category_id = 0;
										if (task_category_obj && (task_category_obj.id > 0)) {
											task_category_id = task_category_obj.id;
											//task_category_obj = await TaskCategory.update(params, {where: { id: task_category_obj.id }});
											//task_category_obj = await TaskCategory.findOne({where: { supplier_id: supplier_id, project_id: project_id }});
										} else {
											task_category_obj = await TaskCategory.create(params);
											if (task_category_obj) {
												task_category_obj = task_category_obj.dataValues;
												task_category_id = task_category_obj.id;
											}
										}

										// Add task

										let comments = '';
										let task_params = {
											project_id: project_id,
											task_name: task_name,
											supplier_id: supplier_id,
											character_id: character_id,
											task_category_id: task_category_id,
											// task_type_id: 0,
											task_status_id: task_status_active_id,
											//due_date: ,
											comments: comments,
											project_scene_id: scene_id,
											project_shooting_day_id: shooting_day_id,
											project_scene_text: scene_obj.text,
											project_scene_location: scene_obj.location,
											price: scene_obj.price
										}
										let task = await Task.create(task_params);
									}

									// Add TaskCategory & Tasks script (per character) to Task DB
									if (scene_obj && scene_obj.characters && (scene_obj.characters.length > 0)) {

										for (var m = 0; m < scene_obj.characters.length; m++) {
											let character = scene_obj.characters[m];
											if (character && character.supplier_id && (character.supplier_id > 0)) {
												let supplier = await Supplier.findOne({where: { id: character.supplier_id }})
												if (supplier) {
													supplier = supplier.dataValues;

													let supplier_id = character.supplier_id;
													if (!supplier_id || (supplier_id && (supplier_id <= 0))) {
														supplier_id = null
													}

													let character_id = character.character_id;
													if (!character_id || (character_id && (character_id <= 0))) {
														character_id = null
													}

													let category_name = '';
													if (shooting_day_obj) {
														category_name = shooting_day_obj.name.toLowerCase().trim() + ' - ' + shooting_day_obj.location[0];
													}
							
													let task_category_obj = null;
													let color = '';
													let params = {
														supplier_id: supplier_id,
														project_id: project_id,
														task_category: shooting_day_id,
														task_category_name: category_name,
														shooting_day_id: shooting_day_id,
														color: color
													}
							
													if (supplier_id && (supplier_id > 0)) {
														task_category_obj = await TaskCategory.findOne({where: { supplier_id: supplier_id, project_id: project_id, task_category: category_name }});
													}
										
													let task_category_id = 0;
													if (task_category_obj && (task_category_obj.id > 0)) {
														task_category_id = task_category_obj.id;
														//task_category_obj = await TaskCategory.update(params, {where: { id: task_category_obj.id }});
														//task_category_obj = await TaskCategory.findOne({where: { supplier_id: supplier_id, project_id: project_id }});
													} else {
														task_category_obj = await TaskCategory.create(params);
														if (task_category_obj) {
															task_category_obj = task_category_obj.dataValues;
															task_category_id = task_category_obj.id;
														}
													}
							
													let script = scene_obj.script;
													let comments = '';
													let task_params = {
														project_id: project_id,
														task_name: category_name,
														supplier_id: supplier_id,
														character_id: character_id,
														task_category_id: task_category_id,
														// task_type_id: 0,
														task_status_id: task_status_active_id,
														//due_date: ,
														comments: comments,
														script: script,
														project_scene_id: scene_id,
														project_shooting_day_id: 0,//shooting_day_id,
														project_scene_text: scene_obj.text,
														project_scene_location: scene_obj.location,
														price: scene_obj.price
													}
													let task = await Task.create(task_params);
												}
											}
										}
									}
								}
							}
						}
					}

					if (update_scene) {
						let params1 = {
							project_id: project_id,
							max_shooting_days: 0,
							params: project_params,
							shooting_day: shooting_day_obj
						}			
						let project_shooting_day = await ProjectShootingDay.update(params1, {where: { id: shooting_day_id }});
					}
				}
			}
		} else {
		}

		let project_shooting_day_list = []
		let project_shooting_day1 = await ProjectShootingDay.findAll({ 
			where: { project_id: project_id }/*,
			order: [
				['pos', 'ASC']
			]*/
		});
		project_shooting_day1 = project_shooting_day1.sort(function(a, b) {
			return a.pos - b.pos;
		});
		for (var j = 0; j < project_shooting_day1.length; j++) {
			let shooting_day_obj = project_shooting_day1[j].dataValues;
			if (shooting_day_obj && shooting_day_obj.shooting_day) {
				let project_shooting_day_tasks = await Task.findAll({where: { project_shooting_day_id: shooting_day_obj.id }});

				// Get all task_list
				let tasks_list = []
				for (var j2 = 0; j2 < project_shooting_day_tasks.length; j2++) {
					let task_obj = project_shooting_day_tasks[j2].dataValues;
					if (task_obj) {

						let supplier = null;
						if (task_obj.supplier_id && (task_obj.supplier_id > 0)) {
							supplier = await Supplier.findOne({where: { id: task_obj.supplier_id }})
						}

						let supplier_name = '';
						if (supplier && supplier.supplier_name) {
							supplier_name = supplier.supplier_name;
						}

						let character = null;
						if (task_obj.character_id && (task_obj.character_id > 0)) {
							character = await Character.findOne({where: { id: task_obj.character_id }})
						}

						let character_name = '';
						if (character && character.character_name) {
							character_name = character.character_name;
						}

						let task_params = {
							task_id: task_obj.id,
							description: task_obj.task_name,
							supplier_id: task_obj.supplier_id,
							supplier_name: supplier_name,
							character_id: task_obj.character_id,
							character_name: character_name,
							comments: task_obj.comments
						}

						tasks_list.push(task_params)
					}
				}

				if (shooting_day_obj.shooting_day.scenes && (shooting_day_obj.shooting_day.scenes.length > 0)) {
					let total_scenes = [];
					if (shooting_day_obj && shooting_day_obj.shooting_day) {
						if (shooting_day_obj.shooting_day.scenes[0] && shooting_day_obj.shooting_day.scenes[1]) {
							total_scenes = [...shooting_day_obj.shooting_day.scenes[0],...shooting_day_obj.shooting_day.scenes[1]];
						} else {
							if (shooting_day_obj.shooting_day.scenes[0]) {
								total_scenes = [...shooting_day_obj.shooting_day.scenes[0]];
							}
						}
					}
					if (shooting_day_obj.shooting_day.total_scenes && (shooting_day_obj.shooting_day.total_scenes.length > 0)) {
						shooting_day_obj.shooting_day.total_scenes = total_scenes;
					} else {
						if (shooting_day_obj && shooting_day_obj.shooting_day) {
							shooting_day_obj.shooting_day = {...shooting_day_obj.shooting_day, total_scenes: total_scenes};
						}
					}
				}
				
				// Get actors & characters & total_scenes
				let characters = []
				let total_scenes = []
				if (shooting_day_obj && shooting_day_obj.shooting_day && 
					shooting_day_obj.shooting_day.total_scenes && 
					(shooting_day_obj.shooting_day.total_scenes.length > 0)) {
					for (var m = 0; m < shooting_day_obj.shooting_day.total_scenes.length; m++) {
						let scene = shooting_day_obj.shooting_day.total_scenes[m];
						if (scene) {
							total_scenes.push(scene);
						}
						if (scene && scene.characters && (scene.characters.length > 0)) {
							for (var m1 = 0; m1 < scene.characters.length; m1++) {
								let character = scene.characters[m1];
								characters.push(character);
							}
						}
					}
				}
				characters = characters.filter((obj, pos, arr) => {
					return arr.map(mapObj => mapObj.character_name).indexOf(obj.character_name) == pos;
				});

				let char_list = await Character.findAll({where: { project_id: project_id }});
				char_list = char_list.sort(function(a, b) {
					return b.character_count - a.character_count;
				});
				let characters_list = []
				for (var j3 = 0; j3 < characters.length; j3++) {
					let char = characters[j3];
					if (char && char.character_id && (char.character_id > 0)) {
						for (var j4 = 0; j4 < char_list.length; j4++) {
							let char2 = char_list[j4];
							if (char2 && char2.dataValues) {
								char2 = char2.dataValues;
							}
							if (char2 && char2.id && (char2.id == char.character_id)) {
								characters_list.push(char)
							}
						}
					} else {
						characters_list.push(char)
					}
				}
				characters = characters_list.filter((obj, pos, arr) => {
					return arr.map(mapObj => mapObj.character_name).indexOf(obj.character_name) == pos;
				});

				let actors = []
				for (var j1 = 0; j1 < characters.length; j1++) {
					let character = characters[j1];
					if (character && (character.supplier_id > 0)) {
						let supplier = await Supplier.findOne({where: { id: character.supplier_id }})
						if (supplier) {
							supplier = supplier.dataValues;
							let found = false;
							if (actors && (actors.length > 0)) {
								for (var n = 0; n < actors.length; n++) {
									let actor = actors[n];
									if (actor && (actor.id == supplier.id)) {
										let char = {
											character_id: character.id,
											character_name: character.character_name
										}
										if (actor.characters) {
											actor.characters.push(char.character_name);
											found = true;
										}
									}
								}
							}
							if (!found) {
								if (supplier.characters) {
									if (character) {
										supplier.characters.push(character.character_name);
									}
								} else {
									// supplier = {...supplier, characters: [{
									// 		character_id: character.id,
									// 		character_name: character.character_name
									// 	}]
									// }
									if (character) {
										supplier = {...supplier, characters: [character.character_name]}
									  } else {
										supplier = {...supplier, characters: []}
									  }
								}

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

								actors.push(supplier);

								/*let actor = {
									actor_id: supplier.id,
									actor_name: supplier.supplier_name,
									characters: [{
										character_id: character.id,
										character_name: character.character_name
									}],
									agency: supplier.agency,
									pickup: supplier.pickup,
									site: supplier.site,
									end_time: supplier.end_time,
									hours: 0,
									extra_hours: 0
								}
								actors.push(actor);*/
							}

							if (supplier.characters && (supplier.characters.length > 0)) {
								supplier.characters = supplier.characters.filter((obj, pos, arr) => {
									return arr.map(mapObj => mapObj).indexOf(obj) == pos;
								});
							}
						}
					}
				}
				actors = actors.filter((obj, pos, arr) => {
					return arr.map(mapObj => mapObj.id).indexOf(obj.id) == pos;
				});

				if (shooting_day_obj.post_shooting_day && shooting_day_obj.post_shooting_day.actors) {
					shooting_day_obj.post_shooting_day.actors = actors;
				} else {
					shooting_day_obj.post_shooting_day = {...shooting_day_obj.post_shooting_day, actors: actors}
				}

				/*if (shooting_day_obj.post_shooting_day && shooting_day_obj.post_shooting_day.scenes) {
					shooting_day_obj.post_shooting_day.scenes = total_scenes;
				} else {
					shooting_day_obj.post_shooting_day = {...shooting_day_obj.post_shooting_day, scenes: total_scenes}
				}*/

				if (shooting_day_obj.scene_pos && 
					shooting_day_obj.shooting_day && 
					shooting_day_obj.shooting_day.total_scenes &&
					(shooting_day_obj.shooting_day.total_scenes.length > 0) && 
					(shooting_day_obj.scene_pos.length > 0)) {
					let new_total_scenes = []
					for (var j2 = 0; j2 < shooting_day_obj.scene_pos.length; j2++) {
						let id = shooting_day_obj.scene_pos[j2];
						if (id && (id > 0)) {
							for (var j3 = 0; j3 < shooting_day_obj.shooting_day.total_scenes.length; j3++) {
								let scene = shooting_day_obj.shooting_day.total_scenes[j3];
								if (scene && scene.id && (scene.id == id)) {
									new_total_scenes.push(scene);
								}
							}
						}
					}
					if (new_total_scenes && (new_total_scenes.length > 0)) {
						shooting_day_obj.shooting_day.total_scenes = new_total_scenes;
					}
				} else {
				}

				let shooting_day = {
					id: shooting_day_obj.id,
					max_shooting_days: shooting_day_obj.max_shooting_days,
					params: shooting_day_obj.params,
					shooting_day: shooting_day_obj.shooting_day,
					tasks: tasks_list,
					characters: characters,
					actors: actors,
					additional_expenses: shooting_day_obj.additional_expenses,
					general_comments: shooting_day_obj.general_comments,
					post_shooting_day: shooting_day_obj.post_shooting_day,
					scene_pos: shooting_day_obj.scene_pos,
					suppliers: shooting_day_obj.suppliers,
					date: shooting_day_obj.date
				}
				project_shooting_day_list.push(shooting_day);
			}
		}

		//let tasks = await Task.findAll({ where: { project_id: project_id }});
		//let suppliers = await Supplier.findAll({where: { company_id: company_id }});
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
				cb(err);
			} else {

				utils.getAllProjectSuppliers(project_id, function (err, suppliers) {
					if (err) {
						cb(err)
					} else {

						let response = {
							project_id: project_id,
							shooting_days: project_shooting_day_list,
							tasks: tasks,
							suppliers: suppliers,
							budgets: budgets
						}
			
						cb(null, response);
	
					}
				});
			}
		});
	} catch (err) {
		cb(err);
	}
}

async function scriptBreakdownFunc(project_id, project, req, res, next) {
	try {

		if (project_id == 0) {
			let projectId = parseInt(req.body.project_id);
			if (projectId && (projectId > 0)) {
				project_id = projectId;
			}
		}

		if (isNaN(project_id) || (project_id <= 0)) {
			project_id = 0;
			return res.json({
				response: 2,
				err: "No project id"
			})
		}

		if (!project) {
			return res.json({
				response: 2,
				err: 'No project found'
			})
		}

		if (!req.files || !req.files[0] || !req.files[0].path || (req.files[0].path.length == 0)) {

			let script_obj = {
				project_id: project_id,
				name: '',
				date: '',
				chapter_number: 0,
				scenes: [],
				characters: [],
				extras: 0,
				attachments: []
			}

			let scene_time_list = await SceneTime.findAll({where: { project_id: project_id }});
			let scene_location_list = await SceneLocation.findAll({where: { project_id: project_id }});
			let character_list = await Character.findAll({where: { project_id: project_id }});
			
			character_list = character_list.sort(function(a, b) {
				return b.character_count - a.character_count;
			});

			let characters = [];
			for(var j in character_list) {
				var character = character_list[j];
				if (character) {
					characters.push({...character.dataValues, character_id: character.id})
				}
			}

			return res.json({
				response: 0,
				err: "",
				script: script_obj,
				project: project,
				scene_time: scene_time_list,
				scene_location: scene_location_list,
				characters: characters
			})
		}

		let company_id = project ? project.company_id : 0;

		let character_list = [];
		let supplier_list = [];
		let project_script_list = [];
		let project_scene_list = [];
		let task_category_list = [];
		let task_type_list = [];
		let task_status_list = [];
		let budget_type_list = [];
		let budget_status_list = [];
		let props_list_arr = [];
		let props_list = [];
		let makeups_list_arr = [];
		let makeups_list = [];
		let clothes_list_arr = [];
		let clothes_list = [];
		let specials_list_arr = [];
		let specials_list = [];
		let others_list_arr = [];
		let others_list = [];
		let scene_location = [];
		let scene_location_bank = [];
		let scene_location_bank_ref = [];
		let scene_time = [];
		let scene_time_bank = [];
		let scene_time_bank_ref = [];
		let scene_time_def = [];
		let scene_status = [];
		let scene_location_bank_arr = [];
		let scene_time_bank_arr = [];

		if (project_id && (project_id > 0)) {
			character_list = await Character.findAll({where: { project_id: project_id }});

			character_list = character_list.sort(function(a, b) {
				return b.character_count - a.character_count;
			});

			supplier_list = await Supplier.findAll({where: { company_id: company_id }});
			project_script_list = await ProjectScript.findAll({where: { project_id: project_id }});
			project_scene_list = await ProjectScene.findAll({where: { project_id: project_id }});
			task_category_list = await TaskCategory.findAll({where: { project_id: project_id }});
			task_type_list = await TaskType.findAll({});
			task_status_list = await TaskStatus.findAll({});
			budget_type_list = await BudgetType.findAll({});
			budget_status_list = await BudgetStatus.findAll({});
			props_list_arr = await Props.findAll({});
			makeups_list_arr = await Makeups.findAll({});
			clothes_list_arr = await Clothes.findAll({});
			specials_list_arr = await Specials.findAll({});
			others_list_arr = await Others.findAll({});
			scene_location = await SceneLocation.findAll({where: { project_id: project_id }});
			scene_location_bank = await SceneLocationBank.findAll({});
			scene_location_bank_ref = await SceneLocationBankRef.findAll({});
			scene_time = await SceneTime.findAll({where: { project_id: project_id }});
			scene_time_bank = await SceneTimeBank.findAll({});
			scene_time_bank_ref = await SceneTimeBankRef.findAll({});
			scene_time_def = await SceneTimeDef.findAll({});
			scene_status = await SceneStatus.findAll({})
		}

		if (scene_location_bank && (scene_location_bank.length > 0)) {
			for (var i2 = 0; i2 < scene_location_bank.length; i2++) {
				let location = scene_location_bank[i2].dataValues;
				if (location && location.scene_location && (location.scene_location.length > 0) && (location.scene_location_count >= 2)) {
					scene_location_bank_arr.push(location.scene_location);
					scene_location_bank_arr.push(location.scene_location_count);
				}
			}
		}

		if (scene_time_bank && (scene_time_bank.length > 0)) {
			for (var i2 = 0; i2 < scene_time_bank.length; i2++) {
				let time = scene_time_bank[i2].dataValues;
				if (time && time.scene_time && (time.scene_time.length > 0) && (time.scene_time_count >= 2)) {
					scene_time_bank_arr.push(time.scene_time);
					scene_time_bank_arr.push(time.scene_time_count);
				}
			}
		}

		for (var j = 0; j < props_list_arr.length; j++) {
			let prop = props_list_arr[j];
			if (prop) {
				if (!prop.company || (prop.company.length <= 0)) {
					props_list.push(prop);
				} else {
					if (prop.company || (prop.company.length > 0)) {
						for (var j1 = 0; j1 < prop.company.length; j1++) {
							let id = prop.company[j1];
							if (id && (id == company_id)) {
								props_list.push(prop);
							}
						}
					}
				}
			}
		}

		for (var j = 0; j < makeups_list_arr.length; j++) {
			let makeup = makeups_list_arr[j];
			if (makeup) {
				if (!makeup.company || (makeup.company.length <= 0)) {
					makeups_list.push(makeup);
				} else {
					if (makeup.company || (makeup.company.length > 0)) {
						for (var j1 = 0; j1 < makeup.company.length; j1++) {
							let id = makeup.company[j1];
							if (id && (id == company_id)) {
								makeups_list.push(makeup);
							}
						}
					}
				}
			}
		}

		for (var j = 0; j < clothes_list_arr.length; j++) {
			let cloth = clothes_list_arr[j];
			if (cloth) {
				if (!cloth.company || (cloth.company.length <= 0)) {
					clothes_list.push(cloth);
				} else {
					if (cloth.company || (cloth.company.length > 0)) {
						for (var j1 = 0; j1 < cloth.company.length; j1++) {
							let id = cloth.company[j1];
							if (id && (id == company_id)) {
								clothes_list.push(cloth);
							}
						}
					}
				}
			}
		}

		for (var j = 0; j < specials_list_arr.length; j++) {
			let specials = specials_list_arr[j];
			if (specials) {
				if (!specials.company || (specials.company.length <= 0)) {
					specials_list.push(specials);
				} else {
					if (specials.company || (specials.company.length > 0)) {
						for (var j1 = 0; j1 < specials.company.length; j1++) {
							let id = specials.company[j1];
							if (id && (id == company_id)) {
								specials_list.push(specials);
							}
						}
					}
				}
			}
		}

		for (var j = 0; j < others_list_arr.length; j++) {
			let other = others_list_arr[j];
			if (other) {
				if (!other.company || (other.company.length <= 0)) {
					others_list.push(other);
				} else {
					if (other.company || (other.company.length > 0)) {
						for (var j1 = 0; j1 < other.company.length; j1++) {
							let id = other.company[j1];
							if (id && (id == company_id)) {
								others_list.push(other);
							}
						}
					}
				}
			}
		}

		let script_attachments = [];

		var folder = 'p/'+project_id+'/'

		let is_add_file_to_s3 = false;

		let script_list = [];
		let is_return_func = false;

		async function addFileToS3AndScriptBreakdown(file_path) {
			return new Promise(async (resolve,reject)=>{

				let file_name = '';
				let file_id = '';
				let file_path_ = '';
				let local_path = '';
				let script_props_list = [];
				let script_clothes_list = [];
				let script_makeups_list = [];
				let script_specials_list = [];
				let script_others_list = [];
		
				console.log('Project File Upload:',file_path)
				local_path = file_path;
				var name = path.basename(file_path);
				var file_end = name.split('.')[1];
				file_name = apikey(10)+ "."+file_end;
				awsSDK.upload_file_to_s3(file_path, folder, file_name, file_end, async function(err, result) {

					if (err) {
						console.log('err s3:', err);
						if (!is_return_func) {
							res.json({
								response: 1,
								err: err
							})
						}
						is_return_func = true;
						resolve();
						return;
					}

					file_id = result.id;
					file_path_ = result.url;

					is_add_file_to_s3 = true;

					//resolve();
					let content = ''
					file.script_breakdown(file_path_, local_path, folder, file_name, content, scene_location_bank_arr, scene_time_bank_arr, project_id, async function(err, script) {
						if (err) {
							if (!is_return_func) {
								res.json({
									response: 3,
									err: err
								})
							}
							is_return_func = true;
							resolve();
							return;
						} 
						
						if (!script) {
							if (!is_return_func) {
								res.json({
									response: 3,
									err: 'Script Breakdown Failed'
								})
							}
							is_return_func = true;
							resolve();
							return;
						}

						if (script && (!script.chapter_number || (script.chapter_number && (script.chapter_number <= 0)))) {
							if (script.chapter_number && (script.chapter_number <= 0)) {
								script.chapter_number = 1;
							} else {
								if (!script.chapter_numbe) {
									script = {...script, chapter_number: 1}
								}
							}
						}

						let location_array = script.first_word_array;
						let time_array = script.last_word_array;

						let update_project_script = false;
						for(var k in project_script_list) {
							var script_obj2 = project_script_list[k];
							if (script_obj2 && 
								(script_obj2.dataValues.project_id == project_id) &&
								(script_obj2.dataValues.chapter_number == script.chapter_number) && 
								(script.chapter_number > 0)
								) {
								update_project_script = true;
							}
						}

						let update_location = false;
						if (script.loc_bank && (script.loc_bank.length > 0)) {
							for (var i1 = 0; i1 < script.loc_bank.length; i1++) {
								let location = script.loc_bank[i1];
								if (location && (location.length > 0)) {
									let location_name = location[0];
									let location_count = parseInt(location[1]);
									if (location_count < 1) {
										location_count = 1;
									}
									//location_name = location_name.replace(/['"`.,-~=+!@#$%^&*(){}]/g, '');
									location_name = location_name.replace(/[-~=+!@#$%^&*(){}]/g, '');
									location_name = location_name.replace(/[.]/g, '');
									location_name = location_name.replace(/[,]/g, '');
									if (location_name && (location_name.length > 0)) {
										let found1 = false;
										let found2 = false;
										let word_count1 = 0;
										let word_count2 = 0;
										if (scene_location_bank && (scene_location_bank.length > 0)) {
											for (var i2 = 0; ((i2 < scene_location_bank.length) && !found1); i2++) {
												let location2 = scene_location_bank[i2].dataValues.scene_location;
												let location_count2 = scene_location_bank[i2].dataValues.scene_location_count;
												if (location2 && (location2.length > 0)) {
													if (location_name.toLowerCase().trim() == location2.toLowerCase().trim()) {
														found1 = true;
														location_count2 += location_count;
														if (!update_project_script) {
															const response = await SceneLocationBank.update({
																scene_location: location_name,
																scene_location_count: location_count2
															}, {where: {scene_location: location_name}});
															scene_location_bank = await SceneLocationBank.findAll({});
														}
														word_count1 = location_count2;
													}
												}
											}
										}
										if (scene_location_bank_ref && (scene_location_bank_ref.length > 0)) {
											for (var i2 = 0; ((i2 < scene_location_bank_ref.length) && !found2); i2++) {
												let location2 = scene_location_bank_ref[i2].dataValues.scene_location;
												let location_count2 = scene_location_bank_ref[i2].dataValues.scene_location_count;
												if (location2 && (location2.length > 0)) {
													if (location_name.toLowerCase().trim() == location2.toLowerCase().trim()) {
														found2 = true;
														location_count2 += location_count;
														if (!update_project_script) {
															const response = await SceneLocationBankRef.update({
																scene_location: location_name,
																scene_location_count: location_count2
															}, {where: {scene_location: location_name}});
															scene_location_bank_ref = await SceneLocationBankRef.findAll({});
														}
														word_count2 = location_count2;
													}
												}
											}
										}
										if (!found1 && !found2 && !update_project_script && (location_count >= 2)) {
											found2 = true;
											const response = await SceneLocationBankRef.create({
												scene_location: location_name,
												scene_location_count: location_count
											});
											scene_location_bank_ref = await SceneLocationBankRef.findAll({});
											word_count2 = location_count;
										}
										if (!found1 && found2 && (word_count2 >= 50)) {
											update_location = true;
											const response = await SceneLocationBank.create({
												scene_location: location_name,
												scene_location_count: location_count
											});
											scene_location_bank = await SceneLocationBank.findAll({});
											word_count1 = location_count;
										}
									}
								}
							}
						}

						if (update_location) {
							scene_location_bank_arr = [];
							if (scene_location_bank && (scene_location_bank.length > 0)) {
								for (var i2 = 0; i2 < scene_location_bank.length; i2++) {
									let location = scene_location_bank[i2].dataValues;
									if (location && location.scene_location && (location.scene_location.length > 0) && (location.scene_location_count >= 2)) {
										scene_location_bank_arr.push(location.scene_location);
										scene_location_bank_arr.push(location.scene_location_count);
									}
								}
							}
						}

						let time_bank_arr = [];
						let update_time = false;
						// let time_name = '';
						// let time_count = 1;
						if (script.time_bank && (script.time_bank.length > 0)) {
							for (var i1 = 0; i1 < script.time_bank.length; i1++) {
								let time = script.time_bank[i1];
								if (time && (time.length > 0)) {
									let time_name = time[0];
									let time_count = parseInt(time[1]);
									if (time_count < 1) {
										time_count = 1;
									}

									//time_name = time_name.replace(/['"`.,-~=+!@#$%^&*(){}]/g, '');
									time_name = time_name.replace(/[-~=+!@#$%^&*(){}]/g, '');
									time_name = time_name.replace(/[.]/g, '');
									time_name = time_name.replace(/[,]/g, '');

									if (time_name && (time_name.length > 0)) {
										let found1 = false;
										let found2 = false;
										let word_count1 = 0;
										let word_count2 = 0;
										if (scene_time_bank && (scene_time_bank.length > 0)) {
											for (var i2 = 0; ((i2 < scene_time_bank.length) && !found1); i2++) {
												let time2 = scene_time_bank[i2].dataValues.scene_time;
												let time_count2 = scene_time_bank[i2].dataValues.scene_time_count;
												if (time2 && (time2.length > 0)) {
													if (time_name.toLowerCase().trim() == time2.toLowerCase().trim()) {
														found1 = true;
														time_count2 += time_count;
														if (!update_project_script) {
															const response = await SceneTimeBank.update({
																scene_time: time_name,
																scene_time_count: time_count2
															}, {where: {scene_time: time_name}});
															scene_time_bank = await SceneTimeBank.findAll({});
														}
														word_count1 = time_count2;
													}
												}
											}
										}
										if (scene_time_bank_ref && (scene_time_bank_ref.length > 0)) {
											for (var i2 = 0; ((i2 < scene_time_bank_ref.length) && !found2); i2++) {
												let time2 = scene_time_bank_ref[i2].dataValues.scene_time;
												let time_count2 = scene_time_bank_ref[i2].dataValues.scene_time_count;
												if (time2 && (time2.length > 0)) {
													if (time_name.toLowerCase().trim() == time2.toLowerCase().trim()) {
														found2 = true;
														time_count2 += time_count;
														if (!update_project_script) {
															const response = await SceneTimeBankRef.update({
																scene_time: time_name,
																scene_time_count: time_count2
															}, {where: {scene_time: time_name}});
															scene_time_bank_ref = await SceneTimeBankRef.findAll({});
														}
														word_count2 = time_count2;
													}
												}
											}
										}
										if (!found1 && !found2 && !update_project_script && (time_count >= 2)) {
											found2 = true;
											const response = await SceneTimeBankRef.create({
												scene_time: time_name,
												scene_time_count: time_count
											});
											scene_time_bank_ref = await SceneTimeBankRef.findAll({});
											word_count2 = time_count;
										}
										if (!found1 && found2 && (word_count2 >= 50)) {
											update_time = true;
											const response = await SceneTimeBank.create({
												scene_time: time_name,
												scene_time_count: time_count
											});
											scene_time_bank = await SceneTimeBank.findAll({});
											word_count1 = time_count;
										}
									}
								}
							}
						}

						if (update_time) {
							scene_time_bank_arr = [];
							if (scene_time_bank && (scene_time_bank.length > 0)) {
								for (var i2 = 0; i2 < scene_time_bank.length; i2++) {
									let time = scene_time_bank[i2].dataValues;
									if (time && time.scene_time && (time.scene_time.length > 0) && (time.scene_time_count >= 2)) {
										scene_time_bank_arr.push(time.scene_time);
										scene_time_bank_arr.push(time.scene_time_count);
									}
								}
							}
						}

						let update_db = false;
						if (location_array) {
							for (var j = 0; j < location_array.length; j++) {
								let location2 = location_array[j];
								let found = false;
								for (var i = 0; i < scene_location.length; i++) {
									let project_id1 = scene_location[i].dataValues.project_id;
									let location1 = scene_location[i].dataValues.scene_location;
									if (location1 && location2 && 
										(location1.toLowerCase().trim() == location2.toLowerCase().trim()) &&
										(project_id1 == project_id)) {
										found = true;
									}
								}
								if (!found && location2 && (location2.length > 0)) {
									update_db = true;
									const response = await SceneLocation.create({
										project_id: project_id,
										scene_location: location2
									});
								}
							}
						}
						if (update_db) {
							scene_location = await SceneLocation.findAll({where: { project_id: project_id }});
						}

						update_db = false;
						if (time_array) {
							for (var j = 0; j < time_array.length; j++) {
								let time2 = time_array[j];//.toLowerCase().trim();
								let found = false;
								for (var i = 0; i < scene_time.length; i++) {
									let project_id1 = scene_time[i].dataValues.project_id;
									let time1 = scene_time[i].dataValues.scene_time;//.toLowerCase().trim();
									if (time1 && time2 && 
										(time1.toLowerCase().trim() == time2.toLowerCase().trim()) && 
										(project_id1 == project_id)) {
										found = true;
									}
								}
								if (!found && time2 && (time2.length > 0)) {
									update_db = true;
									let scene_time_type = 0;
									let max_day_duration = config.max_day_duration * 60;
									let max_night_duration = config.max_night_duration * 60;
									let max_shooting_duration = config.max_shooting_duration * 60;
									let default_scene_time = config.default_scene_time_min;
									let max_shooting_scenes = 8;
									let color = '#ffffff';
									for (var i = 0; i < scene_time_def.length; i++) {
										let project_id1 = scene_time_def[i].dataValues.project_id;
										let time1 = scene_time_def[i].dataValues.scene_time;//.toLowerCase().trim();
										let scene_time_type1 = scene_time_def[i].dataValues.scene_time_type;
										let color1 = scene_time_def[i].dataValues.color;
										let max_shooting_scenes1 = scene_time_def[i].dataValues.max_shooting_scenes;
										let max_shooting_duration1 = scene_time_def[i].dataValues.max_shooting_duration;
										let default_scene_time1 = scene_time_def[i].dataValues.default_scene_time;
										if (time1 && time2 && 
											((time1.toLowerCase().trim().includes(time2.toLowerCase().trim())) || 
											(time2.toLowerCase().trim().includes(time1.toLowerCase().trim())))) {
											if (color1 && (color1.length > 0)) {
												color = color1;
											}
											scene_time_type = scene_time_type1;
											max_shooting_scenes = max_shooting_scenes1;
											max_shooting_duration = max_shooting_duration1;
											default_scene_time = default_scene_time1;
										}
									}
	
									const response = await SceneTime.create({
										project_id: project_id,
										scene_time: time2,
										scene_time_type: scene_time_type,
										max_shooting_scenes: max_shooting_scenes,
										max_shooting_duration: max_shooting_duration,
										default_scene_time: default_scene_time,
										color: color
									});
								}
							}
						}
						if (update_db) {
							scene_time = await SceneTime.findAll({where: { project_id: project_id }});
						}

						let text1 = '';
						if (script.name) {
							text1 = script.name;
						}
						var obj = {
							file_name: file_name,
							file_id: result.id,
							file_url: result.url,
							text: text1
						}
						script_attachments.push(obj);

						let script_characters_list = [];
						if (script && script.characters && (script.characters.length > 0)) {
							script_characters_list = script.characters_count;

							if (script_characters_list && (script_characters_list.length > 0)) {
								for (var i1 = 0; i1 < script_characters_list.length; i1++) {
									let char_obj = script_characters_list[i1];
									if (char_obj && (char_obj.length > 0)) {
										let char = char_obj[0];
										let char_count = parseInt(char_obj[1]);
										if (char_count < 1) {
											char_count = 1;
										}
								
										if (char && (char.length > 0)) {

											let character_name = char;

											var subString = '';
											if (character_name && (character_name.length > 0)) {
												if (character_name.includes('(') && character_name.includes(')')) {
													subString = character_name.substring(
														character_name.lastIndexOf('(') + 1,
														character_name.lastIndexOf(')')
													);
													if (subString.length == 0) {
														subString = character_name.substring(
															character_name.lastIndexOf(')') + 1,
															character_name.lastIndexOf('(')
														);
													}
												}
												if (subString.length > 0) {
													character_name = character_name.replace(subString, '');
													character_name = character_name.replace('(', '');
													character_name = character_name.replace(')', '');
													character_name = character_name;
												}
								
												let character_id = 0;
												let character_type = 0;
												let supplier_id = 0;
												let character_count = 1;
												let character_exist = false;

												for(var k in character_list) {
													var character = character_list[k];
													if (character && (character.dataValues.character_name == character_name)) {
														character_exist = true;
														character_id = character.dataValues.id;
														character_type = character.dataValues.character_type;
														supplier_id = character.dataValues.supplier_id;
														character_count = character.dataValues.character_count;

														char_count += character_count;
														if (!update_project_script) {
															let response = await Character.update({
																character_name: character_name,
																character_type: character_type,
																project_id: project_id,
																supplier_id: supplier_id,
																character_count: char_count
															}, {where: { project_id: project_id, character_name: character_name}});
														}
													}
												}

												let char_name = character_name.trim();
												if (!character_exist && (char_name.length > 0)) {
													let character_obj = await Character.findOne({where: { project_id: project_id, character_name: character_name }});
													if (character_obj) {
														character_id = character_obj.dataValues.id;
														character_type = character_obj.dataValues.character_type;
														supplier_id = character_obj.dataValues.supplier_id;
														character_count = character_obj.dataValues.character_count;

														char_count += character_count;
														if (!update_project_script) {
															let response = await Character.update({
																character_name: character_name,
																character_type: character_type,
																project_id: project_id,
																supplier_id: supplier_id,
																character_count: char_count
															}, {where: { project_id: project_id, character_name: character_name}});
														}
													} else {
														let response = await Character.create({
															character_name: character_name,
															character_type: character_type,
															project_id: project_id,
															supplier_id: supplier_id,
															character_count: char_count
														});
														character_id = response.dataValues.id;
														character_type = response.dataValues.character_type;
													}
												}
												
												character_list = await Character.findAll({where: { project_id: project_id }});

												character_list = character_list.sort(function(a, b) {
													return b.character_count - a.character_count;
												});
																					
											}
										}
									}
								}
							}
						}

						script_characters_list = script_characters_list.sort(function(a, b) {
							return b.character_count - a.character_count;
						});

						let word_count = 0;
						let scenes = script.scenes;
						if (scenes && (scenes.length > 0)) {
		
							let title = '';
							let content  = '';
							let scene_summary = '';
							//scenes.forEach(async(scene) => {
							for(var a in scenes) {
								var scene = scenes[a];

								if (scene) {
		
									let scene_obj = scene;
									let scene_word_count = 0;
		
									scenes[a].name = scene_obj.name;//.toLowerCase().trim();
									scenes[a].text = scene_obj.text;//.toLowerCase().trim();

									if (!scene_obj.chapter_number || (scene_obj.chapter_number && (scene_obj.chapter_number <= 0))) {
										scene_obj.chapter_number = 1;
									}

									let default_scene_time = config.default_scene_time_min;
									if (!scene.eighth || (scene.eighth && (scene.eighth < 1))) {
										if (!scene.eighth) {
											scenes[a] = {...scenes[a], eighth: 1}
										} else {
											scenes[a].eighth = 1;
										}
									}
									let duration = scenes[a].eighth * (60 / 8);
									if (isNaN(duration) || (duration < default_scene_time)) {
										//duration = default_scene_time;
									}
									// Add scene_duration to scenes
									if (scene.scene_duration && (scene.scene_duration >= default_scene_time)) {
									} else {
										if (scene.scene_duration && (scene.scene_duration < default_scene_time)) {
											scenes[a].scene_duration = duration;
											if (scene.scene_duration && (scene.scene_duration < default_scene_time)) {
												//scenes[a].scene_duration = default_scene_time;
											}
										} else {
											if (!scene.scene_duration) {
												scenes[a] = {...scenes[a], scene_duration: duration};
											}
										}
									}
											
									let scene_type = scene_obj.type;
									let scene_name = scene_obj.name;
									let scene_text = scene_obj.text;
									let chapter_number = scene_obj.chapter_number;
									let scene_number = scene_obj.scene_number;
									let scene_props_list = [];
									let scene_characters_list = [];
									let scene_clothes_list = [];
									let scene_makeups_list = [];
									let scene_specials_list = [];
									let scene_others_list = [];
									let extras = 0;

									let reshoots = 0;
									if (scene && scene.reshoot && (scene.reshoot > 0)) {
										reshoots = scene.reshoot;
									}

									if (!scene.reshoots) {
										scenes[a] = {...scenes[a], reshoots: reshoots}
									}

									if (!scene.pos) {
										scenes[a] = {...scenes[a], pos: 0}
									}

									let scene_id = '';
									if (scene_obj.scene_id_number || (scene_obj.scene_id_number && (scene_obj.scene_id_number.length > 0))) {
										scene_id = scene_obj.scene_id_number;
									} else {
										scene_id = getSceneId(scene_obj.chapter_number, scene_obj.scene_number);
									}

									if (scene.scene_id_number) {
										scenes[a].scene_id_number = scene_id;
									} else {
										scenes[a] = {...scenes[a], scene_id: scene_id}
									}
									
									for (var i = 0; i < scene_location.length; i++) {
										let location = scene_location[i].dataValues.scene_location;
										if (location && (location.length > 0) && scene.location && (scene.location.length > 0)) {
											if (	
												(scene.location.toLowerCase().trim().includes(location.toLowerCase().trim())) ||
												(location.toLowerCase().trim().includes(scene.location.toLowerCase().trim()))
											) {
											}
										}
									}

									let found_time = false;
									for (var i = 0; i < scene_time.length; i++) {
										let time = scene_time[i].dataValues.scene_time;
										let time_type = scene_time[i].dataValues.scene_time_type;
										let time_id = scene_time[i].dataValues.id;
										let color = scene_time[i].dataValues.color;
										if (time && (time.length > 0) && scene.time && (scene.time.length > 0)) {
											//if (scene.time == time) {
											if ((scene.time.toLowerCase().trim().includes(time.toLowerCase().trim())) || 
												(time.toLowerCase().trim().includes(scene.time.toLowerCase().trim()))) { 
												if (!found_time) {
													found_time = true;
													if (scene && !scene.time_id) {
														scenes[a] = {...scenes[a], time_id: time_id}
													}
													scenes[a] = {...scenes[a], time_type: time_type}
													scenes[a] = {...scenes[a], color: color}
												}
											}
										}
									}

									if (scene.characters && (scene.characters.length > 0)) {
										for (var i1 = 0; i1 < scene.characters.length; i1++) {
											let char = scene.characters[i1];
											if (char) {
	
												let character_name = char;

												var subString = '';
												if (character_name.includes('(') && character_name.includes(')')) {
													subString = character_name.substring(
														character_name.lastIndexOf('(') + 1,
														character_name.lastIndexOf(')')
													);
													if (subString.length == 0) {
														subString = character_name.substring(
															character_name.lastIndexOf(')') + 1,
															character_name.lastIndexOf('(')
														);
													}
												}
												if (subString.length > 0) {
													character_name = character_name.replace(subString, '');
													character_name = character_name.replace('(', '');
													character_name = character_name.replace(')', '');
													character_name = character_name;
												}
								
												let character_id = 0;
												let character_type = 0;
												let supplier_id = 0;
												let character_exist = false;
												let scene_character_exist = false;

												for(var k in character_list) {
													var character = character_list[k];
													if (character && (character.dataValues.character_name == character_name)) {
														character_exist = true;
														character_id = character.dataValues.id;
														character_type = character.dataValues.character_type;
														supplier_id = character.dataValues.supplier_id;
													}
												}

												let char_name = character_name.trim();
												if (0 && !character_exist && (char_name.length > 0)) {
													let response = await Character.create({
														character_name: character_name,
														character_type: character_type,
														project_id: project_id,
														supplier_id: supplier_id
													});
													character_id = response.dataValues.id;
													character_type = response.dataValues.character_type;
													character_list = await Character.findAll({where: { project_id: project_id }});

													character_list = character_list.sort(function(a, b) {
														return b.character_count - a.character_count;
													});													
												}

												for(var k in scene_characters_list) {
													var scene_character = scene_characters_list[k];
													if (scene_character && (scene_character.character_name == character_name)) {
														scene_character_exist = true;
														character_id = character.dataValues.id;
														character_type = character.dataValues.character_type;
														supplier_id = character.dataValues.supplier_id;
													}
												}

												if (!scene_character_exist) {
													for(var k in character_list) {
														var character = character_list[k];
														if (!scene_character_exist && character && (character.dataValues.character_name == character_name)) {
															let character_obj = {
																character_id: character.dataValues.id,
																character_name: character.dataValues.character_name,//.toLowerCase().trim(),
																character_type: character.dataValues.character_type,
																supplier_id: character.dataValues.supplier_id,
																project_id: project_id
															}
															scene_character_exist = true;
															scene_characters_list.push(character_obj);
														}
													}
												}
											}
										}
									}

									title = scene.name;

									let script = scene.script;
									if (script && (script.length > 0)) {
										//script.forEach(async(script_obj) => {
										for(var b in script) {
											var script_obj = script[b];

                                            if (script_obj && (script_obj.type == 'character')) {
                                                content += script_obj.character+': '+script_obj.text + '\n';
                                                if (script_obj.text && (script_obj.text.length > 0)) {
                                                    let words = extractwords(script_obj.text, {lowercase: true, punctuation: true});
                                                    word_count += words.length;
                                                    scene_word_count += words.length;
                                                }											
											}

											async function findWords(script_obj) {
												return new Promise(async (resolve,reject)=>{

													if (script_obj && script_obj.text && (script_obj.text.length > 0)) {

														let text = script_obj.text;

														for (var j = 0; j < props_list.length; j++) {
															let word_props = props_list[j].dataValues.word;

															let word_props_arr = [];
															if (word_props && (word_props.length > 0)) {
																word_props_arr = extractwords(word_props, {lowercase: true, punctuation: true});
															}
															if (word_props_arr && (word_props_arr.length > 1)) {

																if (word_props && (word_props.length > 0)) {
																	if (text.includes(word_props)) {

																		let script_word_exist = false;
																		for (var k = 0; ((k < script_props_list.length) && !script_word_exist); k++) {
																			let word2 = script_props_list[k];
																			if (word2 && (word2.length > 0) && (word2 == word_props)) {
																				script_word_exist = true;
																			}
																		}
																		if (!script_word_exist) {
																			let prop_obj = {
																				def: word_props,
																				supplier_id: 0,
																				supplier_name: '',
																				character_id: 0,
																				character_name: '',
																				comments: ''
																			}
																			script_props_list.push(prop_obj);
																		}

																		let scene_word_exist = false;
																		for (var k = 0; ((k < scene_props_list.length) && !scene_word_exist); k++) {
																			let word2 = scene_props_list[k];
																			if (word2 && (word2.length > 0) && (word2 == word_props)) {
																				scene_word_exist = true;
																			}
																		}
																		if (!scene_word_exist) {
																			let prop_obj = {
																				def: word_props,
																				supplier_id: 0,
																				supplier_name: '',
																				character_id: 0,
																				character_name: '',
																				comments: ''
																			}
																			scene_props_list.push(prop_obj);
																		}
																	}
																}
															} else {
																if (text && (text.length > 0)) {
																	let words_arr = extractwords(text, {lowercase: true, punctuation: true});
																	if (words_arr && (words_arr.length > 0)) {
																		for (var i = 0; i < words_arr.length; i++) {
																			let word = words_arr[i];
																			if (word && (word.length > 0) && (word == word_props)) {

																				let script_word_exist = false;
																				for (var k = 0; ((k < script_props_list.length) && !script_word_exist); k++) {
																					let word2 = script_props_list[k];
																					if (word2 && (word2.length > 0) && (word2 == word_props)) {
																						script_word_exist = true;
																					}
																				}
																				if (!script_word_exist) {
																					let prop_obj = {
																						def: word_props,
																						supplier_id: 0,
																						supplier_name: '',
																						character_id: 0,
																						character_name: '',
																						comments: ''
																					}
																					script_props_list.push(prop_obj);
																				}

																				let scene_word_exist = false;
																				for (var k = 0; ((k < scene_props_list.length) && !scene_word_exist); k++) {
																					let word2 = scene_props_list[k];
																					if (word2 && (word2.length > 0) && (word2 == word_props)) {
																						scene_word_exist = true;
																					}
																				}
																				if (!scene_word_exist) {
																					let prop_obj = {
																						def: word_props,
																						supplier_id: 0,
																						supplier_name: '',
																						character_id: 0,
																						character_name: '',
																						comments: ''
																					}
																					scene_props_list.push(prop_obj);
																				}
																			}
																		}
																	}
																}
															}
														}

														for (var j = 0; j < makeups_list.length; j++) {
															let word_makeups = makeups_list[j].dataValues.word;

															let word_makeups_arr = [];
															if (word_makeups && (word_makeups.length > 0)) {
																word_makeups_arr = extractwords(word_makeups, {lowercase: true, punctuation: true});
															}
															if (word_makeups_arr && (word_makeups_arr.length > 1)) {

																if (word_makeups && (word_makeups.length > 0)) {
																	if (text.includes(word_makeups)) {

																		let script_word_exist = false;
																		for (var k = 0; ((k < script_makeups_list.length) && !script_word_exist); k++) {
																			let word2 = script_makeups_list[k];
																			if (word2 && (word2.length > 0) && (word2 == word_makeups)) {
																				script_word_exist = true;
																			}
																		}
																		if (!script_word_exist) {
																			let prop_obj = {
																				def: word_makeups,
																				supplier_id: 0,
																				supplier_name: '',
																				character_id: 0,
																				character_name: '',
																				comments: ''
																			}
																			script_makeups_list.push(prop_obj);
																		}

																		let scene_word_exist = false;
																		for (var k = 0; ((k < scene_makeups_list.length) && !scene_word_exist); k++) {
																			let word2 = scene_makeups_list[k];
																			if (word2 && (word2.length > 0) && (word2 == word_makeups)) {
																				scene_word_exist = true;
																			}
																		}
																		if (!scene_word_exist) {
																			let prop_obj = {
																				def: word_makeups,
																				supplier_id: 0,
																				supplier_name: '',
																				character_id: 0,
																				character_name: '',
																				comments: ''
																			}
																			scene_makeups_list.push(prop_obj);
																		}
																	}
																}
															} else {

																if (text && (text.length > 0)) {
																	let words_arr = extractwords(text, {lowercase: true, punctuation: true});
																	if (words_arr && (words_arr.length > 0)) {
																		for (var i = 0; i < words_arr.length; i++) {
																			let word = words_arr[i];
																			if (word && (word.length > 0) && (word == word_makeups)) {

																				let script_word_exist = false;
																				for (var k = 0; ((k < script_makeups_list.length) && !script_word_exist); k++) {
																					let word2 = script_makeups_list[k];
																					if (word2 && (word2.length > 0) && (word2 == word_makeups)) {
																						script_word_exist = true;
																					}
																				}
																				if (!script_word_exist) {
																					let prop_obj = {
																						def: word_makeups,
																						supplier_id: 0,
																						supplier_name: '',
																						character_id: 0,
																						character_name: '',
																						comments: ''
																					}
																					script_makeups_list.push(prop_obj);
																				}

																				let scene_word_exist = false;
																				for (var k = 0; ((k < scene_makeups_list.length) && !scene_word_exist); k++) {
																					let word2 = scene_makeups_list[k];
																					if (word2 && (word2.length > 0) && (word2 == word_makeups)) {
																						scene_word_exist = true;
																					}
																				}
																				if (!scene_word_exist) {
																					let prop_obj = {
																						def: word_makeups,
																						supplier_id: 0,
																						supplier_name: '',
																						character_id: 0,
																						character_name: '',
																						comments: ''
																					}
																					scene_makeups_list.push(prop_obj);
																				}
																			}
																		}
																	}
																}
															}
														}

														for (var j = 0; j < clothes_list.length; j++) {
															let word_clothes = clothes_list[j].dataValues.word;

															let word_clothes_arr = [];
															if (word_clothes && (word_clothes.length > 0)) {
																word_clothes_arr = extractwords(word_clothes, {lowercase: true, punctuation: true});
															}
															if (word_clothes_arr && (word_clothes_arr.length > 1)) {

																if (word_clothes && (word_clothes.length > 0)) {
																	if (text.includes(word_clothes)) {

																		let script_word_exist = false;
																		for (var k = 0; ((k < script_clothes_list.length) && !script_word_exist); k++) {
																			let word2 = script_clothes_list[k];
																			if (word2 && (word2.length > 0) && (word2 == word_clothes)) {
																				script_word_exist = true;
																			}
																		}
																		if (!script_word_exist) {
																			let prop_obj = {
																				def: word_clothes,
																				supplier_id: 0,
																				supplier_name: '',
																				character_id: 0,
																				character_name: '',
																				comments: ''
																			}
																			script_clothes_list.push(prop_obj);
																		}

																		let scene_word_exist = false;
																		for (var k = 0; ((k < scene_clothes_list.length) && !scene_word_exist); k++) {
																			let word2 = scene_clothes_list[k];
																			if (word2 && (word2.length > 0) && (word2 == word_clothes)) {
																				scene_word_exist = true;
																			}
																		}
																		if (!scene_word_exist) {
																			let prop_obj = {
																				def: word_clothes,
																				supplier_id: 0,
																				supplier_name: '',
																				character_id: 0,
																				character_name: '',
																				comments: ''
																			}
																			scene_clothes_list.push(prop_obj);
																		}
																	}
																}
															} else {

																if (text && (text.length > 0)) {
																	let words_arr = extractwords(text, {lowercase: true, punctuation: true});
																	if (words_arr && (words_arr.length > 0)) {
																		for (var i = 0; i < words_arr.length; i++) {
																			let word = words_arr[i];
																			if (word && (word.length > 0) && (word == word_clothes)) {

																				let script_word_exist = false;
																				for (var k = 0; ((k < script_clothes_list.length) && !script_word_exist); k++) {
																					let word2 = script_clothes_list[k];
																					if (word2 && (word2.length > 0) && (word2 == word_clothes)) {
																						script_word_exist = true;
																					}
																				}
																				if (!script_word_exist) {
																					let prop_obj = {
																						def: word_clothes,
																						supplier_id: 0,
																						supplier_name: '',
																						character_id: 0,
																						character_name: '',
																						comments: ''
																					}
																					script_clothes_list.push(prop_obj);
																				}

																				let scene_word_exist = false;
																				for (var k = 0; ((k < scene_clothes_list.length) && !scene_word_exist); k++) {
																					let word2 = scene_clothes_list[k];
																					if (word2 && (word2.length > 0) && (word2 == word_clothes)) {
																						scene_word_exist = true;
																					}
																				}
																				if (!scene_word_exist) {
																					let prop_obj = {
																						def: word_clothes,
																						supplier_id: 0,
																						supplier_name: '',
																						character_id: 0,
																						character_name: '',
																						comments: ''
																					}
																					scene_clothes_list.push(prop_obj);
																				}
																			}
																		}
																	}
																}
															}
														}

														for (var j = 0; j < specials_list.length; j++) {
															let word_specials = specials_list[j].dataValues.word;

															let word_specials_arr = [];
															if (word_specials && (word_specials.length > 0)) {
																word_specials_arr = extractwords(word_specials, {lowercase: true, punctuation: true});
															}
															if (word_specials_arr && (word_specials_arr.length > 1)) {

																if (word_specials && (word_specials.length > 0)) {
																	if (text.includes(word_specials)) {

																		let script_word_exist = false;
																		for (var k = 0; ((k < script_specials_list.length) && !script_word_exist); k++) {
																			let word2 = script_specials_list[k];
																			if (word2 && (word2.length > 0) && (word2 == word_specials)) {
																				script_word_exist = true;
																			}
																		}
																		if (!script_word_exist) {
																			let prop_obj = {
																				def: word_specials,
																				supplier_id: 0,
																				supplier_name: '',
																				character_id: 0,
																				character_name: '',
																				comments: ''
																			}
																			script_specials_list.push(prop_obj);
																		}

																		let scene_word_exist = false;
																		for (var k = 0; ((k < scene_specials_list.length) && !scene_word_exist); k++) {
																			let word2 = scene_specials_list[k];
																			if (word2 && (word2.length > 0) && (word2 == word_specials)) {
																				scene_word_exist = true;
																			}
																		}
																		if (!scene_word_exist) {
																			let prop_obj = {
																				def: word_specials,
																				supplier_id: 0,
																				supplier_name: '',
																				character_id: 0,
																				character_name: '',
																				comments: ''
																			}
																			scene_specials_list.push(prop_obj);
																		}
																	}
																}
															} else {

																if (text && (text.length > 0)) {
																	let words_arr = extractwords(text, {lowercase: true, punctuation: true});
																	if (words_arr && (words_arr.length > 0)) {
																		for (var i = 0; i < words_arr.length; i++) {
																			let word = words_arr[i];
																			if (word && (word.length > 0) && (word == word_specials)) {

																				let script_word_exist = false;
																				for (var k = 0; ((k < script_specials_list.length) && !script_word_exist); k++) {
																					let word2 = script_specials_list[k];
																					if (word2 && (word2.length > 0) && (word2 == word_specials)) {
																						script_word_exist = true;
																					}
																				}
																				if (!script_word_exist) {
																					let prop_obj = {
																						def: word_specials,
																						supplier_id: 0,
																						supplier_name: '',
																						character_id: 0,
																						character_name: '',
																						comments: ''
																					}
																					script_specials_list.push(prop_obj);
																				}

																				let scene_word_exist = false;
																				for (var k = 0; ((k < scene_specials_list.length) && !scene_word_exist); k++) {
																					let word2 = scene_specials_list[k];
																					if (word2 && (word2.length > 0) && (word2 == word_specials)) {
																						scene_word_exist = true;
																					}
																				}
																				if (!scene_word_exist) {
																					let prop_obj = {
																						def: word_specials,
																						supplier_id: 0,
																						supplier_name: '',
																						character_id: 0,
																						character_name: '',
																						comments: ''
																					}
																					scene_specials_list.push(prop_obj);
																				}
																			}
																		}
																	}
																}
															}
														}

														for (var j = 0; j < others_list.length; j++) {
															let word_others = others_list[j].dataValues.word;

															let word_others_arr = [];
															if (word_others && (word_others.length > 0)) {
																word_others_arr = extractwords(word_others, {lowercase: true, punctuation: true});
															}
															if (word_others_arr && (word_others_arr.length > 1)) {

																if (word_others && (word_others.length > 0)) {
																	if (text.includes(word_others)) {

																		let script_word_exist = false;
																		for (var k = 0; ((k < script_others_list.length) && !script_word_exist); k++) {
																			let word2 = script_others_list[k];
																			if (word2 && (word2.length > 0) && (word2 == word_others)) {
																				script_word_exist = true;
																			}
																		}
																		if (!script_word_exist) {
																			let prop_obj = {
																				def: word_others,
																				supplier_id: 0,
																				supplier_name: '',
																				character_id: 0,
																				character_name: '',
																				comments: ''
																			}
																			script_others_list.push(prop_obj);
																		}

																		let scene_word_exist = false;
																		for (var k = 0; ((k < scene_others_list.length) && !scene_word_exist); k++) {
																			let word2 = scene_others_list[k];
																			if (word2 && (word2.length > 0) && (word2 == word_others)) {
																				scene_word_exist = true;
																			}
																		}
																		if (!scene_word_exist) {
																			let prop_obj = {
																				def: word_others,
																				supplier_id: 0,
																				supplier_name: '',
																				character_id: 0,
																				character_name: '',
																				comments: ''
																			}
																			scene_others_list.push(prop_obj);
																		}
																	}
																}
															} else {

																if (text && (text.length > 0)) {
																	let words_arr = extractwords(text, {lowercase: true, punctuation: true});
																	if (words_arr && (words_arr.length > 0)) {
																		for (var i = 0; i < words_arr.length; i++) {
																			let word = words_arr[i];
																			if (word && (word.length > 0) && (word == word_others)) {

																				let script_word_exist = false;
																				for (var k = 0; ((k < script_others_list.length) && !script_word_exist); k++) {
																					let word2 = script_others_list[k];
																					if (word2 && (word2.length > 0) && (word2 == word_others)) {
																						script_word_exist = true;
																					}
																				}
																				if (!script_word_exist) {
																					let prop_obj = {
																						def: word_others,
																						supplier_id: 0,
																						supplier_name: '',
																						character_id: 0,
																						character_name: '',
																						comments: ''
																					}
																					script_others_list.push(prop_obj);
																				}

																				let scene_word_exist = false;
																				for (var k = 0; ((k < scene_others_list.length) && !scene_word_exist); k++) {
																					let word2 = scene_others_list[k];
																					if (word2 && (word2.length > 0) && (word2 == word_others)) {
																						scene_word_exist = true;
																					}
																				}
																				if (!scene_word_exist) {
																					let prop_obj = {
																						def: word_others,
																						supplier_id: 0,
																						supplier_name: '',
																						character_id: 0,
																						character_name: '',
																						comments: ''
																					}
																					scene_others_list.push(prop_obj);
																				}
																			}
																		}
																	}
																}
															}
														}

													} else {
													}
													resolve();
												})
											}

											const pormises_words = []
											pormises_words.push(findWords(script_obj))
											await Promise.all(pormises_words)
										}//)
									}

									let scene_exist = false;
		
									let scene_characters_count = 0;
									if (scene_characters_list.length > 0) {
										scene_characters_count = scene_characters_list.length;
									}
									scene_props_list = scene_props_list.filter((obj, pos, arr) => {
										return arr.map(mapObj => mapObj.def).indexOf(obj.def) == pos;
									});

									/*async function getSummery(title, content) {
										return new Promise(async (resolve,reject)=>{
											scene_summary = title;
											return resolve();
										})
									}

									const pormises_summery = []
									pormises_summery.push(getSummery(title, content))
									await Promise.all(pormises_summery)*/

									// Add props / makeup / specials / others [{ def: 'סולם', supplier_id: 1, supplier_name: 'name', character_id: 0, character_name: '', comments: ''}]
									// change props jason array
									let project_scene_id = 0;
									for(var j in project_scene_list) {
										var scene_obj2 = project_scene_list[j];
										if (scene_obj2 && (scene_number > 0) && (chapter_number > 0) && 
											(scene_obj2.dataValues.scene_number == scene_number) &&
											(scene_obj2.dataValues.chapter_number == chapter_number)
											) {
											scene_exist = true;
											if (!scenes[a].scene_duration || isNaN(scenes[a].scene_duration)) {
												scenes[a].scene_duration = 0;
											}
											let response = await ProjectScene.update({
												scene_name: scene_name,//.toLowerCase().trim(),
												scene_number: scene_number,
												chapter_number: chapter_number,
												text: scenes[a].text,
												//location: scenes[a].location,
												//time: scenes[a].time,
												eighth: scenes[a].eighth,
												props: scenes[a].props,
												makeups: scenes[a].makeups,
												clothes: scenes[a].clothes,
												specials: scenes[a].specials,
												others: scenes[a].others,
												extras: scenes[a].extras,
												extras_text: scenes[a].extras.extras_text,
												bits: scenes[a].extras.bits,
												bits_text: scenes[a].bits_text,
												scene_duration: scenes[a].scene_duration
											}, {where: { project_id: project_id, chapter_number: chapter_number, scene_number: scene_number }});
											project_scene_id = scene_obj2.dataValues.id;
										}
									}
									if (!scene_exist) {
										console.log('scene_name:',scene_name)
										if (!scenes[a].scene_duration || isNaN(scenes[a].scene_duration)) {
											scenes[a].scene_duration = 0;
										}
										let response = await ProjectScene.create({
											project_id: project_id,
											scene_number: scene_number,
											chapter_number: chapter_number,
											scene_name: scene_name,//.toLowerCase().trim(),
											text: scenes[a].text,
											//location: scenes[a].location,
											//time: scenes[a].time,
											eighth: scenes[a].eighth,
											props: scenes[a].props,
											makeups: scenes[a].makeups,
											clothes: scenes[a].clothes,
											specials: scenes[a].specials,
											others: scenes[a].others,
											extras: scenes[a].extras,
											extras_text: scenes[a].extras.extras_text,
											bits: scenes[a].extras.bits,
											bits_text: scenes[a].bits_text,
											scene_duration: scenes[a].scene_duration,
											screen_time: '',
											raw_time: '',
											script_pages: '',
											camera_card: '',
											sound_card: '',
											comments: ''
										});

										project_scene_id = response.dataValues.id;
										//project_scene_list = await ProjectScene.findAll({where: { project_id: project_id }});
									}

									if (scene[a] && acene[a].text) {
										scene[a].text = scene_summary;
									} else {
										scenes[a] = {...scenes[a], text: scene_summary}
									}
									scenes[a] = {...scenes[a], props: scene_props_list, characters: scene_characters_list, characters_count: scene_characters_count, clothes: scene_clothes_list, makeups: scene_makeups_list, specials: scene_specials_list, others: scene_others_list, extras: extras, word_count: scene_word_count, project_scene_id: project_scene_id}

									if (project_scene_id > 0) {

									}
								}
							}//)
						}
		
						let characters_list = []
						let extras = 0;
		
						if (script && script.characters && (script.characters.length > 0)) {
		
							for(var j in script.characters) {
								var script_character = script.characters[j];
								if (script_character) {
									for(var k in character_list) {
										var character = character_list[k];
										if (character && (character.dataValues.character_name == script_character)) {
											let character_obj = {
												character_id: character.dataValues.id,
												character_name: character.dataValues.character_name,//.toLowerCase().trim(),
												character_type: character.dataValues.character_type,
												supplier_id: character.dataValues.supplier_id,
												character_count: character.dataValues.character_count,
												project_id: project_id
											}
											characters_list.push(character_obj);
										}
									}
								}
							}
						}
		
						delete script.characters;
						let characters_count = 0;
						if (characters_list.length > 0) {
							characters_count = characters_list.length;
						}
						script_props_list = script_props_list.filter((obj, pos, arr) => {
							return arr.map(mapObj => mapObj.def).indexOf(obj.def) == pos;
						});
						
						characters_list = characters_list.sort(function(a, b) {
							return b.character_count - a.character_count;
						});

						script = { ...script, characters: characters_list, characters_count: characters_count, extras: extras, project_id: project_id, props: script_props_list, clothes: script_clothes_list, makeups: script_makeups_list, specials: script_specials_list, others: script_others_list, word_count: word_count, attachments: script_attachments }
		
						let characters = script.characters;
						let script_id = 0;
						let script_exist = false;
		
						console.log('script_attachments:',script_attachments)
		
						let project_script_2 = null;
						if (script && script.chapter_number) {
							project_script_2 = await ProjectScript.findOne({where: { project_id: project_id, chapter_number: script.chapter_number }});
						}
						if (project_script_2) {
							let script_attachments_2 = project_script_2.attachments;
							var folder = 'app/f/p/'+project_id+'/'
							const pormises_script = []
							if (script_attachments_2 && (script_attachments_2.length > 0)) {
								for (var i = 0; i < script_attachments_2.length; i++) {
									let attachment_2 = script_attachments_2[i];
									if (attachment_2) {
										console.log('Project File Delete:',attachment_2.file_name)
										pormises_script.push(deleteFileFromS3(folder, attachment_2.file_name))
									}
								}							
								await Promise.all(pormises_script)
							}
						}

						for(var k in project_script_list) {
							var script_obj2 = project_script_list[k];
							if (script_obj2 && 
								(script_obj2.dataValues.project_id == project_id) &&
								(script_obj2.dataValues.chapter_number == script.chapter_number) && 
								(script.chapter_number > 0)
								) {
								script_exist = true;
								const response = await ProjectScript.update({
									script: script,
									characters: characters,
									extras: extras,
									attachments: script_attachments
								}, {where: { project_id: project_id, chapter_number: script.chapter_number }});
								script_id = script_obj2.dataValues.id;
							}
						}
						if (!script_exist) {
							let response = await ProjectScript.create({
								project_id: project_id,
								chapter_number: script.chapter_number,
								script: script,
								characters: characters,
								extras: extras,
								attachments: script_attachments
							});
							script_id = response.dataValues.id;
							project_script_list = await ProjectScript.findAll({where: { project_id: project_id }});
						}
		
						//console.log('script:',JSON.stringify(script));
						console.log('script:',script);
				
						script_list.push(script);
						resolve();				
					})
				})
			})
		}

		const pormises = []
		let index = 0;
		while (req.files && req.files[index] && req.files[index].path && (req.files[index].path.length > 0)) {
			pormises.push(addFileToS3AndScriptBreakdown(req.files[index].path))
			index++;
		}
		await Promise.all(pormises)		

		emptyS3Directory(project_id)

		if (is_add_file_to_s3) {
			//const response = await Project.update({attachments: attachments}, {where: { id: project_id }});
		}

		// Sort list acording to chapter number
		/*function sortByChepterNumber(property) {
			return function (a,b) {
				if(a[property] && b[property] && (a[property] > b[property]))
					return 1;
				else if(a[property] && b[property] && (a[property] < b[property]))
					return -1;
				else if(!a[property] || !b[property])
					return 0;

				return 0;
			}
		}*/

		script_list.sort(sortByChepterNumber("chapter_number")); //sort according to chapter_number

		let scenes = []
		if (script_list && (script_list.length > 0)) {
			for(var i in script_list) {
				var script = script_list[i];
				if (script) {
					if (script && script.scenes && (script.scenes.length > 0)) {
						for(var j in script.scenes) {
							var scene = script.scenes[j];
							if (scene) {
								scenes.push(scene);
							}
						}
					}
				}
			}
		}

		/*script_list.sort(function(a,b) {
			return a.chapter_number - b.chapter_number;
		});*/

		if (!is_return_func) {

			let scene_time_list = await SceneTime.findAll({where: { project_id: project_id }});
			let scene_location_list = await SceneLocation.findAll({where: { project_id: project_id }});
			let character_list = await Character.findAll({where: { project_id: project_id }});
			
			character_list = character_list.sort(function(a, b) {
				return b.character_count - a.character_count;
			});

			let characters = [];
			for(var j in character_list) {
				var character = character_list[j];
				if (character) {
					characters.push({...character.dataValues, character_id: character.id})
				}
			}

			if (/*0 &&*/ scenes && (scenes.length > 0)) {

				var now = new Date();
				var ticks = now.getTime();
				var rnd = Math.floor(Math.random() * 10000);
				var session = ticks.toString() + "_" + rnd.toString();
	
				var folder = 'p/'+project_id;
    
				//var name = path.basename(file_path);
				let file_name_json = apikey(10)+ ".json";
				let file_name_json_ret = apikey(10)+ ".json";

				var s3_bucket_name = config.s3_bucket_name;

				var dir1 = path.join('app/f', folder)
				var file_path_json_ret = path.join(dir1, file_name_json_ret)
		  
				file_path_json_ret = config.s3_url_prefix + file_path_json_ret;
				file_path_json_ret = file_path_json_ret.replace(/[\\]/g, '/');
		  
				awsSDK.upload_json_to_s3(scenes, folder, file_name_json, 'json', async function(err, result) {
		
				  if (err) {
					console.log('err1:', err);
					emptyS3Directory(project_id)
					return res.json({
						response: 0,
						err: "",
						script: script_list,
						project: project,
						scene_time: scene_time_list,
						scene_location: scene_location_list,
						characters: characters,
						shooting_days: []
					})
				}
  
				  let file_path_json = result.url;
				  let json = '';//JSON.stringify(pdfData);
				  var params = {
					session: session,
					params: {
					  method: 'scenes-grouping'
					},
					data: {
					  file_path_json: file_path_json,
					  folder: result.folder,
					  file_name_json: file_name_json,
					  file_path_json_ret: file_path_json_ret,
					  file_name_json_ret: file_name_json_ret
					}
				  }
  
				  var api_path = 'scenes-grouping/'
				  utils.postToApi(api_path, params, function(err, body) {
					  let scenes = []
					  let file_path = ''
					  if (err) {
						console.log('err2:', err);
						emptyS3Directory(project_id)
						return res.json({
							response: 0,
							err: "",
							script: script_list,
							project: project,
							scene_time: scene_time_list,
							scene_location: scene_location_list,
							characters: characters,
							shooting_days: []
						})
					  } else {
						  try {
							awsSDK.get_json_file_from_s3(folder, file_name_json_ret, async function(err, result) {

								let json_data = {groups:[]}
								if (!err) {
									json_data = JSON.parse(result);
								}

								buildProjectScenesSchedule (project_id, json_data, function(err, shooting_days){
									if (err) {
										emptyS3Directory(project_id)
										return res.json({
											response: 0,
											err: "",
											script: script_list,
											project: project,
											scene_time: scene_time_list,
											scene_location: scene_location_list,
											characters: characters,
											shooting_days: []
										})
									}
			
									utils.getProjectShootingDays(project_id, function (err, shooting_day_list){
										
										emptyS3Directory(project_id)
										if (err) {
											shooting_day_list = [];
										}
										return res.json({
											response: 0,
											err: "",
											script: script_list,
											project: project,
											scene_time: scene_time_list,
											scene_location: scene_location_list,
											characters: characters,
											shooting_days: shooting_day_list
										})
									})
								})		  
							})
						  } catch (err) {
							console.log('err3:', err);
							emptyS3Directory(project_id)
							return res.json({
								response: 0,
								err: "",
								script: script_list,
								project: project,
								scene_time: scene_time_list,
								scene_location: scene_location_list,
								characters: characters,
								shooting_days: []
							})
						}
					  }
  				  });
				});

			} else {
				console.log('No scenes found');
				emptyS3Directory(project_id)
				return res.json({
					response: 0,
					err: "",
					script: script_list,
					project: project,
					scene_time: scene_time_list,
					scene_location: scene_location_list,
					characters: characters,
					shooting_days: []
				})
			}
		}
	} catch (error) {
		
		console.log('error:',error)
		emptyS3Directory(project_id)
		return res.json({
			response: 1,
			err: error
		})
	}
}

const ProjectController = {

	getAll: async (req, res, next) => {
		try {
			let projects = [];
			projects = await Project.findAll({});

			/*let project_list = []
			if (projects && (projects.length > 0)) {
				for (var j = 0; j < projects.length; j++) {
					let project_obj = projects[j].dataValues;
					if (project_obj && (project_obj.project_status_id != 2)) {
						project_list.push(project_obj);
					}
				}
			}*/

			res.json(projects);
			//res.json(project_list);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	getProject: async (req, res, next) => {
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

			let project = null;
			project = await Project.findOne({ where: { id: project_id } });
			res.json(project);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	getProjectCharacter: async(req, res, next) => {
		try {
			let project_id = req.params.project_id;

			let characters_list = []
			let actors_list = []

			let actors = []
			if (project_id && (project_id > 0)) {
				let project_script_list = await ProjectScript.findAll({where: { project_id: project_id }});
				if (project_script_list && (project_script_list.length > 0)) {
					for (var j = 0; j < project_script_list.length; j++) {
						let project_script = project_script_list[j].dataValues;
						if (project_script && project_script.script && project_script.script.scenes && (project_script.script.scenes.length > 0)) {
							for (var j1 = 0; j1 < project_script.script.scenes.length; j1++) {
								let scene = project_script.script.scenes[j1];
								if (scene && scene.characters && (scene.characters.length > 0)) {
									for (var j2 = 0; j2 < scene.characters.length; j2++) {
										let character = scene.characters[j2];
										if (character) {	
											let char = await Character.findOne({where: { id: character.character_id }})
											if (char && char.dataValues && (character.supplier_id <= 0) && (char.dataValues.supplier_id > 0)) {
												character.supplier_id = char.dataValues.supplier_id;
											}
											if (character.supplier_id > 0) {
												let supplier = await Supplier.findOne({where: { id: character.supplier_id }})
												if (supplier) {
													supplier = supplier.dataValues;
													let found = false;
													if (actors && (actors.length > 0)) {
														for (var n = 0; n < actors.length; n++) {
															let actor = actors[n];
															if (actor && (actor.id == supplier.id)) {
																let char = {
																	character_id: character.id,
																	character_name: character.character_name//.toLowerCase().trim()
																}
																if (actor.characters) {
																	actor.characters.push(char);
																	found = true;
																}
															}
														}
													}
			
													if (!found) {
			
														if (supplier.characters) {
															supplier.characters = characters;
														} else {
															supplier = {...supplier, characters: [{
																	character_id: character.id,
																	character_name: character.character_name//.toLowerCase().trim()
																}]
															}
														}
			
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
									
														actors_list.push(supplier);
			
														/*let actor = {
															actor_id: supplier.id,
															actor_name: supplier.supplier_name,//.toLowerCase().trim(),
			
															characters: [{
																character_id: character.id,
																character_name: character.character_name//.toLowerCase().trim()
															}],
															agency: supplier.agency,
															pickup: supplier.pickup,
															site: supplier.site,
															end_time: supplier.end_time,
															hours: 0,
															extra_hours: 0
														}
														actors_list.push(actor);*/
													}
												}
											}
											
											if(char){
									
												characters_list.push(char);
											}
											// characters_list.push(character);
										
										}
									}
								}
							}
						}
					}

					characters_list = characters_list.filter((obj, pos, arr) => {
						return arr.map(mapObj => mapObj.character_name/*.toLowerCase().trim()*/).indexOf(obj.character_name/*.toLowerCase().trim()*/) == pos;
					});

					let char_list = await Character.findAll({where: { project_id: project_id }});
					char_list = char_list.sort(function(a, b) {
						return b.character_count - a.character_count;
					});
		
					let characters_list1 = []
					for (var j3 = 0; j3 < characters_list.length; j3++) {
						let char = characters_list[j3];
						if (char && char.character_id && (char.character_id > 0)) {
							for (var j4 = 0; j4 < char_list.length; j4++) {
								let char2 = char_list[j4];
								if (char2 && char2.dataValues) {
									char2 = char2.dataValues;
								}
								if (char2 && char2.id && (char2.id == char.character_id)) {
									characters_list1.push(char)
								}
							}
						} else {
							characters_list1.push(char)
						}
					}
					characters_list = characters_list1.filter((obj, pos, arr) => {
						return arr.map(mapObj => mapObj.character_name/*.toLowerCase().trim()*/).indexOf(obj.character_name/*.toLowerCase().trim()*/) == pos;
					});

					actors_list = actors_list.filter((obj, pos, arr) => {
						return arr.map(mapObj => mapObj.id).indexOf(obj.id) == pos;
					});
				}
			}

			let response = {
				characters: characters_list,
				actors: actors_list
			}
			
			return res.json(characters_list)
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	create: async (req, res, next) => {

		try {
			let user_id = parseInt(Number(req.body.user_id));
			let project_id = req.body.project_id == 'undefined' ? 0 : parseInt(Number(req.body.project_id));
			let company_id = parseInt(req.body.company_id);
			let country_id = req.body.country_id == 'undefined' ? 0 : parseInt(Number(req.body.country_id));
			let project_name = req.body.project_name == 'undefined' ? 0 : req.body.project_name;
			let date = req.body.date == 'undefined' ? null : req.body.date;
			let date_end = req.body.date_end == 'undefined' ? null : req.body.date_end;
			let budget = req.body.budget == 'undefined' ? 0 : parseInt(Number(req.body.budget));
			let max_shooting_days = req.body.max_shooting_days == 'undefined' ? 0 : parseInt(Number(req.body.max_shooting_days));
			let project_params = req.body.params == 'undefined' ? null : req.body.params;
			let project_status_id = req.body.project_status_id == 'undefined' ? null : req.body.project_status_id;
			let attachments = req.body.attachments;
			let tasks = req.body.tasks == 'undefined' ? [] : req.body.tasks;
			let suppliers = req.body.suppliers == 'undefined' ? [] : req.body.suppliers; // [{supplier_id: 1, ...}]

			//console.log('Files:',req.files)
			let user_admin = null;
			if (user_id && !isNaN(user_id) && (user_id > 0)) {
				user_admin = await User.findOne({ where: { id: user_id } });
			}

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = 0;
			}

			if (!project_id || (project_id <= 0)) {
				if (!user_admin) {
					return res.json({
						response: 2,
						err: "No admin user."
					})
				} else {
					if (user_admin) {
						company_id = user_admin.company_id;
					}
					if (user_admin && (user_admin.permission_type_id >= 2) && (user_admin.permission_type_id <= 3)) {
						console.log('User have no permission.');
						return res.json({
							response: 2,
							err: "User have no permission."
						})
					}
				}
			}

			if (isNaN(country_id) || (country_id <= 0)) {
				country_id = null;
			}

			if (!project_name || (project_name.length <= 0)) {
				project_name = null;
			}

			if (!date) {
				date = null;
			}

			if (!date_end) {
				date_end = null;
			}

			if (!suppliers) {
				suppliers = null;
			}

			if (isNaN(budget) || (budget <= 0)) {
				budget = null;
			}

			if (isNaN(project_status_id) || (project_status_id <= 0)) {
				project_status_id = null;
			}

			if (isNaN(max_shooting_days) || (max_shooting_days < 0)) {
				if (!project_id || (project_id <= 0)) {
					max_shooting_days = 100;
				} else {
					max_shooting_days = null;
				}
			}

			if (!project_params && (project_id <= 0)) {

				project_params = [
					{
						type: 'shooting_hours',
						inside: { start: '06:00', end: '20:00'},
						outside: { start: '06:00', end: '18:00'}
					},{
						type: 'breakfast',
						inside: { start: '06:00', end: '06:30'},
						outside: { start: '06:00', end: '06:30'}
					},{
						type: 'lunch',
						inside: { start: '13:00', end: '13:30'},
						outside: { start: '13:00', end: '13:30'}
					},{
						type: 'dinner',
						inside: { start: '17:30', end: '18:00'},
						outside: { start: '17:30', end: '18:00'}
					},{
						type: 'times',
						times: [{
							time: 'day',
							inside: { start: '06:00', end: '17:00'},
							outside: { start: '06:00', end: '17:00'}
						},{
							time: 'night',
							inside: { start: '17:30', end: '21:00'},
							outside: { start: '17:30', end: '21:00'}
						}]
					}
				]
			}

			let params = {
			}
			if (company_id && !isNaN(company_id) && (company_id > 0)) {
				params = {...params, company_id: company_id}
			}
			if (country_id && !isNaN(country_id) && (country_id > 0)) {
				params = {...params, country_id: country_id}
			}
			if (project_name && (project_name.length > 0)) {
				params = {...params, project_name: project_name}
			}
			if (date) {
				params = {...params, date: date}
			}
			if (date_end) {
				params = {...params, date_end: date_end}
			}
			if (budget && !isNaN(budget) && (budget > 0)) {
				params = {...params, budget: budget}
			}
			if (project_status_id && !isNaN(project_status_id) && (project_status_id > 0)) {
				params = {...params, project_status_id: project_status_id}
			}
			if (max_shooting_days) {
				params = {...params, max_shooting_days: max_shooting_days}
			}
			if (project_params) {
				params = {...params, params: project_params}
			}
			let project = null;
			if (project_id > 0) {
				project = await Project.update(params, {where: { id: project_id }});
				project = await Project.findOne({ where: { id: project_id }})
				if (project) {
					project = project.dataValues;
				}
			} else {
				project = await Project.create(params);
				if (project) {
					project = project.dataValues;
				}
			}

			emptyS3Directory(project_id)

			//if (tasks && (tasks.length > 0)) {
			//	await taskController.createTaskList(req, res, next);
			//}

			if (project) {
				project_id = project.id;
				company_id = project.company_id;
			}

			let tasks_to_return = [];

			if (/*!suppliers &&*/ project_id && (project_id > 0)) {
				suppliers = []
				let suppliers_list = await Supplier.findAll({where: { company_id: company_id }})
				for (var m = 0; m < suppliers_list.length; m++) {
					let supplier = suppliers_list[m];
					if (supplier) {
						let obj = {
							supplier_id: supplier.id,
							supplier_job_title_id: supplier.supplier_job_title_id,
							supplier_name: supplier.supplier_name,
							supplier_category_id: supplier.supplier_category_id
						}
						suppliers.push(obj);
					}
				}
			}

			if (suppliers && (suppliers.length > 0)) {
				for (var l = 0; l < suppliers.length; l++) {
					let supplier = suppliers[l];
					if (supplier && (supplier.supplier_id > 0)) {
						let supplier_project_obj = {
							project_id: project.id,
							supplier_id: supplier.supplier_id
						}

						let supplier_project = null;
						if ((supplier_project_obj.project_id > 0) && (supplier_project_obj.supplier_id > 0)) {
							supplier_project = await SupplierProject.findOne({ where: { project_id: supplier_project_obj.project_id, supplier_id: supplier_project_obj.supplier_id }})
						}
						if (supplier_project) {
							supplier_project = await SupplierProject.update(supplier_project_obj, {where: { project_id: supplier_project_obj.project_id, supplier_id: supplier_project_obj.supplier_id }});
							supplier_project = await SupplierProject.findOne({ where: { project_id: supplier_project_obj.project_id, supplier_id: supplier_project_obj.supplier_id }})
							if (supplier_project) {
								supplier_project = supplier_project.dataValues;
							}
						} else {
							supplier_project = await SupplierProject.create(supplier_project_obj);
							if (supplier_project) {
								supplier_project = supplier_project.dataValues;
							}
						}
					}
				}
			}

			if (suppliers && (suppliers.length > 0)) {

				//let supplier_departments = await SupplierDepartment.findAll({})
				let supplier_job_titles = await SupplierJobTitle.findAll({})
				//let supplier_unit_types = await SupplierUnitType.findAll({})
				//let supplier_types = await SupplierType.findAll({})

				let supplier_category_list = await SupplierCategory.findAll({});
				let budget_category_list = await BudgetCategory.findAll({});
				
				for (var l = 0; l < suppliers.length; l++) {
					let supplier = suppliers[l];
					if (supplier && (supplier.supplier_id > 0)) {

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
							var supplier_job_title_obj = supplier_job_titles[k];
							if (supplier_job_title_obj && (supplier.supplier_job_title_id == supplier_job_title_obj.id)) {
								supplier_job_title = supplier_job_title_obj.supplier_job_title;
							}
						}
	
						for(var k in supplier_category_list) {
							var supplier_category_obj = supplier_category_list[k];
							if (supplier_category_obj && (supplier.supplier_category_id == supplier_category_obj.id)) {
								supplier_category = supplier_category_obj.supplier_category;
							}
						}
	
						for(var k in budget_category_list) {
							var budget_category_obj = budget_category_list[k];
							if (budget_category_obj && (budget_category_obj.budget_category == supplier_category)) {
								budget_category_id = budget_category_obj.id;
							}
						}
	
						let budget = {
							//budget_name: supplier_name,
							project_id: project.id,
							budget_category_id: budget_category_id,
							budget_type_id: budget_type_id,
							budget_status_id: budget_status_id,
							project_scene_id: 0,
							supplier_id: supplier.supplier_id,
							supplier_job_title_id: supplier_job_title_id,
							price: 0,
							comments: supplier_name,
							description: supplier_job_title,
							attachments: []
						}

						let budget_get = await Budget.findOne({where: { project_id: project.id,
															comments: supplier_name, 
															supplier_id: supplier.supplier_id,
															supplier_job_title_id: supplier_job_title_id
														}});
						if (!budget_get) {
							let budget_result = await Budget.create(budget);
							if (budget_result && (budget_result.id > 0)) {
								let supplier_project = await SupplierProject.update({budget_id: budget_result.id}, {where: { project_id: project_id, supplier_id: supplier.supplier_id }});
							}
						}
					}
				}
			}

			return scriptBreakdownFunc(project_id, project, req, res, next);

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
			
			let project_id = parseInt(req.body.project_id);
			let user_id = parseInt(req.body.user_id);

			let user_admin = null;
			if (user_id && !isNaN(user_id) && (user_id > 0)) {
				user_admin = await User.findOne({ where: { id: user_id } });
			}

			let isAdmin = false;
			let projects = []
			if (user_admin && ((user_admin.permission_type_id == 1) || (user_admin.permission_type_id == 4))) {
				isAdmin = true;
			} else {
				if (user_admin) {
					projects = user_admin.projects;
				}
			}

			if (!isAdmin) {
				console.log('User have no permission.');
				return res.json({
					response: 2,
					err: "User have no permission."
				})
			}

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = null;
				return res.json({
					response: 2,
					err: "No project id"
				})
			}

			emptyS3Directory(project_id)

			console.log('Project Delete:',project_id)

			// const response1 = await ProjectShootingDayScene.destroy({
			// 	where: { project_id: project_id },
			// 	force: true
			// })

			const response2 = await ProjectShootingDay.destroy({
				where: { project_id: project_id },
				force: true
			})

			const response4 = await Task.destroy({
				where: { project_id: project_id },
				force: true
			})

			const response3 = await TaskCategory.destroy({
				where: { project_id: project_id },
				force: true
			})

			const response5 = await Budget.destroy({
				where: { project_id: project_id },
				force: true
			})

			const response6 = await Character.destroy({
				where: { project_id: project_id },
				force: true
			})

			const response7 = await ProjectScript.destroy({
				where: { project_id: project_id },
				force: true
			})

			const response8 = await ProjectScene.destroy({
				where: { project_id: project_id },
				force: true
			})

			const response9 = await SupplierProject.destroy({
				where: { project_id: project_id },
				force: true
			})

			/*const response10 = await SupplierCategory.destroy({
				where: { project_id: project_id },
				force: true
			})

			const response11 = await BudgetCategory.destroy({
				where: { project_id: project_id },
				force: true
			})*/

			const response12 = await SceneLocation.destroy({
				where: { project_id: project_id },
				force: true
			})

			const response13 = await SceneTime.destroy({
				where: { project_id: project_id },
				force: true
			})

			const response14 = await Project.destroy({
				where: { id: project_id },
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

	scriptBreakdown: async(req, res, next) => {
		return scriptBreakdownFunc(0, null, req, res, next);
	},

	getAllCompanyProjects: async (req, res, next) => {
		try {
			let company_id = parseInt(req.params.company_id);
			let user_id = parseInt(req.params.user_id);
			
			if (isNaN(company_id) || (company_id <= 0)) {
				company_id = null;
				return res.json({
					response: 2,
					err: "No company id"
				})
			}

			let user_admin = null;
			if (user_id && !isNaN(user_id) && (user_id > 0)) {
				user_admin = await User.findOne({ where: { id: user_id } });
			}

			let isAdmin = false;
			let projects = []
			if (user_admin && ((user_admin.permission_type_id == 1) || (user_admin.permission_type_id == 4))) {
				isAdmin = true;
			} else {
				if (user_admin) {
					projects = user_admin.projects;
				}
			}

			if (isAdmin) {
				const projects_list = await Project.findAll({
					where: { company_id: company_id }
				});

				res.json(projects_list);
			} else {
				let projects_list = [];
				if (projects && (projects.length > 0)) {
					for (var j = 0; j < projects.length; j++) {
						let project_id = projects[j].dataValues;
						if (project_id && (project_id > 0)) {
							const project = await Project.findOne({
								where: { company_id: company_id, id: project_id }
							});
							if (project) {
								projects_list.push(project)
							}
						}
					}
				}
				res.json(projects_list);
			}
		} catch (error) {
			return res.json({
				response: 1,
				err: error
			})
		}
	},
	getAllProjectFiles: async (req, res, next) => {
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
					err: 'No project found'
				})
			}

			return res.json(project.attachments)						

		} catch (error) {
			return res.json({
				response: 1,
				err: error
			})
		}
	},
	  
	fileAdd: async (req, res, next) => {
		try {
			let project_id = parseInt(req.body.project_id);
			let text = req.body.text;

			if (!text) {
				text = '';
			}

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

			let attachments = project.attachments;

			var folder = 'p/'+project_id+'/'

			let is_add_file_to_s3 = false;

			async function addFileToS3(file_path) {
				return new Promise(async (resolve,reject)=>{

					console.log('Project File Upload:',file_path)
					var name = path.basename(file_path);
					var file_end = name.split('.')[1];
					var file_name = apikey(10)+ "."+file_end;
					awsSDK.upload_file_to_s3(file_path, folder, file_name, file_end, async function(err, result) {

						if (err) {
							console.log('err s3:', err);
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
				const response = await Project.update({attachments: attachments}, {where: { id: project_id }});
			}

			return res.json({
				response: 0,
				err: "",
				attachments: attachments
			})
		} catch (error) {
			return res.json({
				response: 1,
				err: error
			})
		}
	},

	fileDelete: async (req, res, next) => {
		try {
			let project_id = parseInt(req.body.project_id);
			let chapter_number = parseInt(req.body.chapter_number);
			let file_id = req.body.file_id;
			let file_name = req.body.file_name;

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = null;
				return res.json({
					response: 2,
					err: "No project id"
				})
			}

			if (isNaN(chapter_number) || (chapter_number <= 0)) {
				chapter_number = null;
			}

			console.log('Project File Delete:',project_id)

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

			let project_script = null;
			if (chapter_number && (chapter_number > 0)) {
				project_script = await ProjectScript.findOne({where: { project_id: project_id, chapter_number: chapter_number }});
			}

			let attachments = project.attachments;
			let script_attachments = [];
			if (project_script) {
				script_attachments = project_script.attachments;
			}

			{
				var folder = 'p/'+project_id+'/'

				console.log('Project File Delete:',file_name)
				awsSDK.delete_file_from_s3 (folder ,file_name, async function(err, result) {

					if (err) {
						console.log('err3:', err);
						return res.json({
							response: 1,
							err: err
						})
					} else {

						var filtered = attachments.filter(function(el) { return el.file_id != file_id; });

						const response = await Project.update({attachments: filtered}, {where: { id: project_id }});
						if (chapter_number && (chapter_number > 0)) {
							var filtered_script = script_attachments.filter(function(el) { return el.file_id != file_id; });
							const response2 = await ProjectScript.update({attachments: filtered_script}, {where: { project_id: project_id, chapter_number: chapter_number }});
						}

						return res.json({
							response: 0,
							err: "",
							attachments: filtered
						})						
					}
				})
			}
		} catch (error) {
			return res.json({
				response: 1,
				err: error
			})
		}
	},
	
	scriptUploaded: async (req, res, next) => {
		try {
			let project_id = parseInt(req.body.project_id);

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = null;
				return res.json({
					response: 2,
					err: "No project id"
				})
			}

			// if (isNaN(chapter_number) || (chapter_number <= 0)) {
			// 	chapter_number = null;
			// }

			console.log('Project File Delete:',project_id)

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

			emptyS3Directory(project_id)

			return res.json({
				response: 0,
				err: "",
				attachments: []
			})							

			awsSDK.get_all_files_from_s3(folder, async function(err, result) {

				console.log('Project File Delete:',file_name)

				if (err) {
					console.log('err4:', err);
				} else {
					const response = await Project.update({attachments: []}, {where: { id: project_id }});
					// if (chapter_number && (chapter_number > 0)) {
					// 	var filtered_script = script_attachments.filter(function(el) { return el.file_id != file_id; });
					// 	const response2 = await ProjectScript.update({attachments: filtered_script}, {where: { project_id: project_id, chapter_number: chapter_number }});
					// }
	
					return res.json({
						response: 0,
						err: "",
						attachments: []
					})							
				}
			})
		} catch (error) {
			return res.json({
				response: 1,
				err: error
			})
		}
	},
	
	getProjectScene: async (req, res, next) => {
		try {
			let project_id = parseInt(req.params.project_id);
			let chapter_number = parseInt(req.params.chapter_number);
			let scene_number = parseInt(req.params.scene_number);
	
			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = null;
				return res.json({
					response: 2,
					err: "No project id"
				})
			}
			
			if (isNaN(chapter_number)) {
				chapter_number = 0;
			}

			if (isNaN(scene_number)) {
				scene_number = 0;
			}

			if ((scene_number > 0) && (chapter_number > 0)) {
				const project_scene_list = await ProjectScene.findOne({where: { project_id: project_id, chapter_number: chapter_number, scene_number: scene_number }});
				return res.json(project_scene_list);
			} else {
				const project_scene_list = await ProjectScene.findAll({where: { project_id: project_id }});
				return res.json(project_scene_list);
			}
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	setProjectLimitation: async (req, res, next) => {
		try {
			let project_id = parseInt(req.body.project_id);
			let limitations = req.body.limitations;
			
			/*{
				limitations: [{
					supplier_id: 1,
					project_shooting_day_id: '',
					date_from: '',
					date_to: '',
					shooting_days: [],
					reason: 'sick'
				}, {
					supplier_id: 2,
					project_shooting_day_id: '',
					date_from: '',
					date_to: '',
					shooting_days: [],
					reason: 'absence'
				}, {
					supplier_id: 0,
					project_shooting_day_id: '',
					date_from: '',
					date_to: '',
					shooting_days: [],
					reason: 'rain'
				}]
			}*/

			if (isNaN(project_id) || (project_id && (project_id <= 0))) {
				project_id = null;
				return res.json({
					response: 2,
					err: "No project id"
				})
			}

			let params = {limitations: limitations}

			if (project_id > 0) {
				project = await Project.update(params, {where: { id: project_id }});
				project = await Project.findOne({ where: { id: project_id }})
				if (project) {
					project = project.dataValues;
				}
			}

			emptyS3Directory(project_id)

			let project_shooting_day = await ProjectShootingDay.findAll({where : {project_id : project_id}})
			let project_shooting_day_with_limitations = [];
			if (limitations && (limitations.length > 0)) {
				for (var j = 0; j < limitations.length; j++) {
					let limitation = limitations[j].dataValues;
					if (limitation) {
						if (limitation.date_from && (limitation.date_from.length > 1)) {
							if (limitation.date_to && (limitation.date_to.length > 1)) {
								const startDate = new Date(limitation.date_from);
								const endDate = new Date(limitation.date_to);
								project_shooting_day_with_limitations = await ProjectShootingDay.findAll({where : {project_id : project_id, date : {[Op.between] : [startDate , endDate ]}}})
							}
						} else {
							const startDate = new Date(limitation.date_from);
							project_shooting_day_with_limitations = await ProjectShootingDay.findAll({where : {project_id : project_id, date : {[Op.between] : [startDate , startDate ]}}})
						}
					}
				}
			}

			if (project_shooting_day && (project_shooting_day.length > 0) &&
				project_shooting_day_with_limitations && (project_shooting_day_with_limitations.length > 0)) {

				for (var j = 0; j < project_shooting_day.length; j++) {
					let shooting_day_obj = project_shooting_day[j].dataValues;

					if (shooting_day_obj && shooting_day_obj.shooting_day) {

						let found = false;
						for (var j = 0; j < project_shooting_day_with_limitations.length; j++) {
							let shooting_day_obj_with_limitation = project_shooting_day_with_limitations[j].dataValues;
		
							if (shooting_day_obj_with_limitation && shooting_day_obj.shooting_day && (shooting_day_obj_with_limitation.id == shooting_day_obj.id)) {
								found = true;
							}
						}
					}
				}
			}

			return res.json({
				response: 0,
				err: "",
				project: project
			})

		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	buildProjectSchedule: async (req, res, next) =>
	{
		let project_id = parseInt(req.body.project_id);
		let max_shooting_days = parseInt(req.body.max_shooting_days);
		let project_params = req.body.params;
/*
Delete all:
	ProjectShootingDay
Task
TaskCategory

Add scene_duration to scenes
Add character_type & supplier_id

Go over all shooting days:
Create shooting days:
	When scene name == shooting day name:
		If shooting time == shooting time:
			If shooting duration < max shooting duration:
				Add scene to shooting day.
			Else:
				Find Scene with Least Most Actor Appearance
					Remove scene from shooting day.
				Create shooting day with scene name.
				Add scene to shooting day.
	Else:
		Create shooting day with scene name.
		Add scene to shooting day.

Merge days:
Merge days when both days scenes < max shooting duration:

Add breaks to shooting days
Add suppliers & actors & total scenes
Add employees
Add  locations
Add TaskCategory & Tasks (props, makeups, clothes, othes)
Get all task_list
Get actors & characters & total_scenes
*/
		try {

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = 0;
			} else {
			}

			if (isNaN(max_shooting_days) || (max_shooting_days <= 0)) {
				max_shooting_days = 0;
			} else {
			}

			if (!project_params) {
				project_params = null;
			} else {
			}

			let params = {
			}
			if (max_shooting_days) {
				params = {...params, max_shooting_days: max_shooting_days}
			}
			if (project_params) {
				params = {...params, params: project_params}
			}

			let project = null;
			if (project_id > 0) {
				project = await Project.update(params, {where: { id: project_id }});
				project = await Project.findOne({ where: { id: project_id }})
				if (project) {
					project = project.dataValues;
				}
			}
			
			emptyS3Directory(project_id)

			let limitations = null;
			if (project && project.limitations && project.limitations.limitations) {
				limitations = project.limitations.limitations;
			}
			
			const task_status_list = await TaskStatus.findAll({});
			let task_status_active_id = 1;
			if (task_status_list) {
				for (var j = 0; j < task_status_list.length; j++) {
					let task_status = task_status_list[j].dataValues;
					if (task_status.task_status == 'Active') {
						task_status_active_id = task_status.id;
					}
				}
			}

			let scene_location = await SceneLocation.findAll({where: { project_id: project_id }});
			let scene_time = await SceneTime.findAll({where: { project_id: project_id }});
			let scene_status = await SceneStatus.findAll({});

			let shooting_days_list = [];

			// const response1 = await ProjectShootingDayScene.destroy({
			// 	where: { project_id: project_id },
			// 	force: true
			// })

			// Delete all:
			//	ProjectShootingDay
			//	Task
			//	TaskCategory
	
			const response2 = await ProjectShootingDay.destroy({
				where: { project_id: project_id },
				force: true
			})

			const response3 = await Task.destroy({
				where: { project_id: project_id },
				force: true
			})

			const response4 = await TaskCategory.destroy({
				where: { project_id: project_id },
				force: true
			})

			let company_id = project ? project.company_id : 0;
			let character_list = await Character.findAll({where: { project_id: project_id }});

			/*for (var j1 = 0; j1 < character_list.length; j1++) {
				let char1 = character_list[j1].dataValues;
				if (char1 && char1.associated_num && (char1.associated_num > 0)) {
					for (var j2 = 0; j2 < character_list.length; j2++) {
						let char2 = character_list[j2].dataValues;
						if (char2 && 
							(char2.id != char1.id) && 
							char2.associated_num && 
							(char2.associated_num > 0) &&
							(char2.associated_num == char1.associated_num)
							) {
						}
					}
				}
			}*/

			character_list = character_list.sort(function(a, b) {
				return b.character_count - a.character_count;
			});

			const project_scene_list = [];//await ProjectScene.findAll({where: { project_id: project_id }});
			const project_script_list = await ProjectScript.findAll({where: { project_id: project_id }});

			// Add scene_duration to scenes
			// Add character_type & supplier_id
			if (project_script_list) {
				for (var j = 0; j < project_script_list.length; j++) {
					let project_script = project_script_list[j].dataValues;

					// Go over all shooting days

					if (project_script && project_script.script && project_script.script.scenes && (project_script.script.scenes.length > 0)) {
						for (var k = 0; k < project_script.script.scenes.length; k++) {
							let scene = project_script.script.scenes[k];
							if (scene) {
								let default_scene_time = config.default_scene_time_min;
								if (scene_time[k]) {
									default_scene_time = scene_time[k].dataValues.default_scene_time;
								}
								if (!scene.eighth || (scene.eighth && (scene.eighth < 1))) {
									if (!scene.eighth) {
										scene = {...scene, eighth: 1}
									} else {
										scene.eighth = 1;
									}
								}
								let duration = scene.eighth * (60 / 8);
								if (duration < default_scene_time) {
									//duration = default_scene_time;
								}
								// Add scene_duration to scenes
								if (scene.scene_duration && (scene.scene_duration >= default_scene_time)) {
								} else {
									if (scene.scene_duration && (scene.scene_duration < default_scene_time)) {
										scene.scene_duration = duration;
										if (scene.scene_duration && (scene.scene_duration < default_scene_time)) {
											//scene.scene_duration = default_scene_time;
										}
									} else {
										if (!scene.scene_duration) {
											scene = {...scene, scene_duration: duration};
										}
									}
								}

								let project_scene_obj = null;
								if (scene.project_scene_id && (scene.project_scene_id > 0)) {
									project_scene_obj = await ProjectScene.findOne({where: { id: scene.project_scene_id }});
								} else {
									project_scene_obj = await ProjectScene.findOne({where: { project_id: project_id, chapter_number: chapter_number, scene_number: scene_number }});
								}

								if (project_scene_obj) {
									if (scene.scene_status_id) {
										scene.scene_status_id = project_scene_obj.scene_status_id;
									} else {
										scene = {...scene, scene_status_id: project_scene_obj.scene_status_id};
									}

									if (scene.scene_status_id != 1) { // If not shooted already
										project_scene_list.push(scene)
									}
								} else {
									project_scene_list.push(scene)
								}
							}
						}
					}
				}
			}

			// Create shooting days
			if (project_scene_list && (project_scene_list.length > 0)) {
				for (var j = 0; j < project_scene_list.length; j++) {
					let project_scene = project_scene_list[j];
					let scene_found = false

					if (project_scene) {

						// Add character_type & supplier_id
						if (project_scene.characters && (project_scene.characters.length > 0)) {
							for (var j1 = 0; j1 < project_scene.characters.length; j1++) {
								let character_obj1 = project_scene.characters[j1];
								if (character_obj1) {
									for (var j2 = 0; j2 < character_list.length; j2++) {
										let character_obj2 = character_list[j2].dataValues;
										let compare = compareCharacters(character_obj1, character_obj2, character_list);
										if (character_obj2 && compare) {
											if (project_scene.characters[j1].character_type) {
												project_scene.characters[j1].character_type = character_obj2.character_type;
											} else {
												project_scene.characters[j1] = {...project_scene.characters[j1], character_type: character_obj2.character_type}
											}
											if (1 || (project_scene.characters[j1].supplier_id)) {
												project_scene.characters[j1].supplier_id = character_obj2.supplier_id;
											} else {
												project_scene.characters[j1] = {...project_scene.characters[j1], supplier_id: character_obj2.supplier_id}
											}
										}
									}
								}
							}
						}

						let name = project_scene.name;//.toLowerCase().trim();
						let name_trim = name.toLowerCase();
						//name_trim = name_trim.replace(/[.,-~=+!@#$%^&*(){}]/g, '');
						name_trim = name_trim.replace(/[-~=+!@#$%^&*(){}]/g, '');
						name_trim = name_trim.replace(/[,]/g, '');
						name_trim = name_trim.replace(/[.]/g, '');
						let scene_name = name_trim;
						name_trim = name_trim.replace(/[' ']/g, '');
						let location = project_scene.location;
						let location_found = false;
						for (var i = 0; i < scene_location.length; i++) {
							let location1 = scene_location[i].dataValues.scene_location;
							if (location1 && (location1.length > 0) && project_scene.location && (project_scene.location.length > 0)) {
								if (
									project_scene.location.toLowerCase().trim().includes(location1.toLowerCase().trim()) ||
									location1.toLowerCase().trim().includes(project_scene.location.toLowerCase().trim())
								) {
									//location = location;
									location_found = true;
								}
							}
						}
						if (!location_found) {
							location = scene_location[0].dataValues.scene_location;
							project_scene.location = location;
						}
						
						let time = project_scene.time;
						let time_type = project_scene.time_type;
						let time_found = false;
						for (var i = 0; i < scene_time.length; i++) {
							let time1 = scene_time[i].dataValues.scene_time;
							let time_type1 = scene_time[i].dataValues.scene_time_type;
							if (time1 && (time1.length > 0) && project_scene.time && (project_scene.time.length > 0)) {
								//if (project_scene.time == time1) {
								if (
									(project_scene.time.toLowerCase().trim().includes(time.toLowerCase().trim())) || 
									(time.toLowerCase().trim().includes(project_scene.time.toLowerCase().trim()))
								) { 
									if (!time_found) {
										time_found = true;
										time_type = time_type1;
									}
								}
							}
						}
						if (!time_found) {
							time = scene_time[0].dataValues.scene_time;
							time_type = scene_time[0].dataValues.scene_time_type;
							let time_id = scene_time[0].dataValues.id;
							project_scene.time = time;
							project_scene.time_type = time_type;
							project_scene.time_id = time_id;
						}

						if (project_scene && !project_scene.pos) {
							project_scene = {...project_scene, pos: 0}
							scene_found = false
						}

						let scene_id = '';
						if (project_scene.scene_id_number || (project_scene.scene_id_number && (project_scene.scene_id_number.length > 0))) {
							scene_id = project_scene.scene_id_number;
						} else {
							scene_id = getSceneId(project_scene.chapter_number, project_scene.scene_number);
						}

						if (project_scene.scene_id_number) {
							project_scene.scene_id_number = scene_id;
						} else {
							project_scene = {...project_scene, scene_id: scene_id}
							scene_found = false
						}

						for (var i = 0; ((i < shooting_days_list.length) && !scene_found); i++) {
							let shooting_day_obj = shooting_days_list[i];

							let found_location = false;
							if (shooting_day_obj && shooting_day_obj.location && (shooting_day_obj.location.length > 0)) {
								for (var i4 = 0; ((i4 < shooting_day_obj.location.length) && !found_location); i4++) {
									let shooting_day_location = shooting_day_obj.location[i4];
									if (shooting_day_location && (shooting_day_location.length > 0)) {
										if ((shooting_day_location.toLowerCase().trim().includes(location.toLowerCase().trim())) ||
											(location.toLowerCase().trim().includes(shooting_day_location.toLowerCase().trim()))) {
											found_location = true;
										}
									}
								}
							}

							let found_name_trim = false;
							if (shooting_day_obj && shooting_day_obj.name_trim && (shooting_day_obj.name_trim.length > 0)) {
								for (var i4 = 0; ((i4 < shooting_day_obj.name_trim.length) && !found_name_trim); i4++) {
									let shooting_day_name_trim = shooting_day_obj.name_trim[i4];
									if (shooting_day_name_trim && (shooting_day_name_trim.length > 0)) {
										if ((shooting_day_name_trim.toLowerCase().trim().includes(name_trim.toLowerCase().trim())) ||
											(name_trim.toLowerCase().trim().includes(shooting_day_name_trim.toLowerCase().trim()))) {
											found_name_trim = true;
										}
									}
								}
							}

							// Get matched following words inside the shooting days names
							let found_name_words = false;
							let words_arr1 = extractwords(scene_name, {lowercase: true, punctuation: true});
							if (words_arr1 && (words_arr1.length > 0)) {

								if (shooting_day_obj && shooting_day_obj.name_day && (shooting_day_obj.name_day.length > 0)) {
									for (var i4 = 0; ((i4 < shooting_day_obj.name_day.length) && !found_name_words); i4++) {
										let shooting_day_name_day = shooting_day_obj.name_day[i4];
										if (shooting_day_name_day && (shooting_day_name_day.length > 0)) {
											let words_arr2 = extractwords(shooting_day_name_day, {lowercase: true, punctuation: true});
											if (words_arr2 && (words_arr2.length > 0)) {
												if (words_arr2.length >= words_arr1.length) {
													for (var i5 = 0; ((i5 < words_arr1.length) && !found_name_words); i5++) {
														let word = words_arr1[i5];
														if (word && (word.length > 0)) {
															for (var i6 = 0; ((i6 < words_arr2.length) && !found_name_words); i6++) {
																let word2 = words_arr2[i6];
																if (word2 && (word2.length > 0)) {
																		if (word == word2) {
																		let count2 = 1;
																		let done =false;
																		while (!done) {
																			if (((i5 + count2) < words_arr1.length) &&
																				((i6 + count2) < words_arr2.length)) {
																				if (words_arr1[i5+count2] == words_arr2[i6+count2]) {
																					count2++;
																				} else {
																					done = true;
																				}
																			} else {
																				done = true;
																			}
																		}
																		if (count2 >= 2) {
																			found_name_words = true;
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}

							if (shooting_day_obj && (found_name_trim || found_name_words) /* && found_location*/) {
								
									let time_found = false;
								let time_found0 = false;
								let time_found1 = false;		
								for (var ii = 0; ii < scene_time.length; ii++) {
									let time = scene_time[ii].dataValues.scene_time;
									let time_type = scene_time[ii].dataValues.scene_time_type;
									let time_id = scene_time[ii].dataValues.id;
									let max_shooting_scenes = scene_time[ii].dataValues.max_shooting_scenes;
									let max_shooting_duration = scene_time[ii].dataValues.max_shooting_duration;
									let scene_duration = scene_time[ii].dataValues.default_scene_duration;
									if (time_type >= 0) {
										if (project_scene.time_type == time_type) {

											time_found = true;

											if (((time_type == 0) && !time_found0) ||
												((time_type == 1) && !time_found1))
											{
												if (time_type == 0) {
													time_found0 = true;
												} else {
													time_found1 = true;
												}
		
												//When scene name == shooting day name:
												//	If shooting time == shooting time:

												if (project_scene && !project_scene.time_id) {
													project_scene = {...project_scene, time_id: time_id}
													scene_found = false
												}

												let add_scene = false;
												if ((max_shooting_scenes > 0) && (shooting_days_list[i].scenes[time_type].length < max_shooting_scenes)) {
													scene_found = true;

													let scenes = shooting_days_list[i].scenes[time_type];
													let shooting_duration = 0
													for(let a = 0; a < scenes.length; a++) {
														shooting_duration += scenes[a].scene_duration;
													}

													//If shooting duration < max shooting duration:
													//	Add scene to shooting day.
									

													if ((shooting_duration + project_scene.scene_duration) <= max_shooting_duration) {
														let len = shooting_days_list[i].scenes[time_type].length;

														let found1 = false;
														if (shooting_day_obj.location && (shooting_day_obj.location.length > 0)) {
															for (var i3 = 0; i3 < shooting_day_obj.location.length; i3++) {
																let shooting_day_location = shooting_day_obj.location[i3];
																if (shooting_day_location && (shooting_day_location.length > 0)) {
																	if (location.toLowerCase().trim() == shooting_day_location.toLowerCase().trim()) {
																		found1 = true;
																	}
																}
															}
														}
														if (!found1) {
															shooting_day_obj.location.push(location.toLowerCase().trim())
														}

														let found2 = false;
														if (shooting_day_obj.name_trim && (shooting_day_obj.name_trim.length > 0)) {
															for (var i3 = 0; i3 < shooting_day_obj.name_trim.length; i3++) {
																let shooting_day_name_trim = shooting_day_obj.name_trim[i3];
																if (shooting_day_name_trim && (shooting_day_name_trim.length > 0)) {
																	if (name_trim.toLowerCase().trim() == shooting_day_name_trim.toLowerCase().trim()) {
																		found2 = true;
																	}
																}
															}
														}
														if (!found2) {
															shooting_day_obj.name_trim.push(name_trim.toLowerCase().trim())
															shooting_day_obj.name_day.push(scene_name.toLowerCase())
														}

														shooting_days_list[i].scenes[time_type].push(project_scene);
														add_scene = true;
													}
												} else {
												}

												if (!add_scene) {

													let shooting_duration = 0;
													let scenes = shooting_days_list[i].scenes[time_type];
													let characters_arr = []
													for(let a = 0; a < scenes.length; a++) {
														let characters = scenes[a].characters;
														//characters_arr.push(characters);
														let characters1 = [];
														for(let a1 = 0; a1 < characters.length; a1++) {
															let character = characters[a1];
															if (character) {
																characters1.push(character);
															}
														}
														let location_chararcter = {
															project_id: project_id,
															supplier_id: 0,
															character_id: 99999,
															character_name: scenes[a].location,
															character_type: 0
														}
														characters1.push(location_chararcter)
														characters_arr.push(characters1);
														shooting_duration += scenes[a].scene_duration;
													}
													let project_scene_characters = project_scene.characters;
													//characters_arr.push(project_scene_characters);
													let characters2 = [];
													for(let a1 = 0; a1 < project_scene_characters.length; a1++) {
														let character = project_scene_characters[a1];
														if (character) {
															characters2.push(character);
														}
													}
													let location_chararcter2 = {
														project_id: project_id,
														supplier_id: 0,
														character_id: 99999,
														character_name: project_scene.location,
														character_type: 0
													}
													characters2.push(location_chararcter2)
													characters_arr.push(characters2);
													shooting_duration += project_scene.scene_duration;
	
													//Find Scene with Least Most Actor Appearance
														//Remove scene from shooting day.
													//Create shooting day with scene name.
													// Add scene to shooting day
													let index = findSceneWithLeastMostActorAppearance(characters_arr, 'character_name', 'character_type');

													if ((index >= 0) && (index < scenes.length)) {
														let scene1 = shooting_days_list[i].scenes[time_type][index];
														if (scene1 && ((shooting_duration - scene1.scene_duration) <= max_shooting_duration)) {
															let arr = shooting_days_list[i].scenes[time_type].splice(index,1)
															let project_scene1 = project_scene;
															shooting_days_list[i].scenes[time_type].push(project_scene1)

															if (arr && (arr.length > 0)) {
																project_scene = arr[0];
																scene_found = false
															}
															
															let found1 = false;
															if (shooting_day_obj.location && (shooting_day_obj.location.length > 0)) {
																for (var i3 = 0; i3 < shooting_day_obj.location.length; i3++) {
																	let shooting_day_location = shooting_day_obj.location[i3];
																	if (shooting_day_location && (shooting_day_location.length > 0)) {
																		if (location.toLowerCase().trim() == shooting_day_location.toLowerCase().trim()) {
																			found1 = true;
																		}
																	}
																}
															}
															if (!found1) {
																shooting_day_obj.location.push(location.toLowerCase().trim())
															}

															let found2 = false;
															if (shooting_day_obj.name_trim && (shooting_day_obj.name_trim.length > 0)) {
																for (var i3 = 0; i3 < shooting_day_obj.name_trim.length; i3++) {
																	let shooting_day_name_trim = shooting_day_obj.name_trim[i3];
																	if (shooting_day_name_trim && (shooting_day_name_trim.length > 0)) {
																		if (name_trim.toLowerCase().trim() == shooting_day_name_trim.toLowerCase().trim()) {
																			found2 = true;
																		}
																	}
																}
															}
															if (!found2) {
																shooting_day_obj.name_trim.push(name_trim.toLowerCase().trim())
																shooting_day_obj.name_day.push(scene_name.toLowerCase())
															}
														} else {
															scene_found = false;
														}
													}
												}
											}
										}
									}
								}
							}
						}

						if (!scene_found) {
							// Create shooting day with scene name
							// Add scene to shooting day
							let location_arr = []
							let name_trim_arr = []
							let name_arr = []
							location_arr.push(project_scene.location.toLowerCase().trim());
							name_arr.push(scene_name.toLowerCase());
							name_trim_arr.push(name_trim.toLowerCase().trim());
							let shooting_day_obj = {
								name: project_scene.name,//.toLowerCase().trim(),
								name_day: name_arr,
								name_trim: name_trim_arr,
								location: location_arr,
								scenes: []
							}
							// expand to have the correct amount or rows
							if (project_scene.time_type == 0) {
								shooting_day_obj.scenes.push([project_scene]);
								shooting_day_obj.scenes.push([]);
							} else {
								shooting_day_obj.scenes.push([]);
								shooting_day_obj.scenes.push([project_scene]);
							}
							shooting_days_list.push(shooting_day_obj);
						}
					}
				}

				// Union for shooting days
				let max_scenes = 0;
				let max_day_scenes = 0;
				let max_night_scenes = 0;

				let update1 = false;
				let update2 = false;
				for (var i = 0; i < scene_time.length; i++) {
					let time = scene_time[i].dataValues.scene_time;
					let time_type = scene_time[i].dataValues.scene_time_type;
					let max_shooting_scenes = scene_time[i].dataValues.max_shooting_scenes;
					if (time_type == 0) {
						if (!update1) {
							update1 = true;
							max_scenes += max_shooting_scenes;
							max_day_scenes = max_shooting_scenes;
						}
					} else {
						if (!update2) {
							update2 = true;
							max_scenes += max_shooting_scenes;
							max_night_scenes = max_shooting_scenes;
						}
					}
				}

				// Merge days when both days scenes < max shooting duration
				// function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2)
				let touch = false; // Disable Merge
				while (touch) {
					touch = false;
					for (var j = 0; ((j < shooting_days_list.length) && !touch); j++) {
						let shooting_day_obj1 = shooting_days_list[j];
						if (!touch && shooting_day_obj1 && shooting_day_obj1.scenes &&
							(shooting_day_obj1.scenes.length > 0) &&
							(shooting_day_obj1.scenes[0] && (shooting_day_obj1.scenes[0].length <= max_day_scenes)) &&
							(shooting_day_obj1.scenes[1] && (shooting_day_obj1.scenes[1].length <= max_night_scenes))
							) {

							let day_count1 = 0;
							let night_count1 = 0;
							let total_count1 = 0;
							for (var l = 0; l < shooting_day_obj1.scenes.length; l++) {
							// inner loop applies to sub-arrays
								if (l == 0) {
									day_count1 = shooting_day_obj1.scenes[l].length;
								} else {
									night_count1 = shooting_day_obj1.scenes[l].length;
								}
							}
							total_count1 = day_count1 + night_count1;

							for (var jj = 0; ((jj < shooting_days_list.length) && !touch); jj++) {
								let shooting_day_obj2 = shooting_days_list[jj];
	
								let found_location = false;
								if (shooting_day_obj2) {
									if (shooting_day_obj1.location && (shooting_day_obj1.location.length > 0)) {
										for (var i3 = 0; i3 < shooting_day_obj1.location.length; i3++) {
											let shooting_day_location1 = shooting_day_obj1.location[i3];
											if (shooting_day_location1 && (shooting_day_location1.length > 0)) {
												if (shooting_day_obj2.location && (shooting_day_obj2.location.length > 0)) {
													for (var i4 = 0; i4 < shooting_day_obj2.location.length; i4++) {
														let shooting_day_location2 = shooting_day_obj2.location[i4];
														if (shooting_day_location2 && (shooting_day_location2.length > 0)) {
															if (shooting_day_location1.toLowerCase().trim() == shooting_day_location2.toLowerCase().trim()) {
																found_location = true;
															}
														}
													}
												}
											}
										}
									}
								}

								if (shooting_day_obj2 && shooting_day_obj2.scenes &&
									(shooting_day_obj1 != shooting_day_obj2) && 
									(shooting_day_obj2.scenes.length > 0) &&
									(shooting_day_obj2.scenes[0] && (shooting_day_obj2.scenes[0].length <= max_day_scenes)) &&
									(shooting_day_obj2.scenes[1] && (shooting_day_obj2.scenes[1].length <= max_night_scenes)) &&
									found_location
									) {
			
									let day_count2 = 0;
									let night_count2 = 0;
									let total_count2 = 0;
									for (var k = 0; k < shooting_day_obj2.scenes.length; k++) {
									// inner loop applies to sub-arrays
										if (k == 0) {
											day_count2 = shooting_day_obj2.scenes[k].length;
										} else {
											night_count2 = shooting_day_obj2.scenes[k].length;
										}
									}
									total_count2 = day_count2 + night_count2;

									if (!touch &&
										((max_shooting_days > 0) && (shooting_days_list.length > max_shooting_days))
										||
										(((total_count1 + total_count2) <= max_scenes) &&
										((day_count1 + day_count2) <= max_day_scenes) &&
										((night_count1 + night_count2) <= max_night_scenes))
										)
									{
										
										touch = true;
										for (var l1 = 0; l1 < shooting_day_obj2.scenes.length; l1++) {
											for (var m1 = 0; m1 < shooting_day_obj2.scenes[l1].length; m1++) {
												let scene1 = shooting_day_obj2.scenes[l1][m1];
												shooting_days_list[j].scenes[l1].push(scene1);
											}
										}

										let location_arr = [];
										if (shooting_day_obj1.location && (shooting_day_obj1.location.length > 0)) {
											for (var i3 = 0; i3 < shooting_day_obj1.location.length; i3++) {
												let shooting_day_location1 = shooting_day_obj1.location[i3];
												if (shooting_day_location1 && (shooting_day_location1.length > 0)) {
													location_arr.push(shooting_day_location1);
												}
											}
										}
										if (shooting_day_obj2.location && (shooting_day_obj2.location.length > 0)) {
											for (var i4 = 0; i4 < shooting_day_obj2.location.length; i4++) {
												let shooting_day_location2 = shooting_day_obj2.location[i4];
												if (shooting_day_location2 && (shooting_day_location2.length > 0)) {
													location_arr.push(shooting_day_location2);
												}
											}
										}
										if (location_arr && (location_arr.length > 0)) {
											location_arr = location_arr.filter((obj, pos, arr) => {
												return arr.map(mapObj => mapObj).indexOf(obj) == pos;
											});
										}

										shooting_days_list[j].location = location_arr;
										shooting_days_list = shooting_days_list.filter(item => item != shooting_day_obj2)
									}
								}
							}
						}
					}
				}

				// Sort shooting days by closest locations
				//let shooting_days = shooting_days_list;
				let shooting_days = [];
				let current_shooting_day = null;
				if (shooting_days_list.length > 0) {
					let arr = shooting_days_list.splice(0,1);
					if (arr && (arr.length > 0)) {
						shooting_days = arr;
						current_shooting_day = arr[0];
					}
				}
				while (shooting_days_list.length > 0) {
					let max_score = 0;
					let max_score_pos = 0;
					for (var j1 = 1; j1 < shooting_days_list.length; j1++) {
						let shooting_day_obj1 = shooting_days_list[j1];
						if (shooting_day_obj1) {
							if (current_shooting_day == null) {
								current_shooting_day = shooting_day_obj1;
							}
							if (shooting_day_obj1 && (shooting_day_obj1 != current_shooting_day)) {
								let score = getNamesScore(current_shooting_day.name_day, shooting_day_obj1.name_day);
								if (score && (score > 0) && (score > max_score)) {
									max_score = score;
									max_score_pos = j1;
								}
							}
						}
					}
					if (max_score_pos >= 0) {
						let arr = shooting_days_list.splice(max_score_pos,1);
						if (arr && (arr.length > 0)) {
							shooting_days.push(arr[0]);
							current_shooting_day = arr[0];
						}
					}
				}

				for (var j = 0; j < shooting_days.length; j++) {
					let shooting_day_obj = shooting_days[j];
					if (shooting_day_obj && shooting_day_obj.scenes && (shooting_day_obj.scenes.length > 0)) {
												
						let first_scene = shooting_day_obj.scenes[0][0];

						// Add breaks to shooting days
						let location_index = 0;
						if (first_scene) {
							for (var i = 0; i < scene_location.length; i++) {
								let location = scene_location[i].dataValues.scene_location;
								if (location && (location.length > 0) && first_scene.location && (first_scene.location.length > 0)) {
									if (
										first_scene.location.toLowerCase().trim().includes(location.toLowerCase().trim()) ||
										location.toLowerCase().trim().includes(first_scene.location.toLowerCase().trim())
									) {
										location_index = i;
									}
								}
							}
						}

						let shooting_hours = {}
						let breakfast = {};
						let lunch = {}
						for (var i = 0; i < project_params.length; i++) {
							let Break = project_params[i];
							if (Break) {
								switch (Break.type) {
									case 'shooting_hours':
										shooting_hours = Break;
										break;
									case 'breakfast':
										breakfast = Break;
										break;
									case 'lunch':
										lunch = Break;
										break;
								}
							}
						}
						
						// Add suppliers & actors & total scenes
						let call = (location_index == 0) ? shooting_hours.inside.start : shooting_hours.outside.start;
						let finished = (location_index == 0) ? shooting_hours.inside.end : shooting_hours.outside.end;
						let breakfast_row = (location_index == 0) ? breakfast.inside : breakfast.outside;
						let lunch_row = (location_index == 0) ? lunch.inside : lunch.outside;

						let team_hours = {
							call: call,
							early_call: '',
							early_call_suppliers: [],
							breakfast_start: breakfast_row.start,
							breakfast_end: breakfast_row.end,
							lunch_start: lunch_row.start,
							lunch_end: lunch_row.end,	
							wrap: '',
							first_shoot: '',
							over_time: '',
							finished: finished,
							finished_suppliers: [],
							comments: ''
						}

						// Get locations
						// Get employees
						let locations = []

						for (var k = 0; k < shooting_day_obj.scenes.length; k++) {
							for (var l = 0; l < shooting_day_obj.scenes[k].length; l++) {
								let scene_obj = shooting_day_obj.scenes[k][l];
								if (scene_obj) {
									locations.push({
										location_def: scene_obj.name,//.toLowerCase().trim(),
										location: scene_obj.location,
										time: scene_obj.time,
										time_type: scene_obj.time_type
									})

									if (scene_obj.pos) {
										shooting_day_obj.scenes[k][l].pos = l;
									} else {
										shooting_day_obj.scenes[k][l] = {...shooting_day_obj.scenes[k][l], pos: l};
									}
								}
							}
						}

						// Get actors & total scenes
						let actors = []
						let total_scenes = []
						for (var k = 0; k < shooting_day_obj.scenes.length; k++) {
							for (var l = 0; l < shooting_day_obj.scenes[k].length; l++) {
								let scene = shooting_day_obj.scenes[k][l];
								if (scene) {
									total_scenes.push(scene);
								}
								if (scene && scene.characters && (scene.characters.length > 0)) {
									for (var m = 0; m < scene.characters.length; m++) {
										let character = scene.characters[m];
										if (character && character.supplier_id && (character.supplier_id > 0)) {
											let supplier = await Supplier.findOne({where: { id: character.supplier_id }})
											if (supplier) {
												supplier = supplier.dataValues;
												let found = false;
												if (actors && (actors.length > 0)) {
													for (var n = 0; n < actors.length; n++) {
														let actor = actors[n];
														if (actor && (actor.id == supplier.id)) {
															let char = {
																character_id: character.id,
																character_name: character.character_name//.toLowerCase().trim()
															}
															if (actor.characters) {
																actor.characters.push(char.character_name/*.toLowerCase().trim()*/);
																found = true;
															}
														}
													}
												}
												if (!found) {
													if (supplier.characters) {
														supplier.characters = characters;
													} else {
														// supplier = {...supplier, characters: [{
														// 		character_id: character.id,
														// 		character_name: character.character_name//.toLowerCase().trim()
														// 	}]
														// }
														supplier = {...supplier, characters: [character.character_name/*.toLowerCase().trim()*/]}
													}

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
		
													actors.push(supplier);
		
													/*let actor = {
														actor_id: supplier.id,
														actor_name: supplier.supplier_name,//.toLowerCase().trim(),
														characters: [{
															character_id: character.id,
															character_name: character.character_name//.toLowerCase().trim()
														}],
														agency: supplier.agency,
														pickup: supplier.pickup,
														site: supplier.site,
														end_time: supplier.end_time,
														hours: 0,
														extra_hours: 0
													}
													actors.push(actor);*/
												}

												if (supplier.characters && (supplier.characters.length > 0)) {
													supplier.characters = supplier.characters.filter((obj, pos, arr) => {
														return arr.map(mapObj => mapObj).indexOf(obj) == pos;
													});
												}
											}
										}
									}
								}
							}
						}
						actors = actors.filter((obj, pos, arr) => {
							return arr.map(mapObj => mapObj.id).indexOf(obj.id) == pos;
						});

						let employees = []
						let suppliers1 = shooting_day_obj.suppliers;
						if (suppliers1 && (suppliers1.length > 0)) {
							for (var m = 0; m < suppliers1.length; m++) {
								let supplier_id = suppliers1[m];
								if (supplier_id && (supplier_id > 0)) {
									let supplier = await Supplier.findOne({where: { id: supplier_id }})
									if (supplier) {
										let employee = {
											id: supplier.id,
											supplier_id: supplier.id,
											supplier_name: supplier.supplier_name,
											pickup: supplier.pickup,
											site: supplier.site,
											end_time: supplier.end_time,
											hours: supplier.hours,
											extra_hours: supplier.extra_hours,
											post_comments: supplier.post_comments
										}
										employees.push(employee);
									}
								}
							}
						}
						/*let suppliers = await Supplier.findAll({where: { company_id: company_id }})
						suppliers = suppliers.splice(1,suppliers.length);
						for (var m = 0; m < suppliers.length; m++) {
							let supplier = suppliers[m];
							if (supplier) {
								let employee = {
									id: supplier.id,
									supplier_id: supplier.id,
									supplier_name: supplier.supplier_name,//.toLowerCase().trim(),
									pickup: supplier.pickup,
									site: supplier.site,
									end_time: supplier.end_time,
									hours: supplier.hours,
									extra_hours: supplier.extra_hours,
									post_comments: supplier.post_comments
								}
								employees.push(employee);
							}
						}*/

						locations = locations.map(item => {
							return {
								location_def: item.location_def,
								set_name: '',
								time: item.time,
								location: item.location,
								comments: ''
							}
						}),

						locations = locations.filter((obj, pos, arr) => {
							return arr.map(mapObj => mapObj.location_def).indexOf(obj.location_def) == pos;
						});
	
						let extra_expenses = [];
						let post_shooting_day = {
							//scenes: total_scenes,
							team_hours: team_hours,
							locations: locations,
							actors: actors,
							employees: employees,
							extra_expenses: extra_expenses
						}
						let location = '';
						if (first_scene && first_scene.location) {
							location = first_scene.location;
						}
						let params1 = {
							project_id: project_id,
							max_shooting_days: max_shooting_days,
							params: project_params,
							post_shooting_day: post_shooting_day,
							shooting_day: shooting_day_obj,
							scene_pos: null,
							location: location
						}

						let project_shooting_day = await ProjectShootingDay.create(params1);
						if (project_shooting_day) {
							project_shooting_day = project_shooting_day.dataValues;
						}
						let shooting_day_id = project_shooting_day.id;

						// Add tasks
						// Add TaskCategory & Tasks location manager (shooting day name / location - per supplier) to Task DB

						/*if (0 && shooting_day_obj) {

							let supplier = await Supplier.findOne({where: { company_id: company_id, supplier_job_title_id: 15 }})

							if (supplier) {
								supplier = supplier.dataValues;

								let supplier_id = supplier.id;
								let character_id = null

								let category_name = '';
								if (shooting_day_obj) {
									category_name = shooting_day_obj.name.toLowerCase().trim() + ' - ' + shooting_day_obj.location[0];
								}
		
								let task_category_obj = null;
								let color = '';
								let params = {
									supplier_id: supplier_id,
									project_id: project_id,
									task_category: shooting_day_id,
									task_category_name: category_name,
									shooting_day_id: shooting_day_id,
									color: color
								}
		
								if (supplier_id && (supplier_id > 0)) {
									task_category_obj = await TaskCategory.findOne({where: { supplier_id: supplier_id, project_id: project_id, task_category: category_name }});
								}
					
								let task_category_id = 0;
								if (task_category_obj && (task_category_obj.id > 0)) {
									task_category_id = task_category_obj.id;
									//task_category_obj = await TaskCategory.update(params, {where: { id: task_category_obj.id }});
									//task_category_obj = await TaskCategory.findOne({where: { supplier_id: supplier_id, project_id: project_id }});
								} else {
									task_category_obj = await TaskCategory.create(params);
									if (task_category_obj) {
										task_category_obj = task_category_obj.dataValues;
										task_category_id = task_category_obj.id;
									}
								}
		
								let script = [];
								let comments = '';
								let task_params = {
									project_id: project_id,
									task_name: category_name,
									supplier_id: supplier_id,
									character_id: character_id,
									task_category_id: task_category_id,
									// task_type_id: 0,
									task_status_id: task_status_active_id,
									//due_date: ,
									comments: comments,
									script: script,
									project_scene_id: 0,
									project_shooting_day_id: shooting_day_id,
									project_scene_text: shooting_day_obj.name,//.toLowerCase().trim(),
									project_scene_location: shooting_day_obj.location[0],
									price: 0
								}
								let task = await Task.create(task_params);
							}
						}*/

						// Add TaskCategory & Tasks (props, makeups, clothes, othes)
						let update_scene = false;
						for (var k = 0; k < shooting_day_obj.scenes.length; k++) {
							// inner loop applies to sub-arrays
							for (var l = 0; l < shooting_day_obj.scenes[k].length; l++) {
								let scene_obj = shooting_day_obj.scenes[k][l];
								if (scene_obj) {

									update_scene = true;
									shooting_day_obj.scenes[k][l] = {...shooting_day_obj.scenes[k][l], shooting_day_id: shooting_day_id};

									let params2 = {
										project_id: project_id,
										project_shooting_day_id: shooting_day_id,
										scene_number: scene_obj.scene_number,
										chapter_number: scene_obj.chapter_number,
										scene: scene_obj,
									}
						
									// let project_shooting_day_scene = await ProjectShootingDayScene.create(params2);
									// if (project_shooting_day_scene) {
									// 	project_shooting_day_scene = project_shooting_day_scene.dataValues;
									// }

									let scene_id = 0;
									if (scene_obj) {
										scene_id = getSceneId(scene_obj.chapter_number, scene_obj.scene_number);
										if (scene_obj.scene_id_number || (scene_obj.scene_id_number && (scene_obj.scene_id_number.length > 0))) {
											scene_id = scene_obj.scene_id_number;
										}
									}

									let supplier_id = null;
									let character_id = null;
									let task_name = '';
									if (scene_obj && scene_obj.props && (scene_obj.props.length > 0)) {
										
										for (var m = 0; m < scene_obj.props.length; m++) {
											let prop = scene_obj.props[m];											
											if (prop) {
												task_name += prop.def + ','

												if ((prop.supplier_id > 0) || (prop.character_id > 0)) {
							
													if (!supplier_id) {
														supplier_id = prop.supplier_id;
														if (!supplier_id || (supplier_id && (supplier_id <= 0))) {
															supplier_id = null
														}
													}

													if (!character_id) {
														character_id = prop.character_id;
														if (!character_id || (character_id && (character_id <= 0))) {
															character_id = null
														}
													}
												}
											}
										}
									}
									
									if (task_name.length > 1) {

										// Add task category if not exist
										let category_name = '';
										if (shooting_day_obj) {
											category_name = shooting_day_obj.name.toLowerCase().trim() + ' - ' + shooting_day_obj.location[0];
										}
				
										let task_category_obj = null;
										let color = '';
										let params = {
											supplier_id: supplier_id,
											project_id: project_id,
											task_category: shooting_day_id,
											task_category_name: category_name,
											shooting_day_id: shooting_day_id,
											color: color
										}

										if (supplier_id && (supplier_id > 0)) {
											task_category_obj = await TaskCategory.findOne({where: { supplier_id: supplier_id, project_id: project_id, task_category: category_name }});
										}
							
										let task_category_id = 0;
										if (task_category_obj && (task_category_obj.id > 0)) {
											task_category_id = task_category_obj.id;
											//task_category_obj = await TaskCategory.update(params, {where: { id: task_category_obj.id }});
											//task_category_obj = await TaskCategory.findOne({where: { supplier_id: supplier_id, project_id: project_id }});
										} else {
											task_category_obj = await TaskCategory.create(params);
											if (task_category_obj) {
												task_category_obj = task_category_obj.dataValues;
												task_category_id = task_category_obj.id;
											}
										}

										// Add task

										let comments = '';
										let task_params = {
											project_id: project_id,
											task_name: task_name,
											supplier_id: supplier_id,
											character_id: character_id,
											task_category_id: task_category_id,
											// task_type_id: 0,
											task_status_id: task_status_active_id,
											//due_date: ,
											comments: comments,
											project_scene_id: scene_id,
											project_shooting_day_id: shooting_day_id,
											project_scene_text: scene_obj.text,
											project_scene_location: scene_obj.location,
											price: scene_obj.price
										}
										let task = await Task.create(task_params);
									}

									// Add TaskCategory & Tasks script (per character) to Task DB
									if (scene_obj && scene_obj.characters && (scene_obj.characters.length > 0)) {

										for (var m = 0; m < scene_obj.characters.length; m++) {
											let character = scene_obj.characters[m];
											if (character && character.supplier_id && (character.supplier_id > 0)) {
												let supplier = await Supplier.findOne({where: { id: character.supplier_id }})
												if (supplier) {
													supplier = supplier.dataValues;
	
													let supplier_id = character.supplier_id;
													if (!supplier_id || (supplier_id && (supplier_id <= 0))) {
														supplier_id = null
													}

													let character_id = character.character_id;
													if (!character_id || (character_id && (character_id <= 0))) {
														character_id = null
													}

													let category_name = '';
													if (shooting_day_obj) {
														category_name = shooting_day_obj.name.toLowerCase().trim() + ' - ' + shooting_day_obj.location[0];
													}
							
													let task_category_obj = null;
													let color = '';
													let params = {
														supplier_id: supplier_id,
														project_id: project_id,
														task_category: shooting_day_id,
														task_category_name: category_name,
														shooting_day_id: shooting_day_id,
														color: color
													}
							
													if (supplier_id && (supplier_id > 0)) {
														task_category_obj = await TaskCategory.findOne({where: { supplier_id: supplier_id, project_id: project_id, task_category: category_name }});
													}
										
													let task_category_id = 0;
													if (task_category_obj && (task_category_obj.id > 0)) {
														task_category_id = task_category_obj.id;
														//task_category_obj = await TaskCategory.update(params, {where: { id: task_category_obj.id }});
														//task_category_obj = await TaskCategory.findOne({where: { supplier_id: supplier_id, project_id: project_id }});
													} else {
														task_category_obj = await TaskCategory.create(params);
														if (task_category_obj) {
															task_category_obj = task_category_obj.dataValues;
															task_category_id = task_category_obj.id;
														}
													}
							
													let script = scene_obj.script;
													let comments = '';
													let task_params = {
														project_id: project_id,
														task_name: category_name,
														supplier_id: supplier_id,
														character_id: character_id,
														task_category_id: task_category_id,
														// task_type_id: 0,
														task_status_id: task_status_active_id,
														//due_date: ,
														comments: comments,
														script: script,
														project_scene_id: scene_id,
														project_shooting_day_id: 0,//shooting_day_id,
														project_scene_text: scene_obj.text,
														project_scene_location: scene_obj.location,
														price: scene_obj.price
													}
													let task = await Task.create(task_params);
												}
											}
										}
									}
								}
							}
						}

						if (update_scene) {
							let params1 = {
								project_id: project_id,
								max_shooting_days: max_shooting_days,
								params: project_params,
								shooting_day: shooting_day_obj
							}			
							let project_shooting_day = await ProjectShootingDay.update(params1, {where: { id: shooting_day_id }});
						}
					}
				}
			} else {
			}

			let project_shooting_day_list = []
			let project_shooting_day1 = await ProjectShootingDay.findAll({ 
				where: { project_id: project_id }/*,
				order: [
					['pos', 'ASC']
				]*/
			});
			project_shooting_day1 = project_shooting_day1.sort(function(a, b) {
				return a.pos - b.pos;
			});
			for (var j = 0; j < project_shooting_day1.length; j++) {
				let shooting_day_obj = project_shooting_day1[j].dataValues;
				if (shooting_day_obj && shooting_day_obj.shooting_day) {
					let project_shooting_day_tasks = await Task.findAll({where: { project_shooting_day_id: shooting_day_obj.id }});

					// Get all task_list
					let tasks_list = []
					for (var j2 = 0; j2 < project_shooting_day_tasks.length; j2++) {
						let task_obj = project_shooting_day_tasks[j2].dataValues;
						if (task_obj) {

							let supplier = null;
							if (task_obj.supplier_id && (task_obj.supplier_id > 0)) {
								supplier = await Supplier.findOne({where: { id: task_obj.supplier_id }})
							}

							let supplier_name = '';
							if (supplier && supplier.supplier_name) {
								supplier_name = supplier.supplier_name;
							}

							let character = null;
							if (task_obj.character_id && (task_obj.character_id > 0)) {
								character = await Character.findOne({where: { id: task_obj.character_id }})
							}

							let character_name = '';
							if (character && character.character_name) {
								character_name = character.character_name;
							}

							let task_params = {
								task_id: task_obj.id,
								description: task_obj.task_name,
								supplier_id: task_obj.supplier_id,
								supplier_name: supplier_name,
								character_id: task_obj.character_id,
								character_name: character_name,
								comments: task_obj.comments
							}

							tasks_list.push(task_params)
						}
					}

					if (shooting_day_obj.shooting_day.scenes && (shooting_day_obj.shooting_day.scenes.length > 0)) {
						let total_scenes = [];
						if (shooting_day_obj && shooting_day_obj.shooting_day) {
							if (shooting_day_obj.shooting_day.scenes[0] && shooting_day_obj.shooting_day.scenes[1]) {
								total_scenes = [...shooting_day_obj.shooting_day.scenes[0],...shooting_day_obj.shooting_day.scenes[1]];
							} else {
								if (shooting_day_obj.shooting_day.scenes[0]) {
									total_scenes = [...shooting_day_obj.shooting_day.scenes[0]];
								}
							}
						}
						if (shooting_day_obj.shooting_day.total_scenes && (shooting_day_obj.shooting_day.total_scenes.length > 0)) {
							shooting_day_obj.shooting_day.total_scenes = total_scenes;
						} else {
							if (shooting_day_obj && shooting_day_obj.shooting_day) {
								shooting_day_obj.shooting_day = {...shooting_day_obj.shooting_day, total_scenes: total_scenes};
							}
						}
					}
					
					// Get actors & characters & total_scenes
					let characters = []
					let total_scenes = []
					if (shooting_day_obj && shooting_day_obj.shooting_day && 
						shooting_day_obj.shooting_day.total_scenes && 
						(shooting_day_obj.shooting_day.total_scenes.length > 0)) {
						for (var m = 0; m < shooting_day_obj.shooting_day.total_scenes.length; m++) {
							let scene = shooting_day_obj.shooting_day.total_scenes[m];
							if (scene) {
								total_scenes.push(scene);
							}
							if (scene && scene.characters && (scene.characters.length > 0)) {
								for (var m1 = 0; m1 < scene.characters.length; m1++) {
									let character = scene.characters[m1];
									characters.push(character);
								}
							}
						}
					}
					characters = characters.filter((obj, pos, arr) => {
						return arr.map(mapObj => mapObj.character_name).indexOf(obj.character_name) == pos;
					});

					let char_list = await Character.findAll({where: { project_id: project_id }});
					char_list = char_list.sort(function(a, b) {
						return b.character_count - a.character_count;
					});
					let characters_list = []
					for (var j3 = 0; j3 < characters.length; j3++) {
						let char = characters[j3];
						if (char && char.character_id && (char.character_id > 0)) {
							for (var j4 = 0; j4 < char_list.length; j4++) {
								let char2 = char_list[j4];
								if (char2 && char2.dataValues) {
									char2 = char2.dataValues;
								}
								if (char2 && char2.id && (char2.id == char.character_id)) {
									characters_list.push(char)
								}
							}
						} else {
							characters_list.push(char)
						}
					}
					characters = characters_list.filter((obj, pos, arr) => {
						return arr.map(mapObj => mapObj.character_name).indexOf(obj.character_name) == pos;
					});

					let actors = []
					for (var j1 = 0; j1 < characters.length; j1++) {
						let character = characters[j1];
						if (character && (character.supplier_id > 0)) {
							let supplier = await Supplier.findOne({where: { id: character.supplier_id }})
							if (supplier) {
								supplier = supplier.dataValues;
								let found = false;
								if (actors && (actors.length > 0)) {
									for (var n = 0; n < actors.length; n++) {
										let actor = actors[n];
										if (actor && (actor.id == supplier.id)) {
											let char = {
												character_id: character.id,
												character_name: character.character_name
											}
											if (actor.characters) {
												actor.characters.push(char.character_name);
												found = true;
											}
										}
									}
								}
								if (!found) {
									if (supplier.characters) {
										if (character) {
											supplier.characters.push(character.character_name);
										}
									} else {
										// supplier = {...supplier, characters: [{
										// 		character_id: character.id,
										// 		character_name: character.character_name
										// 	}]
										// }
										if (character) {
											supplier = {...supplier, characters: [character.character_name]}
										  } else {
											supplier = {...supplier, characters: []}
										  }
									}

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

									actors.push(supplier);

									/*let actor = {
										actor_id: supplier.id,
										actor_name: supplier.supplier_name,
										characters: [{
											character_id: character.id,
											character_name: character.character_name
										}],
										agency: supplier.agency,
										pickup: supplier.pickup,
										site: supplier.site,
										end_time: supplier.end_time,
										hours: 0,
										extra_hours: 0
									}
									actors.push(actor);*/
								}

								if (supplier.characters && (supplier.characters.length > 0)) {
									supplier.characters = supplier.characters.filter((obj, pos, arr) => {
										return arr.map(mapObj => mapObj).indexOf(obj) == pos;
									});
								}
							}
						}
					}
					actors = actors.filter((obj, pos, arr) => {
						return arr.map(mapObj => mapObj.id).indexOf(obj.id) == pos;
					});

					if (shooting_day_obj.post_shooting_day && shooting_day_obj.post_shooting_day.actors) {
						shooting_day_obj.post_shooting_day.actors = actors;
					} else {
						shooting_day_obj.post_shooting_day = {...shooting_day_obj.post_shooting_day, actors: actors}
					}

					/*if (shooting_day_obj.post_shooting_day && shooting_day_obj.post_shooting_day.scenes) {
						shooting_day_obj.post_shooting_day.scenes = total_scenes;
					} else {
						shooting_day_obj.post_shooting_day = {...shooting_day_obj.post_shooting_day, scenes: total_scenes}
					}*/

					if (shooting_day_obj.scene_pos && 
						shooting_day_obj.shooting_day && 
						shooting_day_obj.shooting_day.total_scenes &&
						(shooting_day_obj.shooting_day.total_scenes.length > 0) && 
						(shooting_day_obj.scene_pos.length > 0)) {
						let new_total_scenes = []
						for (var j2 = 0; j2 < shooting_day_obj.scene_pos.length; j2++) {
							let id = shooting_day_obj.scene_pos[j2];
							if (id && (id > 0)) {
								for (var j3 = 0; j3 < shooting_day_obj.shooting_day.total_scenes.length; j3++) {
									let scene = shooting_day_obj.shooting_day.total_scenes[j3];
									if (scene && scene.id && (scene.id == id)) {
										new_total_scenes.push(scene);
									}
								}
							}
						}
						if (new_total_scenes && (new_total_scenes.length > 0)) {
							shooting_day_obj.shooting_day.total_scenes = new_total_scenes;
						}
					} else {
					}

					let shooting_day = {
						id: shooting_day_obj.id,
						max_shooting_days: shooting_day_obj.max_shooting_days,
						params: shooting_day_obj.params,
						shooting_day: shooting_day_obj.shooting_day,
						tasks: tasks_list,
						characters: characters,
						actors: actors,
						additional_expenses: shooting_day_obj.additional_expenses,
						general_comments: shooting_day_obj.general_comments,
						post_shooting_day: shooting_day_obj.post_shooting_day,
						scene_pos: shooting_day_obj.scene_pos,
						suppliers: shooting_day_obj.suppliers,
						date: shooting_day_obj.date
					}
					project_shooting_day_list.push(shooting_day);
				}
			}

			//let tasks = await Task.findAll({ where: { project_id: project_id }});
			//let suppliers = await Supplier.findAll({where: { company_id: company_id }});
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

					utils.getAllProjectSuppliers(project_id, function (err, suppliers) {
						if (err) {
							return res.json({
								response: 3,
								err: err
							})
						} else {

							let respose = {
								project_id: project_id,
								shooting_days: project_shooting_day_list,
								tasks: tasks,
								suppliers: suppliers,
								budgets: budgets
							}
				
							return res.json(respose)
		
						}
					});
				}
			});
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	buildProjectReschedule: async (req, res, next) =>
	{
		try {
			let project_id = parseInt(req.body.project_id);
			let shooting_day_id = parseInt(req.body.shooting_day_id);
			let scene_id = req.body.scene_id;
			let chapter_number = parseInt(req.body.chapter_number);
			let scene_number = parseInt(req.body.scene_number);
			
			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = 0;
			} else {
			}

			if (isNaN(shooting_day_id) || (shooting_day_id <= 0)) {
				shooting_day_id = 0;
			} else {
			}

			if (!scene_id) {
				scene_id = null;
			} else {
			}

			if (isNaN(chapter_number) || (chapter_number <= 0)) {
				chapter_number = 0;
			} else {
			}

			if (isNaN(scene_number) || (scene_number <= 0)) {
				scene_number = 0;
			} else {
			}

			let project = null;
			if (project_id > 0) {
				project = await Project.findOne({ where: { id: project_id }})
				if (project) {
					project = project.dataValues;
				}
			}

			emptyS3Directory(project_id)
z
			let limitations = null;
			if (project && project.limitations && project.limitations.limitations) {
				limitations = project.limitations.limitations;
			}

			let shooting_day = null;
			let shooting_day_list = null;
			if (shooting_day_id > 0) {
				shooting_day = await ProjectShootingDay.findOne({ where: { id: shooting_day_id }})
				if (shooting_day) {
					shooting_day = shooting_day.dataValues;
				}
				shooting_day_list = await ProjectShootingDay.findAll({
					where: sequelize.where(
						sequelize.literal('last/strike'),
						'>',
						shooting_day_id
					)		
				})
			}

			if (shooting_day && shooting_day_list && (shooting_day_list.length > 0)) {
				let project_scene = null;
				if (shooting_day && 
					shooting_day.shooting_day && 
					shooting_day.shooting_day.scenes &&
					(shooting_day.shooting_day.scenes.length > 0)
					) {
					for (var k = 0; k < shooting_day.shooting_day.scenes.length; k++) {
						// inner loop applies to sub-arrays
						for (var l = 0; l < shooting_day.shooting_day.scenes[k].length; l++) {
							let scene_obj = shooting_day.shooting_day.scenes[k][l];
							if (scene_obj && (scene_number > 0) && (script.chapter_number > 0) && 
								(scene_obj.scene_number == scene_number) &&
								(scene_obj.chapter_number == chapter_number)
								) {
								let scene_arr = shooting_day.shooting_day.scenes[k].splice(l,1);
								if (scene_arr && (scene_arr.length > 0)) {
									project_scene = scene_arr[0];
								}
							}
						}
					}
				}

				if (project_scene) {
					let scene_location = await SceneLocation.findAll({where: { project_id: project_id }});
					let scene_time = await SceneTime.findAll({where: { project_id: project_id }});	
					let found = false;
					for (var i = 0; i < shooting_day_list.length; i++) {
						let shooting_day_obj = shooting_day_list[i];

						let found_location = false;
						if (shooting_day_obj && shooting_day_obj.location && (shooting_day_obj.location.length > 0)) {
							for (var i4 = 0; i4 < shooting_day_obj.location.length; i4++) {
								let shooting_day_location = shooting_day_obj.location[i4];
								if (shooting_day_location && (shooting_day_location.length > 0)) {
									if ((shooting_day_location.toLowerCase().trim().includes(location.toLowerCase().trim())) ||
										(location.toLowerCase().trim().includes(shooting_day_location.toLowerCase().trim()))) {
										found_location = true;
									}
								}
							}
						}

						let found_name_trim = false;
						if (shooting_day_obj && shooting_day_obj.name_trim && (shooting_day_obj.name_trim.length > 0)) {
							for (var i4 = 0; i4 < shooting_day_obj.name_trim.length; i4++) {
								let shooting_day_name_trim = shooting_day_obj.name_trim[i4];
								if (shooting_day_name_trim && (shooting_day_name_trim.length > 0)) {
									if ((shooting_day_name_trim.toLowerCase().trim().includes(name_trim.toLowerCase().trim())) ||
										(name_trim.toLowerCase().trim().includes(shooting_day_name_trim.toLowerCase().trim()))) {
										found_name_trim = true;
									}
								}
							}
						}

						if (shooting_day_obj && found_location && found_name_trim) {

							let time_found = false;
							let time_found0 = false;
							let time_found1 = false;
							for (var ii = 0; ii < scene_time.length; ii++) {
								let time = scene_time[ii].dataValues.scene_time;
								let time_type = scene_time[ii].dataValues.scene_time_type;
								let time_id = scene_time[ii].dataValues.id;
								let max_shooting_scenes = scene_time[ii].dataValues.max_shooting_scenes;
								let max_shooting_duration = scene_time[ii].dataValues.max_shooting_duration;
								let scene_duration = scene_time[ii].dataValues.default_scene_duration;
								if (time_type >= 0) {
									if (project_scene.time_type == time_type) {
										time_found = true;

										if (((time_type == 0) && !time_found0) ||
											((time_type == 1) && !time_found1))
											{
											if (time_type == 0) {
												time_found0 = true;
											} else {
												time_found1 = true;
											}
				
											if (project_scene && !project_scene.time_id) {
												project_scene = {...project_scene, time_id: time_id}
											}

											let add_scene = false;
											if (1 || ((max_shooting_scenes > 0) && (shooting_days_list[i].scenes[time_type].length < max_shooting_scenes))) {
												found = true;

												let scenes = shooting_days_list[i].scenes[time_type];
												let shooting_duration = 0
												for(let a = 0; a < scenes.length; a++) {
													shooting_duration += scenes[a].scene_duration;
												}

												if (1 || ((shooting_duration + project_scene.scene_duration) <= max_shooting_duration)) {
													let len = shooting_days_list[i].scenes[time_type].length;
													shooting_days_list[i].scenes[time_type].push(project_scene);
													add_scene = true;
												}
											} else {
											}

											if (0 && !add_scene) {

												let shooting_duration = 0;
												let scenes = shooting_days_list[i].scenes[time_type];
												let characters_arr = []
												for(let a = 0; a < scenes.length; a++) {
													let characters = scenes[a].characters;
													let characters1 = [];
													for(let a1 = 0; a1 < characters.length; a1++) {
														let character = characters[a1];
														if (character) {
															characters1.push(character);
														}
													}
													let location_chararcter = {
														project_id: project_id,
														supplier_id: 0,
														character_id: 99999,
														character_name: scenes[a].location,
														character_type: 0
													}
													characters1.push(location_chararcter)
													characters_arr.push(characters1);
												}
												let characters_list = project_scene.characters;
												let characters2 = [];
												for(let a2 = 0; a2 < characters_list.length; a2++) {
													let character = characters_list[a2];
													if (character) {
														characters1.push(character);
													}
												}
												let location_chararcter2 = {
													project_id: project_id,
													supplier_id: 0,
													character_id: 99999,
													character_name: project_scene.location,
													character_type: 0
												}
												characters2.push(location_chararcter2)
												characters_arr.push(characters2);
												shooting_duration += project_scene.scene_duration;

												let index = findSceneWithLeastMostActorAppearance(characters_arr, 'character_name', 'character_type');

												if ((index >= 0) && (index < scenes.length)) {
													let scene1 = shooting_days_list[i].scenes[time_type][index];
													if (scene1 && ((shooting_duration - scene1.scene_duration) <= max_shooting_duration)) {
														let arr = shooting_days_list[i].scenes[time_type].splice(index,1)
														let project_scene1 = project_scene;
														shooting_days_list[i].scenes[time_type].push(project_scene1)
														if (arr && (arr.length > 0)) {
															project_scene = arr[0];
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	addProjectSceneTask: async (req, resז, next) => {

		try {
			let project_id = parseInt(req.body.project_id);
			let chapter_number = parseInt(req.body.chapter_number);
			let scene_number = parseInt(req.body.scene_number);
			let tasks = req.body.tasks;

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = 0;
			} else {
			}

			if (isNaN(scene_number) || (scene_number < 0)) {
				scene_number = 0;
			} else {
			}

			if (isNaN(chapter_number) || (chapter_number <= 0)) {
				chapter_number = 0;
			} else {
			}

			if (!tasks) {
				tasks = null;
			} else {
			}

			if (
				isNaN(project_id) || (project_id <= 0) ||
				isNaN(chapter_number) || (chapter_number <= 0) ||
				isNaN(scene_number) || (scene_number <= 0)
				) {
				project_id = null;
				return res.json({
					response: 2,
					err: "No project id"
				})
			}

			if (!tasks || (tasks && (tasks.length <= 0))) {
				return res.json({
					response: 2,
					err: "No tasks"
				})
			}

			emptyS3Directory(project_id)

			let shooting_day_obj = null;
			let project_shooting_day = await ProjectShootingDay.findAll({ 
				where: { project_id: project_id }/*, 
				order: [
					['pos', 'ASC']
				]*/
			});
			project_shooting_day = project_shooting_day.sort(function(a, b) {
				return a.pos - b.pos;
			});
			for (var j = 0; ((j < project_shooting_day.length) && !shooting_day_obj); j++) {
				let shooting_day_obj1 = project_shooting_day[j].dataValues;
				if (shooting_day_obj1 && shooting_day_obj1.shooting_day) {
					let shooting_day = shooting_day_obj1.shooting_day;
					let update_shooting_day = false;
					if (shooting_day && shooting_day.scenes && (shooting_day.scenes.length > 0)) {
						for (var k = 0; ((k < shooting_day.scenes.length) && !shooting_day_obj); k++) {
							let scene = shooting_day.scenes[k];
							if (scene && chapter_number && scene_number && (chapter_number > 0) && (scene_number> 0) && (scene.chapter_number == chapter_number) && (scene.scene_number == scene_number)) {
								shooting_day_obj = shooting_day_obj1;
							}
						}
					}
				}
			}

			const task_status_list = await TaskStatus.findAll({});
			let task_status_active_id = 1;
			if (task_status_list) {
				for (var j = 0; j < task_status_list.length; j++) {
					let task_status = task_status_list[j].dataValues;
					if (task_status.task_status == 'Active') {
						task_status_active_id = task_status.id;
					}
				}
			}

			const project_scene_obj = await ProjectScene.findOne({where: { project_id: project_id, chapter_number: chapter_number, scene_number: scene_number }});
			if (project_scene_obj && shooting_day_obj) {
				for (var i = 0; i < tasks.length; i++) {

					let task = tasks[i];
					if (task && ((task.supplier_id > 0) || (task.character_id > 0))) {

						let supplier_id = task.supplier_id;
						if (!supplier_id || (supplier_id && (supplier_id <= 0))) {
							supplier_id = null
						}

						let character_id = task.character_id;
						if (!character_id || (character_id && (character_id <= 0))) {
							character_id = null
						}

						let category_name = '';
						if (shooting_day_obj) {
							category_name = shooting_day_obj.name.toLowerCase().trim() + ' - ' + shooting_day_obj.location[0];
						}

						let task_category_obj = null;
						let color = '';
						let params = {
							supplier_id: supplier_id,
							project_id: project_id,
							task_category: shooting_day_obj.id,
							task_category_name: category_name,
							shooting_day_id: shooting_day_obj.id,
							color: color
						}

						if (supplier_id && (supplier_id > 0)) {
							task_category_obj = await TaskCategory.findOne({where: { supplier_id: supplier_id, project_id: project_id, task_category: category_name }});
						}
			
						let task_category_id = 0;
						if (task_category_obj && (task_category_obj.id > 0)) {
							task_category_id = task_category_obj.id;
							//task_category_obj = await TaskCategory.update(params, {where: { id: task_category_obj.id }});
							//task_category_obj = await TaskCategory.findOne({where: { supplier_id: supplier_id, project_id: project_id }});
						} else {
							task_category_obj = await TaskCategory.create(params);
							if (task_category_obj) {
								task_category_obj = task_category_obj.dataValues;
								task_category_id = task_category_obj.id;
							}
						}

						let scene_id = getSceneId(chapter_number, scene_number);
						let comments = '';
						if (task.comments && (task.comments.length > 0)) {
							comments = task.comments;
						}
						let task_params = {
							project_id: project_id,
							task_name: task.def,
							supplier_id: supplier_id,
							character_id: character_id,
							task_category_id: task_category_id,
							// task_type_id: 0,
							task_status_id: task_status_active_id,
							//due_date: ,
							comments: comments,
							project_scene_id: scene_id,
							project_shooting_day_id: shooting_day_obj.id,
							project_scene_text: scene_obj.text,
							project_scene_location: scene_obj.location,
							price: scene_obj.price
						}
						let task = await Task.create(task_params);
					}
				}
			}

			return res.json({
				response: 0,
				err: ''
			})
			
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	addProjectProp: async (req, res, next) => {

		try {
			let project_id = parseInt(req.body.project_id);
			let prop = req.body.prop;
			let type = parseInt(req.body.type); // (0=prop,1=makeup,2=cloth,3=special,4=other)

			if (update && prop && (prop.length > 0) && type && (type > 0)) {

				let project_script = await ProjectScript.findAll({where: { project_id: project_id }});
				for (var i = 0; i < project_script.length; i++) {
					let script = project_script[i].dataValues.script;
					if (script) {
						let update_data = false;
						for (var i1 = 0; i1 < script.scenes.length; i1++) {
							let scene = script.scenes[i1];

							if (scene && scene.script && (scene.script.length > 0)) { 

								for (var i2 = 0; i2 < scene.script.length; i2++) {
									let script = scene.script[i2];

									if (script && script.text && (script.text.length > 0)) {

										let text = script.text;

										let word_props = prop;
			
										let word_props_arr = [];
										if (word_props && (word_props.length > 0)) {
											word_props_arr = extractwords(word_props, {lowercase: true, punctuation: true});
										}
										if (word_props_arr && (word_props_arr.length > 1)) {
			
											if (word_props && (word_props.length > 0)) {
												if (text.includes(word_props)) {
			
													let script_word_exist = false;
													for (var k = 0; ((k < script.props.length) && !script_word_exist); k++) {
														let word2 = script.props[k];
														if (word2 && (word2.length > 0) && (word2 == word_props)) {
															script_word_exist = true;
														}
													}
													if (!script_word_exist) {
														let prop_obj = {
															def: word_props,
															supplier_id: 0,
															supplier_name: '',
															character_id: 0,
															character_name: '',
															comments: ''
														}
														script.props.push(prop_obj);
														update_data = true;
													}
			
													let scene_word_exist = false;
													for (var k = 0; ((k < scene.props.length) && !scene_word_exist); k++) {
														let word2 = scene.props[k];
														if (word2 && (word2.length > 0) && (word2 == word_props)) {
															scene_word_exist = true;
														}
													}
													if (!scene_word_exist) {
														let prop_obj = {
															def: word_props,
															supplier_id: 0,
															supplier_name: '',
															character_id: 0,
															character_name: '',
															comments: ''
														}
														scene.props.push(prop_obj);
														update_data = true;
													}
												}
											}
										} else {
											if (text && (text.length > 0)) {
												let words_arr = extractwords(text, {lowercase: true, punctuation: true});
												if (words_arr && (words_arr.length > 0)) {
													for (var i = 0; i < words_arr.length; i++) {
														let word = words_arr[i];
														if (word && (word.length > 0) && (word == word_props)) {
			
															let script_word_exist = false;
															for (var k = 0; ((k < script.props.length) && !script_word_exist); k++) {
																let word2 = script.props[k];
																if (word2 && (word2.length > 0) && (word2 == word_props)) {
																	script_word_exist = true;
																}
															}
															if (!script_word_exist) {
																let prop_obj = {
																	def: word_props,
																	supplier_id: 0,
																	supplier_name: '',
																	character_id: 0,
																	character_name: '',
																	comments: ''
																}
																script.props.push(prop_obj);
																update_data = true;
															}
			
															let scene_word_exist = false;
															for (var k = 0; ((k < scene.props.length) && !scene_word_exist); k++) {
																let word2 = scene.props[k];
																if (word2 && (word2.length > 0) && (word2 == word_props)) {
																	scene_word_exist = true;
																}
															}
															if (!scene_word_exist) {
																let prop_obj = {
																	def: word_props,
																	supplier_id: 0,
																	supplier_name: '',
																	character_id: 0,
																	character_name: '',
																	comments: ''
																}
																scene.props.push(prop_obj);
																update_data = true;
															}
														}
													}
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
						if (shooting_day && shooting_day.scenes && (shooting_day.scenes.length > 0)) {
							let update_data = false;
							for (var k = 0; k < shooting_day.scenes.length; k++) {
								let scene1 = shooting_day.scenes[k];												
								if (scene1) {
									for (var k1 = 0; k1 < scene1.length; k1++) {
										let scene = scene1[k1];
										if (scene && scene.script && (scene.script.length > 0)) { 

											for (var i2 = 0; i2 < scene.script.length; i2++) {
												let script = scene.script[i2];

												if (script && script.text && (script.text.length > 0)) {

													let text = script.text;

													let word_props = prop;
						
													let word_props_arr = [];
													if (word_props && (word_props.length > 0)) {
														word_props_arr = extractwords(word_props, {lowercase: true, punctuation: true});
													}
													if (word_props_arr && (word_props_arr.length > 1)) {
						
														if (word_props && (word_props.length > 0)) {
															if (text.includes(word_props)) {
						
																let script_word_exist = false;
																for (var k = 0; ((k < script.props.length) && !script_word_exist); k++) {
																	let word2 = script.props[k];
																	if (word2 && (word2.length > 0) && (word2 == word_props)) {
																		script_word_exist = true;
																	}
																}
																if (!script_word_exist) {
																	let prop_obj = {
																		def: word_props,
																		supplier_id: 0,
																		supplier_name: '',
																		character_id: 0,
																		character_name: '',
																		comments: ''
																	}
																	script.props.push(prop_obj);
																	update_data = true;
																}
						
																let scene_word_exist = false;
																for (var k = 0; ((k < scene.props.length) && !scene_word_exist); k++) {
																	let word2 = scene.props[k];
																	if (word2 && (word2.length > 0) && (word2 == word_props)) {
																		scene_word_exist = true;
																	}
																}
																if (!scene_word_exist) {
																	let prop_obj = {
																		def: word_props,
																		supplier_id: 0,
																		supplier_name: '',
																		character_id: 0,
																		character_name: '',
																		comments: ''
																	}
																	scene.props.push(prop_obj);
																	update_data = true;
																}
															}
														}
													} else {
														if (text && (text.length > 0)) {
															let words_arr = extractwords(text, {lowercase: true, punctuation: true});
															if (words_arr && (words_arr.length > 0)) {
																for (var i = 0; i < words_arr.length; i++) {
																	let word = words_arr[i];
																	if (word && (word.length > 0) && (word == word_props)) {
						
																		let script_word_exist = false;
																		for (var k = 0; ((k < script.props.length) && !script_word_exist); k++) {
																			let word2 = script.props[k];
																			if (word2 && (word2.length > 0) && (word2 == word_props)) {
																				script_word_exist = true;
																			}
																		}
																		if (!script_word_exist) {
																			let prop_obj = {
																				def: word_props,
																				supplier_id: 0,
																				supplier_name: '',
																				character_id: 0,
																				character_name: '',
																				comments: ''
																			}
																			script.props.push(prop_obj);
																			update_data = true;
																		}
						
																		let scene_word_exist = false;
																		for (var k = 0; ((k < scene.props.length) && !scene_word_exist); k++) {
																			let word2 = scene.props[k];
																			if (word2 && (word2.length > 0) && (word2 == word_props)) {
																				scene_word_exist = true;
																			}
																		}
																		if (!scene_word_exist) {
																			let prop_obj = {
																				def: word_props,
																				supplier_id: 0,
																				supplier_name: '',
																				character_id: 0,
																				character_name: '',
																				comments: ''
																			}
																			scene.props.push(prop_obj);
																			update_data = true;
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
							if (update_data) {
								let params1 = {
									shooting_day: shooting_day
								}
								let project_shooting_day = await ProjectShootingDay.update(params1, {where: { id: shooting_day_obj.id }});
							}
						}
					}
				}			
			}
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	deleteProjectProp: async (req, res, next) => {

		try {
			let project_id = parseInt(req.body.project_id);
			let prop = req.body.prop;
			let type = parseInt(req.body.type); // (0=prop,1=makeup,2=cloth,3=special,4=other)

			if (update && prop && (prop.length > 0) && type && (type > 0)) {

				let project_script = await ProjectScript.findAll({where: { project_id: project_id }});
				for (var i = 0; i < project_script.length; i++) {
					let script = project_script[i].dataValues.script;
					if (script) {
						let update_data = false;
						for (var i1 = 0; i1 < script.scenes.length; i1++) {
							let scene = script.scenes[i1];

							if (scene && scene.script && (scene.script.length > 0)) { 

								for (var i2 = 0; i2 < scene.script.length; i2++) {
									let script = scene.script[i2];

									if (script && script.text && (script.text.length > 0)) {

										let text = script.text;

										let word_props = prop;
			
										let word_props_arr = [];
										if (word_props && (word_props.length > 0)) {
											word_props_arr = extractwords(word_props, {lowercase: true, punctuation: true});
										}
										if (word_props_arr && (word_props_arr.length > 1)) {
			
											if (word_props && (word_props.length > 0)) {
												if (text.includes(word_props)) {
			
													let script_word_exist = false;
													for (var k = 0; ((k < script.props.length) && !script_word_exist); k++) {
														let word2 = script.props[k];
														if (word2 && (word2.length > 0) && (word2 == word_props)) {
															script_word_exist = true;
														}
													}
													if (!script_word_exist) {
														let prop_obj = {
															def: word_props,
															supplier_id: 0,
															supplier_name: '',
															character_id: 0,
															character_name: '',
															comments: ''
														}
														script.props.push(prop_obj);
														update_data = true;
													}
			
													let scene_word_exist = false;
													for (var k = 0; ((k < scene.props.length) && !scene_word_exist); k++) {
														let word2 = scene.props[k];
														if (word2 && (word2.length > 0) && (word2 == word_props)) {
															scene_word_exist = true;
														}
													}
													if (!scene_word_exist) {
														let prop_obj = {
															def: word_props,
															supplier_id: 0,
															supplier_name: '',
															character_id: 0,
															character_name: '',
															comments: ''
														}
														scene.props.push(prop_obj);
														update_data = true;
													}
												}
											}
										} else {
											if (text && (text.length > 0)) {
												let words_arr = extractwords(text, {lowercase: true, punctuation: true});
												if (words_arr && (words_arr.length > 0)) {
													for (var i = 0; i < words_arr.length; i++) {
														let word = words_arr[i];
														if (word && (word.length > 0) && (word == word_props)) {
			
															let script_word_exist = false;
															for (var k = 0; ((k < script.props.length) && !script_word_exist); k++) {
																let word2 = script.props[k];
																if (word2 && (word2.length > 0) && (word2 == word_props)) {
																	script_word_exist = true;
																}
															}
															if (!script_word_exist) {
																let prop_obj = {
																	def: word_props,
																	supplier_id: 0,
																	supplier_name: '',
																	character_id: 0,
																	character_name: '',
																	comments: ''
																}
																script.props.push(prop_obj);
																update_data = true;
															}
			
															let scene_word_exist = false;
															for (var k = 0; ((k < scene.props.length) && !scene_word_exist); k++) {
																let word2 = scene.props[k];
																if (word2 && (word2.length > 0) && (word2 == word_props)) {
																	scene_word_exist = true;
																}
															}
															if (!scene_word_exist) {
																let prop_obj = {
																	def: word_props,
																	supplier_id: 0,
																	supplier_name: '',
																	character_id: 0,
																	character_name: '',
																	comments: ''
																}
																scene.props.push(prop_obj);
																update_data = true;
															}
														}
													}
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
						if (shooting_day && shooting_day.scenes && (shooting_day.scenes.length > 0)) {
							let update_data = false;
							for (var k = 0; k < shooting_day.scenes.length; k++) {
								let scene1 = shooting_day.scenes[k];												
								if (scene1) {
									for (var k1 = 0; k1 < scene1.length; k1++) {
										let scene = scene1[k1];
										if (scene && scene.script && (scene.script.length > 0)) { 

											for (var i2 = 0; i2 < scene.script.length; i2++) {
												let script = scene.script[i2];

												if (script && script.text && (script.text.length > 0)) {

													let text = script.text;

													let word_props = prop;
						
													let word_props_arr = [];
													if (word_props && (word_props.length > 0)) {
														word_props_arr = extractwords(word_props, {lowercase: true, punctuation: true});
													}
													if (word_props_arr && (word_props_arr.length > 1)) {
						
														if (word_props && (word_props.length > 0)) {
															if (text.includes(word_props)) {
						
																let script_word_exist = false;
																for (var k = 0; ((k < script.props.length) && !script_word_exist); k++) {
																	let word2 = script.props[k];
																	if (word2 && (word2.length > 0) && (word2 == word_props)) {
																		script_word_exist = true;
																	}
																}
																if (!script_word_exist) {
																	let prop_obj = {
																		def: word_props,
																		supplier_id: 0,
																		supplier_name: '',
																		character_id: 0,
																		character_name: '',
																		comments: ''
																	}
																	script.props.push(prop_obj);
																	update_data = true;
																}
						
																let scene_word_exist = false;
																for (var k = 0; ((k < scene.props.length) && !scene_word_exist); k++) {
																	let word2 = scene.props[k];
																	if (word2 && (word2.length > 0) && (word2 == word_props)) {
																		scene_word_exist = true;
																	}
																}
																if (!scene_word_exist) {
																	let prop_obj = {
																		def: word_props,
																		supplier_id: 0,
																		supplier_name: '',
																		character_id: 0,
																		character_name: '',
																		comments: ''
																	}
																	scene.props.push(prop_obj);
																	update_data = true;
																}
															}
														}
													} else {
														if (text && (text.length > 0)) {
															let words_arr = extractwords(text, {lowercase: true, punctuation: true});
															if (words_arr && (words_arr.length > 0)) {
																for (var i = 0; i < words_arr.length; i++) {
																	let word = words_arr[i];
																	if (word && (word.length > 0) && (word == word_props)) {
						
																		let script_word_exist = false;
																		for (var k = 0; ((k < script.props.length) && !script_word_exist); k++) {
																			let word2 = script.props[k];
																			if (word2 && (word2.length > 0) && (word2 == word_props)) {
																				script_word_exist = true;
																			}
																		}
																		if (!script_word_exist) {
																			let prop_obj = {
																				def: word_props,
																				supplier_id: 0,
																				supplier_name: '',
																				character_id: 0,
																				character_name: '',
																				comments: ''
																			}
																			script.props.push(prop_obj);
																			update_data = true;
																		}
						
																		let scene_word_exist = false;
																		for (var k = 0; ((k < scene.props.length) && !scene_word_exist); k++) {
																			let word2 = scene.props[k];
																			if (word2 && (word2.length > 0) && (word2 == word_props)) {
																				scene_word_exist = true;
																			}
																		}
																		if (!scene_word_exist) {
																			let prop_obj = {
																				def: word_props,
																				supplier_id: 0,
																				supplier_name: '',
																				character_id: 0,
																				character_name: '',
																				comments: ''
																			}
																			scene.props.push(prop_obj);
																			update_data = true;
																		}
																	}
																}
															}
														}
													}
												}
											}
										}
									}
								}
							}
							if (update_data) {
								let params1 = {
									shooting_day: shooting_day
								}
								let project_shooting_day = await ProjectShootingDay.update(params1, {where: { id: shooting_day_obj.id }});
							}
						}
					}
				}			
			}
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	addProjectScene: async (req, res, next) => {
		try {
			let project_id = parseInt(req.body.project_id);
			let chapter_number = parseInt(req.body.chapter_number);
			let scene_number = parseInt(req.body.scene_number);
			let scene_name = req.body.scene_name;
			let text = req.body.text;
			let time = req.body.time;
			let location = req.body.location;
			let props = req.body.props;
			let clothes = req.body.clothes;
			let makeups = req.body.makeups;
			let specials = req.body.specials;
			let others = req.body.others;
			let extras = parseInt(req.body.extras);
			let extras_text = req.body.extras_text;
			let bits = parseInt(req.body.bits);
			let bits_text = req.body.bits_text;
			let scene_duration = parseInt(req.body.scene_duration);
			let scene_status_id = parseInt(req.body.scene_status_id);
			let screen_time = req.body.screen_time;
			let raw_time = req.body.raw_time;
			let script_pages = req.body.script_pages;
			let camera_card = req.body.camera_card;
			let sound_card = req.body.sound_card;
			let latitude = req.body.latitude;
			let longitude = req.body.longitude;
			let comments = req.body.comments;
			let shooting_day_id = parseInt(req.body.shooting_day_id);
			let shooting_day_id_to = parseInt(req.body.shooting_day_id_to);
			//let modify_all_scenes = parseInt(req.body.modify_all_scenes);
		
			if (isNaN(shooting_day_id) || (shooting_day_id <= 0)) {
				shooting_day_id = 0;
			}

			if (isNaN(shooting_day_id_to) || (shooting_day_id_to <= 0)) {
				shooting_day_id_to = 0;
			}

			let params = {
				project_id: project_id,
				scene_number: scene_number
			}

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = 0;
			} else {
			}

			if (isNaN(scene_number) || (scene_number < 0)) {
				scene_number = 0;
			} else {
			}

			if (isNaN(chapter_number) || (chapter_number <= 0)) {
				chapter_number = 0;
			} else {
				params = {...params, chapter_number: chapter_number}
			}

			if (!scene_name || (scene_name.length <= 0)) {
				scene_name = '';
			} else {
				params = {...params, scene_name: scene_name}
			}

			if (!text || (text.length <= 0)) {
				text = null;
			} else {
				params = {...params, text: text}
			}

			if (!time || (time.length <= 0)) {
				time = null;
			} else {
				params = {...params, time: time}
			}

			if (!location || (location.length <= 0)) {
				location = null;
			} else {
				params = {...params, location: location}
			}

			if (isNaN(extras) || (extras < 0)) {
				extras = null;
			} else {
				params = {...params, extras: extras}
			}

			if (!extras_text || (extras_text.length <= 0)) {
				extras_text = null;
			} else {
				params = {...params, extras_text: extras_text}
			}

			if (isNaN(bits) || (bits < 0)) {
				bits = null;
			} else {
				params = {...params, bits: bits}
			}

			if (!bits_text || (bits_text.length <= 0)) {
				bits_text = null;
			} else {
				params = {...params, bits_text: bits_text}
			}

			if (isNaN(scene_duration) || (scene_duration < 0)) {
				scene_duration = null;
			} else {
				params = {...params, scene_duration: scene_duration}
			}

			if (!props) {
				props = null;
			} else {
				params = {...params, props: props}
			}

			if (!clothes) {
				clothes = null;
			} else {
				params = {...params, clothes: clothes}
			}

			if (!makeups) {
				makeups = null;
			} else {
				params = {...params, makeups: makeups}
			}

			if (!specials) {
				specials = null;
			} else {
				params = {...params, specials: specials}
			}

			if (!others) {
				others = null;
			} else {
				params = {...params, others: others}
			}

			let project_scene_result = null;

			let project = null;
			if (project_id > 0) {
				project = await Project.update(params, {where: { id: project_id }});
				project = await Project.findOne({ where: { id: project_id }})
				if (project) {
					project = project.dataValues;
				}
			}
			
			let company_id = project ? project.company_id : 0;

			if (props && (props.length > 0)) {
				let update = false;
				let props_list_arr = await Props.findAll({});
				for (var j = 0; j < props.length; j++) {
					let prop2 = props[j];
					if (prop2 && prop2.def && (prop2.def.length > 0)) {
						let found = false;
						let update = false;
						for (var j1 = 0; j1 < props_list_arr.length; j1++) {
							let prop = props_list_arr[j1].dataValues;
							if (prop && prop.word && (prop.word == prop2.def)) {
								found = true;
								if (prop.company && (prop.company.length > 0)) {
									let found_id = false;
									for (var j2 = 0; j2 < prop.company.length; j2++) {
										let id = prop.company[j2];
										if (id && (id == company_id)) {
											found_id = true;
										}
									}
									if (!found_id) {
										update = true;
										prop.company.push(company_id)
										project_scene_result = await Props.update(prop, {where: { id: prop.id }});
										update = true;
									}
								}
							}
						}
						if (!found) {
							let params = {
								word: prop2.def,
								company: [ company_id ]
							}
							let props_result = await Props.create(params);
							update = true;
						}
						
						if (update) {

						}
				}
				}
			}

			if (clothes && (clothes.length > 0)) {
				let update = false;
				let clothes_list_arr = await Clothes.findAll({});
				for (var j = 0; j < clothes.length; j++) {
					let cloth2 = clothes[j];
					if (cloth2 && cloth2.def && (cloth2.def.length > 0)) {
						let found = false;
						for (var j1 = 0; j1 < clothes_list_arr.length; j1++) {
							let cloth = clothes_list_arr[j1].dataValues;
							if (cloth && cloth.word && (cloth.word == cloth2.def)) {
								found = true;
								if (cloth.company && (cloth.company.length > 0)) {
									let found_id = false;
									for (var j2 = 0; j2 < cloth.company.length; j2++) {
										let id = cloth.company[j2];
										if (id && (id == company_id)) {
											found_id = true;
										}
									}
									if (!found_id) {
										update = true;
										cloth.company.push(company_id)
										project_scene_result = await Clothes.update(cloth, {where: { id: cloth.id }});
									}
								}
							}
						}
						if (!found) {
							let params = {
								word: cloth2.def,
								company: [ company_id ]
							}
							let cloths_result = await Clothes.create(params);
						}
					}
				}
			}

			if (makeups && (makeups.length > 0)) {
				let update = false;
				let makeups_list_arr = await Makeups.findAll({});
				for (var j = 0; j < makeups.length; j++) {
					let makeup2 = makeups[j];
					if (makeup2 && makeup2.def && (makeup2.def.length > 0)) {
						let found = false;
						for (var j1 = 0; j1 < makeups_list_arr.length; j1++) {
							let makeup = makeups_list_arr[j1].dataValues;
							if (makeup && makeup.word && (makeup.word == makeup2.def)) {
								found = true;
								if (makeup.company && (makeup.company.length > 0)) {
									let found_id = false;
									for (var j2 = 0; j2 < makeup.company.length; j2++) {
										let id = makeup.company[j2];
										if (id && (id == company_id)) {
											found_id = true;
										}
									}
									if (!found_id) {
										update = true;
										makeup.company.push(project_id)
										project_scene_result = await Makeups.update(makeup, {where: { id: makeup.id }});
									}
								}
							}
						}
						if (!found) {
							let params = {
								word: makeup2.def,
								company: [ company_id ]
							}
							let makeups_result = await Makeups.create(params);
						}
					}
				}
			}

			if (specials && (specials.length > 0)) {
				let update = false;
				let specials_list_arr = await Specials.findAll({});
				for (var j = 0; j < specials.length; j++) {
					let specials2 = specials[j];
					if (specials2 && specials2.def && (specials2.def.length > 0)) {
						let found = false;
						for (var j1 = 0; j1 < specials_list_arr.length; j1++) {
							let specials = specials_list_arr[j1].dataValues;
							if (specials && specials.word && (specials.word == specials2.def)) {
								found = true;
								if (specials.company && (specials.company.length > 0)) {
									let found_id = false;
									for (var j2 = 0; j2 < specials.company.length; j2++) {
										let id = specials.company[j2];
										if (id && (id == company_id)) {
											found_id = true;
										}
									}
									if (!found_id) {
										update = true;
										specials.company.push(project_id)
										project_scene_result = await Specials.update(specials, {where: { id: specials.id }});
									}
								}
							}
						}
						if (!found) {
							let params = {
								word: specials2.def,
								company: [ company_id ]
							}
							let specials_result = await Specials.create(params);
						}
					}
				}
			}

			if (others && (others.length > 0)) {
				let update = false;
				let others_list_arr = await Others.findAll({});
				for (var j = 0; j < others.length; j++) {
					let other2 = others[j];
					if (other2 && other2.def && (other2.def.length > 0)) {
						let found = false;
						for (var j1 = 0; j1 < others_list_arr.length; j1++) {
							let other = others_list_arr[j1].dataValues;
							if (other && other.word && (other.word == other2.def)) {
								found = true;
								if (other.company && (other.company.length > 0)) {
									let found_id = false;
									for (var j2 = 0; j2 < other.company.length; j2++) {
										let id = other.company[j2];
										if (id && (id == company_id)) {
											found_id = true;
										}
									}
									if (!found_id) {
										update = true;
										other.company.push(project_id)
										project_scene_result = await Others.update(other, {where: { id: other.id }});
									}
								}
							}
						}
						if (!found) {
							let params = {
								word: other2.def,
								company: [ company_id ]
							}
							let others_result = await Others.create(params);
						}
					}
				}
			}

			if (isNaN(scene_status_id) || (scene_status_id < 0)) {
				scene_status_id = 0;
			} else {
				params = {...params, scene_status_id: scene_status_id}
			}

			if (!screen_time) {
				screen_time = null;
			} else {
				params = {...params, screen_time: screen_time}
			}

			if (!raw_time) {
				raw_time = null;
			} else {
				params = {...params, raw_time: raw_time}
			}

			if (!script_pages) {
				script_pages = null;
			} else {
				params = {...params, script_pages: script_pages}
			}

			if (!camera_card) {
				camera_card = null;
			} else {
				params = {...params, camera_card: camera_card}
			}

			if (!sound_card) {
				sound_card = null;
			} else {
				params = {...params, sound_card: sound_card}
			}

			if (!latitude) {
				latitude = null;
			} else {
				params = {...params, latitude: latitude}
			}

			if (!longitude) {
				longitude = null;
			} else {
				params = {...params, longitude: longitude}
			}

			if (!comments) {
				comments = null;
			} else {
				params = {...params, comments: comments}
			}

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = null;
				return res.json({
					response: 2,
					err: "No project id"
				})
			}

			emptyS3Directory(project_id)
			
			let project_scene = null;
			let project_scene_from_script = null;
			if ((scene_number > 0) && (chapter_number > 0)) {
				project_scene = await ProjectScene.findOne({where: { project_id: project_id, chapter_number: chapter_number, scene_number: scene_number }});
				if (project_scene) {
					project_scene = await ProjectScene.update(params, {where: { project_id: project_id, chapter_number: chapter_number, scene_number: scene_number }});
				} else {
					project_scene = await ProjectScene.create(params);
				}
				project_scene = await ProjectScene.findOne({where: { project_id: project_id, chapter_number: chapter_number, scene_number: scene_number }});
			} else {
				project_scene = await ProjectScene.create(params);
			}

			let project_scene_id = 0;
			if (project_scene && project_scene.dataValues) {
				project_scene = project_scene.dataValues;
				project_scene_id = project_scene.id;
			}

			// Update projects script props;
			let project_script_result = null;
			if ((chapter_number > 0) && (scene_number > 0)) {
				let update_data = false;
				let project_script = await ProjectScript.findOne({where: { project_id: project_id, chapter_number: chapter_number }});
				if (project_script && project_script.script) {
					let script = project_script.script;
					if (script) {

						if (text && (text.length > 0)) {
							for (var i = 0; i < script.scenes.length; i++) {
								let scene = script.scenes[i];
								if (scene && chapter_number && scene_number && (chapter_number > 0) && (scene_number> 0) && (scene.chapter_number == chapter_number) && (scene.scene_number == scene_number)) {
									if (scene.text) {
										script.scenes[i].text = text;
									} else {
										script.scenes[i] = {...scene, text: text}
									}
									update_data = true;
								}
							}
						}

						if (time && (time.length > 0)) {

							let time_id = 0;
							let time_type = 0;
							let scene_time = await SceneTime.findAll({where: { project_id: project_id }});
							if (scene_time && (scene_time.length > 0)) {
								for (var i = 0; i < scene_time.length; i++) {
									let time1 = scene_time[i].dataValues.scene_time;
									let time_type1 = scene_time[i].dataValues.scene_time_type;
									let time_id1 = scene_time[i].dataValues.id;
									if (time1 && time && 
										(time.toLowerCase().trim().includes(time1.toLowerCase().trim()) ||
										time1.toLowerCase().trim().includes(time.toLowerCase().trim()))
										) {
										time_id = time_id1;
										time_type = time_type1;
									}
								}
							}

							for (var i = 0; i < script.scenes.length; i++) {
								let scene = script.scenes[i];
								if (scene && chapter_number && scene_number && (chapter_number > 0) && (scene_number> 0) && (scene.chapter_number == chapter_number) && (scene.scene_number == scene_number)) {
									if (scene.time) {
										script.scenes[i].time = time;
									} else {
										script.scenes[i] = {...scene, time: time}
									}
									if (scene.time_type >= 0) {
										script.scenes[i].time_type = time_type;
									} else {
										script.scenes[i] = {...scene, time_type: time_type}
									}
									if (scene.time_id) {
										script.scenes[i].time_id = time_id;
									} else {
										script.scenes[i] = {...scene, time_id: time_id}
									}
									update_data = true;
								}
							}
						}

						if (location && (location.length > 0)) {
							for (var i = 0; i < script.scenes.length; i++) {
								let scene = script.scenes[i];
								if (scene && chapter_number && scene_number && (chapter_number > 0) && (scene_number> 0) && (scene.chapter_number == chapter_number) && (scene.scene_number == scene_number)) {
									if (scene.location) {
										script.scenes[i].location = location;
									} else {
										script.scenes[i] = {...scene, location: location}
									}
									update_data = true;
								}
							}
						}

						if (extras) {
							for (var i = 0; i < script.scenes.length; i++) {
								let scene = script.scenes[i];
								if (scene && chapter_number && scene_number && (chapter_number > 0) && (scene_number> 0) && (scene.chapter_number == chapter_number) && (scene.scene_number == scene_number)) {
									if (scene.extras) {
										script.scenes[i].extras = extras;
									} else {
										script.scenes[i] = {...scene, extras: extras}
									}
									update_data = true;
								}
							}
						}

						if (extras_text) {
							for (var i = 0; i < script.scenes.length; i++) {
								let scene = script.scenes[i];
								if (scene && chapter_number && scene_number && (chapter_number > 0) && (scene_number> 0) && (scene.chapter_number == chapter_number) && (scene.scene_number == scene_number)) {
									if (scene.extras_text) {
										script.scenes[i].extras_text = extras_text;
									} else {
										script.scenes[i] = {...scene, extras_text: extras_text}
									}
									update_data = true;
								}
							}
						}

						if (bits) {
							for (var i = 0; i < script.scenes.length; i++) {
								let scene = script.scenes[i];
								if (scene && chapter_number && scene_number && (chapter_number > 0) && (scene_number> 0) && (scene.chapter_number == chapter_number) && (scene.scene_number == scene_number)) {
									if (scene.bits) {
										script.scenes[i].bits = bits;
									} else {
										script.scenes[i] = {...scene, bits: bits}
									}
									update_data = true;
								}
							}
						}

						if (bits_text) {
							for (var i = 0; i < script.scenes.length; i++) {
								let scene = script.scenes[i];
								if (scene && chapter_number && scene_number && (chapter_number > 0) && (scene_number> 0) && (scene.chapter_number == chapter_number) && (scene.scene_number == scene_number)) {
									if (scene.bits_text) {
										script.scenes[i].bits_text = bits_text;
									} else {
										script.scenes[i] = {...scene, bits_text: bits_text}
									}
									update_data = true;
								}
							}
						}

						if (scene_duration) {
							for (var i = 0; i < script.scenes.length; i++) {
								let scene = script.scenes[i];
								if (scene && chapter_number && scene_number && (chapter_number > 0) && (scene_number> 0) && (scene.chapter_number == chapter_number) && (scene.scene_number == scene_number)) {
									if (scene.scene_duration) {
										script.scenes[i].scene_duration = scene_duration;
									} else {
										script.scenes[i] = {...scene, scene_duration: scene_duration}
									}
									update_data = true;
								}
							}
						}

						if (scene_status_id) {
							for (var i = 0; i < script.scenes.length; i++) {
								let scene = script.scenes[i];
								if (scene && chapter_number && scene_number && (chapter_number > 0) && (scene_number> 0) && (scene.chapter_number == chapter_number) && (scene.scene_number == scene_number)) {
									if (scene.scene_status_id) {
										script.scenes[i].scene_status_id = scene_status_id;
									} else {
										script.scenes[i] = {...scene, scene_status_id: scene_status_id}
									}
									update_data = true;
								}
							}
						}

						if (screen_time) {
							for (var i = 0; i < script.scenes.length; i++) {
								let scene = script.scenes[i];
								if (scene && chapter_number && scene_number && (chapter_number > 0) && (scene_number> 0) && (scene.chapter_number == chapter_number) && (scene.scene_number == scene_number)) {
									if (scene.screen_time) {
										script.scenes[i].screen_time = screen_time;
									} else {
										script.scenes[i] = {...scene, screen_time: screen_time}
									}
									update_data = true;
								}
							}
						}

						if (raw_time) {
							for (var i = 0; i < script.scenes.length; i++) {
								let scene = script.scenes[i];
								if (scene && chapter_number && scene_number && (chapter_number > 0) && (scene_number> 0) && (scene.chapter_number == chapter_number) && (scene.scene_number == scene_number)) {
									if (scene.raw_time) {
										script.scenes[i].raw_time = raw_time;
									} else {
										script.scenes[i] = {...scene, raw_time: raw_time}
									}
									update_data = true;
								}
							}
						}

						if (script_pages) {
							for (var i = 0; i < script.scenes.length; i++) {
								let scene = script.scenes[i];
								if (scene && chapter_number && scene_number && (chapter_number > 0) && (scene_number> 0) && (scene.chapter_number == chapter_number) && (scene.scene_number == scene_number)) {
									if (scene.script_pages) {
										script.scenes[i].script_pages = script_pages;
									} else {
										script.scenes[i] = {...scene, script_pages: script_pages}
									}
									update_data = true;
								}
							}
						}

						if (camera_card) {
							for (var i = 0; i < script.scenes.length; i++) {
								let scene = script.scenes[i];
								if (scene && chapter_number && scene_number && (chapter_number > 0) && (scene_number> 0) && (scene.chapter_number == chapter_number) && (scene.scene_number == scene_number)) {
									if (scene.camera_card) {
										script.scenes[i].camera_card = camera_card;
									} else {
										script.scenes[i] = {...scene, camera_card: camera_card}
									}
									update_data = true;
								}
							}
						}

						if (sound_card) {
							for (var i = 0; i < script.scenes.length; i++) {
								let scene = script.scenes[i];
								if (scene && chapter_number && scene_number && (chapter_number > 0) && (scene_number> 0) && (scene.chapter_number == chapter_number) && (scene.scene_number == scene_number)) {
									if (scene.sound_card) {
										script.scenes[i].sound_card = sound_card;
									} else {
										script.scenes[i] = {...scene, sound_card: sound_card}
									}
									update_data = true;
								}
							}
						}

						if (comments) {
							for (var i = 0; i < script.scenes.length; i++) {
								let scene = script.scenes[i];
								if (scene && chapter_number && scene_number && (chapter_number > 0) && (scene_number> 0) && (scene.chapter_number == chapter_number) && (scene.scene_number == scene_number)) {
									if (scene.comments) {
										script.scenes[i].comments = comments;
									} else {
										script.scenes[i] = {...scene, comments: comments}
									}
									update_data = true;
								}
							}
						}
						
						if (props) {
							if (script.props) {
								var props1 = props.concat(script.props);
								var props2 = props1.filter((obj, pos, arr) => {
									return arr.map(mapObj => mapObj.def).indexOf(obj.def) == pos;
								});
								script.props = props2;
								update_data = true;
							}
							for (var i = 0; i < script.scenes.length; i++) {
								let scene = script.scenes[i];
								if (scene && chapter_number && scene_number && (chapter_number > 0) && (scene_number> 0) && (scene.chapter_number == chapter_number) && (scene.scene_number == scene_number)) {
									// console.log('chapter_number:',chapter_number)
									// console.log('scene_number:',scene_number)
									// console.log('props:',props)
									// console.log('scene:',scene.text)
									script.scenes[i].props = props;
									update_data = true;
								}
							}
						}

						if (clothes) {
							if (script.clothes) {
								var clothes1 = clothes.concat(script.clothes);
								var clothes2 = clothes1.filter((obj, pos, arr) => {
									return arr.map(mapObj => mapObj.def).indexOf(obj.def) == pos;
								});
								script.clothes = clothes2;
								update_data = true;
							}
							for (var i = 0; i < script.scenes.length; i++) {
								let scene = script.scenes[i];
								if (scene && chapter_number && scene_number && (chapter_number > 0) && (scene_number> 0) && (scene.chapter_number == chapter_number) && (scene.scene_number == scene_number)) {
									script.scenes[i].clothes = clothes;
									update_data = true;
								}
							}
						}

						if (makeups) {
							if (script.makeups) {
								var makeups1 = makeups.concat(script.makeups);
								var makeups2 = makeups1.filter((obj, pos, arr) => {
									return arr.map(mapObj => mapObj.def).indexOf(obj.def) == pos;
								});
								script.makeups = makeups2;
								update_data = true;
							}

							for (var i = 0; i < script.scenes.length; i++) {
								let scene = script.scenes[i];
								if (scene && chapter_number && scene_number && (chapter_number > 0) && (scene_number> 0) && (scene.chapter_number == chapter_number) && (scene.scene_number == scene_number)) {
									script.scenes[i].makeups = makeups;
									update_data = true;
								}
							}
						}

						if (specials) {
							if (script.specials) {
								var specials1 = specials.concat(script.specials);
								var specials2 = specials1.filter((obj, pos, arr) => {
									return arr.map(mapObj => mapObj.def).indexOf(obj.def) == pos;
								});
								script.specials = specials2;
								update_data = true;
							}

							for (var i = 0; i < script.scenes.length; i++) {
								let scene = script.scenes[i];
								if (scene && chapter_number && scene_number && (chapter_number > 0) && (scene_number> 0) && (scene.chapter_number == chapter_number) && (scene.scene_number == scene_number)) {
									script.scenes[i].specials = specials;
									update_data = true;
								}
							}
						}

						if (others) {
							if (script.others) {
								var others1 = others.concat(script.others);
								var others2 = others1.filter((obj, pos, arr) => {
									return arr.map(mapObj => mapObj.def).indexOf(obj.def) == pos;
								});
								script.others = others2;
								update_data = true;
							}

							for (var i = 0; i < script.scenes.length; i++) {
								let scene = script.scenes[i];
								if (scene && chapter_number && scene_number && (chapter_number > 0) && (scene_number> 0) && (scene.chapter_number == chapter_number) && (scene.scene_number == scene_number)) {
									script.scenes[i].others = others;
									update_data = true;
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

													if (update_shooting_day && time && (time.length > 0)) { // TBT
														for (var k1 = 0; k1 < scene.length; k1++) {
															let scene1 = scene[k1];
															if (scene1 && (scene1.time_id != (k1 + 1))) {
																if (scene1 ) {
																	let arr = shooting_day.scenes[k].splice(k1,1);
																	if (k1 == 0) {
																		scene[1].push(arr[0]);
																	} else {
																		scene[0].push(arr[0]);
																	}
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

			//res.json(task);
			//let shooting_day_list = [];
			let new_date = '';
			let project_shooting_day_id = 0;
			let project_shooting_day_date = '';
			let shooting_day_now = null;

			//if scene_status_id is patial or not shooted then reschedule
			if (/*((scene_status_id == 2) || (scene_status_id == 3)) &&*/
				(shooting_day_id > 0) &&
				((shooting_day_id_to == 0) || ((shooting_day_id_to > 0) && (shooting_day_id != shooting_day_id_to)))
				)
			{
				let start_shooting_day_reschedule = false;
				let project_shooting_day = await ProjectShootingDay.findAll({ 
					where: { project_id: project_id }/*, 
					order: [
						['pos', 'ASC']
					]*/
				});
				project_shooting_day =project_shooting_day.sort(function(a, b) {
					return a.pos - b.pos;
				});	
				let scene_time = await SceneTime.findAll({where: { project_id: project_id }});
				for (var j = 0; j < project_shooting_day.length; j++) {
					let shooting_day_obj = project_shooting_day[j].dataValues;
					if (shooting_day_obj && shooting_day_obj.shooting_day && (shooting_day_obj.id == shooting_day_id)) {
						start_shooting_day_reschedule = true;

						if (shooting_day_obj.shooting_day && shooting_day_obj.shooting_day.scenes && (shooting_day_obj.shooting_day.scenes.length > 0)) {
							for (var k = 0; k < shooting_day_obj.shooting_day.scenes.length; k++) {
								let scene = shooting_day_obj.shooting_day.scenes[k];												
								if (scene) {
									for (var k1 = 0; k1 < scene.length; k1++) {
										let scene1 = scene[k1];
										if (scene1 && 
											(project_scene.chapter_number == scene1.chapter_number) &&
											(project_scene.scene_number == scene1.scene_number)
											) {
											project_scene_from_script = shooting_day_obj.shooting_day.scenes[k][k1];
										}
									}
								}
							}
						}
					} else {
						if (shooting_day_obj && start_shooting_day_reschedule) {

							let name = project_scene.scene_name;//.toLowerCase().trim();
							if (project_scene_from_script) {
								name = project_scene_from_script.name;//.toLowerCase().trim();
							}
							let name_trim = name;
							//name_trim = name_trim.replace(/[.,-~=+!@#$%^&*(){}]/g, '');
							name_trim = name_trim.replace(/[-~=+!@#$%^&*(){}]/g, '');
							name_trim = name_trim.replace(/[,]/g, '');
							name_trim = name_trim.replace(/[.]/g, '');
							name_trim = name_trim.replace(/[' ']/g, '');
							let location = project_scene.location;
							if (project_scene_from_script) {
								location = project_scene_from_script.location;//.toLowerCase().trim();
							}

							//shooting_day_list.push(shooting_day_obj);

							if (project_shooting_day_id == 0) {

								let update_shooting_day = false;

								if ((shooting_day_id_to > 0) && (shooting_day_id_to == shooting_day_obj.id)) {
									let time_found = false;
									let time_found0 = false;
									let time_found1 = false;
									for (var ii = 0; ii < scene_time.length; ii++) {
										let time = scene_time[ii].dataValues.scene_time;
										let time_type = scene_time[ii].dataValues.scene_time_type;
										let time_id = scene_time[ii].dataValues.id;
										let max_shooting_scenes = scene_time[ii].dataValues.max_shooting_scenes;
										let max_shooting_duration = scene_time[ii].dataValues.max_shooting_duration;
										let scene_duration = scene_time[ii].dataValues.default_scene_duration;
										if (time_type >= 0) {
											if (
												(project_scene_from_script && (project_scene_from_script.time_type == time_type))
											){
												time_found = true;
		
												if (((time_type == 0) && !time_found0) ||
													((time_type == 1) && !time_found1))
													{
													if (time_type == 0) {
														time_found0 = true;
													} else {
														time_found1 = true;
													}
						
													if (project_scene_from_script && !project_scene_from_script.time_id) {
														project_scene_from_script = {...project_scene_from_script, time_id: time_id}
													}
		
													let add_scene = false;
													if ((max_shooting_scenes > 0) && (project_shooting_day[j].dataValues.shooting_day.scenes[time_type].length < max_shooting_scenes)) {
		
														let scenes = project_shooting_day[j].dataValues.shooting_day.scenes[time_type];
														let shooting_duration = 0
														for(let a = 0; a < scenes.length; a++) {
															shooting_duration += scenes[a].scene_duration;
														}
		
														if (1 || ((shooting_duration + project_scene_from_script.scene_duration) <= max_shooting_duration)) {
															let len = project_shooting_day[j].dataValues.shooting_day.scenes[time_type].length;

															let found_scene = false;
															if (shooting_day_obj.shooting_day && shooting_day_obj.shooting_day.scenes && (shooting_day_obj.shooting_day.scenes.length > 0)) {
																for (var k = 0; k < shooting_day_obj.shooting_day.scenes.length; k++) {
																	let scene = shooting_day_obj.shooting_day.scenes[k];												
																	if (scene) {
																		for (var k1 = 0; k1 < scene.length; k1++) {
																			let scene1 = scene[k1];
																			if (scene1 && 
																				(project_scene.chapter_number == scene1.chapter_number) &&
																				(project_scene.scene_number == scene1.scene_number)
																				) {
																				found_scene = true;
																			}
																		}
																	}
																}
															}
									

															if (!found_scene) {
																project_shooting_day[j].dataValues.shooting_day.scenes[time_type].push(project_scene_from_script);
															}
															add_scene = true;
															update_shooting_day = true;
															project_shooting_day_id = project_shooting_day[j].dataValues.id;
															project_shooting_day_date = project_shooting_day[j].dataValues.date;
														}
													} else {
													}	
												}
											}
										}
									}
								} else {
									let found_location = false;
									if (shooting_day_obj && shooting_day_obj.shooting_day && shooting_day_obj.shooting_day.location && (shooting_day_obj.shooting_day.location.length > 0)) {
										for (var i4 = 0; i4 < shooting_day_obj.shooting_day.location.length; i4++) {
											let shooting_day_location = shooting_day_obj.shooting_day.location[i4];
											if (shooting_day_location && (shooting_day_location.length > 0)) {
												if ((shooting_day_location.toLowerCase().trim().includes(location.toLowerCase().trim())) ||
													(location.toLowerCase().trim().includes(shooting_day_location.toLowerCase().trim()))) {
													found_location = true;
												}
											}
										}
									}
			
									let found_name_trim = false;
									if (shooting_day_obj && shooting_day_obj.shooting_day && shooting_day_obj.shooting_day.name_trim && (shooting_day_obj.shooting_day.name_trim.length > 0)) {
										for (var i4 = 0; i4 < shooting_day_obj.shooting_day.name_trim.length; i4++) {
											let shooting_day_name_trim = shooting_day_obj.shooting_day.name_trim[i4];
											if (shooting_day_name_trim && (shooting_day_name_trim.length > 0)) {
												if ((shooting_day_name_trim.toLowerCase().trim().includes(name_trim.toLowerCase().trim())) ||
													(name_trim.toLowerCase().trim().includes(shooting_day_name_trim.toLowerCase().trim()))) {
													found_name_trim = true;
												}
											}
										}
									}
			
									if (shooting_day_obj && found_location && found_name_trim) {
			
										let time_found = false;
										let time_found0 = false;
										let time_found1 = false;
										for (var ii = 0; ii < scene_time.length; ii++) {
											let time = scene_time[ii].dataValues.scene_time;
											let time_type = scene_time[ii].dataValues.scene_time_type;
											let time_id = scene_time[ii].dataValues.id;
											let max_shooting_scenes = scene_time[ii].dataValues.max_shooting_scenes;
											let max_shooting_duration = scene_time[ii].dataValues.max_shooting_duration;
											let scene_duration = scene_time[ii].dataValues.default_scene_duration;
											if (time_type >= 0) {
												if (project_scene_from_script.time_type == time_type) {
													time_found = true;
			
													if (((time_type == 0) && !time_found0) ||
														((time_type == 1) && !time_found1))
														{
														if (time_type == 0) {
															time_found0 = true;
														} else {
															time_found1 = true;
														}
							
														if (project_scene_from_script && !project_scene_from_script.time_id) {
															project_scene_from_script = {...project_scene_from_script, time_id: time_id}
														}
			
														let add_scene = false;
														if ((max_shooting_scenes > 0) && (project_shooting_day[j].dataValues.shooting_day.scenes[time_type].length < max_shooting_scenes)) {
			
															let scenes = project_shooting_day[j].dataValues.shooting_day.scenes[time_type];
															let shooting_duration = 0
															for(let a = 0; a < scenes.length; a++) {
																shooting_duration += scenes[a].scene_duration;
															}
			
															if (1 || ((shooting_duration + project_scene_from_script.scene_duration) <= max_shooting_duration)) {
																let len = project_shooting_day[j].dataValues.shooting_day.scenes[time_type].length;

																let found_scene = false;
																if (shooting_day_obj.shooting_day && shooting_day_obj.shooting_day.scenes && (shooting_day_obj.shooting_day.scenes.length > 0)) {
																	for (var k = 0; k < shooting_day_obj.shooting_day.scenes.length; k++) {
																		let scene = shooting_day_obj.shooting_day.scenes[k];												
																		if (scene) {
																			for (var k1 = 0; k1 < scene.length; k1++) {
																				let scene1 = scene[k1];
																				if (scene1 && 
																					(project_scene.chapter_number == scene1.chapter_number) &&
																					(project_scene.scene_number == scene1.scene_number)
																					) {
																					found_scene = true;
																				}
																			}
																		}
																	}
																}
										

																if (!found_scene) {
																	project_shooting_day[j].dataValues.shooting_day.scenes[time_type].push(project_scene_from_script);
																}

																add_scene = true;
																update_shooting_day = true;
																project_shooting_day_id = project_shooting_day[j].dataValues.id;
																project_shooting_day_date = project_shooting_day[j].dataValues.date;
															}
														} else {
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
										shooting_day: shooting_day_obj.shooting_day
									}
									let project_shooting_day = await ProjectShootingDay.update(params1, {where: { id: shooting_day_obj.id }});
								}
							}
						}
					}
				}

				start_shooting_day_reschedule = false;
				if (project_shooting_day_id == 0) {
					for (var j = 0; j < project_shooting_day.length; j++) {
						let shooting_day_obj = project_shooting_day[j].dataValues;
						if (shooting_day_obj && shooting_day_obj.shooting_day && (shooting_day_obj.id == shooting_day_id)) {
							start_shooting_day_reschedule = true;
						} else {	
							if (shooting_day_obj && start_shooting_day_reschedule) {
	
								let name = project_scene.scene_name;//.toLowerCase().trim();
								if (project_scene_from_script) {
									name = project_scene_from_script.name;//.toLowerCase().trim();
								}
								let name_trim = name;
								//name_trim = name_trim.replace(/[.,-~=+!@#$%^&*(){}]/g, '');
								name_trim = name_trim.replace(/[-~=+!@#$%^&*(){}]/g, '');
								name_trim = name_trim.replace(/[,]/g, '');
								name_trim = name_trim.replace(/[.]/g, '');
								name_trim = name_trim.replace(/[' ']/g, '');
								let location = project_scene.location;
								if (project_scene_from_script) {
									location = project_scene_from_script.location;//.toLowerCase().trim();
								}
	
								//shooting_day_list.push(shooting_day_obj);
	
								if (project_shooting_day_id == 0) {
	
									let update_shooting_day = false;
	
									let found_location = false;
									if (shooting_day_obj && shooting_day_obj.shooting_day && shooting_day_obj.shooting_day.location && (shooting_day_obj.shooting_day.location.length > 0)) {
										for (var i4 = 0; i4 < shooting_day_obj.shooting_day.location.length; i4++) {
											let shooting_day_location = shooting_day_obj.shooting_day.location[i4];
											if (shooting_day_location && (shooting_day_location.length > 0)) {
												if ((shooting_day_location.toLowerCase().trim().includes(location.toLowerCase().trim())) ||
													(location.toLowerCase().trim().includes(shooting_day_location.toLowerCase().trim()))) {
													found_location = true;
												}
											}
										}
									}
			
									let found_name_trim = false;
									if (shooting_day_obj && shooting_day_obj.shooting_day && shooting_day_obj.shooting_day.name_trim && (shooting_day_obj.shooting_day.name_trim.length > 0)) {
										for (var i4 = 0; i4 < shooting_day_obj.shooting_day.name_trim.length; i4++) {
											let shooting_day_name_trim = shooting_day_obj.shooting_day.name_trim[i4];
											if (shooting_day_name_trim && (shooting_day_name_trim.length > 0)) {
												if ((shooting_day_name_trim.toLowerCase().trim().includes(name_trim.toLowerCase().trim())) ||
													(name_trim.toLowerCase().trim().includes(shooting_day_name_trim.toLowerCase().trim()))) {
													found_name_trim = true;
												}
											}
										}
									}
			
									if (shooting_day_obj /*&& found_location && found_name_trim*/) {
			
										let time_found = false;
										let time_found0 = false;
										let time_found1 = false;
										for (var ii = 0; ii < scene_time.length; ii++) {
											let time = scene_time[ii].dataValues.scene_time;
											let time_type = scene_time[ii].dataValues.scene_time_type;
											let time_id = scene_time[ii].dataValues.id;
											let max_shooting_scenes = scene_time[ii].dataValues.max_shooting_scenes;
											let max_shooting_duration = scene_time[ii].dataValues.max_shooting_duration;
											let scene_duration = scene_time[ii].dataValues.default_scene_duration;
											if (time_type >= 0) {
												if (project_scene_from_script.time_type == time_type) {
													time_found = true;
			
													if (((time_type == 0) && !time_found0) ||
														((time_type == 1) && !time_found1))
														{
														if (time_type == 0) {
															time_found0 = true;
														} else {
															time_found1 = true;
														}
							
														if (project_scene_from_script && !project_scene_from_script.time_id) {
															project_scene_from_script = {...project_scene_from_script, time_id: time_id}
														}
			
														let add_scene = false;
														if ((max_shooting_scenes > 0) && (project_shooting_day[j].dataValues.shooting_day.scenes[time_type].length < max_shooting_scenes)) {
			
															let scenes = project_shooting_day[j].dataValues.shooting_day.scenes[time_type];
															let shooting_duration = 0
															for(let a = 0; a < scenes.length; a++) {
																shooting_duration += scenes[a].scene_duration;
															}
			
															if (1 || ((shooting_duration + project_scene_from_script.scene_duration) <= max_shooting_duration)) {
																let len = project_shooting_day[j].dataValues.shooting_day.scenes[time_type].length;

																let found_scene = false;
																if (shooting_day_obj.shooting_day && shooting_day_obj.shooting_day.scenes && (shooting_day_obj.shooting_day.scenes.length > 0)) {
																	for (var k = 0; k < shooting_day_obj.shooting_day.scenes.length; k++) {
																		let scene = shooting_day_obj.shooting_day.scenes[k];												
																		if (scene) {
																			for (var k1 = 0; k1 < scene.length; k1++) {
																				let scene1 = scene[k1];
																				if (scene1 && 
																					(project_scene.chapter_number == scene1.chapter_number) &&
																					(project_scene.scene_number == scene1.scene_number)
																					) {
																					found_scene = true;
																				}
																			}
																		}
																	}
																}
										

																if (!found_scene) {
																	project_shooting_day[j].dataValues.shooting_day.scenes[time_type].push(project_scene_from_script);
																}

																add_scene = true;
																update_shooting_day = true;
																project_shooting_day_id = project_shooting_day[j].dataValues.id;
																project_shooting_day_date = project_shooting_day[j].dataValues.date;
															}
														} else {
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
											shooting_day: shooting_day_obj.shooting_day
										}
										let project_shooting_day = await ProjectShootingDay.update(params1, {where: { id: shooting_day_obj.id }});
									}
								}
							}
						}
					}
				}

				if (project_shooting_day_id > 0) {
					for (var j = 0; j < project_shooting_day.length; j++) {
						let shooting_day_obj = project_shooting_day[j].dataValues;
						if (shooting_day_obj && shooting_day_obj.shooting_day && (shooting_day_obj.id == shooting_day_id)) {
							start_shooting_day_reschedule = true;

							if (shooting_day_obj.shooting_day && shooting_day_obj.shooting_day.scenes && (shooting_day_obj.shooting_day.scenes.length > 0)) {
								for (var k = 0; k < shooting_day_obj.shooting_day.scenes.length; k++) {
									let scene = shooting_day_obj.shooting_day.scenes[k];												
									if (scene) {
										for (var k1 = 0; k1 < scene.length; k1++) {
											let scene1 = scene[k1];
											if (scene1 && 
												(project_scene.chapter_number == scene1.chapter_number) &&
												(project_scene.scene_number == scene1.scene_number)
												) {
												project_scene_from_script = shooting_day_obj.shooting_day.scenes[k][k1];

												shooting_day_obj.shooting_day.scenes[k][k1] = {...shooting_day_obj.shooting_day.scenes[k][k1], new_shooting_day_id: project_shooting_day_id}
												let params1 = {
													project_id: project_id,
													max_shooting_days: shooting_day_obj.max_shooting_days,
													params: shooting_day_obj.params,
													shooting_day: shooting_day_obj.shooting_day
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

			utils.getProjectShootingDays(project_id, function (err, shooting_day_list){
				if (err) {
					shooting_day_list = [];
				}
				return res.json({
					response: 0,
					err: "",
					project_scene: project_scene,
					shooting_day_list: shooting_day_list,
					new_shooting_day_id: project_shooting_day_id,
					new_date: project_shooting_day_date
				})	
			})
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},
	
	deleteProjectScene: async (req, res, next) => {
		try {
			let project_id = parseInt(req.body.project_id);
			let chapter_number = parseInt(req.body.chapter_number);
			let scene_number = parseInt(req.body.scene_number);

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = null;
				return res.json({
					response: 2,
					err: "No project id"
				})
			}

			emptyS3Directory(project_id)

			if (isNaN(chapter_number) || (chapter_number < 0)) {
				chapter_number = 0;
			}

			if (isNaN(scene_number) || (scene_number < 0)) {
				scene_number = 0;
			}

			console.log('Delete project id:',project_id)

			if (scene_number > 0) {
				const response = await ProjectScene.destroy({
					where: { project_id: project_id, chapter_number: chapter_number, scene_number: scene_number },
					force: true
				})
			} else {
				const response = await ProjectScene.destroy({
					where: { project_id: project_id },
					force: true
				})
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

	getProjectScript: async (req, res, next) => {
		try {
			let project_id = parseInt(req.params.project_id);	
			let chapter_number = parseInt(req.params.chapter_number);	
	
			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = null;
				return res.json({
					response: 2,
					err: "No project id"
				})
			}
			
			if (isNaN(chapter_number) || (chapter_number <= 0)) {
				chapter_number = 0;
			}
					
			if (chapter_number > 0) {
				let project_script = null;
				project_script = await ProjectScript.findOne({where: { project_id: project_id, chapter_number: chapter_number }});
				if (project_script) {
					let script_obj = {id: project_script.dataValues.id, ...project_script.dataValues.script};
					return res.json(project_obj);
				} else {
					return res.json({
						response: 2,
						err: 'No script found'
					})
				}
			} else {
				let project_script = [];
				let project_script2 = [];
				project_script = await ProjectScript.findAll({where: { project_id: project_id }});
				for (var i = 0; i < project_script.length; i++) {
					let script = project_script[i];
					if (script && script.dataValues && script.dataValues.script) {
						let script_obj = {id: script.dataValues.id, ...script.dataValues.script};
						project_script2.push(script_obj);
					}
				}

				// Sort list acording to chapter number
				/*function sortByChepterNumber(property) {
					return function (a,b) {
						if(a[property] && b[property] && (a[property] > b[property]))
							return 1;
						else if(a[property] && b[property] && (a[property] < b[property]))
							return -1;
						else if(!a[property] || !b[property])
							return 0;

						return 0;
					}
				}*/

				project_script2.sort(sortByChepterNumber("chapter_number")); //sort according to chapter_number

				return res.json(project_script2);
			}
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	addProjectScript: async (req, res, next) => {
		try {
			let project_id = parseInt(req.body.project_id);
			let chapter_number = parseInt(req.body.chapter_number);	
			let script = req.body.script;

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = 0;
			}

			if (isNaN(chapter_number) || (chapter_number <= 0)) {
				chapter_number = 0;
			}

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = null;
				return res.json({
					response: 2,
					err: "No project id"
				})
			}

			emptyS3Directory(project_id)
			
			let project_script_result = null;
			let params = {
				project_id: project_id,
				chapter_number: chapter_number,
				script: script
			}
			if (chapter_number > 0) {
				let project_script = await ProjectScript.findOne({where: { project_id: project_id, chapter_number: chapter_number }});
				if (project_script) {
					project_script_result = await ProjectScript.update(params, {where: { project_id: project_id, chapter_number: chapter_number }});
					project_script_result = params;
				} else {
					project_script_result = await ProjectScript.create(params);
					if (project_script_result) {
						project_script_result = project_script_result.dataValues;
					}
				}
			} else {
				project_script_result = await ProjectScript.create(params);
				if (project_script_result) {
					project_script_result = project_script_result.dataValues;
				}
			}

			//res.json(task);
			return res.json({
				response: 0,
				err: "",
				project_script: project_script_result
			})
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	deleteProjectScript: async (req, res, next) => {

		try {
			let project_id = parseInt(req.params.project_id);
			let chapter_number = parseInt(req.params.chapter_number);

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = null;
				return res.json({
					response: 2,
					err: "No project id"
				})
			}

			if (isNaN(chapter_number) || (chapter_number <= 0)) {
				chapter_number = 0;
			}

			console.log('Delete project id:',project_id)

			emptyS3Directory(project_id)

			if (chapter_number > 0) {

				let project_script = await ProjectScript.findOne({where: { project_id: project_id, chapter_number: chapter_number }});
				if (project_script) {
					let script_attachments = project_script.attachments;
					var folder = 'app/f/p/'+project_id+'/'
					const pormises_script = []
					if (script_attachments && (script_attachments.length > 0)) {
						for (var i = 0; i < script_attachments.length; i++) {
							let attachment = script_attachments[i];
							if (attachment) {
								console.log('Project File Delete:',attachment.file_name)
								pormises_script.push(deleteFileFromS3(folder, attachment.file_name))
							}
						}
						await Promise.all(pormises_script)
					}
				}

				const response = await ProjectScript.destroy({
					where: { project_id: project_id, chapter_number: chapter_number },
					force: true
				})
			} else {
				const response = await ProjectScript.destroy({
					where: { project_id: project_id },
					force: true
				})
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

// ProjectShootingDay & ProjectShootingDayScene

	getProjectShootingDay: async (req, res, next) => {
		try {
			let project_id = parseInt(req.params.project_id);	

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = null;
				return res.json({
					response: 2,
					err: "No project id"
				})
			}

			let project = await Project.findOne({ where: { id: project_id } });

			if (!project) {
				return res.json({
					response: 3,
					err: "No project found"
				})
			}

			let project_shooting_day_list = []
			utils.getProjectShootingDays(project_id, function (err, shooting_day_list){
				if (err) {
					return res.send(project_shooting_day_list);
				} else {
					return res.send(shooting_day_list);
				}
			})
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	addProjectShootingDayPos: async (req, res, next) => {

		try {
			let project_id = parseInt(req.body.project_id);
			let shooting_day_pos = req.body.shooting_day_pos; // [{id: 1, pos 1}, {id: 2, pos 2}]

			if (isNaN(project_id) || (project_id && (project_id <= 0))) {
				project_id = 0;
				return res.json({
					response: 1,
					err: 'Project id not found'
				})
			}

			if (shooting_day_pos && (shooting_day_pos.length > 0)) {
				for (var j = 0; j < shooting_day_pos.length; j++) {
					let pos = shooting_day_pos[j];
					if (pos && pos.id) {
						let shooting_day = await ProjectShootingDay.findOne({where: { id: pos.id }});
						if (shooting_day) {
							let shooting_day1 = await ProjectShootingDay.update({pos: pos.pos}, {where: { id: pos.id }});
						}
					}
				}
			}

		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	addProjectShootingDay: async (req, res, next) => {
		try {
			let project_shooting_day_id = parseInt(req.body.project_shooting_day_id);
			let project_id = parseInt(req.body.project_id);
			let pos = parseInt(req.body.pos);
			let max_shooting_days = parseInt(req.body.max_shooting_days);
			let project_params = req.body.params;
			let additional_expenses = req.body.additional_expenses;
			let general_comments = req.body.general_comments;
			let team_hours = req.body.team_hours;
			let locations = req.body.locations;
			let actors = req.body.actors;
			let employees = req.body.employees;
			let extra_expenses = req.body.extra_expenses;
			let shooting_day = req.body.shooting_day;
			let scene_pos = req.body.scene_pos;
			let tasks = req.body.tasks;
			let suppliers = req.body.suppliers;
			let add_suppliers_to_all_following_days = req.body.add_suppliers_to_all_following_days;
			let date = req.body.date;

			add_suppliers_to_all_following_days = 1;

			let params = {}

			if (isNaN(project_shooting_day_id) || (project_shooting_day_id <= 0)) {
				project_shooting_day_id = 0;
			}

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = 0;
			} else {
				params = {...params, project_id: project_id}
			}

			if (isNaN(pos) || (pos && (pos < 0))) {
				pos = 0;
			} else {
				params = {...params, pos: pos}
			}

			if (isNaN(max_shooting_days) || (max_shooting_days <= 0)) {
				max_shooting_days = 0;
			} else {
				params = {...params, max_shooting_days: max_shooting_days}
			}

			if (!project_params) {
				project_params = null;
			} else {
				params = {...params, params: project_params}
			}

			if (!additional_expenses) {
				additional_expenses = null;
			} else {
				params = {...params, additional_expenses: additional_expenses}
			}

			if (!general_comments) {
				general_comments = null;
			} else {
				params = {...params, general_comments: general_comments}
			}

			if (!team_hours) {
				team_hours = null;
			}
			
			if (!locations) {
				locations = null;
			}
			
			if (!actors) {
				actors = null;
			}

			if (!employees) {
				employees = null;
			}

			if (!extra_expenses) {
				extra_expenses = null;
			}

			if (!shooting_day) {
				shooting_day = null;
			} else {
				params = {...params, shooting_day: shooting_day}
			}

			if (!scene_pos) {
				scene_pos = null;
			} else {
				params = {...params, scene_pos: scene_pos}
			}

			if (!tasks) {
				tasks = null;
			} else {
				params = {...params, tasks: tasks}
			}

			if (!suppliers) {
				suppliers = null;
			} else {
				params = {...params, suppliers: suppliers}
			}
			
			if (!date) {
				date = null;
			} else {
				params = {...params, date: date}
			}

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = null;
				return res.json({
					response: 2,
					err: "No project id"
				})
			}

			let project = await Project.findOne({ where: { id: project_id } });

			if (!project) {
				return res.json({
					response: 3,
					err: "No project found"
				})
			}

			emptyS3Directory(project_id)

			let shooting_day1 = null;
			if (project_shooting_day_id > 0) {
				if (team_hours || locations) {
					shooting_day1 = await ProjectShootingDay.findOne({where: { id: project_shooting_day_id }});
					if (shooting_day1) {
						let post_shooting_day = {
							team_hours: team_hours ? team_hours : shooting_day1.post_shooting_day.team_hours,
							locations: locations ? locations : shooting_day1.post_shooting_day.locations,
							actors: actors ? actors : shooting_day1.post_shooting_day.actors,
							employees: employees ? employees : shooting_day1.post_shooting_day.employees,
							extra_expenses: extra_expenses ? extra_expenses : shooting_day1.post_shooting_day.extra_expenses
						}

						if (actors && (actors.length > 0)) {
							for (var j4 = 0; j4 < actors.length; j4++) {
							  let actor = actors[j4];
							  if (actor) {
								let found = false;
								if (post_shooting_day && post_shooting_day.actors && (post_shooting_day.actors.length > 0)) {
								  for (var j5 = 0; ((j5 < post_shooting_day.actors.length) && !found); j5++) {
									let actor2 = post_shooting_day.actors[j5];
									if (actor2 && (actor2.id == actor.id)) {
									  found = true;
									}
								  }
								}
								if (!found) {
								  post_shooting_day.actors.push(actor);
								}
							  }
							}
						}
				
						if (employees && (employees.length > 0)) {
							for (var j4 = 0; j4 < employees.length; j4++) {
							  let employee = employees[j4];
							  if (employee) {
								let found = false;
								if (post_shooting_day && post_shooting_day.employees && (post_shooting_day.employees.length > 0)) {
								  for (var j5 = 0; ((j5 < post_shooting_day.employees.length) && !found); j5++) {
									let employee2 = post_shooting_day.employees[j5];
									if (employee2 && (employee2.id == employee.id)) {
									  found = true;
									}
								  }
								}
								if (!found) {
								  post_shooting_day.employees.push(employee);
								}
							  }
							}
						}
				
						params = {...params, post_shooting_day: post_shooting_day}
					}
				}
				shooting_day1 = await ProjectShootingDay.update(params, {where: { id: project_shooting_day_id }});
				shooting_day1 = await ProjectShootingDay.findOne({where: { id: project_shooting_day_id }});
				if (shooting_day1) {
					shooting_day1 = shooting_day1.dataValues;
				}
			} else {

				let project_shooting_day = await ProjectShootingDay.findAll({ 
					where: { project_id: project_id }/*, 
					order: [
						['pos', 'ASC']
					]*/
				});
				project_shooting_day = project_shooting_day.sort(function(a, b) {
					return a.pos - b.pos;
				});	

				let first_pos = project_shooting_day[0].dataValues.pos
				if (isNaN(pos) || (pos <= 0)) {
					let new_pos = first_pos - 1;
					params = {...params, pos: new_pos}
				}

				shooting_day1 = await ProjectShootingDay.create(params);
				if (shooting_day1) {
					shooting_day1 = shooting_day1.dataValues;
				}
			}

			const task_status_list = await TaskStatus.findAll({});
			let task_status_active_id = 1;
			if (task_status_list) {
				for (var j = 0; j < task_status_list.length; j++) {
					let task_status = task_status_list[j].dataValues;
					if (task_status.task_status == 'Active') {
						task_status_active_id = task_status.id;
					}
				}
			}
			
			let shooting_day_id = 0;
			if (shooting_day1) {
				shooting_day_id = shooting_day1.id;
			}

			if (tasks && (tasks.length > 0) && (shooting_day_id > 0)) {

				const response3 = await Task.destroy({
					where: { project_shooting_day_id: shooting_day_id },
					force: true
				})

				for (var i = 0; i < tasks.length; i++) {

					let task = tasks[i];
					if (task && (task.supplier_id > 0)) {

						let supplier_id = task.supplier_id;
						if (!supplier_id || (supplier_id && (supplier_id <= 0))) {
							supplier_id = null
						}

						let character_id = task.character_id;
						if (!character_id || (character_id && (character_id <= 0))) {
							character_id = null
						}

						let supplier_name = task.supplier_name;
						if (!supplier_name || (supplier_name && (supplier_name.length <= 0))) {
							supplier_name = ''
						}

						let description = task.description;
						if (!description || (description && (description.length <= 0))) {
							description = ''
						}

						let comments = task.comments;
						if (!comments || (comments && (comments.length <= 0))) {
							comments = ''
						}

						let category_name = '';
						if (shooting_day1 && shooting_day1.shooting_day) {
							category_name = shooting_day1.shooting_day.name.toLowerCase().trim() + ' - ' + shooting_day1.shooting_day.location;
						}

						let task_category_obj = null;
						let color = '';
						let params = {
							supplier_id: supplier_id,
							project_id: project_id,
							task_category: shooting_day_id,
							task_category_name: category_name,
							shooting_day_id: shooting_day_id,
							color: color
						}

						if (supplier_id && (supplier_id > 0)) {
							task_category_obj = await TaskCategory.findOne({where: { supplier_id: supplier_id, project_id: project_id, task_category: category_name }});
						}
			
						let task_category_id = 0;
						if (task_category_obj && (task_category_obj.id > 0)) {
							task_category_id = task_category_obj.id;
							//task_category_obj = await TaskCategory.update(params, {where: { id: task_category_obj.id }});
							//task_category_obj = await TaskCategory.findOne({where: { supplier_id: supplier_id, project_id: project_id }});
						} else {
							task_category_obj = await TaskCategory.create(params);
							if (task_category_obj) {
								task_category_obj = task_category_obj.dataValues;
								task_category_id = task_category_obj.id;
							}
						}

						let scene_id = 0
						let task_params = {
							project_id: project_id,
							task_name: description,
							supplier_id: supplier_id,
							character_id: character_id,
							task_category_id: task_category_id,
							// task_type_id: 0,
							task_status_id: task_status_active_id,
							//due_date: ,
							comments: comments,
							project_scene_id: scene_id,
							project_shooting_day_id: shooting_day_id,
							project_scene_text: '',
							project_scene_location: '',
							price: 0
						}
						let task_obj = await Task.create(task_params);
					}
				}
			}

			if (add_suppliers_to_all_following_days && !isNaN(add_suppliers_to_all_following_days) && (add_suppliers_to_all_following_days > 0)) {
				let project_shooting_day_list = []
				let project_shooting_day = await ProjectShootingDay.findAll({ 
					where: { project_id: project_id }/*,
					order: [
						['pos', 'ASC']
					]*/
				});
				project_shooting_day = project_shooting_day.sort(function(a, b) {
					return a.pos - b.pos;
				});
	
				let find_day = false;
				for (var j = 0; j < project_shooting_day.length; j++) {
					let shooting_day_obj = project_shooting_day[j].dataValues;
					if (shooting_day_obj && shooting_day_obj.shooting_day) {
						if (!find_day && (shooting_day_obj.id == project_shooting_day_id)) {
							find_day = true;
						} else {
							if (find_day) {
								let suppliers1 = suppliers;
								let update_suppliers = false;
								if (suppliers1 && (suppliers1.length > 0)) {
									for (var m = 0; m < suppliers1.length; m++) {
										let supplier1 = suppliers1[m];
										if (supplier1 && (supplier1 > 0)) {
											let found_supplier = false;
											let suppliers2 = shooting_day_obj.suppliers;
											if (suppliers2 && (suppliers2.length > 0)) {
												for (var n = 0; n < suppliers2.length; n++) {
													let supplier2 = suppliers2[n];
													if (supplier2 && (supplier2 > 0) && (supplier2 == supplier1)) {
														found_supplier = true;
													}
												}
											}
											if (!found_supplier) {
												shooting_day_obj.suppliers.push(supplier1)
												update_suppliers = true;
											}
										}
									}
								}
								if (update_suppliers) {
									let shooting_day = await ProjectShootingDay.update(shooting_day_obj, {where: { id: shooting_day_obj.id }});
								}
							}
						}
					}
				}
			}

			let project_shooting_day_list = []
			utils.getProjectShootingDays(project_id, function (err, shooting_day_list){
				if (err) {
					return res.send(project_shooting_day_list);
				} else {
					return res.send(shooting_day_list);
				}
			})

			///////////////////////////////////

			// //res.json(task);
			// return res.json({
			// 	response: 0,
			// 	err: "",
			// 	project_shooting_day: project_shooting_day
			// })
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},
	
	addProjectShootingDays: async (req, res, next) => {
		try {
			let shooting_days = req.body;
			//let shooting_days = [{project_shooting_day_id: 1, project_id: 1, date: "2020-11-01T22:00:00.000Z"}]

			let project_id = 0
			if (shooting_days && (shooting_days.length > 0) && shooting_days[0].project_id && (shooting_days[0].project_id > 0)) {
				project_id = shooting_days[0].project_id;
			}

			emptyS3Directory(project_id)

			if (shooting_days && (shooting_days.length > 0)) {

				const task_status_list = await TaskStatus.findAll({});
				let task_status_active_id = 1;
				if (task_status_list) {
					for (var j = 0; j < task_status_list.length; j++) {
						let task_status = task_status_list[j].dataValues;
						if (task_status.task_status == 'Active') {
							task_status_active_id = task_status.id;
						}
					}
				}
	
				for (var j = 0; j < shooting_days.length; j++) {
					let shooting_day = shooting_days[j];
	
					if (shooting_day) {
						let project_shooting_day_id = parseInt(shooting_day.project_shooting_day_id);
						let project_id = parseInt(shooting_day.project_id);
						let max_shooting_days = parseInt(shooting_day.max_shooting_days);
						let project_params = shooting_day.params;
						let additional_expenses = shooting_day.additional_expenses;
						let general_comments = shooting_day.general_comments;
						let post_shooting_day = shooting_day.post_shooting_day;
						let shooting_day_obj = shooting_day.shooting_day;
						let scene_pos = shooting_day.scene_pos;
						let tasks = shooting_day.tasks;
						let pos = parseInt(shooting_day.pos);
						let date = shooting_day.date;

						let params = {}

						if (isNaN(project_shooting_day_id) || (project_shooting_day_id <= 0)) {
							project_shooting_day_id = 0;
						}

						if (isNaN(project_id) || (project_id <= 0)) {
							project_id = 0;
						} else {
							params = {...params, project_id: project_id}
						}

						if (isNaN(max_shooting_days) || (max_shooting_days <= 0)) {
							max_shooting_days = 0;
						} else {
							params = {...params, max_shooting_days: max_shooting_days}
						}
			
						if (!project_params) {
							project_params = null;
						} else {
							params = {...params, params: project_params}
						}
			
						if (!additional_expenses) {
							additional_expenses = null;
						} else {
							params = {...params, additional_expenses: additional_expenses}
						}

						if (!general_comments) {
							general_comments = null;
						} else {
							param = {...params, general_comments: general_comments}
						}
			
						if (!post_shooting_day) {
							post_shooting_day = null;
						} else {
							params = {...params, post_shooting_day: post_shooting_day}
						}
			
						if (!shooting_day_obj) {
							shooting_day_obj = null;
						} else {
							params = {...params, shooting_day: shooting_day_obj}
						}

						if (!scene_pos) {
							scene_pos = null;
						} else {
							params = {...params, scene_pos: scene_pos}
						}
						
						if (!tasks) {
							tasks = null;
						} else {
							params = {...params, tasks: tasks}
						}

						if (isNaN(pos) || (pos && (pos < 0))) {
							pos = 0;
						} else {
							params = {...params, pos: pos}
						}

						if (!date) {
							date = null;
						} else {
							params = {...params, date: date}
						}

						if (isNaN(project_id) || (project_id <= 0)) {
							project_id = null;
						}

						if (project_id && (project_id > 0)) {
							let project = await Project.findOne({ where: { id: project_id } });

							if (project) {
								let shooting_day = null;
								if (project_shooting_day_id > 0) {
									shooting_day = await ProjectShootingDay.update(params, {where: { id: project_shooting_day_id }});
									shooting_day = await ProjectShootingDay.findOne({where: { id: project_shooting_day_id }});
									if (shooting_day) {
										shooting_day = shooting_day.dataValues;
									}
								} else {
									if (0) {
										shooting_day = await ProjectShootingDay.create(params);
										if (shooting_day) {
											shooting_day = shooting_day.dataValues;
										}
									}
								}
							}
						}

						let shooting_day_id = shooting_day.id;
			
						if (tasks && (tasks.length > 0) && (shooting_day_id > 0)) {

							const response3 = await Task.destroy({
								where: { project_shooting_day_id: shooting_day_id },
								force: true
							})
	
							for (var i = 0; i < tasks.length; i++) {
			
								let task = tasks[i];
								if (task && (task.supplier_id > 0)) {
			
									let supplier_id = task.supplier_id;
									if (!supplier_id || (supplier_id && (supplier_id <= 0))) {
										supplier_id = null
									}
			
									let character_id = task.character_id;
									if (!character_id || (character_id && (character_id <= 0))) {
										character_id = null
									}
						
									let supplier_name = task.supplier_name;
									if (!supplier_name || (supplier_name && (supplier_name.length <= 0))) {
										supplier_name = ''
									}
			
									let description = task.description;
									if (!description || (description && (description.length <= 0))) {
										description = ''
									}
			
									let comments = task.comments;
									if (!comments || (comments && (comments.length <= 0))) {
										comments = ''
									}
			
									let category_name = '';
									if (shooting_day) {
										category_name = shooting_day.name.toLowerCase().trim() + ' - ' + shooting_day.location;
									}
						
									let task_category_obj = null;
									let color = '';
									let params = {
										supplier_id: supplier_id,
										project_id: project_id,
										task_category: shooting_day_id,
										task_category_name: category_name,
										shooting_day_id: shooting_day_id,
										color: color
									}
			
									if (supplier_id && (supplier_id > 0)) {
										task_category_obj = await TaskCategory.findOne({where: { supplier_id: supplier_id, project_id: project_id, task_category: category_name }});
									}
						
									let task_category_id = 0;
									if (task_category_obj && (task_category_obj.id > 0)) {
										task_category_id = task_category_obj.id;
										//task_category_obj = await TaskCategory.update(params, {where: { id: task_category_obj.id }});
										//task_category_obj = await TaskCategory.findOne({where: { supplier_id: supplier_id, project_id: project_id }});
									} else {
										task_category_obj = await TaskCategory.create(params);
										if (task_category_obj) {
											task_category_obj = task_category_obj.dataValues;
											task_category_id = task_category_obj.id;
										}
									}
			
									let scene_id = 0
									let task_params = {
										project_id: project_id,
										task_name: description,
										supplier_id: supplier_id,
										character_id: character_id,
										task_category_id: task_category_id,
										// task_type_id: 0,
										task_status_id: task_status_active_id,
										//due_date: ,
										comments: comments,
										project_scene_id: scene_id,
										project_shooting_day_id: shooting_day_id,
										project_scene_text: '',
										project_scene_location: '',
										price: 0
									}
									let task_obj = await Task.create(task_params);
								}
							}
						}			
					}
				}
			}

			///////////////

			let project_shooting_day_list = []
			utils.getProjectShootingDays(project_id, function (err, shooting_day_list){
				if (err) {
					return res.send(project_shooting_day_list);
				} else {
					return res.send(shooting_day_list);
				}
			})

			///////////////////////////////////

			// //res.json(task);
			// return res.json({
			// 	response: 0,
			// 	err: "",
			// 	project_shooting_day: project_shooting_day
			// })
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	moveProjectShootingDayScene: async (req, res, next) => {
		try {
			let project_id = parseInt(req.body.project_id);
			let project_scene_id = parseInt(req.body.project_scene_id);
			let project_shooting_day_id_from = parseInt(req.body.project_shooting_day_id_from);
			let project_shooting_day_id_to = parseInt(req.body.project_shooting_day_id_to);

			if (isNaN(project_shooting_day_id_from) || (project_shooting_day_id_from <= 0)) {
				project_shooting_day_id_from = 0;
			}

			if (isNaN(project_shooting_day_id_to) || (project_shooting_day_id_to <= 0)) {
				project_shooting_day_id_to = 0;
			}

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = 0;
			} else {
			}

			if (isNaN(project_scene_id) || (project_scene_id <= 0)) {
				project_scene_id = 0;
			}

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = null;
				return res.json({
					response: 2,
					err: "No project id"
				})
			}

			let project = await Project.findOne({ where: { id: project_id } });

			if (!project) {
				return res.json({
					response: 3,
					err: "No project found"
				})
			}

			emptyS3Directory(project_id)

			let shooting_day_from = null;
			if (project_shooting_day_id_from > 0) {
				shooting_day_from = await ProjectShootingDay.findOne({where: { id: project_shooting_day_id_from }});
				if (shooting_day_from) {
					shooting_day_from = shooting_day_from.dataValues;
				}
			}

			let shooting_day_to = null;
			if (project_shooting_day_id_to > 0) {
				shooting_day_to = await ProjectShootingDay.findOne({where: { id: project_shooting_day_id_to }});
				if (shooting_day_to) {
					shooting_day_to = shooting_day_to.dataValues;
				}
			}

			if (shooting_day_from && shooting_day_to) {

				let scene_obj = null;
				let time_id = 0;
				let update_shooting_day = false;
				let update_pos = false;

				if (shooting_day_from && shooting_day_from.shooting_day) {
					let shooting_day = shooting_day_from.shooting_day;
					let scene_pos = shooting_day_from.scene_pos;
					if (shooting_day_from && shooting_day && shooting_day.scenes && (shooting_day.scenes.length > 0)) {
						for (var k = 0; k < shooting_day.scenes.length; k++) {
							let scene = shooting_day.scenes[k];												
							if (shooting_day_from && scene) {
								for (var k1 = 0; k1 < scene.length; k1++) {
									let scene1 = scene[k1];
									if (shooting_day_from && scene1 && scene1.project_scene_id && (scene1.project_scene_id > 0) && (scene1.project_scene_id == project_scene_id)) {
										let arr = shooting_day.scenes[k].splice(k1,1);
										if (shooting_day_from && arr && (arr.length > 0)) {
											scene_obj = arr[0];
											time_id = k;
											update_shooting_day = true;

											if (shooting_day_from && scene_pos && (scene_pos.length > 0)) {
												for (var k2 = 0; k2 < scene_pos.length; k2++){
													let val = scene_pos[k2];
													if (shooting_day_from && val && (val > 0) && (val == scene_obj.scene_id)) {
														let arr2 = shooting_day_from.scene_pos.splice(k2,1);
														if (shooting_day_from && arr2 && (arr2.length > 0)) {
															update_pos = true;
														}
														if (shooting_day_from && shooting_day_from.scene_pos && (shooting_day_from.scene_pos.length == 0)) {
															shooting_day_from.scene_pos = null;
														}
													}
												}
											}

											let scene_count = 0;
											for (var k3 = 0; k3 < shooting_day.scenes.length; k3++) {
												if (shooting_day_from && shooting_day.scenes[k3] && (shooting_day.scenes[k3].length > 0)) {
													scene_count += shooting_day.scenes[k3].length;
												}
											}
											if (scene_count == 0) {
												let response = await ProjectShootingDay.destroy({where: { id: project_shooting_day_id_from }});
												update_shooting_day = false;
												shooting_day_from = null;
											}
										}
									}
								}
							}
						}
					}
					if (shooting_day_from && update_shooting_day) {
						let scene_pos = null;
						if (update_pos) {
							scene_pos = shooting_day_from.scene_pos
						}
						let params1 = {
							shooting_day: shooting_day_from.shooting_day,
							scene_pos: scene_pos
						}
						let project_shooting_day = await ProjectShootingDay.update(params1, {where: { id: shooting_day_from.id }});
					}
				}

				if (update_shooting_day && scene_obj && shooting_day_to && shooting_day_to.shooting_day) {
					shooting_day_to.shooting_day.scenes[time_id].push(scene_obj)
					update_pos = false;
					if (shooting_day_to.scene_pos && (shooting_day_to.scene_pos.length > 0)) {
						shooting_day_to.scene_pos.push(scene_obj.scene_id);
						update_pos = true;
					}
					if (update_shooting_day) {
						let scene_pos = null;
						if (update_pos) {
							scene_pos = shooting_day_to.scene_pos
						}
						let params1 = {
							shooting_day: shooting_day_to.shooting_day,
							scene_pos: scene_pos
						}
						let project_shooting_day = await ProjectShootingDay.update(params1, {where: { id: shooting_day_to.id }});
					}
				}
			}

			let project_shooting_day_list = []
			utils.getProjectShootingDays(project_id, function (err, shooting_day_list){
				if (err) {
					return res.send(project_shooting_day_list);
				} else {
					return res.send(shooting_day_list);
				}
			})

			/*return res.json({
				response: 0,
				err: ""
			})*/
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	moveProjectShootingDay: async (req, res, next) => {
		try {
			let project_id = parseInt(req.body.project_id);
			let project_scene_id = parseInt(req.body.project_scene_id);
			let project_shooting_day_id_from = parseInt(req.body.project_shooting_day_id_from);
			let project_shooting_day_id_to = parseInt(req.body.project_shooting_day_id_to);

			if (isNaN(project_shooting_day_id_from) || (project_shooting_day_id_from <= 0)) {
				project_shooting_day_id_from = 0;
			}

			if (isNaN(project_shooting_day_id_to) || (project_shooting_day_id_to <= 0)) {
				project_shooting_day_id_to = 0;
			}

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = 0;
			} else {
			}

			if (isNaN(project_scene_id) || (project_scene_id <= 0)) {
				project_scene_id = 0;
			}

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = null;
				return res.json({
					response: 2,
					err: "No project id"
				})
			}

			let project = await Project.findOne({ where: { id: project_id } });

			if (!project) {
				return res.json({
					response: 3,
					err: "No project found"
				})
			}

			emptyS3Directory(project_id)

			let shooting_day_from = null;
			if (project_shooting_day_id_from > 0) {
				shooting_day_from = await ProjectShootingDay.findOne({where: { id: project_shooting_day_id_from }});
				if (shooting_day_from) {
					shooting_day_from = shooting_day_from.dataValues;
				}
			}

			let shooting_day_to = null;
			if (project_shooting_day_id_to > 0) {
				shooting_day_to = await ProjectShootingDay.findOne({where: { id: project_shooting_day_id_to }});
				if (shooting_day_to) {
					shooting_day_to = shooting_day_to.dataValues;
				}
			}

			if (shooting_day_from && shooting_day_to) {

				let scene_obj = null;
				let time_id = 0;
				let update_shooting_day = false;
				let update_pos = false;

				if (shooting_day_from && shooting_day_from.shooting_day) {
					let shooting_day = shooting_day_from.shooting_day;
					let scene_pos = shooting_day_from.scene_pos;
					if (shooting_day_from && shooting_day && shooting_day.scenes && (shooting_day.scenes.length > 0)) {
						for (var k = 0; k < shooting_day.scenes.length; k++) {
							let scene = shooting_day.scenes[k];												
							if (shooting_day_from && scene) {
								for (var k1 = 0; k1 < scene.length; k1++) {
									let scene1 = scene[k1];
									if (shooting_day_from && scene1 && scene1.project_scene_id && (scene1.project_scene_id > 0) && (scene1.project_scene_id == project_scene_id)) {
										let arr = shooting_day.scenes[k].splice(k1,1);
										if (shooting_day_from && arr && (arr.length > 0)) {
											scene_obj = arr[0];
											time_id = k;
											update_shooting_day = true;

											if (shooting_day_from && scene_pos && (scene_pos.length > 0)) {
												for (var k2 = 0; k2 < scene_pos.length; k2++){
													let val = scene_pos[k2];
													if (shooting_day_from && val && (val > 0) && (val == scene_obj.scene_id)) {
														let arr2 = shooting_day_from.scene_pos.splice(k2,1);
														if (shooting_day_from && arr2 && (arr2.length > 0)) {
															update_pos = true;
														}
														if (shooting_day_from && shooting_day_from.scene_pos && (shooting_day_from.scene_pos.length == 0)) {
															shooting_day_from.scene_pos = null;
														}
													}
												}
											}

											let scene_count = 0;
											for (var k3 = 0; k3 < shooting_day.scenes.length; k3++) {
												if (shooting_day_from && shooting_day.scenes[k3] && (shooting_day.scenes[k3].length > 0)) {
													scene_count += shooting_day.scenes[k3].length;
												}
											}
											if (scene_count == 0) {
												let response = await ProjectShootingDay.destroy({where: { id: project_shooting_day_id_from }});
												update_shooting_day = false;
												shooting_day_from = null;
											}
										}
									}
								}
							}
						}
					}
					if (shooting_day_from && update_shooting_day) {
						let scene_pos = null;
						if (update_pos) {
							scene_pos = shooting_day_from.scene_pos
						}
						let params1 = {
							shooting_day: shooting_day_from.shooting_day,
							scene_pos: scene_pos
						}
						let project_shooting_day = await ProjectShootingDay.update(params1, {where: { id: shooting_day_from.id }});
					}
				}

				if (update_shooting_day && scene_obj && shooting_day_to && shooting_day_to.shooting_day) {
					shooting_day_to.shooting_day.scenes[time_id].push(scene_obj)
					update_pos = false;
					if (shooting_day_to.scene_pos && (shooting_day_to.scene_pos.length > 0)) {
						shooting_day_to.scene_pos.push(scene_obj.scene_id);
						update_pos = true;
					}
					if (update_shooting_day) {
						let scene_pos = null;
						if (update_pos) {
							scene_pos = shooting_day_to.scene_pos
						}
						let params1 = {
							shooting_day: shooting_day_to.shooting_day,
							scene_pos: scene_pos
						}
						let project_shooting_day = await ProjectShootingDay.update(params1, {where: { id: shooting_day_to.id }});
					}
				}
			}

			let project_shooting_day_list = []
			utils.getProjectShootingDays(project_id, function (err, shooting_day_list){
				if (err) {
					return res.send(project_shooting_day_list);
				} else {
					return res.send(shooting_day_list);
				}
			})

			/*return res.json({
				response: 0,
				err: ""
			})*/
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	deleteProjectShootingDay: async (req, res, next) => {
		try {
			let project_shooting_day_id = parseInt(req.body.project_shooting_day_id);

			if (isNaN(project_shooting_day_id) || (project_shooting_day_id <= 0)) {
				project_shooting_day_id = null;
				return res.json({
					response: 2,
					err: "No project shooting day id"
				})
			}

			console.log('Delete project shooting day:',project_shooting_day_id)

			const response = await ProjectShootingDay.destroy({
				where: { id: project_shooting_day_id },
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

	getProps: async (req, res, next) => {
		try {			
			const propss_list = await Props.findAll({});
			res.json(propss_list);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	addProps: async (req, res, next) => {
		try {
			let word = req.body.word;

			if (!word || (word.length == 0)) {
				return res.json({
					response: 2,
					err: "No word"
				})
			}
			
			let props_result = null;
			let params = {
				word: word
			}
			props_result = await Props.update(params, {where: { word: word }});
			props_result = params;

			//res.json(task);
			return res.json({
				response: 0,
				err: "",
				props: props_result
			})
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	deleteProps: async (req, res, next) => {
		try {
			let word = req.body.word;

			if (!word || (word.length == 0)) {
				return res.json({
					response: 2,
					err: "No word"
				})
			}

			console.log('Delete Props Word:',word)

			const response = await Props.destroy({
				where: { word: word },
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

	getSceneTime: async (req, res, next) => {
		try {
			let project_id = parseInt(req.params.project_id);

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = 0;
				return res.json({
					response: 2,
					err: "No project id"
				})
			}
		
			const scene_time = await SceneTime.findAll({where: { project_id: project_id }});
			res.json(scene_time);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	addSceneTime: async (req, res, next) => {
		try {
			let project_id = parseInt(req.body.project_id);
			let scene_time = req.body.scene_time;

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = 0;
				return res.json({
					response: 2,
					err: "No project id"
				})
			}
		
			if (!scene_time || (scene_time && (scene_time.length <= 0))) {
				project_id = 0;
				return res.json({
					response: 2,
					err: "No scene time"
				})
			}
		
			const scene_time_list = await SceneTime.findAll({where: { project_id: project_id }});
			const scene_time_def = await SceneTimeDef.findAll({});
			
			let update_db = false;
			let time2 = scene_time;
			let found = false;
			for (var i = 0; i < scene_time_list.length; i++) {
				let project_id1 = scene_time_list[i].dataValues.project_id;
				let time1 = scene_time_list[i].dataValues.scene_time;//.toLowerCase().trim();
				let time_type1 = scene_time_list[i].dataValues.scene_time_type;
				if (time1 && time2 && 
					(time1.toLowerCase().trim().includes(time2.toLowerCase().trim()) || 
					time2.toLowerCase().trim().includes(time1.toLowerCase().trim())) && 
					(project_id1 == project_id)) {
					found = true;
				}
			}
			if (!found && time2 && (time2.length > 0)) {
				update_db = true;

				let scene_time_type = 0;
				let max_day_duration = 8 * 60;
				let max_night_duration = 3 * 60;
				let max_shooting_duration = 8 * 60;
				let default_scene_time = 60;
				let max_shooting_scenes = 8;
				let color = '#ffffff';
				for (var i = 0; i < scene_time_def.length; i++) {
					let project_id1 = scene_time_def[i].dataValues.project_id;
					let time1 = scene_time_def[i].dataValues.scene_time;//.toLowerCase().trim();
					let scene_time_type1 = scene_time_def[i].dataValues.scene_time_type;
					let color1 = scene_time_def[i].dataValues.color;
					let max_shooting_scenes1 = scene_time_def[i].dataValues.max_shooting_scenes;
					let max_shooting_duration1 = scene_time_def[i].dataValues.max_shooting_duration;
					let default_scene_time1 = scene_time_def[i].dataValues.default_scene_time;
					if (time1 && time2 && 
						(time1.toLowerCase().trim().includes(time2.toLowerCase().trim()) || 
						time2.toLowerCase().trim().includes(time1.toLowerCase().trim()))) {
						if (color1 && (color1.length > 0)) {
							color = color1;
						}
						scene_time_type = scene_time_type1;
						if (1 || (max_shooting_scenes1 && (max_shooting_scenes1 > 0))) {
							max_shooting_scenes = max_shooting_scenes1;
						}
						if (1 || (max_shooting_duration1 && (max_shooting_duration1 > 0))) {
							max_shooting_duration = max_shooting_duration1;
						}
						if (1 || (default_scene_time1 && (default_scene_time1 > 0))) {
							default_scene_time = default_scene_time1;
						}
					}
				}

				const response = await SceneTime.create({
					project_id: project_id,
					scene_time: time2,
					scene_time_type: scene_time_type,
					max_shooting_scenes: max_shooting_scenes,
					max_shooting_duration: max_shooting_duration,
					default_scene_time: default_scene_time,
					color: color
				});
			}

			scene_time_list = await SceneTime.findAll({where: { project_id: project_id }});

			return res.json({
				response: 0,
				err: "",
				scene_time: scene_time_list
			})
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	deleteSceneTime: async (req, res, next) => {
		try {
			let project_id = parseInt(req.body.project_id);

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = 0;
				return res.json({
					response: 2,
					err: "No project id"
				})
			}

			const response = await SceneTime.destroy({
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
	},

	getSceneLocation: async (req, res, next) => {
		try {
			let project_id = parseInt(req.params.project_id);

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = 0;
				return res.json({
					response: 2,
					err: "No project id"
				})
			}
		
			const scene_location = await SceneLocation.findAll({where: { project_id: project_id }});
			res.json(scene_location);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	addSceneLocation: async (req, res, next) => {
		try {
			let project_id = parseInt(req.body.project_id);
			let scene_location = req.body.scene_location;

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = 0;
				return res.json({
					response: 2,
					err: "No project id"
				})
			}
		
			if (!scene_location || (scene_location && (scene_location.length <= 0))) {
				project_id = 0;
				return res.json({
					response: 2,
					err: "No scene location"
				})
			}
		
			const scene_location_list = await SceneLocation.findAll({where: { project_id: project_id }});
			
			let update_db = false;
			let location2 = scene_location;
			let found = false;
			for (var i = 0; i < scene_location_list.length; i++) {
				let project_id1 = scene_location_list[i].dataValues.project_id;
				let location1 = scene_location_list[i].dataValues.scene_location;
				if (location1 && location2 && 
					((location1.toLowerCase().trim().includes(location2.toLowerCase().trim())) || 
					(location2.toLowerCase().trim().includes(location1.toLowerCase().trim()))) && 
					(project_id1 == project_id)) {
					found = true;
				}
			}
			if (!found && location2 && (location2.length > 0)) {
				update_db = true;
				const response = await SceneLocation.create({
					project_id: project_id,
					scene_location: location2
				});
			}

			scene_location_list = await SceneLocation.findAll({where: { project_id: project_id }});

			return res.json({
				response: 0,
				err: "",
				scene_location: scene_location_list
			})
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	deleteSceneLocation: async (req, res, next) => {
		try {
			let project_id = parseInt(req.body.project_id);

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = 0;
				return res.json({
					response: 2,
					err: "No project id"
				})
			}

			const response = await SceneLocation.destroy({
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
	} ,

	scriptSceneCharacterUpdate: async (req, res, next) => {
		try {
			let character_id = req.body.character_id == 'undefined' ? 0 : parseInt(Number(req.body.character_id));
			let character_name = req.body.character_name == 'undefined' ? '': req.body.character_name;
			let project_id = req.body.project_id == 'undefined' ? 0 : parseInt(Number(req.body.project_id));
		
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
								script.characters[j].character_name = character_name
								update_data = true;
								
							}
						}
					}
					
					for (var i1 = 0; i1 < script.scenes.length; i1++) {
						let scene = script.scenes[i1];

						
						if (scene.characters && (scene.characters.length > 0)) {
							for (var l = 0; l < scene.characters.length; l++) {
								let character1 = scene.characters[l];
								if (character1 && (character1.character_id == character_id)) {
									found = true;
									scene.characters[l].character_name = character_name
									update_data = true;
									
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

			let project_shooting_day = await ProjectShootingDay.findAll({ 
				where: { project_id: project_id }
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
									let found = false;
									if (scene1 && scene1.characters && (scene1.characters.length > 0)) {
											for (var l = 0; l < scene1.characters.length; l++) {
												let character1 = scene1.characters[l];
												if (character1 && (character1.character_id == character_id)) {
													found = true;
													scene1.characters[l].character_name = character_name
													update_shooting_day = true;
													
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
			return res.json({
				response: 0,
				err: ""
			})
		} 
		catch(err){
			return res.json({
				response: 1,
				err: err
			})
		}

	} , 

	scriptSceneCharacterDelete: async (req, res, next) => {
	
			

		try{
			let character_id = req.body.character_id == 'undefined' ? 0 : parseInt(Number(req.body.character_id));
			let scene_id = req.body.scene_id == 'undefined' ? '' : req.body.scene_id;
			let project_id = req.body.project_id == 'undefined' ? 0 : parseInt(Number(req.body.project_id));
			let chapter_number = req.body.chapter_number == 'undefined' ? 0 : parseInt(Number(req.body.chapter_number));
			

			let project_script = await ProjectScript.findAll({where: { project_id: project_id , chapter_number: chapter_number}});
			for (var i = 0; i < project_script.length; i++) {
				let script = project_script[i].dataValues.script;
				if (script) {
					let update_data = false;
					let found = false;

					let scene = script.scenes.filter(item => item.scene_id === scene_id)[0];
					
					if (scene.characters && (scene.characters.length > 0)) {
						update_data = true;
						let updatedCharacters = []
						updatedCharacters = scene.characters.filter(item => item.character_id !== character_id)
						console.log("updatedCharacters" , updatedCharacters)
						scene.characters = updatedCharacters

						console.log("scene.characters " , scene.characters )
					}

					

					if (update_data) {
						let script_params = {
							script: script
						}
					
						let project_script_result = await ProjectScript.update(script_params, {where: { project_id: project_id, chapter_number: chapter_number }});
					}	
				}
			}

			let project_shooting_day = await ProjectShootingDay.findAll({ 
				where: { project_id: project_id }
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
									console.log("scene", scene)
									let scene1 = scene.filter(item => item.scene_id === scene_id)[0]
									console.log("scene1", scene1)
									let found = false;
									if (scene1){
										let updatedCharacters = []
										updatedCharacters = scene1.characters.filter(item => item.character_id !== character_id)
										scene1.characters = updatedCharacters
										update_shooting_day = true;
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

			

			return res.json({
				response: 0,
				err: ""
			})
		}
		catch(err){
			return res.json({
				response: 1,
				err: err
			})
		}
	}


};



export default ProjectController;
