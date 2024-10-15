const { DataTypes, Op, where } = require("sequelize");
const db = require('../config/db');
const sequelize = db.sequelize;
const serviceModel = require("../models/serviceModel")(sequelize, DataTypes);
const appoinmentmodel = require('../models/appoinmentModel')(sequelize, DataTypes);
const appoinmenthistoryModel = require('../models/appoinmentHistoryModel')(sequelize, DataTypes);
const stffmodel = require('../models/staffModel')(sequelize, DataTypes);
const customermodel = require('../models/customerModel')(sequelize, DataTypes);
const appoinmentlogcol = require('../models/appoinmentLogColModel')(sequelize, DataTypes);
const appoinmentConfigurationl = require('../models/appoinmentConfigurationModel')(sequelize, DataTypes);
const { createObjectCsvWriter } = require('csv-writer');
const appoinmentConfigurationHistoryModel = require("../models/appoinmentConfigurationHistoryModel")(sequelize, DataTypes);

const convertCustomTimeFormat = (time) => {
    return time.replace('.', ':').toUpperCase();
}

// Add Appointment
const AddAppoinment = async (req, res) => {
    try {
        // Destructure request body
        const { provider, service, date, starttime, endtime, customerID, internalnote } = req.body;
        const createdBy = req.user.username;
        const LastModifiedBy = req.user.username;

        // Validate the provider
        const FindStaff = await stffmodel.findOne({ where: { name: provider } });
        if (!FindStaff) {
            return res.status(400).send({
                success: false,
                message: 'Staff Not Found...',
            });
        }

        // Validate the service
        const FindService = await serviceModel.findOne({ where: { title: service } });
        if (!FindService) {
            return res.status(400).send({
                success: false,
                message: 'Service Not Found...',
            });
        }

        // Validate the customer
        const FindCustomer = await customermodel.findOne({ where: { customerID: customerID } });
        if (!FindCustomer) {
            return res.status(400).send({
                success: false,
                message: 'Customer Not Found...',
            });
        }

        // Custom date handling: ensure the date is in the right format
        const appointmentDate = new Date(date);
        if (isNaN(appointmentDate.getTime())) {
            return res.status(400).send({
                success: false,
                message: 'Invalid date format. Please provide a valid date.',
            });
        }

        // Convert custom time format to standard format
        const validStartTime = convertCustomTimeFormat(starttime);
        const validEndTime = convertCustomTimeFormat(endtime);

        // Check for valid time formats
        if (!/^\d{1,2}:\d{2} (AM|PM)$/.test(validStartTime) || !/^\d{1,2}:\d{2} (AM|PM)$/.test(validEndTime)) {
            return res.status(400).send({
                success: false,
                message: 'Invalid starttime or endtime format. Please provide valid times.',
            });
        }

        // Combine date and time into a single string for parsing
        const parsedStartTime = new Date(`${appointmentDate.toISOString().split('T')[0]} ${validStartTime}`);
        const parsedEndTime = new Date(`${appointmentDate.toISOString().split('T')[0]} ${validEndTime}`);

        // Validate starttime and endtime
        if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
            return res.status(400).send({
                success: false,
                message: 'Invalid starttime or endtime format. Please provide valid times.',
            });
        }

        // Ensure starttime is before endtime
        if (parsedStartTime >= parsedEndTime) {
            return res.status(400).send({
                success: false,
                message: 'Start time must be before end time.',
            });
        }

        // Check for existing appointments for the same provider on the same date
        const existingAppointments = await appoinmentmodel.findOne({
            where: {
                provider,
                service,
                date: appointmentDate,
                [Op.or]: [
                    {
                        starttime: {
                            [Op.lte]: validEndTime
                        },
                        endtime: {
                            [Op.gte]: validStartTime
                        }
                    }
                ]
            }
        });

        if (existingAppointments) {
            return res.status(400).send({
                success: false,
                message: 'The Time Slot Is Already Booked For This Service With This Provider.',
            });
        }

        // Create the appointment with validated and formatted date and time values
        const AddAppoinment = await appoinmentmodel.create({
            provider,
            service,
            date: appointmentDate,
            starttime: validStartTime,
            endtime: validEndTime,
            customerID,
            internalnote,
            createdBy,
            LastModifiedBy
        });

        return res.status(200).send({
            success: true,
            message: 'Appointment added successfully...',
            Data: AddAppoinment
        });

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        });
    }
}

