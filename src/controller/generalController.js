import moment from 'moment';
const sequelize = require('../models');
const { SupplierDepartment, SupplierJobTitle, SupplierUnitType, SupplierType, TaskType, TaskStatus, BudgetType, BudgetStatus, Country, State, Props, Clothes, Makeups, Specials, Others, SceneLocation, ScenePlace, SceneTime, SceneTimeDef, SceneStatus, ProjectStatus, PermissionType, PermissionStatus, Company } = sequelize.models;

const GeneralController = {

	getAllList: async (req, res, next) => {

		try {

			const companies = await Company.findAll({});
			const supplier_type = await SupplierType.findAll({});
			const supplier_department = await SupplierDepartment.findAll({});
			const supplier_job_title = await SupplierJobTitle.findAll({});
			const supplier_unit_type = await SupplierUnitType.findAll({});
			const task_type = await TaskType.findAll({});
			const task_status = await TaskStatus.findAll({});
			const budget_type = await BudgetType.findAll({});
			const budget_status = await BudgetStatus.findAll({});
			const props = await Props.findAll({});
			const clothes = await Clothes.findAll({});
			const makeups = await Makeups.findAll({});
			const specials = await Specials.findAll({});
			const others = await Others.findAll({});
			const scene_status = await SceneStatus.findAll({});
			const project_status = await ProjectStatus.findAll({});
			const permission_type = await PermissionType.findAll({});
			const permission_status = await PermissionStatus.findAll({});
			const scene_place = await ScenePlace.findAll({});
			
			let lists = {
				companies: companies,
				supplier_type: supplier_type,
				supplier_department: supplier_department,
				supplier_job_title: supplier_job_title,
				supplier_unit_type: supplier_unit_type,
				task_type: task_type,
				task_status: task_status,
				budget_type: budget_type,
				budget_status: budget_status,
				props: props,
				clothes: clothes,
				makeups: makeups,
				specials: specials,
				others: others,
				scene_status: scene_status,
				project_status: project_status,
				permission_type: permission_type,
				permission_status: permission_status,
				scene_place: scene_place
			}
			res.json(lists);
		} catch (err) {
			return res.json({
				response: 1,
				err: err
			})
		}
	},

	getCountries: async (req, res, next) => {
		try {
			let countries = await Country.findAll({});

			let new_countries = [];

			async function getCountryState(country) {

				return new Promise(async (resolve,reject)=>{

					if (country) {

						if (country && country.state_id && (parseInt(country.state_id) > 0)) {
							let state = await State.findOne({ where: { id: country.state_id } });
							if (state) {
								country = {...country, state: state}
							}
							new_countries.push(country)
							resolve()
						} else {
							if (country) {
								new_countries.push(country)
							} else {
							}
							resolve()
						}
					}
				})
			}

			const pormises = []
			if (countries && (countries.length > 0)) {
			  for (var i = 0; i < countries.length; i++) {				
				pormises.push(getCountryState(countries[i]))
			  }
			}

			await Promise.all(pormises)

			return res.json(new_countries)
		} catch (error) {
			console.log('error:',error)
			return res.json({
				response: 1,
				err: error
			})
		}
	},

	getCountry: async (req, res, next) => {
		try {
			let country_id = parseInt(req.params.country_id);

			if (isNaN(country_id) || (country_id <= 0)) {
				country_id = null;
				return res.json({
					response: 2,
					err: "No country id"
				})
			}
			
			let country = await Country.findOne({ where: { id: country_id } });

			if (country && country.state_id && (parseInt(country.state_id) > 0)) {
				let state = await State.findOne({ where: { id: country.state_id } });
				if (state) {
					country = {...country, state: state}
				}
				return res.json(country)
			} else {
				if (country) {
					return res.json(country)
				} else {
					return res.json({
						response: 1,
						err: 'No country found'
					})
				}
			}
		} catch (error) {
			return res.json({
				response: 1,
				err: error
			})
		}
	}

};

export default GeneralController;
