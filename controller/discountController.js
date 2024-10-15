const { DataTypes, Op, where } = require("sequelize");
const db = require('../config/db');
const sequelize = db.sequelize;
const discountModel = require('../models/discountModel')(sequelize, DataTypes);
const discounthistoryModel = require('../models/discountHistoryModel')(sequelize, DataTypes);
const serviceModel = require("../models/serviceModel")(sequelize, DataTypes);

// //  Add Discount
// const AddDiscount = async (req, res) => {
//     try {
//         const { title, state, discount, deducation, startdate, enddate, numberperson, equalexceeds, service } = req.body;
//         const createdBy = req.user.username;
//         const LastModifiedBy = req.user.username;

//         const FindService = await serviceModel.findAll({ where: { title: service } });
//         if (FindService.length === 0) {
//             return res.status(400).send({
//                 success: false,
//                 message: 'Service Not Found..'
//             });
//         }

//         // Create the discount entry without formatting dates for the database
//         const AddDiscount = await discountModel.create({
//             title,
//             state,
//             discount,
//             deducation,
//             startdate: new Date(startdate),
//             enddate: new Date(enddate),
//             equalexceeds,
//             numberperson,
//             service,
//             createdBy,
//             LastModifiedBy
//         });

//         return res.status(200).send({
//             success: true,
//             message: 'Discount Added Successfully..',
//             Data: AddDiscount
//         });

//     } catch (error) {
//         console.log(error);
//         return res.status(400).send({
//             success: false,
//             message: error.message
//         });
//     }
// };

const AddDiscount = async (req, res) => {
    try {
        const { title, state, discount, deducation, startdate, enddate, numberperson, equalexceeds, service } = req.body;
        const createdBy = req.user.username;
        const LastModifiedBy = req.user.username;

        // Validate that the service field is provided
        if (!service) {
            return res.status(400).send({
                success: false,
                message: 'Service is required.'
            });
        }

        // Find the service by its title
        const FindService = await serviceModel.findAll({ where: { title: service } });

        // If no service is found, return an error
        if (FindService.length === 0) {
            return res.status(400).send({
                success: false,
                message: 'Service Not Found..'
            });
        }

        // Create the discount entry
        const AddDiscount = await discountModel.create({
            title,
            state,
            discount,
            deducation,
            startdate: new Date(startdate),
            enddate: new Date(enddate),
            equalexceeds,
            numberperson,
            service,
            createdBy,
            LastModifiedBy
        });

        return res.status(200).send({
            success: true,
            message: 'Discount Added Successfully..',
            Data: AddDiscount
        });

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        });
    }
};

// GetList By Discount
const GetList = async (req, res) => {
    try {
        const Finddata = await discountModel.findAll({});
        return res.status(400).send({
            success: false,
            message: 'Discount Viewed Successfully..',
            Data: Finddata
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        })
    }
}

// GetByID By Discount 
const GetByID = async (req, res) => {
    try {
        const id = req.params.id || req.query.id;

        const FindDiscount = await discountModel.findOne({ where: { discountID: id } })
        if (!FindDiscount) {
            return res.status(400).send({
                success: false,
                message: 'Discount Not Found..'
            })
        }

        return res.status(200).send({
            success: true,
            message: 'Discount Found Successfully..',
            Data: FindDiscount
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        })
    }
}

// Update Discount
const UpdateDiscount = async (req, res) => {
    try {
        const id = req.params.id || req.query.id;

        const { title, state, discount, deducation, startdate, enddate, numberperson, equalexceeds, service } = req.body

        const existingDiscount = await discountModel.findOne({ where: { discountID: id } });
        if (!existingDiscount) {
            return res.status(400).send({
                success: false,
                message: 'Discount Not Found..'
            })
        }
        const HistoryDiscount = await discounthistoryModel.create({
            discountID: existingDiscount.discountID,
            title: existingDiscount.title,
            state: existingDiscount.state,
            discount: existingDiscount.discount,
            deducation: existingDiscount.deducation,
            startdate: existingDiscount.startdate,
            enddate: existingDiscount.enddate,
            numberperson: existingDiscount.numberperson,
            equalexceeds: existingDiscount.equalexceeds,
            service: existingDiscount.service,
            BackupCreatedBy: existingDiscount.createdBy,
            BackupCreatedOn: new Date()
        })

        const UpdateData = await existingDiscount.update({
            title, state, discount, deducation, startdate, enddate, numberperson, equalexceeds, service
        })

        return res.status(200).send({
            success: true,
            message: 'Discount Updated SUcessfully..',
            Data: UpdateData
        })

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        })
    }
}

// Delete Discount 
const DeleteDiscount = async (req, res) => {
    try {
        const id = req.params.id.split(',');

        if (!Array.isArray(id) || id.length === 0) {
            return res.status(400).send({
                success: false,
                message: 'No Discount IDs Provided For Deletion.'
            })
        }

        const existingDiscount = await discountModel.findAll({
            where: {
                discountID: id,
                IsDeleted: 0
            }
        })

        if (existingDiscount.length === 0) {
            return res.status(400).send({
                success: false,
                message: 'No Discount Found For The Provided ID.'
            })
        }

        const historyDiscount = existingDiscount.map(async (discount) => {
            return discounthistoryModel.create({
                discountID: discount.discountID,
                title: discount.title,
                state: discount.state,
                discount: discount.discount,
                deducation: discount.deducation,
                startdate: discount.startdate,
                enddate: discount.enddate,
                numberperson: discount.numberperson,
                equalexceeds: discount.equalexceeds,
                service: discount.service,
                BackupCreatedBy: discount.createdBy,
                BackupCreatedOn: new Date()
            })
        })

        await Promise.all(historyDiscount);

        const changeStatus = await discountModel.update({ IsDeleted: 1 }, { where: { discountID: id } })

        if (changeStatus[0] === 0) {
            return res.status(400).send({
                success: false,
                message: "No Discount Were Deleted."
            })
        }

        return res.status(200).send({
            success: true,
            message: "Discount Deleted Successfully.."
        })

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        })
    }
}

module.exports = { AddDiscount, GetList, GetByID, UpdateDiscount, DeleteDiscount };
