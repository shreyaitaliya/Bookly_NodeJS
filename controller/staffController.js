const { DataTypes, Op, where } = require("sequelize");
const db = require('../config/db');
const sequelize = db.sequelize;
const staffModel = require("../models/staffModel")(sequelize, DataTypes);
const staffhistoryModel = require("../models/staffhistoryModel")(sequelize, DataTypes);
const path = require('path');
const stafflogcolModel = require("../models/staffLogColModel")(sequelize, DataTypes);
const staffConfigurationModel = require("../models/staffConfigurationModel")(sequelize, DataTypes);
const staffConfigurationhistoryModel = require("../models/staffconfigurationhistoryModel")(sequelize, DataTypes);
const categoryModel = require("../models/categoryModel")(sequelize, DataTypes);
const fs = require('fs');

// Add Staff 
const AddStaff = async (req, res) => {
    try {
        const { name, email, phone, info, color, visibility, category, paymentmethod } = req.body
        const user = req.user.username
        const createdBy = req.user.username;
        const LastModifiedBy = req.user.username;

        const findStaff = await staffModel.findOne({ email: email })
        if (!findStaff) {
            return res.status(400).send({
                success: false,
                message: 'This Email Already Exits..'
            })
        }

        const findCategory = await categoryModel.findOne({ where: { category: category } })
        if (!findCategory) {
            return res.status(400).send({
                success: false,
                message: 'Category Not Found..'
            })
        }

        const addstaff = await staffModel.create({ image: req.file?.path || "", name, email, phone, info, color, visibility, category, paymentmethod, user, createdBy, LastModifiedBy })

        return res.status(200).send({
            success: true,
            message: 'Add Staff Successfully..',
            Data: addstaff
        })

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        })
    }
}

// GetAllData By DropDown
const AllData = async (req, res) => {
    try {
        const alldata = await staffModel.findAll({ where: { IsDeleted: 0 } });
        if (!alldata) {
            return res.status(400).send({
                success: false,
                message: 'No Staff Found..',
            })
        }

        return res.status(200).send({
            success: true,
            message: 'Staff Found Successfully..',
            Data: alldata,
        })

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        })
    }
}

// Get All Staff Data
const GetAllData = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10; // Adjusted default limit to 10
        const offset = (page - 1) * limit;
        const filter = req.query.filter || '';

        const whereclause = {
            [Op.or]: [
                { name: { [Op.like]: `%${filter}%` } },
                { email: { [Op.like]: `%${filter}%` } },
            ]
        };

        const alldata = await db.staffModel.findAll({
            limit, offset, where: {
                ...whereclause,
                IsDeleted: 0
            },
            order: [['LastModifiedOn', 'DESC']],
        });

        const countTotal = await db.staffModel.count({ where: { ...whereclause, IsDeleted: 0 } });
        const TotalPages = Math.ceil(countTotal / limit);

        const columns = Object.keys(db.staffModel.rawAttributes);

        const stafflogcol = await Promise.all(
            columns.map(async (column) => {
                return stafflogcolModel.findOrCreate({
                    where: { ColumnName: column },
                    defaults: { Alias: column, Status: 'Active' },
                });
            })
        );

        const LogColumns = await stafflogcolModel.findAll({});
        const LogConfig = await staffConfigurationModel.findAll({ where: { profileID: req.user.profileID } });

        return res.status(200).send({
            totalAllData: countTotal,
            totalRows: alldata.length,
            TotalPages: TotalPages,
            page: page,
            data: alldata,
            LogColumns: LogColumns,
            LogConfig: LogConfig
        });

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        });
    }
};

// Staff Save Column
const GetConfiguration = async (req, res) => {
    try {
        const profileID = req.user.profileID;
        const { data } = req.body;

        if (!Array.isArray(data) || data.length === 0) {
            return res.status(400).send({
                message: 'No Configuration Data Provided.'
            })
        }

        const validconfiguration = [];
        const invalidconfiguration = [];

        for (const config of data) {
            const { ColumnName, Priority, IsActive } = config;
            if (!ColumnName) {
                invalidconfiguration.push({ ColumnName, Priority, IsActive });
                continue;
            }

            const existingColumn = await stafflogcolModel.findOne({ where: { ColumnName } })

            if (existingColumn) {
                validconfiguration.push({ profileID: profileID, ColumnName, Priority, IsActive })
            } else {
                invalidconfiguration.push({ ColumnName, Priority, IsActive })
            }
        }

        if (validconfiguration.length > 0) {
            const existingConfigs = await staffConfigurationModel.findAll({
                where: {
                    ColumnName: validconfiguration.map((config) => config.ColumnName)
                }
            })

            const historyData = existingConfigs.map((config) => ({
                staffConfigurationID: config.staffConfigurationID,
                profileID: config.profileID,
                ColumnName: config.ColumnName,
                Priority: config.Priority,
                IsActive: config.IsActive,
                AddedOn: config.AddedOn,
                LastModifiedOn: new Date(),
            }));

            if (historyData.length > 0) {
                for (const historyItem of historyData) {
                    await staffConfigurationhistoryModel.create(historyItem);
                }
            }
            for (const config of validconfiguration) {
                const existingConfig = await staffConfigurationModel.findOne({
                    where: { ColumnName: config.ColumnName }
                });

                if (existingConfig) {
                    await existingConfig.update({
                        Priority: config.Priority,
                        IsActive: config.IsActive,
                        profileID: config.profileID
                    });
                } else {
                    await staffConfigurationModel.create(config);
                }
            }

            return res.status(200).send({
                message: 'Configuration Processed Successfully.',
                validconfiguration,
                invalidconfiguration
            });
        }

        return res.status(400).send({
            message: 'No Valid Configuration Found.',
            invalidconfiguration
        });

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.mmessage
        })
    }
}