// Get All List Data 
const GetAllListData = async (req, res) => {
    try {
        const GetAllData = await appoinmentmodel.findAll({ where: { IsDeleted: 0 } });
        if (!GetAllData) {
            return res.status(200).send({
                success: false,
                message: 'No Appoinmnet Data Found..',
            })
        }

        return res.status(200).send({
            success: true,
            message: 'All Data Viewed Successully..',
            Data: GetAllData
        })

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        })
    }
}

// GetList
const GetList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 1;
        const offset = (page - 1) * limit;
        const filter = req.query.filter || '';

        const whereclause = {
            [Op.or]: [
                { provider: { [Op.like]: `%${filter}%` } },
                { service: { [Op.like]: `%${filter}%` } },
                { customerID: { [Op.like]: `%${filter}%` } } // Change 'customer' to 'customerID'
            ],
            IsDeleted: 0
        };

        // Fetch appointment data
        const alldata = await appoinmentmodel.findAll({
            limit,
            offset,
            where: whereclause,
            order: [['LastModifiedOn', 'DESC']]
        });

        // Fetch customer data for each appointment
        const appointmentWithCustomerData = await Promise.all(alldata.map(async (appointment) => {
            const customer = await customermodel.findOne({
                where: { customerID: appointment.customerID },
                attributes: ['name', 'email', 'phone']
            });

            // Fetch service data (including duration)
            const service = await serviceModel.findOne({
                where: { title: appointment.service },
                attributes: ['duration']
            });

            return {
                ...appointment.toJSON(),
                customerDetails: customer ? customer.toJSON() : null,
                serviceDetails: service ? service.toJSON() : null
            };
        }));

        const CountTotal = await appoinmentmodel.count({ where: { ...whereclause, IsDeleted: 0 } });
        const TotalPages = Math.ceil(CountTotal / limit);

        const columns = Object.keys(appoinmentmodel.rawAttributes);

        await Promise.all(
            columns.map(async (column) => {
                return appoinmentlogcol.findOrCreate({
                    where: { ColumnName: column },
                    defaults: { Alias: column, Status: 'Active' },
                });
            })
        );

        const LogColumns = await appoinmentlogcol.findAll({});
        const LogConfig = await appoinmentConfigurationl.findAll({ where: { profileID: req.user.profileID } });

        return res.status(200).send({
            TotalAllData: CountTotal,
            TotalRows: alldata.length,
            TotalPages: TotalPages,
            page: page,
            data: appointmentWithCustomerData,
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


// Save Configuration
// const GetConfiguration = async (req, res) => {
//     try {
//         const profileID = req.user.profileID;
//         const { data } = req.body;

//         if (!Array.isArray(data) || data.length === 0) {
//             return res.status(400).send({
//                 success: false,
//                 message: 'No Configuration Data Provided..'
//             })
//         }

//         const validconfiguration = [];
//         const invalidconfiguration = [];

//         for (const config of data) {
//             const { ColumnName, Priority, IsActive } = config;
//             if (!ColumnName) {
//                 invalidconfiguration.push({ ColumnName, Priority, IsActive });
//                 continue;
//             }

//             const existingColumn = await appoinmentlogcol.findOne({ where: { ColumnName } })

//             if (existingColumn) {
//                 validconfiguration.push({ profileID: profileID, ColumnName, Priority, IsActive })
//             } else {
//                 invalidconfiguration.push({ ColumnName, Priority, IsActive })
//             }
//         }
//         if (validconfiguration.length > 0) {
//             const existingConfigs = await appoinmentConfigurationl.findAll({
//                 where: {
//                     ColumnName: validconfiguration.map((config) => config.ColumnName)
//                 }
//             })

//             const historydata = existingConfigs.map((config) => ({
//                 appoinmentConfigurationID: config.appoinmentConfigurationID,
//                 profileID: config.profileID,
//                 ColumnName: config.ColumnName,
//                 Priority: config.Priority,
//                 IsActive: config.IsActive,
//                 AddedOn: config.AddedOn,
//                 LastModifiedOn: new Date(),
//             }))
//             if (historydata.length > 0) {
//                 for (const historyItem of historydata) {
//                     await appoinmentConfigurationHistoryModel.create(historyItem);
//                 }
//             }
//             for (const config of validconfiguration) {
//                 const existingConfig = await appoinmentConfigurationl.findOne({
//                     where: { ColumnName: config.ColumnName }
//                 });

//                 if (existingConfig) {
//                     await existingConfig.update({
//                         Priority: config.Priority,
//                         IsActive: config.IsActive,
//                         profileID: config.profileID
//                     });
//                 } else {
//                     await appoinmentConfigurationl.create(config);
//                 }
//             }

//             return res.status(200).send({
//                 message: 'Configuration Processed Successfully.',
//                 validconfiguration,
//                 invalidconfiguration
//             });
//         }
//         return res.status(400).send({
//             message: 'No Valid Configuration Found.',
//             invalidconfiguration
//         });

//     } catch (error) {
//         console.log(error);
//         return res.status(400).send({
//             success: false,
//             message: error.message
//         })
//     }
// }

// const GetConfiguration = async (req, res) => {
//     try {
//         const profileID = req.user.profileID;
//         const { data } = req.body;

//         if (!Array.isArray(data) || data.length === 0) {
//             return res.status(400).send({
//                 message: 'No Configuration Data Provided.'
//             });
//         }

//         const validConfiguration = [];
//         const invalidConfiguration = [];

//         // Validate and categorize configurations
//         for (const config of data) {
//             const { ColumnName, Priority, IsActive } = config;

//             if (!ColumnName) {
//                 invalidConfiguration.push({ ColumnName, Priority, IsActive });
//                 continue;
//             }

//             const existingColumn = await appoinmentlogcol.findOne({ where: { ColumnName, Status: 1 } });

//             if (existingColumn) {
//                 validConfiguration.push({ profileID: profileID, ColumnName, Priority, IsActive });
//             } else {
//                 invalidConfiguration.push({ ColumnName, Priority, IsActive });
//             }
//         }

//         if (validConfiguration.length > 0) {
//             const existingConfigs = await appoinmentConfigurationl.findAll({
//                 where: {
//                     ColumnName: validConfiguration.map((config) => config.ColumnName)
//                 }
//             });

//             // Prepare data for history table
//             const historyData = existingConfigs.map((config) => ({
//                 appoinmentConfigurationID: config.appoinmentConfigurationID,
//                 profileID: config.profileID,
//                 ColumnName: config.ColumnName,
//                 Priority: config.Priority,
//                 IsActive: config.IsActive,
//                 AddedOn: config.AddedOn,
//                 LastModifiedOn: new Date(),
//             }));

//             if (historyData.length > 0) {
//                 await appoinmentConfigurationHistoryModel.bulkCreate(historyData);
//             }

//             // Determine configurations to update and add
//             const configToUpdate = validConfiguration.filter(config =>
//                 existingConfigs.some(existing => existing.ColumnName === config.ColumnName)
//             );

//             const configToAdd = validConfiguration.filter(config =>
//                 !existingConfigs.some(existing => existing.ColumnName === config.ColumnName)
//             );

//             // Update existing configurations
//             if (configToUpdate.length > 0) {
//                 await Promise.all(configToUpdate.map(config =>
//                     appoinmentConfigurationl.update(
//                         { Priority: config.Priority, IsActive: config.IsActive },
//                         { where: { profileID: profileID, ColumnName: config.ColumnName } }
//                     )
//                 ));
//             }

//             // Add new configurations
//             if (configToAdd.length > 0) {
//                 await appoinmentConfigurationl.bulkCreate(configToAdd);
//             }

//             // Optionally handle removal of configurations not in the new data
//             const configToRemove = existingConfigs.filter(existing =>
//                 !validConfiguration.some(config => config.ColumnName === existing.ColumnName)
//             );

//             if (configToRemove.length > 0) {
//                 await appoinmentConfigurationl.update(
//                     { IsActive: 0 },
//                     { where: { ColumnName: configToRemove.map(config => config.ColumnName), profileID: profileID } }
//                 );
//             }

//             return res.status(200).send({
//                 message: 'Configuration Process Successfully.',
//                 invalidConfiguration,
//                 validConfiguration
//             });
//         }

//         return res.status(400).send({
//             message: 'No Valid Configuration Found.',
//             invalidConfiguration
//         });

//     } catch (error) {
//         console.log(error);
//         return res.status(400).send({
//             Error: error.message
//         });
//     }
// };

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

        for (const config of data) {
            const { ColumnName, Priority, IsActive } = config;
            if (!ColumnName) {
                invalidconfiguration.push({ ColumnName, Priority, IsActive });
                continue;
            }

            const existingColumn = await appoinmentlogcol.findOne({ where: { ColumnName, Status: 'Active' } });

            if (existingColumn) {
                validconfiguration.push({ profileID: profileID, ColumnName, Priority, IsActive });
            } else {
                invalidconfiguration.push({ ColumnName, Priority, IsActive });
            }
        }

        if (validconfiguration.length > 0) {
            const existingConfigs = await appoinmentConfigurationl.findAll({
                where: {
                    ColumnName: validconfiguration.map((config) => config.ColumnName)
                }
            });

            // Prepare history data from existing configurations
            const historyData = existingConfigs.map((config) => ({
                appoinmentConfigurationID: config.appoinmentConfigurationID,
                profileID: config.profileID,
                ColumnName: config.ColumnName,
                Priority: config.Priority,
                IsActive: config.IsActive,
                AddedOn: config.AddedOn,
                LastModifiedOn: new Date(),
            }));

            // Save history before updating any existing configurations
            if (historyData.length > 0) {
                await appoinmentConfigurationHistoryModel.bulkCreate(historyData);
            }

            // Filter out configurations to update and to add
            const configToUpdate = validconfiguration.filter(config =>
                existingConfigs.some(existing => existing.ColumnName === config.ColumnName)
            );

            const configToAdd = validconfiguration.filter(config =>
                !existingConfigs.some(existing => existing.ColumnName === config.ColumnName)
            );

            // Update existing configurations
            if (configToUpdate.length > 0) {
                await Promise.all(configToUpdate.map(config =>
                    appoinmentConfigurationl.update(
                        { Priority: config.Priority, IsActive: config.IsActive },
                        { where: { profileID: profileID, ColumnName: config.ColumnName } }
                    )
                ));
            }

            // Add new configurations
            if (configToAdd.length > 0) {
                await appoinmentConfigurationl.bulkCreate(configToAdd);
            }

            // Optionally handle removal of configurations not in the new data
            const configToRemove = existingConfigs.filter(existing =>
                !validconfiguration.some(config => config.ColumnName === existing.ColumnName)
            );

            if (configToRemove.length > 0) {
                await appoinmentConfigurationl.update(
                    { IsActive: 0 },
                    { where: { ColumnName: configToRemove.map(config => config.ColumnName), profileID: profileID } }
                );
            }

            return res.status(200).send({
                message: 'Configuration Processed Successfully.',
                invalidconfiguration,
                validconfiguration
            });
        }

        return res.status(400).send({
            message: 'No Valid Configuration Found.',
            invalidconfiguration
        });

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            message: 'Internal Server Error'
        });
    }
};

