const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

module.exports = (sequelize, DataTypes) => {
    const staffhistory = sequelize.define('staffhistory', {
        staffhistoryID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        staffID: {
            type: DataTypes.INTEGER,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        user: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        info: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        color: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        visibility: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                isIn: [[1, 2, 3]]
            },
            comment: "'1 PUBLIC', '2 PRIVATE', '3 ARCHIVE'",
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        paymentmethod: {
            type: DataTypes.STRING,
            defaultValue: false,
            validate: {
                isIn: [[0, 1]]
            },
            comment: "'0 DEFAULT 1 CUSTOM'"
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
        tableName: "staffhistory",
    });
    return staffhistory;
};   