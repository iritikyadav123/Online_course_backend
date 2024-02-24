const { Router } = require('express');
const express = require('express');
const jwt = require('jsonwebtoken');
const router = Router();
const bcrypt = require('bcrypt');
const { Admin, Course } = require('../database/db');
const { adminSchema, courseSchema } = require('../zod/index');
const { adminRepeationCheckMiddleware, adminCheckMiddleware, adminTokenCheckMiddleware } = require('../middleware/admin')
const { jwt_secret } = require('../jsonToken')
router.use(express.json());
// Admin routes

// Create the account of admin (signUp)
router.post('/signUp', adminRepeationCheckMiddleware, async function (req, res) {
    const { username, password } = req.body;
    const validation = await adminSchema.safeParse({
        username,
        password
    });
    if (!validation.success) {
        return res.status(400).json({
            error: "Bad Request",
            message: "Admin input data is in an unexpected format."
        });
    }
    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the admin with hashed password
        const admin = await Admin.create({
            username,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Admin has been successfully added to the database",
            adminId: admin._id
        });
    } catch (error) {
        console.error("Error adding admin:", error);
        res.status(500).json({
            error: "Internal Server Error",
            message: "Unable to add admin to the database. Please try again later."
        });
    }
});


//  crate a jsonweb token for the admin

router.post('/signIn', adminCheckMiddleware, async function (req, res) {
    const { username, password } = req.headers; // Change to req.body to get username and password from the request body
    try {
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(403).json({
                msg: "Admin not found."
            });
        }
        const hash = admin.password;
        const adminPasswordDecrypt = await bcrypt.compare(password, hash); // Await bcrypt.compare to get the comparison result
        console.log(adminPasswordDecrypt)
        if (!adminPasswordDecrypt) {
            return res.status(403).json({
                msg: "Incorrect password."
            });
        }
        const adminToken = jwt.sign({ username }, jwt_secret); // Sign only the username to the token, avoid storing sensitive data in the token
        if (!adminToken) {
            return res.status(503).json({
                msg: "Unable to create JSON Web Token."
            });
        }
        res.json({
            adminToken
        });
    } catch (error) {
        console.error("Error signing in admin:", error);
        return res.status(503).json({
            msg: "Unable to generate JWT token. An error occurred."
        });
    }
});
router.post('/course', adminTokenCheckMiddleware, async function (req, res) {
    const authorization = req.headers.authorization;
    const { title, description, price, imageLink } = req.body;
    const token = authorization.split(" ")[1];
    const tokenVerify = jwt.verify(token, jwt_secret);
    const userName = tokenVerify.username;
    let adminId = "";
    const admin = await Admin.findOne({ username: userName });
    if (!admin) {
        return res.status(404).json({
            msg: "Your admin is not in the database"
        });
    }
    adminId = admin._id;
    const courseValidation = courseSchema.safeParse({
        title,
        description,
        price,
        imageLink
    });
    if (!courseValidation.success) {
        return res.status(403).json({
            msg: "Your course format is not in proper way"
        });
    }
    const course = await Course.create({
        title,
        description,
        price,
        imageLink,
        adminId: adminId
    });
    if (course) {
        return res.json({
            msg: "Your course has been saved in the database",
            courseId: course._id
        });
    }
});
router.get('/courses', adminTokenCheckMiddleware, async function (req, res) {
    const authorization = req.headers.authorization;
    const token = authorization.split(" ")[1];
    const tokenVerify = jwt.verify(token, jwt_secret);
    const userName = tokenVerify.username;
    let adminId = "";
    const admin = await Admin.findOne({ username: userName });
    if (!admin) {
        return res.status(404).json({
            msg: "Your admin is not in the database"
        });
    }
    adminId = admin._id;
    const course = await Course.find({ adminId: adminId });
    if (course) {
        res.json({
            courses: course
        })
    } else {
        res.status(503).json({
            msg: "unable to fatch your data"
        })
    }
})
router.delete('/course/delete', adminTokenCheckMiddleware, async function (req, res) {
    const courseId = req.body.courseId;
    const course = await Course.deleteOne({ _id: courseId });
    if (!course) {
        return req.status.json({
            msg: "unable deletee your course",
        })
        res.json({
            msg: "your course has been deleted",
        })
    }
})
module.exports = router;