// GetByID
const GetByID = async (req, res) => {
    try {
        const id = req.params.id

        const FindData = await appoinmentmodel.findOne({ where: { appointmentID: id, IsDeleted: 0 } });
        if (!FindData) {
            return res.status(400).send({
                success: false,
                message: 'Appionment Not Found..'
            })
        }

        const customerData = await customermodel.findOne({ where: { customerID: FindData.customerID } });

        const responseData = {
            ...FindData.dataValues,
            customerName: customerData ? customerData.name : null
        };


        return res.status(200).send({
            success: false,
            message: 'Appoinment Found Successfully..',
            Data: responseData
        })

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        })
    }
}

// Update
const Update = async (req, res) => {
    try {
        const id = req.params.id;
        const { provider, service, date, starttime, endtime, customerID, internalnote } = req.body;

        const findData = await appoinmentmodel.findOne({ where: { appointmentID: id, IsDeleted: 0 } });
        if (!findData) {
            return res.status(400).send({
                success: false,
                message: 'Appoinmnet Data Not Found..'
            })
        }
        // Validate the provider
        const FindStaff = await stffmodel.findOne({ where: { name: provider } });
        if (!FindStaff) {
            return res.status(400).send({
                success: false,
                message: 'Staff Not Found...',
            });
        }

        // Validate the service
        const FindService = await serviceModel.findOne({ where: { title: service } });
        if (!FindService) {
            return res.status(400).send({
                success: false,
                message: 'Service Not Found...',
            });
        }

        // Validate the customer
        const FindCustomer = await customermodel.findOne({ where: { customerID: customerID } });
        if (!FindCustomer) {
            return res.status(400).send({
                success: false,
                message: 'Customer Not Found...',
            });
        }

        // Custom date handling: ensure the date is in the right format
        const appointmentDate = new Date(date);
        if (isNaN(appointmentDate.getTime())) {
            return res.status(400).send({
                success: false,
                message: 'Invalid date format. Please provide a valid date.',
            });
        }

        // Convert custom time format to standard format
        const validStartTime = convertCustomTimeFormat(starttime);
        const validEndTime = convertCustomTimeFormat(endtime);

        // Check for valid time formats
        if (!/^\d{1,2}:\d{2} (AM|PM)$/.test(validStartTime) || !/^\d{1,2}:\d{2} (AM|PM)$/.test(validEndTime)) {
            return res.status(400).send({
                success: false,
                message: 'Invalid starttime or endtime format. Please provide valid times.',
            });
        }

        // Combine date and time into a single string for parsing
        const parsedStartTime = new Date(`${appointmentDate.toISOString().split('T')[0]} ${validStartTime}`);
        const parsedEndTime = new Date(`${appointmentDate.toISOString().split('T')[0]} ${validEndTime}`);

        // Validate starttime and endtime
        if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
            return res.status(400).send({
                success: false,
                message: 'Invalid starttime or endtime format. Please provide valid times.',
            });
        }

        // Ensure starttime is before endtime
        if (parsedStartTime >= parsedEndTime) {
            return res.status(400).send({
                success: false,
                message: 'Start time must be before end time.',
            });
        }

        // Check for existing appointments for the same provider on the same date
        const existingAppointments = await appoinmentmodel.findOne({
            where: {
                provider,
                service,
                date: appointmentDate,
                [Op.or]: [
                    {
                        starttime: {
                            [Op.lte]: validEndTime
                        },
                        endtime: {
                            [Op.gte]: validStartTime
                        }
                    }
                ]
            }
        });

        if (existingAppointments) {
            return res.status(400).send({
                success: false,
                message: 'The Time Slot Is Already Booked For This Service With This Provider.',
            });
        }

        // Old Data Added To History Table
        const Historydata = await appoinmenthistoryModel.create({
            appointmentID: findData.appointmentID,
            provider: findData.provider,
            service: findData.service,
            date: findData.date,
            starttime: findData.starttime,
            endtime: findData.endtime,
            customerID: findData.customerID,
            internalnote: findData.internalnote,
            BackupCreatedBy: findData.createdBy,
            BackupCreatedOn: new Date(),
        })

        const update = await findData.update({
            provider,
            service,
            date: appointmentDate,
            starttime: validStartTime,
            endtime: validEndTime,
            customerID,
            internalnote,
        })

        return res.status(200).send({
            success: true,
            message: 'Appoinment Update Successfully..',
            Data: update
        })


    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        })
    }
}

