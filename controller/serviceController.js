const { DataTypes, Op, where } = require("sequelize");
const db = require('../config/db');
const sequelize = db.sequelize;
const serviceModel = require("../models/serviceModel")(sequelize, DataTypes);
const categoryModel = require("../models/categoryModel")(sequelize, DataTypes);
const staffModel = require("../models/staffModel")(sequelize, DataTypes);
const servicelogcolModel = require("../models/serviceLogColModel")(sequelize, DataTypes);
const serviceConfigurationModel = require("../models/serviceConfigurationModel")(sequelize, DataTypes);
const serviceConfigurationHistoryModel = require("../models/serviceConfigurationHistoryModel")(sequelize, DataTypes);
const serviceHistoryModel = require('../models/serviceHistoryModel')(sequelize, DataTypes);
const fs = require('fs');
const path = require('path');

// Add Service
const AddService = async (req, res) => {
    try {
        const {
            title, category, color, visibility, price,
            providers, providerspreference, periodbefore,
            periodafter, randomstaff, paymentmethod, info,
            duration, timelegth, beforePaddingTime,
            afterPaddingTime,
        } = req.body;

        const createdBy = req.user.username;
        const LastModifiedBy = req.user.username;

        // Check Category Data
        const categorydata = await categoryModel.findOne({ where: { category } });
        if (!categorydata) {
            return res.status(400).send({
                success: false,
                message: 'Category Data Not Provided.'
            });
        }

        // Ensure providers is an array
        let providersArray;
        try {
            providersArray = JSON.parse(providers);
            providersArray = Array.isArray(providersArray) ? providersArray : [providersArray];
        } catch (error) {
            return res.status(400).send({ success: false, message: "Invalid providers format" });
        }

        const FindStaff = await staffModel.findAll({
            where: {
                name: {
                    [Op.in]: providersArray,
                }
            }
        });

        if (!FindStaff || FindStaff.length === 0) {
            return res.status(400).send({
                success: false,
                message: 'One or more staff not found.'
            });
        }

        // Create the service entry
        const data = await serviceModel.create({
            image: req.file?.path || "",
            title,
            category,
            color,
            visibility,
            price,
            providers: providersArray.join(','),
            providerspreference,
            periodbefore,
            periodafter,
            randomstaff,
            paymentmethod,
            info,
            duration,
            timelegth,
            beforePaddingTime,
            afterPaddingTime,
            createdBy,
            LastModifiedBy
        });

        return res.status(200).send({
            success: true,
            message: 'Service Added Successfully..',
            data,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message || 'An error occurred.'
        });
    }
};

// GetAllData DropDown
const GetData = async (req, res) => {
    try {
        const alldata = await serviceModel.findAll({ where: { IsDeleted: 0 } })
        if (!alldata) {
            return res.status(400).send({
                success: false,
                message: 'No Services Found..',
            })
        }

        return res.status(200).send({
            success: true,
            message: 'Service Found Successfully..',
            Data: alldata
        })

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        })
    }
}

// GetAllData Service
const GetAllData = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const filter = req.query.filter || '';

        const whereclause = {
            [Op.or]: [
                { title: { [Op.like]: `%${filter}%` } },
                { category: { [Op.like]: `%${filter}%` } },
            ]
        }

        const alldata = await serviceModel.findAll({
            limit, offset, where: {
                ...whereclause, IsDeleted: 0
            },
            order: [['LastModifiedOn']]
        })

        const CountTotal = await serviceModel.count({ where: { ...whereclause, IsDeleted: 0 } });
        const TotalPages = Math.ceil(CountTotal / limit);

        const columns = Object.keys(serviceModel.rawAttributes);

        const servicelogcol = await Promise.all(
            columns.map(async (column) => {
                return servicelogcolModel.findOrCreate({
                    where: { ColumnName: column },
                    defaults: { Alias: column, Status: 'Active' },
                })
            })
        )

        const LogColumns = await servicelogcolModel.findAll({});
        const LogConfig = await serviceConfigurationModel.findAll({ where: { profileID: req.user.profileID } });

        return res.status(200).send({
            TotalAllData: CountTotal,
            TotalRows: alldata.length,
            TotalPages: TotalPages,
            page: page,
            data: alldata,
            LogColumns: LogColumns,
            LogConfig: LogConfig
        })


    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        })
    }
}

// GetAll List Api
// <<-----------------Pending for historymodel----------------------->>
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

            const existingColumn = await servicelogcolModel.findOne({ where: { ColumnName } })

            if (existingColumn) {
                validconfiguration.push({ profileID: profileID, ColumnName, Priority, IsActive })
            } else {
                invalidconfiguration.push({ ColumnName, Priority, IsActive })
            }
        }

        if (validconfiguration.length > 0) {
            const existingConfigs = await serviceConfigurationModel.findAll({
                where: {
                    ColumnName: validconfiguration.map((config) => config.ColumnName)
                }
            })

            const historyData = existingConfigs.map((config) => ({
                serviceConfigurationID: config.serviceConfigurationID,
                profileID: config.profileID,
                ColumnName: config.ColumnName,
                Priority: config.Priority,
                IsActive: config.IsActive,
                AddedOn: config.AddedOn,
                LastModifiedOn: new Date(),
            }));

            if (historyData.length > 0) {
                for (const historyItem of historyData) {
                    await serviceConfigurationHistoryModel.create(historyItem);
                }
            }
            for (const config of validconfiguration) {
                const existingConfig = await serviceConfigurationModel.findOne({
                    where: { ColumnName: config.ColumnName }
                });

                if (existingConfig) {
                    await existingConfig.update({
                        Priority: config.Priority,
                        IsActive: config.IsActive,
                        profileID: config.profileID
                    });
                } else {
                    await serviceConfigurationModel.create(config);
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
        return res.status(500).send({

        })
    }
}

// GetByID
const GetByID = async (req, res) => {
    try {
        const id = req.params.id;

        const data = await serviceModel.findOne({ where: { serviceID: id, IsDeleted: 0 } })

        if (!data) {
            return res.status(400).send({
                success: false,
                message: 'SErvice Not Found..'
            })
        }

        return res.status(200).send({
            success: true,
            message: 'Service Found Successfully..',
            Data: data
        })

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: error.message
        })
    }
}