// GetByID Staff Data
const GetByID = async (req, res) => {
    try {
        const id = req.params.id;

        const data = await staffModel.findOne({ where: { staffID: id, IsDeleted: 0 } })
        if (!data) {
            return res.status(400).send({
                success: false,
                message: 'Staff Not Found...'
            })
        }

        return res.status(400).send({
            success: true,
            message: 'Staff Found Sucessfully...',
            Data: data,
        })

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        })
    }
}

//Update Staff 

// <<<--------------------- Pending Replace image for Update ---------------------->>>>

const UpdateStaff = async (req, res) => {
    try {
        const id = req.params.id;

        const { name, email, phone, info, color, visibility, category, paymentmethod } = req.body;

        const existingstaff = await staffModel.findByPk(id);

        if (!existingstaff) {
            return res.status(404).send({
                message: 'Staff not found',
                success: false
            });
        }

        // Save old data to the history table
        await staffhistoryModel.create({
            staffID: existingstaff.staffID,
            image: existingstaff.image,
            name: existingstaff.name,
            user: existingstaff.user,
            email: existingstaff.email,
            phone: existingstaff.phone,
            info: existingstaff.info,
            color: existingstaff.color,
            visibility: existingstaff.visibility,
            category: existingstaff.category,
            paymentmethod: existingstaff.paymentmethod,
            BackupCreatedBy: existingstaff.createdBy,
            BackupCreatedOn: new Date()
        });

        // If a new image is uploaded, handle the image replacement
        let imagePath = existingstaff.image;
        if (req.file) {
            const newImagePath = req.file.path;

            if (existingstaff.image && fs.existsSync(path.resolve(existingstaff.image))) {
                fs.unlinkSync(path.resolve(existingstaff.image));
            }

            imagePath = newImagePath;
        }

        const updatedData = await existingstaff.update({
            image: imagePath, name, email, phone, email, info, color, visibility, category, paymentmethod,
        });

        return res.status(200).send({
            message: 'Staff updated successfully.',
            success: true,
            updatedData
        });

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message,
        });
    }
};

// Delete Staff 
const DeleteStaff = async (req, res) => {
    try {
        const id = req.params.id.split(',');

        if (!Array.isArray(id) || id.length === 0) {
            return res.status(400).send({
                success: false,
                message: 'No category IDs provided for deletion.'
            });
        }

        // Find existing staff members that are not deleted
        const existingstaff = await staffModel.findAll({
            where: {
                staffID: id,
                IsDeleted: 0
            }
        });

        // Check if any of the staff exist
        if (existingstaff.length === 0) {
            return res.status(400).send({
                success: false,
                message: 'No Staff found for the provided ID.'
            });
        }

        // Create history entries for each staff member
        const historyPromises = existingstaff.map(async (staff) => {
            return staffhistoryModel.create({
                staffID: staff.staffID,
                image: staff.image,
                name: staff.name,
                user: staff.user,
                email: staff.email,
                phone: staff.phone,
                info: staff.info,
                color: staff.color,
                visibility: staff.visibility,
                category: staff.category,
                paymentmethod: staff.paymentmethod,
                BackupCreatedBy: staff.createdBy,
                BackupCreatedOn: new Date()
            });
        });

        await Promise.all(historyPromises);

        // Update the deletion status of the staff members
        const changedStatus = await staffModel.update(
            { IsDeleted: 1 },
            { where: { staffID: id } }
        );

        // Check if any staff were updated
        if (changedStatus[0] === 0) {
            return res.status(500).send({
                success: false,
                message: "No Staff were deleted."
            });
        }

        return res.status(200).send({
            success: true,
            message: "Staff deleted successfully."
        });

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        });
    }
}

module.exports = ({ AddStaff, AllData, GetAllData, GetConfiguration, GetByID, UpdateStaff, DeleteStaff })