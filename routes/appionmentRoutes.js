const express = require('express');

const routes = express.Router();
const joi = require('joi');
const { validateRequest } = require('../middelware/validation');

// Appionment Controller
const appoinmentController = require('../controller/appoinmentController')

const tokenVerify = require('../middelware/jwtToken');

const AddappionmentSchema = joi.object({
    provider: joi.string().required().max(255),
    service: joi.string().required().max(255),
    date: joi.date().required(),
    starttime: joi.string().optional(),
    endtime: joi.string().optional(),
    customerID: joi.number().integer().required(),
    internalnote: joi.string().optional().max(500),
})

const AddAppoinment = (req, res, next) => {
    validateRequest(req, res, next, AddappionmentSchema);
}

const UpdateappionmentSchema = joi.object({
    provider: joi.string().optional().max(255),
    service: joi.string().optional().max(255),
    date: joi.date().optional(),
    starttime: joi.string().optional(),
    endtime: joi.string().optional(),
    customerID: joi.number().integer().required(),
    internalnote: joi.string().optional().max(500),
})

const updateAppoinment = (req, res, next) => {
    validateRequest(req, res, next, UpdateappionmentSchema);
}

// Routes
routes.post('/', tokenVerify, AddAppoinment, appoinmentController.AddAppoinment);

routes.get('/getalldata', tokenVerify, appoinmentController.GetAllListData);

routes.get('/', tokenVerify, appoinmentController.GetList);

routes.post('/save', tokenVerify, appoinmentController.GetConfiguration);

routes.get('/:id', appoinmentController.GetByID);

routes.put('/:id', tokenVerify, updateAppoinment, appoinmentController.Update);

routes.delete('/:id', appoinmentController.Delete);

routes.get('/export', appoinmentController.exportAppointmentsToCSV);

module.exports = routes    