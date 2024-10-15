const express = require('express');

const routes = express.Router();
const path = require('path');
const joi = require('joi');
const { validateRequest } = require('../middelware/validation')

// Staff Controller
const staffController = require('../controller/staffController')

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

const upload = multer({ storage: storage }).single('image')


const AddStaffSchema = joi.object({
    name: joi.string().required(),
    user: joi.string().optional(),
    email: joi.string().email().required(),
    phone: joi.number().integer().required(),
    info: joi.string().required(),
    color: joi.string().required(),
    visibility: joi.number().integer().valid(1, 2, 3).required(),
    category: joi.string().optional(),
    paymentmethod: joi.number().integer().valid(0, 1).optional(),
    IsActive: joi.boolean().optional(),
})

const addStaff = (req, res, next) => {
    validateRequest(req, res, next, AddStaffSchema);
}

const UpdateStaffSchema = joi.object({
    image: joi.string().optional(),
    name: joi.string().optional(),
    user: joi.string().optional(),
    email: joi.string().email().optional(),
    phone: joi.number().integer().optional(),
    info: joi.string().optional(),
    color: joi.string().optional(),
    visibility: joi.number().integer().valid(1, 2, 3).optional(),
    category: joi.string().optional(),
    paymentmethod: joi.number().integer().valid(0, 1).optional(),
    IsActive: joi.boolean().optional(),
})

const updateStaff = (req, res, next) => {
    validateRequest(req, res, next, UpdateStaffSchema);
}

// Staff Routes
routes.post('/', upload, addStaff, tokenverify, staffController.AddStaff);

routes.get('/alldata', tokenverify, staffController.AllData);

routes.get('/', tokenverify, staffController.GetAllData);

routes.post('/saveconfiguration', tokenverify, staffController.GetConfiguration);

routes.get('/:id', staffController.GetByID);

routes.put('/update/:id', upload, tokenverify, updateStaff, staffController.UpdateStaff);

routes.delete('/:id', staffController.DeleteStaff);

module.exports = routes    