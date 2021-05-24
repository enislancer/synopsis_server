import * as models from "../../models";
import createError from "http-errors";
import { JWT_SECRET } from "../confirmUser.middleware";
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import randomize from 'randomize';
import validator from 'validator';
import * as bcrypt from 'bcrypt-nodejs';
import sendEmail from "../../utils/sendEmail.util";
import { v4 as uuidv4 } from 'uuid';

const { User } = models.models;

const register = (req, res, next) => {
    try {
        passport.authenticate("local-signup", function (err, user, info) {
            if (err) {
                return next(err);
            } else if (!user) {
                console.log(info);
                if (info !== undefined) {
                    res.send({ error: info.message });
                }
            } else {
                req.logIn(user, function (err) {
                    if (err) {
                        res.send(err);
                    }
                    console.log(user);
                    res.send({ user });
                });
            }
        })(req, res, next);
    } catch (error) {
        next(error);
    }
}

// passport.use(
//     "local-signup",
//     new LocalStrategy({ passReqToCallback: true },
//         async (req, username, password, done) => {
//             let user;
//             try {
//                 user = await User.findOne({ where: { email: username } });
//                 if (user) {
//                     return done(null, false, {
//                         message: "That email is already taken."
//                     });
//                 }
//             } catch (error) {
//                 return done(error);
//             }

//             if (!validator.isEmail(username)) {
//                 return done(null, false, { message: "Not A Valid Email" });
//             }

//             const verify_email_token = uuidv4();;
//             user = await User.create({
//                 email: username,
//                 verify_email_token,
//                 password: bcrypt.hashSync(password)
//             });

//             try {
//                 // const response = await sendEmail(username, 'david@imgn.co', 'Verify your email', `<a href='http://imgn.co/yt=${verify_email_token}'></a>`);
//             } catch (error) {
//                 return done(error);
//             }

//             return done(null, { user });
//         }
//     )
// );

export default register;