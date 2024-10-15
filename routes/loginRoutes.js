const express = require('express');

const routes = express.Router();
const joi = require('joi');
const { validateRequest } = require('../middelware/validation')
const logincontroller = require('../controller/loginController');

const loginSchema = joi.object({
    username: joi.string().min(3).max(30).required(),
    newpassword: joi.string().min(6).max(100).required(),
});

const loginvalidation = (req, res, next) => {
    validateRequest(req, res, next, loginSchema);
}

//Login Routes 

routes.post('/', loginvalidation, logincontroller.Login)

module.exports = routes