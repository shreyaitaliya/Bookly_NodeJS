const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

module.exports = (sequelize, DataTypes) => {
    const payment = sequelize.define('payment', {
        paymentID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        priceofpayment: {
            type: DataTypes.FLOAT,
            allowNull: true,
        },
        customerID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        appointmentID: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        status: {
            type: DataTypes.INTEGER,
            defaultValue: 1,  
            validate: {
                isIn: [[1, 2, 3, 4]]
            },
            comment: "'1 PENDING', '2 APPROVE', '3 CANCELLED', '4 REJECTED",
        },
        createdBy: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        LastModifiedBy: {
            type: DataTypes.STRING
        },
        LastModifiedOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        IsActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        IsDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
    }, {
        timestamps: false,
        tableName: "payment",
    });

    return payment;
};   