const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

module.exports = (sequelize, DataTypes) => {
    const appointmenthistory = sequelize.define('appointmenthistory', {
        appointmenthistoryID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        appointmentID: {
            type: DataTypes.INTEGER,
        },
        provider: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        service: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        starttime: {
            type: DataTypes.TIME,
            allowNull: true,
        },
        endtime: {
            type: DataTypes.TIME,
            allowNull: true,
        },
        customerID: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        internalnote: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        BackupCreatedBy: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        BackupCreatedOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
    }, {
        timestamps: false,
        tableName: "appointmenthistory",
    });
    return appointmenthistory;
};   