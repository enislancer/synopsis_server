import moment from "moment";
import axios from "axios";
const sequelize = require("../models");
import * as jwt from "jsonwebtoken";
import createError from "http-errors";

const { Company } = sequelize.models;
export const JWT_SECRET = "imgn-secret";
export const JWT_COOKIE_NAME = "imgn-cookie"
const expTokenHours = 3;


const AuthController = {
  signup: async (req, res, next) => {
    try {
      let { ...company } = req.body;
      company = await Company.create(company);

      const token = AuthController.jwtSign(company);

      res.json({ company, token });
    } catch (err) {
      next(err);
    }
  },

  me: async (req, res, next) => {
    try {
      res.json({ user: req.user });
    } catch (err) {
      next(err);
    }
  },

  verifyToken: async (req, res, next) => {
    try {

      //const campaign = await Campaign.findOne({ id: req.params.id });
      //res.json(campaign || null);
      res.json({success: true} || null);
    } catch (err) {
      next(err);
    }
  },
  login: async (req, res, next) => {
    try {

      let token = null;
      let company = null;

      company = await Company.findOne({
        where: {
          url: process.env.NODE_ENV === 'production' ? req.headers.origin : 'http://local.wp.imgn.co',
        }
      });

      if (!company) {
        throw new createError.BadRequest(JSON.stringify({ msg: "Invalid company" }));
      }

      const siteResponse = await axios.get(`${company.url}/?yt_verify=token`);

      if (!siteResponse.data || !siteResponse.data.token) {
        throw new createError.Unauthorized(JSON.stringify({ msg: "Invalid credentials" }));
      }

      token = AuthController.jwtSign(company);

      res.json({ token, company });
    } catch (err) {
      next(err);
    }
  },

  jwtSign: (company) => {
    const token = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * expTokenHours,
        data: {
          url: company.url,
          email: company.email,
        }
      },
      JWT_SECRET
    );

    return token;
  }
};

export default AuthController;
