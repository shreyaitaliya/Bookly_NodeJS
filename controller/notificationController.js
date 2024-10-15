const { DataTypes, Op, where } = require("sequelize");
const db = require('../config/db');
const sequelize = db.sequelize;
const notificationModel = require('../models/notificationModel')(sequelize, DataTypes);
const notificationhistoryModel = require('../models/notificationhistoryModel')(sequelize, DataTypes);
const notificationlogcolModel = require('../models/notificationLogColModel')(sequelize, DataTypes);
const notificationconfigurationModel = require('../models/notificationConfigurationModel')(sequelize, DataTypes);
const notificationconfigurationhistoryModel = require('../models/notificationConfigurationHistoryModel')(sequelize, DataTypes);
const servicemodel = require('../models/serviceModel')(sequelize, DataTypes);

// Add Notification
// const AddNotification = async (req, res) => {
//     try {
//         const { title, state, type, status, services, recipients, email, description } = req.body;
//         const createdBy = req.user.username;
//         const LastModifiedBy = req.user.username;

//         // Ensure services and recipients are strictly arrays
//         if (!Array.isArray(services) || services.length === 0) {
//             return res.status(400).send({
//                 success: false,
//                 message: 'At least one service is required, and it must be an array.'
//             });
//         }

//         if (!Array.isArray(recipients) || recipients.length === 0) {
//             return res.status(400).send({
//                 success: false,
//                 message: 'At least one recipient is required.'
//             });
//         }

//         // Find services by title
//         const foundServices = await servicemodel.findAll({
//             where: { title: { [Op.in]: services } }
//         });

//         if (foundServices.length !== services.length) {
//             return res.status(400).send({
//                 success: false,
//                 message: 'One or more services not found.'
//             });
//         }

//         const servicesList = foundServices.map(service => service.title).join(', ');
//         const recipientsList = recipients.join(', ');

//         // Create notification
//         const AddNotification = await notificationModel.create({
//             title,
//             state,
//             type,
//             status,
//             service: servicesList,
//             recipients: recipientsList,
//             email,
//             description,
//             createdBy,
//             LastModifiedBy
//         });

//         return res.status(200).send({
//             success: true,
//             message: 'Notification added successfully.',
//             data: AddNotification
//         });

//     } catch (error) {
//         console.log(error);
//         return res.status(400).send({
//             success: false,
//             message: error.message
//         });
//     }
// };

const AddNotification = async (req, res) => {
    try {
        const { title, state, type, status, service, recipients, email, description } = req.body;
        const createdBy = req.user.username;
        const LastModifiedBy = req.user.username;

        // Find services by title
        const foundServices = await servicemodel.findAll({
            where: { title: { [Op.in]: service } }
        });

        if (foundServices.length !== service.length) {
            return res.status(400).send({
                success: false,
                message: 'One or more services not found.'
            });
        }

        const servicesList = foundServices.map(service => service.title).join(', ');
        const recipientsList = recipients.join(', ');

        // Create notification
        const newNotification = await notificationModel.create({
            title,
            state,
            type,
            status,
            service: servicesList,
            recipients: recipientsList,
            email,
            description,
            createdBy,
            LastModifiedBy
        });

        return res.status(200).send({
            success: true,
            message: 'Notification added successfully.',
            data: newNotification
        });

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        });
    }
};


// const AddNotification = async (req, res) => {
//     try {
//         const { title, state, type, status, services, recipients, email, description } = req.body;
//         const createdBy = req.user.username;
//         const LastModifiedBy = req.user.username;

//         // Convert single service into an array if it's not already
//         let serviceArray = Array.isArray(services) ? services : [services];

//         // Ensure the services array is not empty
//         if (serviceArray.length === 0) {
//             return res.status(400).send({
//                 success: false,
//                 message: 'At least one service is required.'
//             });
//         }

//         // Ensure recipients are strictly an array
//         if (!Array.isArray(recipients) || recipients.length === 0) {
//             return res.status(400).send({
//                 success: false,
//                 message: 'At least one recipient is required.'
//             });
//         }

//         // Find services by title
//         const foundServices = await servicemodel.findAll({
//             where: { title: { [Op.in]: serviceArray } }
//         });

