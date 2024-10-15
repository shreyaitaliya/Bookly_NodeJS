const express = require('express');

const routes = express.Router();
const joi = require('joi');
const path = require('path');
const { validateRequest } = require('../middelware/validation');

const categorycontroller = require('../controller/categoryController');

//Mideleware For Jwt Token
const tokenverify = require('../middelware/jwtToken');

const AddCategorySchema = joi.object({
    category: joi.string().max(30).required(),
    description: joi.string().max(300).optional(),
    IsDeleted: joi.boolean().optional().default(false)
})

const addCategory = (req, res, next) => {
    validateRequest(req, res, next, AddCategorySchema);
}

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

// Category Routes

routes.post('/', upload, tokenverify, addCategory, categorycontroller.AddCategory);

routes.get('/getall', categorycontroller.GetByAll);

routes.get('/:id', categorycontroller.GetByCategoryId);

routes.delete('/:id', categorycontroller.DeleteCategory);

module.exports = routes