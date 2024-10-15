const express = require('express');

const routes = express.Router();
const path = require('path');
const joi = require('joi');
const { validateRequest } = require('../middelware/validation');

// Service Controller 
const serviceController = require('../controller/serviceController');

// Token Verification By JWt
const tokenverify = require('../middelware/jwtToken');

// Image Upload Using Multer
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

const upload = multer({ storage: storage }).single('image');


const AddServiceSchema = joi.object({
    title: joi.string().max(50).required(),
    category: joi.string().max(50).required(),
    color: joi.string().max(50).required(),
    visibility: joi.number().integer().valid(1, 2).default(1),
    price: joi.number().integer().required(),
    providers: joi.string().required(),
    providerspreference: joi.string().max(50).required(),
    periodbefore: joi.string().max(50).required(),
    periodafter: joi.string().max(50).required(),
    randomstaff: joi.number().integer().valid(0, 1).default(1),
    paymentmethod: joi.number().integer().valid(0, 1, 2).default(0),
    info: joi.string().max(50).required(),
    duration: joi.number().integer().required(),
    timelegth: joi.string().required(),
    beforePaddingTime: joi.string().max(50).required(),
    afterPaddingTime: joi.string().max(50).required(),
    IsActive: joi.boolean().optional(),
})

const addService = (req, res, next) => {
    validateRequest(req, res, next, AddServiceSchema);
}

const UpdateServiceSchema = joi.object({
    title: joi.string().max(50).optional(),
    category: joi.string().max(50).optional(),
    color: joi.string().max(50).optional(),
    visibility: joi.number().integer().valid(1, 2).default(1),
    price: joi.number().integer().required(),
    providers: joi.string().email().optional(),
    providerspreference: joi.string().max(50).optional(),
    periodbefore: joi.string().max(50).optional(),
    periodafter: joi.string().max(50).optional(),
    randomstaff: joi.number().integer().valid(0, 1).default(1),
    paymentmethod: joi.number().integer().valid(0, 1, 2).default(0),
    info: joi.string().max(50).optional(),
    duration: joi.number().integer().optional(),
    timelegth: joi.string().optional(),
    beforePaddingTime: joi.string().max(50).optional(),
    afterPaddingTime: joi.string().max(50).optional(),
    IsActive: joi.boolean().optional(),
})

const UpdateService = (req, res, next) => {
    validateRequest(req, res, next, UpdateServiceSchema);
};

//routes 

routes.post('/', tokenverify, upload, addService, serviceController.AddService);

routes.get('/getdata', tokenverify, serviceController.GetData);

routes.get('/', tokenverify, serviceController.GetAllData);

routes.post('/savecolumn', tokenverify, serviceController.GetConfiguration);

routes.get('/:id', serviceController.GetByID);

routes.put('/:id', upload, tokenverify, UpdateService, serviceController.UpdateService);

routes.delete('/:id', serviceController.DeleteService);

module.exports = routes