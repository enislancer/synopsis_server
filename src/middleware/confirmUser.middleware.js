const sequelize = require('../models');
import * as jwt from 'jsonwebtoken';
import createError from 'http-errors';

import AppError from '../utils/AppError';
export const JWT_SECRET = 'yt-secret-';

const { Company, UserCompany, User } = sequelize.models;
const httpStatus = require('http-status');

const confirmUser = (needLoggedUser) => {
	return async (req, res, next) => {
		try {
			return next();

			let token = req.headers['x-access-token'] || req.headers['authorization'];

			if (token && token.startsWith('Bearer ')) {
				token = token.slice(7, token.length);
			} else {
				token = null;
			}

			if (!token) {
				if (!needLoggedUser) return next();

				//throw new createError.Unauthorized(JSON.stringify({ msg: "Missing permissions" }));
				throw new AppError(httpStatus.UNAUTHORIZED, 'Missing permissions');
			}

			const decode = jwt.verify(token, JWT_SECRET);

			if (process.env.NODE_ENV === 'production' && decode.data.url !== req.headers.origin) {
				console.error({
					decode_url: decode.data.url,
					request_origin: req.headers.origin
				});
				//throw new createError.Unauthorized(JSON.stringify({ msg: "Invalid request" }));
				throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid request');
			}
			const userCompany = await UserCompany.findOne({
				where: { id: decode.data.id },
				include: [
					{
						association: 'company',
						model: Company,
						required: true
					},
					{
						association: 'user',
						model: User,
						required: true
					}
				]
			});

			if (!userCompany) {
				throw new createError.Unauthorized(JSON.stringify({ msg: 'Missing object' }));
			}

			req.user = {
				user: userCompany.user.dataValues,
				company: userCompany.company.dataValues,
				userCompany: userCompany.dataValues
			};

			next();
		} catch (error) {
			next(error);
		}
	};
};

export default confirmUser;