//         if (foundServices.length !== serviceArray.length) {
//             return res.status(400).send({
//                 success: false,
//                 message: 'One or more services not found.'
//             });
//         }

//         const servicesList = foundServices.map(service => service.title).join(', ');
//         const recipientsList = recipients.join(', ');

//         // Create notification
//         const AddNotification = await notificationModel.create({
//             title,
//             state,
//             type,
//             status,
//             service: servicesList,
//             recipients: recipientsList,
//             email,
//             description,
//             createdBy,
//             LastModifiedBy
//         });

//         return res.status(200).send({
//             success: true,
//             message: 'Notification added successfully.',
//             data: AddNotification
//         });

//     } catch (error) {
//         console.log(error);
//         return res.status(400).send({
//             success: false,
//             message: error.message
//         });
//     }
// };

// GetAll Data By DropDown
const GetAllData = async (req, res) => {
    try {
        const alldata = await notificationModel.findAll({ where: { IsDeleted: 0 } })
        if (!alldata) {
            return res.status(400).send({
                success: false,
                message: 'No Notification Data Found..'
            })
        }

        return res.status(200).send({
            success: false,
            message: 'Notification Found Successsfully..',
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

// GetList By Notification
const GetList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const filter = req.query.filter || '';

        const whereclause = {
            [Op.or]: [
                { title: { [Op.like]: `%${filter}%` } },
            ]
        }

        const alldata = await notificationModel.findAll({
            limit, offset, where: {
                ...whereclause, IsDeleted: 0
            },
            order: [['LastModifiedOn']]
        })

        const CountTotal = await notificationModel.count({ whre: { ...whereclause, IsDeleted: 0 } })
        const TotalPages = Math.ceil(CountTotal / limit);

        const columns = Object.keys(notificationModel.rawAttributes);

        const notificationlogcol = await Promise.all(
            columns.map((column) => {
                return notificationlogcolModel.findOrCreate({
                    where: { ColumnName: column },
                    defaults: { Alias: column, Status: 'Active' },
                })
            })
        )

        const LogColumns = await notificationlogcolModel.findAll({});
        const notificationconfig = await notificationconfigurationModel.findAll({ where: { profileID: req.user.profileID } });

        return res.status(200).send({
            TotalAllData: CountTotal,
            TotalRows: alldata.length,
            TotalPages: TotalPages,
            Page: page,
            Data: alldata,
            LogCOlumn: LogColumns,
            LogConfig: notificationconfig
        })

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        })
    }
}

