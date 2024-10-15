const { DataTypes, Op, where } = require("sequelize");
const db = require('../config/db');
const sequelize = db.sequelize;
const cancelModel = require('../models/canceltionModel')(sequelize, DataTypes);
const cancelhistoryModel = require('../models/cancelHistoryModel')(sequelize, DataTypes);

// AddCancel
const AddCancel = async (req, res) => {
    try {
        const { title, color, reson } = req.body;
        const createdBy = req.user.username;
        const LastModifiedBy = req.user.username;

        const AddCancel = await cancelModel.create({ title, color, reson, createdBy, LastModifiedBy })

        return res.status(200).send({
            success: true,
            message: 'Canceltion Form Added Successfully..',
            Data: AddCancel
        })

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        })
    }
}
      
// GetAll Data
const GetAllData = async (req, res) => {
    try {
        const FindData = await cancelModel.findAll({})
        if (!FindData) {
            return res.status(400).send({
                success: false,
                message: 'No More Canceltion Data..'
            })
        }
        return res.status(200).send({
            success: true,
            message: 'View Canceltion Data Successfully..',
            Data: FindData
        })

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        })
    }
}      

// Delete Data
const Delete = async (req, res) => {
    try {
        const id = req.params.id

        const FindData = await cancelModel.findOne({ where: { canceltionID: id, IsDeleted: 0 } })
        if (!FindData) {
            return res.status(400).send({
                success: false,
                message: 'Cancelation Not Found...',
            })
        }

        const HistoryCancel = await cancelhistoryModel.create({
            canceltionID: FindData.canceltionID,
            title: FindData.title,
            color: FindData.color,
            reson: FindData.reson,
            BackupCreatedBy: FindData.createdBy,
            BackupCreatedOn: new Date(),
        });


        const changeData = await cancelModel.update({ IsDeleted: 1 }, { where: { canceltionID: id } })

        if (changeData[0] === 0) {
            return res.status(400).send({
                success: false,
                message: 'No Canceltion Were Deleted..',
            })
        }

        return res.status(200).send({
            success: true,
            message: 'Cancelation Deleted Sucessfully...',
        })

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        })
    }
}

module.exports = ({ AddCancel, GetAllData, Delete })  