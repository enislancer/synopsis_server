import moment from 'moment';
const sequelize = require('../models');
const { Supplier, SupplierProject, Project, SupplierType, SupplierCategory, SupplierDepartment, SupplierJobTitle, SupplierUnitType, SupplierTitle, Company } = sequelize.models;
var path = require('path');
var apikey = require("apikeygen").apikey;
var awsSDK = require('../utils/awsSDK')

const SupplierProjectController = {

	create: async (req, res, next) => {
		try {

			let supplier_project_id = parseInt(req.body.supplier_project_id);
			let project_id = parseInt(req.body.project_id);
			let supplier_id = parseInt(req.body.supplier_id);
			let characters = req.body.characters;
			let supplier_unit_type_id = parseInt(req.body.supplier_unit_type_id);
			let supplier_unit_cost = parseInt(req.body.supplier_unit_cost);
			let start_date = req.body.start_date;
			let end_date = req.body.end_date;

			if (!supplier_project_id || isNaN(supplier_project_id) || (supplier_project_id <= 0)) {
				supplier_project_id = 0;
			}

			if (isNaN(project_id) || (project_id <= 0)) {
				project_id = null;
			}

			if (isNaN(supplier_id) || (supplier_id <= 0)) {
				supplier_id = null;
			}

			if (!characters) {
				characters = null;
			}

			if (!pos || isNaN(pos) || (pos <= 0)) {
				pos = 0;
			}

			if (isNaN(supplier_unit_type_id) || (supplier_unit_type_id && (supplier_unit_type_id <= 0))) {
				supplier_unit_type_id = null;
			}

			if (isNaN(supplier_unit_cost) || (supplier_unit_cost && (supplier_unit_cost <= 0))) {
				supplier_unit_cost = null;
			}

			if (!start_date) {
				start_date = null;
			}

			if (!end_date) {
				end_date = null;
			}

			let params = {
			}
			if (project_id && (project_id > 0)) {
				params = {...params, project_id: project_id}
			}
			if (supplier_id && (supplier_id > 0)) {
				params = {...params, supplier_id: supplier_id}
			}
			if (characters) {
				params = {...params, characters: characters}
			}
			if (supplier_unit_type_id && (supplier_unit_type_id > 0)) {
				params = {...params, supplier_unit_type_id: supplier_unit_type_id}
			}			
			if (supplier_unit_cost && (supplier_unit_cost > 0)) {
				params = {...params, supplier_unit_cost: supplier_unit_cost}
			}
			if (start_date) {
				params = {...params, start_date: start_date}
			}
			if (end_date) {
				params = {...params, end_date: end_date}
			}

			let supplier_project = null;
			if (supplier_project_id > 0) {
				supplier_project = await SupplierProject.update(params, {where: { id: supplier_project_id }});
				supplier_project = await SupplierProject.findOne({ where: { id: supplier_project_id }})
				if (supplier_project) {
					supplier_project = supplier_project.dataValues;
				}
			} else {
				if ((project_id > 0) && (supplier_id > 0)) {
					supplier_project = await SupplierProject.findOne({ where: { project_id: project_id, supplier_id: supplier_id }})
				}
				if (supplier_project) {
					supplier_project = await SupplierProject.update(params, {where: { project_id: project_id, supplier_id: supplier_id }});
					supplier_project = await SupplierProject.findOne({ where: { project_id: project_id, supplier_id: supplier_id }})
					if (supplier_project) {
						supplier_project = supplier_project.dataValues;
					}
				} else {
					supplier_project = await SupplierProject.create(params);
					if (supplier_project) {
						supplier_project = supplier_project.dataValues;
					}
				}
			}

			if (supplier_unit_types && (supplier_unit_types.length > 0)) {
				for (let index3 = 0; index3 < supplier_unit_types.length; index3++) {
					let supplier_unit_type = supplier_unit_types[index3].dataValues;
					if (supplier_unit_type && (supplier_unit_type.id == supplier_project.supplier_unit_type_id)) {
						supplier_project = {...supplier_project, supplier_unit_type: supplier_unit_type.supplier_unit_type}
					}
				}
			}				
	
			return res.json({
				response: 0,
				err: "",
				supplier_project: supplier_project
			})
		} catch (err) {
			//next(err);
			console.log(err)
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	delete: async (req, res, next) => {
		try {
			let supplier_project_id = parseInt(req.body.supplier_project_id);

			if (isNaN(supplier_project_id) || (supplier_project_id <= 0)) {
				supplier_project_id = null;
				return res.json({
					response: 2,
					err: 'No supplier project id'
				})
			}

			console.log('delete:',supplier_project_id)

			const response = await SupplierProject.destroy({
				where: { id: supplier_project_id },
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
	}
};


export default SupplierProjectController;
