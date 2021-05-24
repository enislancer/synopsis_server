import axios from 'axios';
const sequelize = require('../models');
const { Pay, Company } = sequelize.models;

//const API_URL = 'https://api.imgn.co/';
const API_URL = 'http://api.imgn.co/';
const CLIENT = 'ASkGgynr2pLneu83w3wrFDfd7ARVW5zgI74Lzvv91uXjYzkJ49rhvDbmzYSYASJ2Ht4wu3kN8Cft7aag';
const SECRET = 'EH9-rYsv0FHtvhd4jzFGfOURxMl7q6d1FjCB1SOMID_yRUvN37O7y7sb7uZmlLwC1r22BL_MXcjCO9b9';
const PAYPAL_API = 'https://api.paypal.com';

const payController = {
	create: async (req, res, next) => {
		try {
			var amount = req.body.amount;
			console.log('Payment Controller:',req.body);
			const data = {
				intent: 'sale',
				payer: {
					payment_method: 'paypal'
				},
				transactions: [
					{
						amount: {
							total: amount,
							currency: 'USD'
						}
					}
				],
				redirect_urls: {
					return_url: `${API_URL}/payment/cancel`,
					cancel_url: `${API_URL}/payment/return`
				}
			};

			const auth = {
				username: CLIENT,
				password: SECRET
			};

			const options = {
				method: 'post',
				headers: {
					'Content-Type': 'application/json'
				},
				data: data,
				auth: auth,
				url: `${PAYPAL_API}/v1/payments/payment`
			};

			axios(options)
				.then((response) => {
					res.json({ id: response.data.id });
				})
				.catch((err) => {
					console.log(err);
				});
		} catch (err) {
			next(err);
		}
	},

	execute: async (req, res, next) => {
		try {
			let amount = req.body.amount;
			let credit = req.body.credit;
			let paymentID = req.body.paymentID;
			let payerID = req.body.payerID;
			let company_id = req.body.companyId;

			console.log([ 'company_id', company_id ]);
			const data = {
				payer_id: payerID,
				transactions: [
					{
						amount: {
							total: amount,
							currency: 'USD'
						}
					}
				]
			};

			const auth = {
				username: CLIENT,
				password: SECRET
			};

			const options = {
				method: 'post',
				headers: {
					'Content-Type': 'application/json'
				},
				data: data,
				auth: auth,
				url: `${PAYPAL_API}/v1/payments/payment/${paymentID}/execute`
			};

			axios(options)
				.then((response) => {
					Payment.create({
						payment_id: response.data.id,
						company_id: company_id,
						amount: amount,
						payer_email: response.data.payer.payer_info.email,
						payer_first_name: response.data.payer.payer_info.first_name,
						payer_last_name: response.data.payer.payer_info.last_name,
						payer_paypal_id: response.data.payer.payer_info.payer_id,
						payer_country: response.data.payer.payer_info.country_code,
						credits: credit
					}).then(function(payment) {});

					Company.increment('credits', {
						by: amount,
						where: { id: company_id }
					}).then(function(company) {
						res.json('payment succsess');
					});
				})
				.catch((err) => {
					console.log(err);
				});
		} catch (err) {
			console.log(err);
			next(err);
		}
	},

	cancel: async (req, res, next) => {
		try {
			let test = 'cancel';
			res.json(test);
		} catch (err) {
			console.log(err);
			next(err);
		}
	},

	return: async (req, res, next) => {
		try {
			let test = 'return_url';
			res.json(test);
		} catch (err) {
			next(err);
		}
	}
};

export default payController;
