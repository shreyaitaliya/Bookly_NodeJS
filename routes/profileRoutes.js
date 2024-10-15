const express = require('express');

const routes = express.Router();

//Image Upload
const multer = require('multer');
const path = require('path');

const joi = require('joi');

const { validateRequest } = require('../middelware/validation')

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

// Joi Validation
const AddProfileSchema = joi.object({
    username: joi.string().max(50).required(),
    firstname: joi.string().max(50).required(),
    lastname: joi.string().max(50).required(),
    nickname: joi.string().max(50).required(),
    displaynamepublicklyas: joi.string().max(50).required(),
    email: joi.string().email().required(),
    facebook: joi.string().max(50).required(),
    twitter: joi.string().max(50).required(), 
    linkedin: joi.string().max(50).required(),
    dribble: joi.string().max(50).required(),
    google: joi.string().max(50).required(),
    whatsapp: joi.string().max(50).required(),
    customMessage: joi.string().max(500).required(),
    biographicalinfo: joi.string().max(500).required(),
    newpassword: joi.string().max(50).required(),
    newpasswordname: joi.string().max(50).required(),
    IsActive: joi.boolean().optional(),
    image: joi.string().optional(),
})

const addProfile = (req, res, next) => {
    validateRequest(req, res, next, AddProfileSchema);
};

const UpdateProfileSchema = joi.object({
    username: joi.string().max(50).required(),
    firstname: joi.string().max(50).required(),
    lastname: joi.string().max(50).required(),
    nickname: joi.string().max(50).required(),
    displaynamepublicklyas: joi.string().max(50).required(),
    email: joi.string().email().required(),
    facebook: joi.string().max(50).required(),
    twitter: joi.string().max(50).required(),
    linkedin: joi.string().max(50).required(),
    dribble: joi.string().max(50).required(),
    google: joi.string().max(50).required(),
    whatsapp: joi.string().max(50).required(),
    customMessage: joi.string().max(500).required(),
    biographicalinfo: joi.string().max(500).required(),
    newpassword: joi.string().max(50).required(),
    newpasswordname: joi.string().max(50).required(),
    IsActive: joi.boolean().optional(),
    image: joi.string().optional(),
})
const UpdateProfile = (req, res, next) => {
    validateRequest(req, res, next, UpdateProfileSchema);
};


//Profile Controller
const profileController = require('../controller/profileController')

//Routes

routes.post('/add', upload, addProfile, profileController.AddProfile);

routes.get('/:id', profileController.GetByID);  
// pending for not attending Params Request -------------------------

// routes.put('/update/:id', upload.single('profileimage'), profileController.update)          

routes.put('/update/:id', upload, UpdateProfile, profileController.UpdateProfile);

module.exports = routes