const express = require('express');

const routes = express.Router();
const joi = require('joi');
const { validateRequest } = require('../middelware/validation')

// Notificaion Controller
const notificationcontroller = require('../controller/notificationController');

// Token With Jwt
const tokenVerify = require('../middelware/jwtToken');

const AddNotificationSchema = joi.object({
    title: joi.string().max(255).required(),
    state: joi.number().integer().valid(0, 1).default(0),
    type: joi.number().integer().valid(1, 2, 3, 4, 5, 6, 7).optional(),
    status: joi.number().integer().valid(1, 2, 3, 4, 5, 6, 7).default(2),
    service: joi.array().items(joi.string().max(255)).min(1).required(),
    recipients: joi.array().items(joi.string().valid('1', '2', '3', '4')).min(1).default(['4']),
    email: joi.string().email().optional(),
    description: joi.string().max(255).required(),
    IsActive: joi.boolean().optional(),
})

const addNotification = (req, res, next) => {
    validateRequest(req, res, next, AddNotificationSchema);
}

const UpdateNotificationSchema = joi.object({
    title: joi.string().max(255).optional(),
    state: joi.number().integer().valid(0, 1).default(0),
    type: joi.number().integer().valid(1, 2, 3, 4, 5, 6, 7).optional(),
    status: joi.number().integer().valid(1, 2, 3, 4, 5, 6, 7).default(2),
    service: joi.string().max(255).optional(),
    recipients: joi.string().valid('1', '2', '3', '4').default('1'),
    email: joi.string().email().optional(),
    description: joi.string().max(255).optional(),
    IsActive: joi.boolean().optional(),
})

const updateNotification = (req, res, next) => {
    validateRequest(req, res, next, UpdateNotificationSchema);
}

// Routes
routes.post('/', tokenVerify, addNotification, notificationcontroller.AddNotification);

routes.get('/alldata', tokenVerify, notificationcontroller.GetAllData)

routes.get('/', tokenVerify, notificationcontroller.GetList)

routes.post('/save', tokenVerify, notificationcontroller.GetConfiguration);

routes.get('/:id', notificationcontroller.GetByID);

routes.put('/:id', updateNotification, notificationcontroller.update);

routes.delete('/:id', notificationcontroller.Delete);

module.exports = routes