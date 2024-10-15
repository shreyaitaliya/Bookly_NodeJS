const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

module.exports = (sequelize, DataTypes) => {
    const servicehistory = sequelize.define('servicehistory', {
        servicehistoryID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        serviceID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        color: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        visibility: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            validate: {
                isIn: [[1, 2]]
            },
            comment: "'1 PUBLIC', '2 PRIVATE'",
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        providers: {  // staff
            type: DataTypes.STRING,
            allowNull: true,
        },
        providerspreference: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        periodbefore: {  // before and after set number of the day appointment
            type: DataTypes.STRING,
            allowNull: true,
        },
        periodafter: {  // before and after set number of the day appointment
            type: DataTypes.STRING,
            allowNull: true,
        },
        randomstaff: {  // Enable or Disabled to pick a random staff 
            type: DataTypes.INTEGER,
            defaultValue: 1, // Changed to 1 (enabled)
            validate: {
                isIn: [[0, 1]]
            },
            comment: "'0 DISABLED', '1 ENABLED'"
        },
        paymentmethod: {
            type: DataTypes.INTEGER,
            defaultValue: 0, // Changed to 0 (default)
            validate: {
                isIn: [[0, 1, 2]]
            },
            comment: "'0 DEFAULT', '1 LOCAL', '2 PAYPAL'"
        },
        info: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        timelegth: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        beforePaddingTime: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        afterPaddingTime: {
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
        tableName: "servicehistory",
    });
    return servicehistory;
};   