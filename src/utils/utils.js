
const sequelize = require('../models');
const { Project, Character, Supplier, SupplierType, SupplierCategory, SupplierTitle, SupplierProject, SupplierJobTitle, Budget, Task, TaskCategory, TaskType, TaskStatus, TaskTitle, BudgetType, BudgetStatus, Props, Makeups, Clothes, Specials, Others, SceneLocation, SceneTime, SceneTimeDef, ProjectShootingDay/*, ProjectShootingDayScene*/ } = sequelize.models;
const { Op } = require("sequelize");
var config = require('../config/config');
var request = require('request');

var api_address = config.script_breakdown_server_ip_local;
if (config.env == 1) {
  api_address = config.script_breakdown_server_ip_dev;
} else {
  if (config.env == 2) {
    api_address = config.script_breakdown_server_ip_prod;
  }
}

let colors1 = [
  '#333', //color-base
  '#f00', //color-error
  '#00f', //color-action
  '#ff0', //color-warning
  '#fff', //color-white
  '#000', //color-black
  '#131313', //color-black2
  '#2d2c2c', //color-black3
  '#453937', //color-black4
  '#4c413f', //color-black5
  '#eef2f9' //color-light,
]

let colors = [
  '#3150ff', //color-blue1
  '#a1ffff', //color-blue2
  '#44a6f5', //color-blue3
  '#dce1ff', //color-blue4
  '#005bb0', //color-blue5
  '#060607', //color-blue6
  '#82c786', //color-green1
  '#47894b', //color-green2
  '#06bf85', //color-green3
  '#ffa828', //color-yellow
  '#707090', //color-light-purple
  '#ff5050', //color-red1
  '#f15c47', //color-red2
  '#e57373', //color-red3
  '#00294f', //color-primary-imgn
  "#63b598", "#ce7d78", "#ea9e70", "#a48a9e", "#c6e1e8", "#648177" ,"#0d5ac1" ,
  "#f205e6" ,"#1c0365" ,"#14a9ad" ,"#4ca2f9" ,"#a4e43f" ,"#d298e2" ,"#6119d0",
  "#d2737d" ,"#c0a43c" ,"#f2510e" ,"#651be6" ,"#79806e" ,"#61da5e" ,"#cd2f00" ,
  "#9348af" ,"#01ac53" ,"#c5a4fb" ,"#996635","#b11573" ,"#4bb473" ,"#75d89e" ,
  "#2f3f94" ,"#2f7b99" ,"#da967d" ,"#34891f" ,"#b0d87b" ,"#ca4751" ,"#7e50a8" ,
  "#c4d647" ,"#e0eeb8" ,"#11dec1" ,"#289812" ,"#566ca0" ,"#ffdbe1" ,"#2f1179" ,
  "#935b6d" ,"#916988" ,"#513d98" ,"#aead3a", "#9e6d71", "#4b5bdc", "#0cd36d",
  "#250662", "#cb5bea", "#228916", "#ac3e1b", "#df514a", "#539397", "#880977",
  "#f697c1", "#ba96ce", "#679c9d", "#c6c42c", "#5d2c52", "#48b41b", "#e1cf3b",
  "#5be4f0", "#57c4d8", "#a4d17a", "#225b8", "#be608b", "#96b00c", "#088baf",
  "#f158bf", "#e145ba", "#ee91e3", "#05d371", "#5426e0", "#4834d0", "#802234",
  "#6749e8", "#0971f0", "#8fb413", "#b2b4f0", "#c3c89d", "#c9a941", "#41d158",
  "#fb21a3", "#51aed9", "#5bb32d", "#807fb", "#21538e", "#89d534", "#d36647",
  "#7fb411", "#0023b8", "#3b8c2a", "#986b53", "#f50422", "#983f7a", "#ea24a3",
  "#79352c", "#521250", "#c79ed2", "#d6dd92", "#e33e52", "#b2be57", "#fa06ec",
  "#1bb699", "#6b2e5f", "#64820f", "#1c271", "#21538e", "#89d534", "#d36647",
  "#7fb411", "#0023b8", "#3b8c2a", "#986b53", "#f50422", "#983f7a", "#ea24a3",
  "#79352c", "#521250", "#c79ed2", "#d6dd92", "#e33e52", "#b2be57", "#fa06ec",
  "#1bb699", "#6b2e5f", "#64820f", "#1c271", "#9cb64a", "#996c48", "#9ab9b7",
  "#06e052", "#e3a481", "#0eb621", "#fc458e", "#b2db15", "#aa226d", "#792ed8",
  "#73872a", "#520d3a", "#cefcb8", "#a5b3d9", "#7d1d85", "#c4fd57", "#f1ae16",
  "#8fe22a", "#ef6e3c", "#243eeb", "#1dc18", "#dd93fd", "#3f8473", "#e7dbce",
  "#421f79", "#7a3d93", "#635f6d", "#93f2d7", "#9b5c2a", "#15b9ee", "#0f5997",
  "#409188", "#911e20", "#1350ce", "#10e5b1", "#fff4d7", "#cb2582", "#ce00be",
  "#32d5d6", "#17232", "#608572", "#c79bc2", "#00f87c", "#77772a", "#6995ba",
  "#fc6b57", "#f07815", "#8fd883", "#060e27", "#96e591", "#21d52e", "#d00043",
  "#b47162", "#1ec227", "#4f0f6f", "#1d1d58", "#947002", "#bde052", "#e08c56",
  "#28fcfd", "#bb09b", "#36486a", "#d02e29", "#1ae6db", "#3e464c", "#a84a8f",
  "#911e7e", "#3f16d9", "#0f525f", "#ac7c0a", "#b4c086", "#c9d730", "#30cc49",
  "#3d6751", "#fb4c03", "#640fc1", "#62c03e", "#d3493a", "#88aa0b", "#406df9",
  "#615af0", "#4be47", "#2a3434", "#4a543f", "#79bca0", "#a8b8d4", "#00efd4",
  "#7ad236", "#7260d8", "#1deaa7", "#06f43a", "#823c59", "#e3d94c", "#dc1c06",
  "#f53b2a", "#b46238", "#2dfff6", "#a82b89", "#1a8011", "#436a9f", "#1a806a",
  "#4cf09d", "#c188a2", "#67eb4b", "#b308d3", "#fc7e41", "#af3101", "#ff065",
  "#71b1f4", "#a2f8a5", "#e23dd0", "#d3486d", "#00f7f9", "#474893", "#3cec35",
  "#1c65cb", "#5d1d0c", "#2d7d2a", "#ff3420", "#5cdd87", "#a259a4", "#e4ac44",
  "#1bede6", "#8798a4", "#d7790f", "#b2c24f", "#de73c2", "#d70a9c", "#25b67",
  "#88e9b8", "#c2b0e2", "#86e98f", "#ae90e2", "#1a806b", "#436a9e", "#0ec0ff",
  "#f812b3", "#b17fc9", "#8d6c2f", "#d3277a", "#2ca1ae", "#9685eb", "#8a96c6",
  "#dba2e6", "#76fc1b", "#608fa4", "#20f6ba", "#07d7f6", "#dce77a", "#77ecca",
  '#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
  '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
  '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
  '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
  '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
  '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
  '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
  '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
  '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
  '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'
]