// Delete
const Delete = async (req, res) => {
    try {
        const ids = req.params.id.split(',');

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).send({
                success: false,
                message: 'No Appoinment IDs Provided For Deletion'
            });
        }

        const Findappoinmnet = await appoinmentmodel.findAll({
            where: {
                appointmentID: ids,
                IsDeleted: 0
            }
        });

        if (Findappoinmnet.length === 0) {
            return res.status(400).send({
                success: false,
                message: 'No Appoinmnet Found For The Provided ID.'
            });
        }

        // Add HistoryData On Own History Table...
        const historyRecords = Findappoinmnet.map(appoinmnet => ({
            appointmentID: appoinmnet.appointmentID,
            provider: appoinmnet.provider,
            service: appoinmnet.service,
            date: appoinmnet.date,
            starttime: appoinmnet.starttime,
            endtime: appoinmnet.endtime,
            customer: appoinmnet.customer,
            internalnote: appoinmnet.internalnote,
            BackupCreatedBy: appoinmnet.createdBy,
            BackupCreatedOn: new Date(),
        }));

        // Bulk create history records
        await appoinmenthistoryModel.bulkCreate(historyRecords);

        // Mark services as deleted
        const changedata = await appoinmentmodel.update({ IsDeleted: 1 }, { where: { appointmentID: ids } });

        if (changedata[0] === 0) {
            return res.status(400).send({
                success: false,
                message: 'No Appoinmnet Were Deleted.'
            });
        }

        return res.status(200).send({
            success: true,
            message: 'Appoinmnet Deleted Successfully.'
        });

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        });
    }
}