// Get Configuration
const GetConfiguration = async (req, res) => {
    try {
        const profileID = req.user.profileID;
        const { data } = req.body;

        if (!Array.isArray(data) || data.length === 0) {
            return res.status(400).send({
                message: 'No Configuration Data Provided.'
            });
        }

        const validconfiguration = [];
        const invalidconfiguration = [];

        // Validate configuration data
        for (const config of data) {
            const { ColumnName, Priority, IsActive } = config;

            if (!ColumnName) {
                invalidconfiguration.push({ ColumnName, Priority, IsActive });
                continue;
            }

            // Fetch the column data from the DealerColModel table
            const existingColumn = await notificationlogcolModel.findOne({ where: { ColumnName } });

            if (existingColumn) {
                validconfiguration.push({ profileID: profileID, ColumnName, Priority, IsActive });
            } else {
                invalidconfiguration.push({ ColumnName, Priority, IsActive });
            }
        }

        if (validconfiguration.length > 0) {
            const existingConfigs = await notificationconfigurationModel.findAll({
                where: {
                    ColumnName: validconfiguration.map((config) => config.ColumnName)
                }
            });

            // data to move to history
            const historyData = existingConfigs.map((config) => ({
                notificationConfigurationID: config.notificationConfigurationID,
                profileID: config.profileID,
                ColumnName: config.ColumnName,
                Priority: config.Priority,
                IsActive: config.IsActive,
                AddedOn: config.AddedOn,
                LastModifiedOn: new Date(),
            }));

            // Store old data in DealerModelConfigurationHistory
            if (historyData.length > 0) {
                for (const historyItem of historyData) {
                    await notificationconfigurationhistoryModel.create(historyItem);
                }
            }

            // Update or insert valid configurations into stationconfiguration table
            for (const config of validconfiguration) {
                const existingConfig = await notificationconfigurationModel.findOne({
                    where: { ColumnName: config.ColumnName }
                });

                if (existingConfig) {
                    // Update existing configuration
                    await existingConfig.update({
                        Priority: config.Priority,
                        IsActive: config.IsActive,
                        profileID: config.profileID
                    });
                } else {
                    // Insert new configuration
                    await notificationconfigurationModel.create(config);
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
        console.error(error);
        return res.status(500).send({
            message: 'An error occurred while processing configurations.',
            error: error.message,
        });
    }
};

// GetByID Notification
const GetByID = async (req, res) => {
    try {
        const id = req.params.id;

        const data = await notificationModel.findOne({ where: { notificationID: id, IsDeleted: 0 } })

        if (!data) {
            return res.status(400).send({
                success: false,
                message: 'Notification Not Found..'
            })
        }

        return res.status(400).send({
            success: true,
            message: 'Notification Found Successfully..',
            Data: data
        })

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        })
    }
}

// Update Notification
const update = async (req, res) => {
    try {
        const id = req.params.id;
        const { title, state, type, status, services, recipients, email, description } = req.body;

        const existingnotification = await notificationModel.findByPk(id);

        if (!existingnotification) {
            return res.status(404).send({
                success: false,
                message: 'Notification Not Found..',
            })
        }

        // Ensure services and recipients are strictly arrays
        if (!Array.isArray(services) || services.length === 0) {
            return res.status(400).send({
                success: false,
                message: 'At least one service is required, and it must be an array.'
            });
        }

        if (!Array.isArray(recipients) || recipients.length === 0) {
            return res.status(400).send({
                success: false,
                message: 'At least one recipient is required.'
            });
        }

        // Find services by title
        const foundServices = await servicemodel.findAll({
            where: { title: { [Op.in]: services } }
        });

        if (foundServices.length !== services.length) {
            return res.status(400).send({
                success: false,
                message: 'One or more services not found.'
            });
        }

        const servicesList = foundServices.map(service => service.title).join(', ');
        const recipientsList = recipients.join(', ');

        const historynotificationdata = await notificationhistoryModel.create({
            notificationID: existingnotification.notificationID,
            title: existingnotification.title,
            state: existingnotification.state,
            type: existingnotification.type,
            status: existingnotification.status,
            service: existingnotification.service,
            recipients: existingnotification.recipients,
            email: existingnotification.email,
            description: existingnotification.description,
            BackupCreatedBy: existingnotification.createdBy,
            BackupCreatedOn: new Date(),
        })

        const UpdateData = await existingnotification.update({
            title, state, type, status,
            service: servicesList,
            recipients: recipientsList,
            email, description
        })

        return res.status(200).send({
            success: true,
            message: 'Notification Edit Successfully..',
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

// Delete Notification
const Delete = async (req, res) => {
    try {
        const ids = req.params.id.split(',');

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).send({
                success: false,
                message: 'No Notification IDs Provided For Deletion..'
            })
        }

        const FindNotification = await notificationModel.findAll({
            where: {
                notificationID: ids,
                IsDeleted: 0
            }
        })

        if (FindNotification.length === 0) {
            return res.status(400).send({
                success: false,
                message: 'No Notification Found For The Provided ID..'
            })
        }

        const historyRecords = FindNotification.map(notification => ({
            notificationID: notification.notificationID,
            title: notification.title,
            state: notification.state,
            type: notification.type,
            status: notification.status,
            service: notification.service,
            recipients: notification.recipients,
            email: notification.email,
            description: notification.description,
            BackupCreatedBy: notification.createdBy,
            BackupCreatedOn: new Date(),
        }))

        await notificationhistoryModel.bulkCreate(historyRecords);

        const changedata = await notificationModel.update({ IsDeleted: 1 }, { where: { notificationID: ids } });

        if (changedata[0] === 0) {
            return res.status(400).send({
                success: false,
                message: 'No Notification Were Deleted..',
            })
        }

        return res.status(200).send({
            success: true,
            message: 'Notification Deleted Sucessfully...'
        })

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message,
        })
    }
}

module.exports = { AddNotification, GetAllData, GetList, GetConfiguration, GetByID, update, Delete };