const { DataTypes, where } = require("sequelize");
const db = require('../config/db');
const sequelize = db.sequelize;
const profileModel = require("../models/profilemodel")(sequelize, DataTypes);
const historyprofilemodel = require("../models/profileHistoryModel")(sequelize, DataTypes);
const fs = require('fs')

//Add Profile
const AddProfile = async (req, res) => {
    try {
        const { username, firstname, lastname, nickname, displaynamepublicklyas, email, facebook, twitter, linkedin, dribble, google, whatsapp, customMessage, biographicalinfo, newpassword, newpasswordname } = req.body;

        const addData = await profileModel.create({ username, firstname, lastname, nickname, displaynamepublicklyas, email, facebook, twitter, linkedin, dribble, google, whatsapp, customMessage, biographicalinfo, image: req.file?.path || "", newpassword, newpasswordname })

        return res.status(200).send({
            message: 'Profile Created SUcessfully..',
            sucess: true,
            addData
        })

    } catch (error) {
        console.log(error);
        return res.status(500).send({ error });
    }
}

//GetByeID Profile
const GetByID = async (req, res) => {
    try {
        const id = req.params.id;
        // return res.json(id);

        // Check if id is undefined or null
        if (!id) {
            return res.status(400).send({
                success: false,
                message: 'Missing or invalid Profile ID in request parameters'
            });
        }

        const profile = await profileModel.findOne({
            where: { profileID: id }
        });

        // Corrected condition to check if the profile was not found
        if (!profile) {
            return res.status(404).send({
                success: false,
                message: 'Profile Not Found...'
            });
        }

        return res.status(200).send({
            success: true,
            message: 'Profile Retrieved Successfully...',
            data: profile
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: 'An error occurred while retrieving the profile.',
            error: error.message,
        });
    }
};

// Update Profile

///<<<<<<<<-----------------pending replace image ------------------------->>>>>>>>>>///
const UpdateProfile = async (req, res) => {
    try {
        const id = req.params.id;

        const { firstname, lastname, nickname, displaynamepublicklyas, email, facebook, twitter, linkedin, dribble, google, whatsapp, customMessage, biographicalinfo, newpassword, newpasswordname } = req.body;

        const existingProfile = await profileModel.findByPk(id);

        if (!existingProfile) {
            return res.status(404).send({
                message: 'Profile not found',
                success: false
            });
        }

        // Save old data to the history table
        await historyprofilemodel.create({
            profileID: existingProfile.profileID,
            username: existingProfile.username,
            firstname: existingProfile.firstname,
            lastname: existingProfile.lastname,
            nickname: existingProfile.nickname,
            displaynamepublicklyas: existingProfile.displaynamepublicklyas,
            email: existingProfile.email,
            facebook: existingProfile.facebook,
            twitter: existingProfile.twitter,
            linkedin: existingProfile.linkedin,
            dribble: existingProfile.dribble,
            google: existingProfile.google,
            whatsapp: existingProfile.whatsapp,
            customMessage: existingProfile.customMessage,
            biographicalinfo: existingProfile.biographicalinfo,
            image: existingProfile.image,
            newpassword: existingProfile.newpassword,
            newpasswordname: existingProfile.newpasswordname,
        });

        // Update with new data (including image if uploaded)
        const updatedData = await existingProfile.update({
            firstname,
            lastname,
            nickname,
            displaynamepublicklyas,
            email,
            facebook,
            twitter,
            linkedin,
            dribble,
            google,
            whatsapp,
            customMessage,
            biographicalinfo,
            image: existingProfile.image,  // Ensure new image is saved if uploaded
            newpassword,
            newpasswordname
        });

        return res.status(200).send({
            message: 'Profile updated successfully.',
            success: true,
            updatedData
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send({ error });
    }
};


module.exports = ({ AddProfile, GetByID, UpdateProfile })