// Export To CSV File
const exportAppointmentsToCSV = async (req, res) => {
    try {
        // Retrieve appointments from the database
        const appointments = await appoinmentmodel.findAll({
            attributes: ['appointmentID', 'provider', 'service', 'date', 'starttime', 'endtime', 'customer', 'internalnote'],
        });

        // Define the CSV writer
        const csvWriter = createObjectCsvWriter({
            path: 'appointments.csv', // Specify the file path for the CSV
            header: [
                { id: 'appointmentID', title: 'Appointment ID' },
                { id: 'provider', title: 'Provider' },
                { id: 'service', title: 'Service' },
                { id: 'date', title: 'Date' },
                { id: 'starttime', title: 'Start Time' },
                { id: 'endtime', title: 'End Time' },
                { id: 'customer', title: 'Customer' },
                { id: 'internalnote', title: 'Internal Note' }
            ]
        });

        // Format the data to match the CSV header
        const records = appointments.map(appointment => {
            // Ensure the date is correctly parsed
            const appointmentDate = appointment.date instanceof Date ? appointment.date : new Date(appointment.date);

            return {
                appointmentID: appointment.appointmentID,
                provider: appointment.provider,
                service: appointment.service,
                // Ensure the date is formatted correctly
                date: appointmentDate && !isNaN(appointmentDate.getTime()) ?
                    appointmentDate.toISOString().split('T')[0] : '', // format date to YYYY-MM-DD
                starttime: appointment.starttime,
                endtime: appointment.endtime,
                customer: appointment.customer,
                internalnote: appointment.internalnote
            };
        });

        // Write records to the CSV file
        await csvWriter.writeRecords(records);

        // Respond with a success message
        res.status(200).send({
            success: true,
            message: 'Appointments exported successfully to appointments.csv.',
            file: 'appointments.csv'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({
            success: false,
            message: 'An error occurred while exporting appointments to CSV.'
        });
    }
}

module.exports = ({
    AddAppoinment, GetAllListData, GetList, GetConfiguration, GetByID, Update, Delete, exportAppointmentsToCSV
})