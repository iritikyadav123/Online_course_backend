const { Router } = require('express');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Course } = require('../database/db');
const { userSchema} = require('../zod/index');
const {userRepeationCheckMiddleware, userCheckMiddleware, userTokenCheckMiddleware} = require('../middleware/user');
const { jwt_secret } = require('../jsonToken')
const router = Router();
router.use(express.json());   

router.post('/signUp',userRepeationCheckMiddleware, async function (req, res) {
    const { username, password } = req.body;
    const validation = await userSchema.safeParse({
        username,
        password
    });
    if (!validation.success) {
        return res.status(400).json({
            error: "Bad Request",
            message: "user input data is in an unexpected format."
        });
    }
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the admin with hashed password
        const user = await User.create({
            username,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Admin has been successfully added to the database",
            userId: user._id
        });
    } catch (error) {
        console.error("Error adding admin:", error);
        res.status(500).json({
            error: "Internal Server Error",
            message: "Unable to add user to the database. Please try again later."
        });
    }
});




//  crate a jsonweb token for the admin

router.post('/signIn', userCheckMiddleware, async function (req, res) {
    const { username, password } = req.headers; // Change to req.body to get username and password from the request body
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(403).json({
                msg: "user not found."
            });
        }
        const hash = user.password;
        const userPasswordDecrypt = await bcrypt.compare(password, hash); // Await bcrypt.compare to get the comparison result
        console.log(userPasswordDecrypt)
        if (!userPasswordDecrypt) {
            return res.status(403).json({
                msg: "Incorrect password."
            });
        }
        const userToken = jwt.sign({ username }, jwt_secret); // Sign only the username to the token, avoid storing sensitive data in the token
        if (!userToken) {
            return res.status(503).json({
                msg: "Unable to create JSON Web Token."
            });
        }
        res.json({
            userToken
        });
    } catch (error) {
        console.error("Error signing in admin:", error);
        return res.status(503).json({
            msg: "Unable to generate JWT token. An error occurred."
        });
    }
});

router.get('/courses', async function(req, res) {
    try {
        const courses = await Course.find({});
        if (courses) {
            return res.json(courses); // Return courses as JSON response
        } else {
            return res.status(404).json({ message: "No courses found" });
        }
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
});


router.put('/course/choose', userTokenCheckMiddleware,async function(req,res) {
    const authorization = req.headers.authorization;
    const courseId = req.body.courseId;
    const { title, description, price, imageLink } = req.body;
    const token = authorization.split(" ")[1];
    const tokenVerify = jwt.verify(token, jwt_secret);
    const userName = tokenVerify.username;
    try{
        const course = await User.updateOne({username : userName},
            {
                "$push" : {
                    courseId : courseId
                }
            })
            if(course) {
                res.json({
                    msg : "your course added sucess fully",
                })
            } 

    }catch{
        res.status(503).json({
            msg : "Unable to add in user Profile"
        })
    }
})



module.exports = router;