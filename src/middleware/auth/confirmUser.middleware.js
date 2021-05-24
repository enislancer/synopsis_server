const models = require("../models");
import createError from "http-errors";
import { JWT_SECRET } from "../confirmUser.middleware";
const { User } = models;

const confirmUser = (req, res, next) => {
    try {
        let token = req.headers['x-access-token'] || req.headers['authorization'];

        if (token && token.startsWith('Bearer ')) {
            token = token.slice(7, token.length);
        } else {
            token = null;
        }

        if (!token) {
            throw new createError.Unauthorized(JSON.stringify({ msg: "Missing permissions" }));
        }

        const decode = jwt.verify(
            token,
            JWT_SECRET
        );

        const user = await User.findOne({ where: { id: decode.data.id, email: decode.data.email } });

        if (!user) {
            throw new createError.Unauthorized(JSON.stringify({ msg: "Missing permissions" }));
        }

        delete user.password;

        req.user = user;

        next(user)

    } catch (error) {
        next(error);
    }
}

export default confirmUser;