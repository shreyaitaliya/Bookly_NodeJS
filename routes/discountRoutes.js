const express = require('express');

const routes = express.Router();
const joi = require('joi');
const { validateRequest } = require('../middelware/validation');

// Discount Controller
const discountController = require('../controller/discountController');

const tokenVerify = require('../middelware/jwtToken');

const AddDiscountSchema = joi.object({
    title: joi.string().required(),
    state: joi.number().integer().valid(0, 1).default(0).required(),
    discount: joi.number().required(),
    deducation: joi.number().integer().required(),
    numberperson: joi.string().required(),
    equalexceeds: joi.number().integer().valid(1, 2, 3).required(),
    service: joi.string().max(50).required(),
    IsActive: joi.boolean().optional().default(true),
})

const addDiscount = (req, res, next) => {
    validateRequest(req, res, next, AddDiscountSchema);
}

const UpdateDiscountSchema = joi.object({
    title: joi.string().optional(),
    state: joi.number().integer().valid(0, 1).default(0).optional(),
    discount: joi.number().optional(),
    deducation: joi.number().integer().optional(),
    numberperson: joi.string().optional(),
    equalexceeds: joi.number().integer().valid(1, 2, 3).optional(),
    service: joi.string().max(50).optional(),
    IsActive: joi.boolean().optional().default(true),
})

const updateDiscount = (req, res, next) => {
    validateRequest(req, res, next, UpdateDiscountSchema);
}

// Routes
routes.post('/', tokenVerify, addDiscount, discountController.AddDiscount);

routes.get('/', tokenVerify, discountController.GetList);

routes.get('/:id', tokenVerify, discountController.GetByID);

routes.put('/:id', tokenVerify, updateDiscount, discountController.UpdateDiscount);

routes.delete('/:id', tokenVerify, discountController.DeleteDiscount);

module.exports = routes