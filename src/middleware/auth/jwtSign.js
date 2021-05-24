import { JWT_SECRET } from "../../controller/AuthController";

const jwtSign = (user) => {

    const token = jwt.sign(
        {
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * expTokenHours,
            data: {
                id: user.id,
                email: user.email,
            }
        },
        JWT_SECRET
    );

    return token;
}

export default jwtSign;