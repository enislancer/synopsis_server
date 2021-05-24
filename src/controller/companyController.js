import moment from 'moment';
const sequelize = require('../models');
const { Company } = sequelize.models;

const CompanyController = {

	getAll: async (req, res, next) => {
		try {
			let company = null;
			company = await Budget.findAll({});
			res.json(company);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	getCompany: async (req, res, next) => {
		try {
			let company_id = parseInt(req.params.company_id);

			if (isNaN(company_id) || (company_id <= 0)) {
				company_id = 0;
			}

			if (company_id <= 0) {
				return res.json({
					response: 2,
					err: 'No Company Id'
				})
			}

			let company = null;
			company = await Company.findOne({ where: { id: company_id } });
			res.json(company);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	create: async (req, res, next) => {
		try {
			let company_id = parseInt(req.body.company_id);
			let company_name = req.body.company_name;
			let url = req.body.url;
			let company_info = req.body.company_info;

			if (isNaN(company_id) || (company_id <= 0)) {
				company_id = 0;
			}
		
			let params = {
			}
			if (company_name && (company_name.length > 0)) {
				params = {...params, company_name: company_name}
			}
			if (url && (url.length > 0)) {
				params = {...params, url: url}
			}
			if (company_info && (company_info.length > 0)) {
				params = {...params, company_info: company_info}
			}

			let company = null;
			if (company_id > 0) {				
				company = await Company.update(params, {where: { id: company_id }});
				company = params;
			} else {
				company = await Company.create(params);
				if (company) {
					company = company.dataValues;
				}
			}
			//res.json(company);
			return res.json({
				response: 0,
				err: "",
				company: company
			})
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	update: async (req, res, next) => {
		try {
			const { id, ...otherFields } = req.body;
			const response = await Company.update(otherFields, {
				where: { id: req.params.id }
			});
			response = otherFields;
			res.json(response);
		} catch (err) {
			next(err);
		}
	},

	delete: async (req, res, next) => {
		try {
			let company_id = parseInt(req.body.company_id);

			if (isNaN(company_id) || (company_id <= 0)) {
				company_id = null;
				return res.json({
					response: 2,
					err: "No company id"
				})
			}

			console.log('Company Delete:',company_id)
			/*const now = moment().format('YYYY-MM-DD HH:mm:ss');
			const response = await Company.update(
				{ deletedAt: now },
				{
					where: { id: company_id }
				}
			);*/

			/*const response = await Company.destroy(
				{
					where: { id: parseInt(company_id) }
				}
			);*/

			const response = await Company.destroy({
				where: { id: company_id },
				force: true
			})

			return res.json({
				response: 0,
				err: ""
			})

			/*Company.destroy({
				where: {
					id: company_id //this will be your id that you want to delete
					//url: 'https://imgn.com' //this will be your id that you want to delete
				}
			}).then(function(rowDeleted){ // rowDeleted will return number of rows deleted
				console.log('Deleted successfully:',rowDeleted);
				return res.json({
					response: 0,
					err: ""
				})
			}, function(err){
				 console.log('err:',err); 
			});*/
			
			//res.json(response);
		} catch (err) {
			//next(err);
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	getCompany: async (req, res, next) => {
		try {
			let company_id = parseInt(req.params.company_id);

			if (isNaN(company_id) || (company_id <= 0)) {
				company_id = null;
				return res.json({
					response: 2,
					err: "No company id"
				})
			}
			
			const company = await Company.findOne({where: { id: company_id }});

			if (!company) {
				return res.json({
					response: 2,
					err: 'No company found'
				})
			}

			return res.json(company)
			
		} catch (error) {
			return res.json({
				response: 1,
				err: error
			})
		}
	}
};

export default CompanyController;