module.exports = {

  getRandomInt: function (max) {
    return Math.floor(Math.random() * Math.floor(max));
  },
  
  getColor: function() {
    var rnd = Math.floor(Math.random() * colors.length);
    return colors[rnd]
  },

  getFromApi: function (api_endpoint, params, callback) {

    console.log('Get from:'+api_endpoint+'/'+params);
  
    let api_path = api_address+api_endpoint;
    request.get(api_path+'/'+params, function (error, response, body) {
  
      if (error) {
          return callback(error);
      }
  
      if (typeof body === 'string') {
          body = JSON.parse(body)
      }
  
      console.log('Status:', response.statusCode);
      //console.log('Body:', body);
      return callback(null, body);
    });
  },
  
  postToApi: function (api_endpoint, json_data, callback) {
  
    //console.log(api_address+api_endpoint+': ', JSON.stringify(json_data));
    let api_path = api_address+api_endpoint;
    //console.log(api_path+':', json_data);
    console.log(api_path+':', json_data);
  
    request.post({
  
      url: api_path,
      //body: json_data,
      //json: true,
      headers: {'Content-Type': 'application/json'/*,
    'api-key-access-token': 'SN8Id8gAvXMCvamF0PibfaGKngQpwMpOzva58Dc7'*/},
      form: json_data // body
    },
  
    function (error, response, body) {
  
      if (error) {
        return callback(error);
      }
  
      if (response.statusCode == 500) {
        return callback(body);
      }
  
      if (typeof body == 'string') {
        //body = JSON.parse(body)
      }
  
      //console.log('Status: ', response.statusCode);
      //console.log('Body: ', JSON.stringify(body));
      return callback(null, body);
    });
  },
  
  getProjectTask: async function (project_id, project, cb) {

    try {

      if (!project_id || isNaN(project_id) || (project_id <= 0)) {
        project_id = null;
        return cb('No project id');
      }

      // let project = null;
      // if (project_id  > 0) {
      // 	project = await Project.findOne({where: { id: project_id }});
      // }

      if (!project) {
        return cb('No project');
      }

      //console.log('project:',project)
      let company_id = parseInt(project.company_id);
      let country_id = parseInt(project.country_id);

      let suppliers = await Supplier.findAll({ where: { company_id: company_id } });

      //let task_category = await TaskCategory.findAll({});

      let new_suppliers = [];

      let task_types = await TaskType.findAll({})
      let task_statuses = await TaskStatus.findAll({})

      async function getSupplierTasks(supplier, index) {

        return new Promise(async (resolve,reject)=>{

          if (supplier) {

            /*if (index == 0) {
              supplier = {...supplier, active: true}
            } else {
              supplier = {...supplier, active: false}
            }*/
      
            let has_tasks = false;
            let task_category_list = [];
            let task_category = await TaskCategory.findAll({ where: {supplier_id: supplier.id, project_id: project_id}});
            if (task_category) {

              for (let index = 0; index < task_category.length; index++) {
                let task_category_item = task_category[index].dataValues;
                
                if (task_category_item) {

                  let task_title = await TaskTitle.findOne({where: { project_id: project_id, category_id: task_category_item.id }})

                  task_category_item = {...task_category_item,
                      task_title: task_title,
                      tasks: {default:[], canban: []}
                    }

                  let tasks = await Task.findAll({ where: { supplier_id: supplier.id, project_id: project_id, parent_task_id: 0 }/*,
                    order: [
                      ['pos', 'ASC']
                    ]*/
                  });
									tasks = tasks.sort(function(a, b) {
										return a.pos - b.pos;
									});
                  
                  if (tasks && (tasks.length > 0)) {
                    has_tasks = true;
                    for (let index2 = 0; index2 < tasks.length; index2++) {
                      let task = tasks[index2].dataValues;

                      if (task && (task.task_category_id == task_category_item.id)) {

                        let supplier_id = 0;
                        if (task.supplier_id > 0) {
                          supplier_id = task.supplier_id;
                        }
                                                
                        let supplier = null;
                        if (supplier_id && (supplier_id > 0)) {
                          supplier = await Supplier.findOne({where: { id: supplier_id }})
                        }
                        
                        let supplier_name = '';
                        if (supplier && supplier.supplier_name) {
                          supplier_name = supplier.supplier_name;
                        }

                        let character_id = 0;
                        if (task.character_id > 0) {
                          character_id = task.character_id;
                        }
                                                
                        let character = null;
                        if (character_id && (character_id > 0)) {
                          character = await Character.findOne({where: { id: character_id }})
                        }
                        
                        let character_name = '';
                        if (character && character.character_name) {
                          character_name = character.character_name;
                        }

                        if (task_types && (task_types.length > 0)) {
                          for (let index3 = 0; index3 < task_types.length; index3++) {
                            let task_type = task_types[index3].dataValues;
                            if (task_type && (task_type.id == task.task_type_id)) {
                              task = {...task, task_type: task_type.task_type}
                            }
                          }
                        }

                        if (task_statuses && (task_statuses.length > 0)) {
                          for (let index3 = 0; index3 < task_statuses.length; index3++) {
                            let task_status = task_statuses[index3].dataValues;
                            if (task_status && (task_status.id == task.task_status_id)) {
                              task = {...task, task_status: task_status.task_status}
                            }
                          }
                        }

                        let task_status_id = 0;
                        if (task.task_status_id > 0) {
                          task_status_id = task.task_status_id;
                        }
                        let task_status = '';
                        if (task.task_status) {
                          task_status = task.task_status;
                        }
                        let task_type_id = 0;
                        if (task.task_type_id > 0) {
                          task_type_id = task.task_type_id;
                        }
                        let task_type = '';
                        if (task.task_type) {
                          task_type = task.task_type;
                        }

                        let new_task = {
                          'listId': task_category_item.id,
                          'color': task_category_item.color,
                          'id': task.id,
                          'parent_id': task.parent_id,
                          'project_id': task.project_id,
                          'pos': task.pos,
                          'description': task.task_name,
                          'status_id': task_status_id,
                          'status': task_status,
                          'type_id': task_type_id,
                          'type': task_type,
                          'scene_id': task.project_scene_id,
                          'shooting_day_id': task.project_shooting_day_id,
                          'synofsis': task.project_scene_text,
                          'location': task.project_scene_location,
                          'supplier_id': supplier_id,
                          'supplier_name': supplier_name,
                          'character_id': character_id,
                          'character_name': character_name,
                          'price': task.price,
                          'script': task.script,
                          'comments': task.comments,
                          'attachments': task.attachments,
                          'due_date': task.due_date,
                          'parent_task_id': 0
                        }

                        let text1 = task.text1;
                        if (task_title && task_title.text1) {
                          new_task = {...new_task, text1: text1}
                        }

                        let text2 = task.text2;
                        if (task_title && task_title.text2) {
                          new_task = {...new_task, text2: text2}
                        }

                        let text3 = task.text3;
                        if (task_title && task_title.text3) {
                          new_task = {...new_task, text3: text3}
                        }

                        let number1 = task.number1;
                        if (task_title && task_title.number1) {
                          new_task = {...new_task, number1: number1}
                        }

                        let number2 = task.number2;
                        if (task_title && task_title.number2) {
                          new_task = {...new_task, number2: number2}
                        }

                        let number3 = task.number3;
                        if (task_title && task_title.number3) {
                          new_task = {...new_task, number3: number3}
                        }
                  
                        {
                          let child_tasks_list = [];
                          async function getChildTasks(task_id, supplier_id, project_id) {
                            return new Promise(async (resolve,reject)=>{
                              let child_tasks = await Task.findAll({ where: { supplier_id: supplier_id, project_id: project_id, parent_task_id: task_id }/*,
                                order: [
                                  ['pos', 'ASC']
                                ]*/
                              });
                              child_tasks = child_tasks.sort(function(a, b) {
                                return a.pos - b.pos;
                              });
                                    
                              if (child_tasks && (child_tasks.length > 0)) {
                                for (let index22 = 0; index22 < child_tasks.length; index22++) {
                                  let child_task = child_tasks[index22].dataValues;
            
                                  if (child_task /*&& (child_task.task_category_id == task_category_item.id)*/) {
            
                                    let supplier_id = 0;
                                    if (child_task.supplier_id > 0) {
                                      supplier_id = child_task.supplier_id;
                                    }
                                    
                                    let supplier = null;
                                    if (supplier_id && (supplier_id > 0)) {
                                      supplier = await Supplier.findOne({where: { id: supplier_id }})
                                    }
            
                                    let supplier_name = '';
                                    if (supplier && supplier.supplier_name) {
                                      supplier_name = supplier.supplier_name;
                                    }
            
                                    let character_id = 0;
                                    if (child_task.character_id > 0) {
                                      character_id = child_task.character_id;
                                    }
                                    
                                    let character = null;
                                    if (character_id && (character_id > 0)) {
                                      character = await Character.findOne({where: { id: character_id }})
                                    }
            
                                    let character_name = '';
                                    if (character && character.character_name) {
                                      character_name = character.character_name;
                                    }
            
                                    if (task_types && (task_types.length > 0)) {
                                      for (let index3 = 0; index3 < task_types.length; index3++) {
                                        let task_type = task_types[index3].dataValues;
                                        if (task_type && (task_type.id == child_task.task_type_id)) {
                                          child_task = {...child_task, task_type: task_type.task_type}
                                        }
                                      }
                                    }
            
                                    if (task_statuses && (task_statuses.length > 0)) {
                                      for (let index3 = 0; index3 < task_statuses.length; index3++) {
                                        let task_status = task_statuses[index3].dataValues;
                                        if (task_status && (task_status.id == child_task.task_status_id)) {
                                          child_task = {...child_task, task_status: task_status.task_status}
                                        }
                                      }
                                    }
                                                            
                                    let task_status_id = 0;
                                    if (child_task.task_status_id > 0) {
                                      task_status_id = child_task.task_status_id;
                                    }
                                    let task_status = '';
                                    if (child_task.task_status) {
                                      task_status = child_task.task_status;
                                    }
                                    let task_type_id = 0;
                                    if (child_task.task_type_id > 0) {
                                      task_type_id = child_task.task_type_id;
                                    }
                                    let task_type = '';
                                    if (child_task.task_type) {
                                      task_type = child_task.task_type;
                                    }
            
                                    let new_child_task = {
                                      'listId': task_category_item.id,
                                      'color': task_category_item.color,
                                      'id': child_task.id,
                                      'parent_id': child_task.parent_id,
                                      'project_id': child_task.project_id,
                                      'pos': child_task.pos,
                                      'description': child_task.task_name,
                                      'status_id': task_status_id,
                                      'status': task_status,
                                      'type_id': task_type_id,
                                      'type': task_type,
                                      'scene_id': child_task.project_scene_id,
                                      'shooting_day_id': child_task.project_shooting_day_id,
                                      'synofsis': child_task.project_scene_text,
                                      'location': child_task.project_scene_location,
                                      'supplier_id': supplier_id,
                                      'supplier_name': supplier_name,
                                      'character_id': character_id,
                                      'character_name': character_name,
                                      'price': child_task.price,
                                      'script': child_task.script,
                                      'comments': child_task.comments,
                                      'attachments': child_task.attachments,
                                      'due_date': child_task.due_date,
                                      'parent_task_id': task_id
                                    }
            
                                    let text1 = child_task.text1;
                                    if (task_title && task_title.text1) {
                                      new_child_task = {...new_child_task, text1: text1}
                                    }
            
                                    let text2 = child_task.text2;
                                    if (task_title && task_title.text2) {
                                      new_child_task = {...new_child_task, text2: text2}
                                    }
            
                                    let text3 = child_task.text3;
                                    if (task_title && task_title.text3) {
                                      new_child_task = {...new_child_task, text3: text3}
                                    }
            
                                    let number1 = child_task.number1;
                                    if (task_title && task_title.number1) {
                                      new_child_task = {...new_child_task, number1: number1}
                                    }
            
                                    let number2 = child_task.number2;
                                    if (task_title && task_title.number2) {
                                      new_child_task = {...new_child_task, number2: number2}
                                    }
            
                                    let number3 = child_task.number3;
                                    if (task_title && task_title.number3) {
                                      new_child_task = {...new_child_task, number3: number3}
                                    }

                                    {
                                      let child_tasks_list2 = [];
                                      async function getChildTasks2(task_id, supplier_id, project_id) {
                                        return new Promise(async (resolve,reject)=>{
                                          let child_tasks = await Task.findAll({ where: { supplier_id: supplier_id, project_id: project_id, parent_task_id: task_id }/*,
                                            order: [
                                              ['pos', 'ASC']
                                            ]*/
                                          });
                                          child_tasks = child_tasks.sort(function(a, b) {
                                            return a.pos - b.pos;
                                          });
                                                            
                                          if (child_tasks && (child_tasks.length > 0)) {
                                            for (let index22 = 0; index22 < child_tasks.length; index22++) {
                                              let child_task2 = child_tasks[index22].dataValues;
                        
                                              if (child_task2 /*&& (child_task2.task_category_id == task_category_item.id)*/) {
                        
                                                let supplier_id = 0;
                                                if (child_task2.supplier_id > 0) {
                                                  supplier_id = child_task2.supplier_id;
                                                }
                                                
                                                let supplier = null;
                                                if (supplier_id && (supplier_id > 0)) {
                                                  supplier = await Supplier.findOne({where: { id: supplier_id }})
                                                }
                        
                                                let supplier_name = '';
                                                if (supplier && supplier.supplier_name) {
                                                  supplier_name = supplier.supplier_name;
                                                }

                                                let character_id = 0;
                                                if (child_task2.character_id > 0) {
                                                  character_id = child_task2.character_id;
                                                }
                                                
                                                let character = null;
                                                if (character_id && (character_id > 0)) {
                                                  character = await Character.findOne({where: { id: character_id }})
                                                }
                        
                                                let character_name = '';
                                                if (character && character.character_name) {
                                                  character_name = character.character_name;
                                                }
            
                                                if (task_types && (task_types.length > 0)) {
                                                  for (let index3 = 0; index3 < task_types.length; index3++) {
                                                    let task_type = task_types[index3].dataValues;
                                                    if (task_type && (task_type.id == child_task2.task_type_id)) {
                                                      child_task2 = {...child_task2, task_type: task_type.task_type}
                                                    }
                                                  }
                                                }
                        
                                                if (task_statuses && (task_statuses.length > 0)) {
                                                  for (let index3 = 0; index3 < task_statuses.length; index3++) {
                                                    let task_status = task_statuses[index3].dataValues;
                                                    if (task_status && (task_status.id == child_task2.task_status_id)) {
                                                      child_task2 = {...child_task2, task_status: task_status.task_status}
                                                    }
                                                  }
                                                }
                                                                                                
                                                let task_status_id = 0;
                                                if (child_task2.task_status_id > 0) {
                                                  task_status_id = child_task2.task_status_id;
                                                }
                                                let task_status = '';
                                                if (child_task2.task_status) {
                                                  task_status = child_task2.task_status;
                                                }
                                                let task_type_id = 0;
                                                if (child_task2.task_type_id > 0) {
                                                  task_type_id = child_task2.task_type_id;
                                                }
                                                let task_type = '';
                                                if (child_task2.task_type) {
                                                  task_type = child_task2.task_type;
                                                }
                        
                                                let new_child_task2 = {
                                                  'listId': task_category_item.id,
                                                  'color': task_category_item.color,
                                                  'id': child_task2.id,
                                                  'parent_id': child_task2.parent_id,
                                                  'project_id': child_task2.project_id,
                                                  'pos': child_task2.pos,
                                                  'description': child_task2.task_name,
                                                  'status_id': task_status_id,
                                                  'status': task_status,
                                                  'type_id': task_type_id,
                                                  'type': task_type,
                                                  'scene_id': child_task2.project_scene_id,
                                                  'shooting_day_id': child_task2.project_shooting_day_id,
                                                  'synofsis': child_task2.project_scene_text,
                                                  'location': child_task2.project_scene_location,
                                                  'supplier_id': supplier_id,
                                                  'supplier_name': supplier_name,
                                                  'character_id': character_id,
                                                  'character_name': character_name,
                                                  'price': child_task2.price,
                                                  'script': child_task2.script,
                                                  'comments': child_task2.comments,
                                                  'attachments': child_task2.attachments,
                                                  'due_date': child_task2.due_date,
                                                  'parent_task_id': task_id
                                                }
                        
                                                let text1 = child_task2.text1;
                                                if (task_title && task_title.text1) {
                                                  new_child_task2 = {...new_child_task2, text1: text1}
                                                }
                        
                                                let text2 = child_task2.text2;
                                                if (task_title && task_title.text2) {
                                                  new_child_task2 = {...new_child_task2, text2: text2}
                                                }
                        
                                                let text3 = child_task2.text3;
                                                if (task_title && task_title.text3) {
                                                  new_child_task2 = {...new_child_task2, text3: text3}
                                                }
                        
                                                let number1 = child_task2.number1;
                                                if (task_title && task_title.number1) {
                                                  new_child_task2 = {...new_child_task2, number1: number1}
                                                }
                        
                                                let number2 = child_task2.number2;
                                                if (task_title && task_title.number2) {
                                                  new_child_task2 = {...new_child_task2, number2: number2}
                                                }
                        
                                                let number3 = child_task2.number3;
                                                if (task_title && task_title.number3) {
                                                  new_child_task2 = {...new_child_task2, number3: number3}
                                                }
            
                                                {
                                                  let child_tasks_list3 = [];
                                                  async function getChildTasks3(task_id, supplier_id, project_id) {
                                                    return new Promise(async (resolve,reject)=>{
                                                      let child_tasks = await Task.findAll({ where: { supplier_id: supplier_id, project_id: project_id, parent_task_id: task_id }/*,
                                                        order: [
                                                          ['pos', 'ASC']
                                                        ]*/
                                                      });
                                                      child_tasks = child_tasks.sort(function(a, b) {
                                                        return a.pos - b.pos;
                                                      });
                                                            
                                                      if (child_tasks && (child_tasks.length > 0)) {
                                                        for (let index33 = 0; index33 < child_tasks.length; index33++) {
                                                          let child_task3 = child_tasks[index33].dataValues;
                                    
                                                          if (child_task3 /*&& (child_task3.task_category_id == task_category_item.id)*/) {
                                  
                                                            let supplier_id = 0;
                                                            if (child_task3.supplier_id > 0) {
                                                              supplier_id = child_task3.supplier_id;
                                                            }
                                                            
                                                            let supplier = null;
                                                            if (supplier_id && (supplier_id > 0)) {
                                                              supplier = await Supplier.findOne({where: { id: supplier_id }})
                                                            }
                                    
                                                            let supplier_name = '';
                                                            if (supplier && supplier.supplier_name) {
                                                              supplier_name = supplier.supplier_name;
                                                            }
                        
                                                            let character_id = 0;
                                                            if (child_task3.character_id > 0) {
                                                              character_id = child_task3.character_id;
                                                            }
                                                            
                                                            let character = null;
                                                            if (character_id && (character_id > 0)) {
                                                              character = await Character.findOne({where: { id: character_id }})
                                                            }
                                    
                                                            let character_name = '';
                                                            if (character && character.character_name) {
                                                              character_name = character.character_name;
                                                            }
                        
                                                            if (task_types && (task_types.length > 0)) {
                                                              for (let index3 = 0; index3 < task_types.length; index3++) {
                                                                let task_type = task_types[index3].dataValues;
                                                                if (task_type && (task_type.id == child_task3.task_type_id)) {
                                                                  child_task3 = {...child_task3, task_type: task_type.task_type}
                                                                }
                                                              }
                                                            }
                                    
                                                            if (task_statuses && (task_statuses.length > 0)) {
                                                              for (let index3 = 0; index3 < task_statuses.length; index3++) {
                                                                let task_status = task_statuses[index3].dataValues;
                                                                if (task_status && (task_status.id == child_task3.task_status_id)) {
                                                                  child_task3 = {...child_task3, task_status: task_status.task_status}
                                                                }
                                                              }
                                                            }
                                                                                                                                    
                                                            let task_status_id = 0;
                                                            if (child_task3.task_status_id > 0) {
                                                              task_status_id = child_task3.task_status_id;
                                                            }
                                                            let task_status = '';
                                                            if (child_task3.task_status) {
                                                              task_status = child_task3.task_status;
                                                            }
                                                            let task_type_id = 0;
                                                            if (child_task3.task_type_id > 0) {
                                                              task_type_id = child_task3.task_type_id;
                                                            }
                                                            let task_type = '';
                                                            if (child_task3.task_type) {
                                                              task_type = child_task3.task_type;
                                                            }
                                    
                                                            let new_child_task3 = {
                                                              'listId': task_category_item.id,
                                                              'color': task_category_item.color,
                                                              'id': child_task3.id,
                                                              'parent_id': child_task3.parent_id,
                                                              'project_id': child_task3.project_id,
                                                              'pos': child_task3.pos,
                                                              'description': child_task3.task_name,
                                                              'status_id': task_status_id,
                                                              'status': task_status,
                                                              'type_id': task_type_id,
                                                              'type': task_type,
                                                              'scene_id': child_task3.project_scene_id,
                                                              'shooting_day_id': child_task3.project_shooting_day_id,
                                                              'synofsis': child_task3.project_scene_text,
                                                              'location': child_task3.project_scene_location,
                                                              'supplier_id': supplier_id,
                                                              'supplier_name': supplier_name,
                                                              'character_id': character_id,
                                                              'character_name': character_name,
                                                              'price': child_task3.price,
                                                              'script': child_task3.script,
                                                              'comments': child_task3.comments,
                                                              'attachments': child_task3.attachments,
                                                              'due_date': child_task3.due_date,
                                                              'parent_task_id': task_id
                                                            }
                                    
                                                            let text1 = child_task3.text1;
                                                            if (task_title && task_title.text1) {
                                                              new_child_task3 = {...new_child_task3, text1: text1}
                                                            }
                                    
                                                            let text2 = child_task3.text2;
                                                            if (task_title && task_title.text3) {
                                                              new_child_task3 = {...new_child_task3, text2: text2}
                                                            }
                                    
                                                            let text3 = child_task3.text3;
                                                            if (task_title && task_title.text3) {
                                                              new_child_task3 = {...new_child_task3, text3: text3}
                                                            }
                                    
                                                            let number1 = child_task3.number1;
                                                            if (task_title && task_title.number1) {
                                                              new_child_task3 = {...new_child_task3, number1: number1}
                                                            }
                                    
                                                            let number2 = child_task3.number2;
                                                            if (task_title && task_title.number2) {
                                                              new_child_task3 = {...new_child_task3, number2: number2}
                                                            }
                                    
                                                            let number3 = child_task3.number3;
                                                            if (task_title && task_title.number3) {
                                                              new_child_task3 = {...new_child_task3, number3: number3}
                                                            }
                        
                                                            child_tasks_list3.push(new_child_task3);
                                                          }
                                                        }
                                                      }
                        
                                                      resolve();					  
                                                    })
                                                  }
                                            
                                                  const pormises3 = []
                                                  pormises3.push(getChildTasks3(new_child_task.id, new_child_task.supplier_id, new_child_task.project_id))
                                                  await Promise.all(pormises3)
                        
                                                  new_child_task2 = {...new_child_task, child_tasks: child_tasks_list3}
                                                }
            
                                                child_tasks_list2.push(new_child_task2);
                                              }
                                            }
                                          }
            
                                          resolve();					  
                                        })
                                      }
                                
                                      const pormises2 = []
                                      pormises2.push(getChildTasks2(new_child_task.id, new_child_task.supplier_id, new_child_task.project_id))
                                      await Promise.all(pormises2)
            
                                      new_child_task = {...new_child_task, child_tasks: child_tasks_list2}
                                    }
            

                                    child_tasks_list.push(new_child_task);
                                  }
                                }
                              }

                              resolve();					  
                            })
                          }
                    
                          const pormises = []
                          pormises.push(getChildTasks(new_task.id, new_task.supplier_id, new_task.project_id))
                          await Promise.all(pormises)

                          new_task = {...new_task, child_tasks: child_tasks_list}
                        }
                                                
                        task_category_item.tasks.default.push(new_task)
                      }
                    }
                    if ((task_category_item && task_category_item.tasks && 
                      (
                        (task_category_item.tasks.default && (task_category_item.tasks.default.length > 0)) ||
                        (task_category_item.tasks.canban && (task_category_item.tasks.canban.length > 0))
                      ))) {
                      task_category_list.push(task_category_item);
                    }
                  } else {
                    //task_category_list.push(task_category_item);
                  }
                } else {
                }
              }
            }

            if (task_category_list && (task_category_list.length > 0)) {
              let new_supplier = {
                id: supplier.id,
                company_id: supplier.company_id,
                country_id: country_id,
                supplier_name: supplier.supplier_name,
                attachments: supplier.attachments,
                email: supplier.email,
                lists: task_category_list,
                active: supplier.active
              }

              new_suppliers.push(new_supplier);
            }

          } else {
          }
          resolve();					  
        })
      }

      const pormises = []
      if (suppliers && (suppliers.length > 0)) {
        for (var i = 0; i < suppliers.length; i++) {
          pormises.push(getSupplierTasks(suppliers[i].dataValues, i))
        }
      }
      await Promise.all(pormises)

      if (new_suppliers && (new_suppliers.length > 0)) {
        new_suppliers[0] = {...new_suppliers[0], active: true}
      }

      return cb(null, new_suppliers);

    } catch (error) {
      return cb(error);
    }
  },

  getProjectShootingDays: async function (project_id, cb) {

    try {
      let project_shooting_day_list = []
      let project_shooting_day1 = null;
      project_shooting_day1 = await ProjectShootingDay.findAll({ 
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
              shooting_day_obj.shooting_day = {...shooting_day_obj.shooting_day, total_scenes: total_scenes};
            }
          }

          let char_list = await Character.findAll({where: { project_id: project_id }});

          let characters = []
          let total_scenes = []
          if (shooting_day_obj && shooting_day_obj.shooting_day && 
            shooting_day_obj.shooting_day.total_scenes && 
            (shooting_day_obj.shooting_day.total_scenes.length > 0)) {
            for (var j1 = 0; j1 < shooting_day_obj.shooting_day.total_scenes.length; j1++) {
              let scene = shooting_day_obj.shooting_day.total_scenes[j1];
              if (scene) {
                total_scenes.push(scene);
              }
              if (scene && scene.characters && (scene.characters.length > 0)) {
                for (var j2 = 0; j2 < scene.characters.length; j2++) {
                  let character = scene.characters[j2];
                  characters.push(character);
                }
              }
            }
          }
          characters = characters.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj.character_name).indexOf(obj.character_name) == pos;
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

          let employees = []
          if (shooting_day_obj.suppliers && (shooting_day_obj.suppliers.length > 0)) {
            for (var j2 = 0; j2 < shooting_day_obj.suppliers.length; j2++) {
              let supplier_id = shooting_day_obj.suppliers[j2];
              if (supplier_id && (supplier_id > 0)) {
                let supplier = await Supplier.findOne({where: { id: supplier_id }})
                if (supplier) {
                  supplier = supplier.dataValues;
                  let found = false;
                  if (employees && (employees.length > 0)) {
                    for (var n = 0; n < employees.length; n++) {
                      let employee = employees[n];
                      if (employee && (employee.id == supplier.id)) {
                        employee.characters = [];
                        /*let char = {
                          character_id: character.id,
                          character_name: character.character_name
                        }
                        if (employee.characters) {
                          employee.characters.push(char.character_name);
                          found = true;
                        }*/
                      }
                    }
                  }
                  if (!found) {
                    if (0 && supplier.characters) {
                      if (character) {
                        supplier.characters.push(character.character_name);
                      }
                    } else {
                      // supplier = {...supplier, characters: [{
                      // 		character_id: character.id,
                      // 		character_name: character.character_name
                      // 	}]
                      // }
                      if (0 && character) {
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

                    if (supplier.supplier_job_title_name) {
                      supplier.supplier_job_title_name = supplier_job_title_name;
                    } else {
                      supplier = {...supplier, supplier_job_title_name: supplier_job_title_name}
                    }

                    employees.push(supplier);
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
          employees = employees.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj.id).indexOf(obj.id) == pos;
          });

          if (actors && (actors.length > 0)) {
            for (var j4 = 0; j4 < actors.length; j4++) {
              let actor = actors[j4];
              if (actor) {
                let found = false;
                if (shooting_day_obj.post_shooting_day && shooting_day_obj.post_shooting_day.actors && (shooting_day_obj.post_shooting_day.actors.length > 0)) {
                  for (var j5 = 0; ((j5 < shooting_day_obj.post_shooting_day.actors.length) && !found); j5++) {
                    let actor2 = shooting_day_obj.post_shooting_day.actors[j5];
                    if (actor2 && (actor2.id == actor.id)) {
                      found = true;
                    }
                  }
                }
                if (!found) {
                  shooting_day_obj.post_shooting_day.actors.push(actor);
                }
              }
            }
          }

          if (employees && (employees.length > 0)) {
            for (var j4 = 0; j4 < employees.length; j4++) {
              let employee = employees[j4];
              if (employee) {
                let found = false;
                if (shooting_day_obj.post_shooting_day && shooting_day_obj.post_shooting_day.employees && (shooting_day_obj.post_shooting_day.employees.length > 0)) {
                  for (var j5 = 0; ((j5 < shooting_day_obj.post_shooting_day.employees.length) && !found); j5++) {
                    let employee2 = shooting_day_obj.post_shooting_day.employees[j5];
                    if (employee2 && (employee2.id == employee.id)) {
                      found = true;
                    }
                  }
                }
                if (!found) {
                  shooting_day_obj.post_shooting_day.employees.push(employee);
                }
              }
            }
          }

          if (shooting_day_obj.post_shooting_day && shooting_day_obj.post_shooting_day.actors && (shooting_day_obj.post_shooting_day.actors.length > 0)) {
            //shooting_day_obj.post_shooting_day.actors = actors;
          } else {
            if (shooting_day_obj.post_shooting_day && shooting_day_obj.post_shooting_day.actors) {
              shooting_day_obj.post_shooting_day.actors = actors;
            } else {
              shooting_day_obj.post_shooting_day = {...shooting_day_obj.post_shooting_day, actors: actors}
            }
          }

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

          let emloyees = [];
          if (shooting_day_obj.post_shooting_day && shooting_day_obj.post_shooting_day.employees && (shooting_day_obj.post_shooting_day.employees.length > 0)) {
            emloyees = shooting_day_obj.post_shooting_day.employees;
          }

          let shooting_day = {
            id: shooting_day_obj.id,
            max_shooting_days: shooting_day_obj.max_shooting_days,
            params: shooting_day_obj.params,
            shooting_day: shooting_day_obj.shooting_day,
            tasks: tasks_list,
            characters: characters,
            actors: actors,
            employees: employees,
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

      cb (null, project_shooting_day_list)
    } catch (error) {
      return cb(error);
    }
  },

  getAllProjectSuppliers: async function (project_id, cb) {
		try {
			if (isNaN(project_id) || (project_id <= 0)) {
        project_id = null;
        return cb('No project id');
			}

			let project = null;
			if (project_id  > 0) {
				project = await Project.findOne({where: { id: project_id }});
			}

			if (!project) {
        return cb('No project found');
			}

			let company_id = project.company_id;

			let supplier_category_list = [];

			let supplier_types = await SupplierType.findAll({})
			let supplier_category = await SupplierCategory.findAll({});

			async function getProjectSuppliers(project_id) {

				return new Promise(async (resolve,reject)=>{

					let has_suppliers = false;
					if (supplier_category) {

						for (let index = 0; index < supplier_category.length; index++) {
							let supplier_category_item = supplier_category[index].dataValues;

							if (supplier_category_item) {
								
								let supplier_title = await SupplierTitle.findOne({where: { project_id: project_id, category_id: supplier_category_item.id }})

								if (supplier_title) {
									supplier_title = supplier_title.dataValues;
								}
								supplier_category_item = {...supplier_category_item,
									supplier_title: supplier_title,
									suppliers: {default:[], canban: []}
											}

								let suppliers_list = await Supplier.findAll({ 
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
                    supplier = {...supplier, characters: []};
                    let supplier_project = await SupplierProject.findOne({ where: { supplier_id: supplier.id, project_id: project_id } });
										if (supplier_project) {
                      let characters_list = await Character.findAll({ where: { supplier_id: supplier.id, project_id: project_id } });
                      let characters = [];
                      if (characters_list && (characters_list.length > 0)) {
                        for(var j in characters_list) {
                          var character = characters_list[j].dataValues;
                          if (character) {
                            characters.push(character);
                          }
                        }
                      }
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
                      /*if (supplier.characters) {
                        supplier.characters = supplier_project.characters;
                      } else {
                        supplier = {...supplier, characters: supplier_project.characters}
                      }*/
                      if (supplier.characters) {
                        supplier.characters = characters;
                      } else {
                        supplier = {...supplier, characters: characters}
                      }
                      suppliers.push(supplier);
										}
									}
								}
					
								if (suppliers && (suppliers.length > 0)) {
									has_suppliers = true;
									for (let index2 = 0; index2 < suppliers.length; index2++) {
										let supplier = suppliers[index2];

                    let supplier_category = null;
                    if (supplier.supplier_category_id && (supplier.supplier_category_id > 0)) {
                      supplier_category = await SupplierCategory.findOne({where: { id: supplier.supplier_category_id }})
                    }

                    let supplier_category_name = '';
                    if (supplier_category && supplier_category.supplier_category) {
                      supplier_category_name = supplier_category.supplier_category;
                    }

                    if (supplier_category_name && (supplier_category_name.length > 0)) {
                      supplier = {...supplier, supplier_category: supplier_category_name}
                    }

										//if (supplier && (supplier.supplier_category_id == supplier_category_item.id)) {
                    if (supplier && (supplier.supplier_category == supplier_category_item.supplier_category)) {

											let supplier_id = 0;
											if (supplier.id > 0) {
												supplier_id = supplier.id;
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

											if (supplier_types && (supplier_types.length > 0)) {
												for (let index3 = 0; index3 < supplier_types.length; index3++) {
													let supplier_type = supplier_types[index3].dataValues;
													if (supplier_type && (supplier_type.id == supplier.supplier_type_id)) {
														supplier = {...supplier, supplier_type: supplier_type.supplier_type}
													}
												}
											}

											let supplier_type_id = 0;
											if (supplier.supplier_type_id > 0) {
												supplier_type_id = supplier.supplier_type_id;
											}
											let supplier_type = '';
											if (supplier.supplier_type) {
												supplier_type = supplier.supplier_type;
											}

											let new_supplier = {...supplier,
												'listId': supplier_category_item.id,
                        'color': supplier_category_item.color,
												'id': supplier.id,
												'company_id': supplier.company_id,
												'pos': supplier.pos,
												'expense-description': supplier.description,
												'type_id': supplier_type_id,
												'type': supplier_type,
												'supplier_id': supplier_id,
												'supplier_name': supplier_name,
												'supplier_job_title_id': supplier_job_title_id,
												'supplier_job_title': supplier_job_title_name,
												'comments': supplier.comments,
												'attachments': supplier.attachments,
												'category_id': supplier.category_id,
												'category': supplier.category
											}

											let text1 = supplier.text1;
											if (supplier_title && supplier_title.text1) {
												new_supplier = {...new_supplier, text1: text1}
											}

											let text2 = supplier.text2;
											if (supplier_title && supplier_title.text2) {
												new_supplier = {...new_supplier, text2: text2}
											}

											let text3 = supplier.text3;
											if (supplier_title && supplier_title.text3) {
												new_supplier = {...new_supplier, text3: text3}
											}

											let number1 = supplier.number1;
											if (supplier_title && supplier_title.number1) {
												new_supplier = {...new_supplier, number1: number1}
											}

											let number2 = supplier.number2;
											if (supplier_title && supplier_title.number2) {
												new_supplier = {...new_supplier, number2: number2}
											}

											let number3 = supplier.number3;
											if (supplier_title && supplier_title.number3) {
												new_supplier = {...new_supplier, number3: number3}
											}

											supplier_category_item.suppliers.default.push(new_supplier)
										}
									}
									if (1 || 
										(supplier_category_item && supplier_category_item.suppliers && 
										(
											(supplier_category_item.suppliers.default && (supplier_category_item.suppliers.default.length > 0)) ||
											(supplier_category_item.suppliers.canban && (supplier_category_item.suppliers.canban.length > 0))
										))) {
											supplier_category_list.push(supplier_category_item);
									}
								} else {
									supplier_category_list.push(supplier_category_item);
								}
							} else {
							}
						}
					}
					resolve();					  
				})
			}
		
			const pormises = []
			pormises.push(getProjectSuppliers(project_id))
			await Promise.all(pormises)

      return cb(null, supplier_category_list);

    } catch (error) {
      return cb(error);
    }
	}
}
