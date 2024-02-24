const jwt = require('jsonwebtoken');
const { User } = require('../database/db');
const { jwt_secret } = require('../jsonToken')


const userRepeationCheckMiddleware = async (req, res, next) => {
    try {
        const { username } = req.body;
        const User = await User.findOne({ username });
        if (User) {
            return res.status(403).json({
                error: "Forbidden",
                message: "Username already exists. Please choose a different username."
            });
        }
        next();
    } catch (error) {
        console.error("Error checking admin repetition:", error);
        res.status(500).json({
            error: "Internal Server Error",
            message: "Unable to check user repetition. Please try again later."
        });
    }
};


const userCheckMiddleware = async (req, res, next) => {
    try {
        const { username } = req.headers;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(403).json({
                error: "Forbidden",
                message: "Username not exists. Please check Your data."
            });
        }
        next();
    } catch (error) {
        console.error("Error checking admin repetition:", error);
        res.status(500).json({
            error: "Internal Server Error",
            message: "Unable to check admin repetition. Please try again later."
        });
    }
}


const userTokenCheckMiddleware = (req, res, next) => {
    try {
        const authorization = req.headers.authorization;
        const token = authorization.split(" ")[1];
        const tokenVerify = jwt.verify(token, jwt_secret);
        if (tokenVerify.username) {
            next(); // Call next to pass control to the next middleware or route handler
        } else {
            return res.status(403).json({ msg: "Your Token is unverified" });
        }
    } catch (error) {
        console.error("Error verifying token:", error);
        return res.status(500).json({ msg: "Internal Server Error", error });
    }
};
 


module.exports = {
    userRepeationCheckMiddleware,
    userCheckMiddleware,
    userTokenCheckMiddleware

};
