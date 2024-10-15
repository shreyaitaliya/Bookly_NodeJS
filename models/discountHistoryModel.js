const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

module.exports = (sequelize, DataTypes) => {
    const discounthistory = sequelize.define('discounthistory', {
        discounthistoryID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        discountID: {
            type: DataTypes.INTEGER,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        state: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            validate: {
                isIn: [[0, 1]]
            },
            comment: "'0 DISABLED', '1 ENABLED'",
        },
        discount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        deducation: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        startdate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        enddate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        numberperson: { // condition for number of person
            type: DataTypes.STRING,
            allowNull: false,
        },
        equalexceeds: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        service: {
            type: DataTypes.STRING,
            allowNull: false,
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
        tableName: "discounthistory",
    });
    return discounthistory;
};   