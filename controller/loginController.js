const { DataTypes } = require("sequelize");
const db = require('../config/db');
const sequelize = db.sequelize;
const profileModel = require("../models/profilemodel")(sequelize, DataTypes);
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs')

const Login = async (req, res) => {
    try {
        // return res.json(req.body)
        const { username, newpassword } = req.body;

        // Find user by username
        const user = await profileModel.findOne({ where: { username } });
        if (!user) {
            return res.status(401).send({ message: 'Invalid username or password' });
        }

        // Check if the password matches (plain text comparison)
        if (user.newpassword !== newpassword) {
            return res.status(401).send({ message: 'Invalid username or password' });
        }

        // // Create JWT Token
        const token = jwt.sign({ id: user.id, profileuser: user }, 'bookly', { expiresIn: '12365478900000s' });

        return res.status(200).send({
            message: 'Login successful',
            success: true,
            Token: token,
        });

    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).send({
            success: false,
            message: error.message
        });
    }
};

module.exports = { Login };
