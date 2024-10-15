const express = require('express');

const routes = express.Router();
const joi = require('joi');

const { validateRequest } = require('../middelware/validation');

// Cancel Controller
const cancelController = require('../controller/canceltionController')

// VerifyToken
const Verifytoken = require('../middelware/jwtToken');

const AddcancelSchema = joi.object({
    title: joi.string().max(255).optional(),
    color: joi.string().max(50).optional(), 
    reson: joi.string().min(1).required(),
    IsDeleted: joi.boolean().optional().default(false)
})

const addcancel = (req, res, next) => {
    validateRequest(req, res, next, AddcancelSchema);
}

// Routes
routes.post('/', Verifytoken, addcancel, cancelController.AddCancel);

routes.get('/', Verifytoken, cancelController.AddCancel);

routes.delete('/:id', cancelController.Delete);

module.exports = routes;