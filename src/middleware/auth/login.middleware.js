import * as models from "../../models";
import { compareHash } from "../../utils/compareHash";
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

const { User } = models;

const login = (req, res, next) => {
    try {
        passport.authenticate("local", function (err, user, info) {
            if (err) {
                return next(err);
            }

            if (!user) {
                if (info !== undefined) {
                    res.send({ error: info.message });
                }
                return;
            }

            req.logIn(user, function (err) {
                if (err) {
                    res.send({ error: err });
                }
                req.session.User = user;
                res.send({ user });
            });

        })(req, res, next);
    } catch (error) {
        next(error);
    }
}

// Use the LocalStrategy within Passport to login/”signin” user.
// passport.use(
//     new LocalStrategy(async (username, password, done) => {
//         try {
//             const user = await User.findOne({ where: { email: username } });
//             if (!user) {
//                 return done(null, false, { message: "Wrong credentials" });
//             }

//             const isMatch = await compareHash(password, user.password);

//             if (isMatch) {
//                 return done(null, user);
//             } else {
//                 return done(null, false, { message: "Wrong credentials" });
//             }

//         } catch (error) {
//             done(error);
//         }

//     })
// );

export default login;