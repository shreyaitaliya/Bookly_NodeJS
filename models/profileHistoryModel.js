const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

module.exports = (sequelize, DataTypes) => {
    const profilehistory = sequelize.define('profilehistory', {
        profilehistoryID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        profileID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        firstname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        lastname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        nickname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        displaynamepublicklyas: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        facebook: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        twitter: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        linkedin: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        dribble: {    
            type: DataTypes.STRING,
            allowNull: false,
        },
        google: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        whatsapp: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        customMessage: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        biographicalinfo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        newpassword: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        newpasswordname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        timestamps: false,
        tableName: "profilehistory",
    });

    return profilehistory;
};   