// Update Service
const UpdateService = async (req, res) => {
    try {
        const id = req.params.id;

        const { title, category, color, visibility, price,
            providers, providerspreference, periodbefore,
            periodafter, randomstaff, paymentmethod, info,
            duration, timelegth, beforePaddingTime,
            afterPaddingTime, } = req.body

        const existingservice = await serviceModel.findByPk(id);

        if (!existingservice) {
            return res.status(404).send({
                success: false,
                message: 'Service Not Found',
            })
        }

        // Check Category Data
        const categorydata = await categoryModel.findOne({ where: { category } });
        if (!categorydata) {
            return res.status(400).send({
                success: false,
                message: 'Category Data Not Provided.'
            });
        }

        // Ensure providers is an array
        let providersArray;
        try {
            providersArray = JSON.parse(providers);
            providersArray = Array.isArray(providersArray) ? providersArray : [providersArray];
        } catch (error) {
            return res.status(400).send({ success: false, message: "Invalid providers format" });
        }

        const FindStaff = await staffModel.findAll({
            where: {
                name: {
                    [Op.in]: providersArray,
                }
            }
        });

        if (!FindStaff || FindStaff.length === 0) {
            return res.status(400).send({
                success: false,
                message: 'One or more staff not found.'
            });
        }

        await serviceHistoryModel.create({
            serviceID: existingservice.serviceID,
            image: existingservice.image,
            title: existingservice.title,
            category: existingservice.category,
            color: existingservice.color,
            visibility: existingservice.visibility,
            price: existingservice.price,
            providers: existingservice.providers,
            providerspreference: existingservice.providerspreference,
            periodbefore: existingservice.periodbefore,
            periodafter: existingservice.periodafter,
            randomstaff: existingservice.randomstaff,
            paymentmethod: existingservice.paymentmethod,
            info: existingservice.info,
            duration: existingservice.duration,
            timelegth: existingservice.timelegth,
            beforePaddingTime: existingservice.beforePaddingTime,
            afterPaddingTime: existingservice.afterPaddingTime,
            BackupCreatedBy: existingservice.createdBy,
            BackupCreatedOn: new Date(),
        })

        let imagepath = existingservice.image;
        if (req.file) {
            const newImagePath = req.file.path;
            if (existingservice.image && fs.existsSync(path.resolve(existingservice.image))) { // Corrected existsSync
                fs.unlinkSync(path.resolve(existingservice.image));
            }
            imagepath = newImagePath;
        }


        const UpdateData = await existingservice.update({
            image: imagepath, title, category, color, visibility, price,
            providers: providersArray.join(','), providerspreference, periodbefore,
            periodafter, randomstaff, paymentmethod, info,
            duration, timelegth, beforePaddingTime,
            afterPaddingTime
        })

        return res.status(200).send({
            success: true,
            message: 'Service Edit Successfully..',
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

// Delete Service
const DeleteService = async (req, res) => {
    try {
        const ids = req.params.id.split(',');

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).send({
                success: false,
                message: 'No Service IDs Provided For Deletion'
            });
        }

        const FindService = await serviceModel.findAll({
            where: {
                serviceID: ids,
                IsDeleted: 0
            }
        });

        if (FindService.length === 0) {
            return res.status(400).send({
                success: false,
                message: 'No Service Found For The Provided ID.'
            });
        }

        // Add HistoryData On Own History Table...
        const historyRecords = FindService.map(service => ({
            serviceID: service.serviceID,
            image: service.image,
            title: service.title,
            category: service.category,
            color: service.color,
            visibility: service.visibility,
            price: service.price,
            providers: service.providers,
            providerspreference: service.providerspreference,
            periodbefore: service.periodbefore,
            periodafter: service.periodafter,
            randomstaff: service.randomstaff,
            paymentmethod: service.paymentmethod,
            info: service.info,
            duration: service.duration,
            timelegth: service.timelegth,
            beforePaddingTime: service.beforePaddingTime,
            afterPaddingTime: service.afterPaddingTime,
            BackupCreatedBy: service.createdBy,
            BackupCreatedOn: new Date(),
        }));

        // Bulk create history records
        await serviceHistoryModel.bulkCreate(historyRecords);

        // Mark services as deleted
        const changedata = await serviceModel.update({ IsDeleted: 1 }, { where: { serviceID: ids } });

        if (changedata[0] === 0) {
            return res.status(400).send({
                success: false,
                message: 'No Services Were Deleted.'
            });
        }

        return res.status(200).send({
            success: true,
            message: 'Service Deleted Successfully.'
        });

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        });
    }
};


module.exports = { AddService, GetData, GetAllData, GetConfiguration, GetByID, UpdateService, DeleteService };
