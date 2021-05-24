import moment from 'moment';
const sequelize = require('../models');
const { Country, Payment, Project } = sequelize.models;
var path = require('path');
var apikey = require("apikeygen").apikey;
var awsSDK = require('../utils/awsSDK')

const PaymentController = {
	
	getAll: async (req, res, next) => {
		try {
			let payment = null;
			payment = await Payment.findAll({});
			res.json(payment);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	getProjectPayments: async (req, res, next) => {
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

			let payment = null;
			payment = await Payment.findAll({ where: { project_id: project_id } });
			res.json(payment);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	getPayment: async (req, res, next) => {
		try {
			let payment_id = parseInt(req.params.payment_id);

			if (isNaN(payment_id) || (payment_id <= 0)) {
				payment_id = 0;
			}

			if (payment_id <= 0) {
				return res.json({
					response: 2,
					err: 'No Payment Id'
				})
			}

			let payment = null;
			payment = await Payment.findOne({ where: { id: payment_id } });
			if (payment) {
				payment = payment.dataValues;
			}

			res.json(payment);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	create: async (req, res, next) => {
		try {
			let payment_id = parseInt(req.body.payment_id);
			let pos = parseInt(req.body.pos);
			let project_id = parseInt(req.body.project_id);
			let supplier_id = parseInt(req.body.supplier_id);
			let budget_id = parseInt(req.body.budget_id);
			let amount_paid = parseInt(req.body.amount_paid);
			let accounting_id = parseInt(req.body.accounting_id);
			let paid_to = req.body.paid_to;
			let comments = req.body.comments;
			let description = req.body.description;
			let date = req.body.date;

			if (!payment_id || isNaN(payment_id) || (payment_id <= 0)) {
				payment_id = 0;
			}
			if (!budget_id || isNaN(budget_id) || (budget_id <= 0)) {
				budget_id = 0;
			}
			if (!project_id || isNaN(project_id) || (project_id <= 0)) {
				project_id = 0;
			}
			if (!pos || isNaN(pos) || (pos <= 0)) {
				pos = 0;
			}
			if (isNaN(supplier_id) || (supplier_id <= 0)) {
				supplier_id = null;
			}
			if (isNaN(accounting_id) || (accounting_id <= 0)) {
				accounting_id = null;
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

			let vat = ((amount_paid * vat_precent) / 100);

			let params = {
			}
			if (project_id && !isNaN(project_id) && (project_id > 0)) {
				params = {...params, project_id: project_id}
			}
			if (supplier_id && !isNaN(supplier_id) && (supplier_id > 0)) {
				params = {...params, supplier_id: supplier_id}
			}
			if (budget_id && !isNaN(budget_id) && (budget_id > 0)) {
				params = {...params, budget_id: budget_id}
			}
			if (pos && !isNaN(pos) && (pos > 0)) {
				params = {...params, pos: pos}
			}
			if (project_id && !isNaN(project_id) && (project_id > 0)) {
				params = {...params, project_id: project_id}
			}
			if (amount_paid && !isNaN(amount_paid) && (amount_paid > 0)) {
				params = {...params, amount_paid: amount_paid}
			}
			if (description && (description.length > 0)) {
				params = {...params, description: description}
			}
			params = {...params, supplier_id: supplier_id}
			if (accounting_id) {
				params = {...params, accounting_id: accounting_id}
			}
			if (paid_to && (paid_to.length > 0)) {
				params = {...params, paid_to: paid_to}
			}
			if (comments && (comments.length > 0)) {
				params = {...params, comments: comments}
			}
			if (date) {
				params = {...params, date: date}
			}

			let payment = null;
			if (payment_id > 0) {
				payment = await Payment.update(params, {where: { id: payment_id }});
				payment = await Payment.findOne({ where: { id: payment_id }})
				if (payment) {
					payment = payment.dataValues;
				}
			} else {
				payment = await Payment.create(params);
				if (payment) {
					payment = payment.dataValues;
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

			let supplier_job_title_id = 0;
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

			if (payment) {
				if (payment.supplier_name) {
					if (supplier_name && (supplier_name.length > 0)) {
						payment.supplier_name = supplier_name;
					}
				} else {
					payment = {...payment, supplier_name: supplier_name}
				}
				if (payment.supplier_job_title_id) {
					if (supplier_job_title_id && (supplier_job_title_id > 0)) {
						payment.supplier_job_title_id = supplier_job_title_id;
					}
				} else {
					payment = {...payment, supplier_job_title_id: supplier_job_title_id}
				}
				if (payment.supplier_job_title) {
					if (supplier_job_title && (supplier_job_title.length > 0)) {
						payment.supplier_job_title = supplier_job_title;
					}
				} else {
					payment = {...payment, supplier_job_title: supplier_job_title}
				}
			}

			return res.json({
				response: 0,
				err: "",
				payment: payment
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
			let payment_id = parseInt(req.body.payment_id);

			if (isNaN(payment_id) || (payment_id <= 0)) {
				payment_id = null;
				return res.json({
					response: 2,
					err: "No payment id"
				})
			}

			console.log('delete:',payment_id)

			const response = await Payment.destroy({
				where: { id: payment_id },
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

export default PaymentController;
