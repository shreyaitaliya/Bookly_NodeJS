const express = require('express');

const routes = express.Router();

const path = require('path');
const joi = require('joi');
const { validateRequest } = require('../middelware/validation');

// Controller Customer
const customerController = require('../controller/customerController');

// Verifyed By Token
const verifyToken = require('../middelware/jwtToken');

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

const upload = multer({ storage: storage }).single('image')

const AddCustomerSchema = joi.object({
    user: joi.string().min(3).max(30).optional(),
    name: joi.string().min(1).max(50).required(),
    phone: joi.string().length(10).required(),
    email: joi.string().email().required(),
    tags: joi.number().integer().valid(1, 2).required(),
    dateofbirth: joi.string().required(),
    country: joi.string().min(2).max(50).required(),
    state: joi.string().optional(),
    postalcode: joi.string().min(5).max(10).required(),
    city: joi.string().min(2).max(50).required(),
    streetaddress: joi.string().min(5).max(100).required(),
    additionaladdress: joi.string().optional(),
    streetnumber: joi.string().required(),
    note: joi.string().optional(),
    IsDeleted: joi.boolean().optional().default(false)
})

const addCustomer = (req, res, next) => {
    validateRequest(req, res, next, AddCustomerSchema);
}

const UpdateCustomerSchema = joi.object({
    name: joi.string().min(1).max(50).optional(),
    phone: joi.string().length(10).optional(),
    email: joi.string().email().optional(),
    tags: joi.number().integer().valid(1, 2).optional(),
    dateofbirth: joi.string().optional(),
    country: joi.string().min(2).max(50).optional(),
    state: joi.string().optional(),
    postalcode: joi.string().min(5).max(10).optional(),
    city: joi.string().min(2).max(50).optional(),
    streetaddress: joi.string().min(5).max(100).optional(),
    additionaladdress: joi.string().optional(),
    streetnumber: joi.string().optional(),
    note: joi.string().optional(),
    IsDeleted: joi.boolean().optional().default(false)
})

const updateCustomer = (req, res, next) => {
    validateRequest(req, res, next, UpdateCustomerSchema);
}

// Routes For Staff

routes.post('/', upload, verifyToken, addCustomer, customerController.AddCustomer);

routes.get('/alldata', verifyToken, customerController.GetAllData);

routes.get('/', verifyToken, customerController.GetList);

routes.post('/savecolumn', verifyToken, customerController.GetConfiguration);

routes.get('/:id', customerController.GetByID);

routes.put('/:id', upload, verifyToken, updateCustomer, customerController.UpdateCustomer);

routes.delete('/:id', customerController.DeleteCustomer);

module.exports = routes