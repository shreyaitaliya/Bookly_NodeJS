const { DataTypes, Op, where } = require("sequelize");
const db = require('../config/db');
const sequelize = db.sequelize;
const customerModel = require("../models/customerModel")(sequelize, DataTypes);
const customerhistoryModel = require("../models/customerhistoryModel")(sequelize, DataTypes);
const customerlogcolModel = require("../models/customerlogcolModel")(sequelize, DataTypes);
const customerconfigurationModel = require("../models/customerConfiguration")(sequelize, DataTypes);
const customerconfigurationhistoryModel = require("../models/customerConfigurationHistoryModel")(sequelize, DataTypes);
const appionmentModel = require('../models/appoinmentModel')(sequelize, DataTypes);;
const fs = require('fs');

// Add Customer
const AddCustomer = async (req, res) => {
    try {
        const { name, phone, email, tags, dateofbirth, country, state, postalcode, city, streetaddress, additionaladdress, streetnumber, note } = req.body;

        const user = req.user.username;
        const createdBy = user;
        const LastModifiedBy = user;

        // Check if customer with this email already exists
        const findCustomer = await customerModel.findOne({ where: { email } });
        if (findCustomer) {
            return res.status(400).send({
                success: false,
                message: 'This email already exists.'
            });
        }

        // Proceed with creating a new customer
        const addCustomer = await customerModel.create({
            image: req.file?.path || "",  // Check if file exists
            name,
            phone,
            email,
            tags,
            dateofbirth,
            country,
            state,
            postalcode,
            city,
            streetaddress,
            additionaladdress,
            streetnumber,
            note,
            user,
            createdBy,
            LastModifiedBy
        });

        return res.status(200).send({
            success: true,
            message: 'Customer added successfully.',
            data: addCustomer
        });

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        });
    }
};

// Get All Data Drop-Down
const GetAllData = async (req, res) => {
    try {
        const alldata = await customerModel.findAll({ where: { IsDeleted: 0 } });
        if (!alldata) {
            return res.status(400).send({
                success: false,
                message: 'No Customer Data Found..'
            })
        }

        return res.status(200).send({
            success: false,
            message: 'Customer Data Viewed Successfully..',
            Data: alldata
        })

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message,
        })
    }
}

// Get All Data
const GetList = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const filter = req.query.filter || '';

        const whereclause = {
            [Op.or]: [
                { name: { [Op.like]: `%${filter}%` } },
                { email: { [Op.like]: `%${filter}%` } },
            ]
        }

        const alldata = await customerModel.findAll({
            limit, offset, where: {
                ...whereclause,
                IsDeleted: 0
            },
            order: [['LastmodifiedOn']]
        })

        // const appoinmentData = await appionmentModel.findAll({ where: { IsDeleted: 0 } });

        // // Attach appointment count only with customer name
        // const dataWithAppointmentCount = alldata.map(customer => {
        //     const customerAppointments = appoinmentData.filter(appointment => appointment.customer === customer.name);
        //     return {
        //         name: customer.name,
        //         totalAppointments: customerAppointments.length
        //     };
        // });

        // return res.send(dataWithAppointmentCount);

        const appointmentData = await appionmentModel.findAll({ where: { IsDeleted: 0 } });

        // Calculate total appointments
        const totalAppointments = appointmentData.length;

        const countTotal = await customerModel.count({ where: { ...whereclause, IsDeleted: 0 } });
        const Totalpages = Math.ceil(countTotal / limit);

        const columns = Object.keys(customerModel.rawAttributes);

        const customerlogcol = await Promise.all(
            columns.map(async (columns) => {
                return customerlogcolModel.findOrCreate({
                    where: { ColumnName: columns },
                    defaults: { Alias: columns, Status: 'Active' }
                })
            })
        )

        const LogColumns = await customerlogcolModel.findAll({});
        const logConfig = await customerconfigurationModel.findAll({ where: { profileID: req.user.profileID } });


        return res.status(200).send({
            TotalAllData: countTotal,
            Totalrows: alldata.length,
            Totalpages: Totalpages,
            TotalAppointments: totalAppointments,
            Page: page,
            Data: alldata,
            Logcolumns: LogColumns,
            LogConfig: logConfig
        })

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        })
    }
}

// Customer Save Column
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

            const existingColumn = await customerlogcolModel.findOne({ where: { ColumnName } })

            if (existingColumn) {
                validconfiguration.push({ profileID: profileID, ColumnName, Priority, IsActive })
            } else {
                invalidconfiguration.push({ ColumnName, Priority, IsActive })
            }
        }

        if (validconfiguration.length > 0) {
            const existingConfigs = await customerconfigurationModel.findAll({
                where: {
                    ColumnName: validconfiguration.map((config) => config.ColumnName)
                }
            })

            const historyData = existingConfigs.map((config) => ({
                customerConfigurationID: config.customerConfigurationID,
                profileID: config.profileID,
                ColumnName: config.ColumnName,
                Priority: config.Priority,
                IsActive: config.IsActive,
                AddedOn: config.AddedOn,
                LastModifiedOn: new Date(),
            }));

            if (historyData.length > 0) {
                for (const historyItem of historyData) {
                    await customerconfigurationhistoryModel.create(historyItem);
                }
            }
            for (const config of validconfiguration) {
                const existingConfig = await customerconfigurationModel.findOne({
                    where: { ColumnName: config.ColumnName }
                });

                if (existingConfig) {
                    await existingConfig.update({
                        Priority: config.Priority,
                        IsActive: config.IsActive,
                        profileID: config.profileID
                    });
                } else {
                    await customerconfigurationModel.create(config);
                }
            }

            return res.status(200).send({
                message: 'Configuration Processed Successfully.',
                validconfiguration,
                invalidconfiguration
            });
        }

        return res.status(400).send({
            success: true,
            message: 'No valid COnfiguration Found..',
            invalidconfiguration
        })

    } catch (error) {
        console.log();
        return res.status(400).send({
            success: false,
            message: error.message
        })
    }
}

// GetByID By Customer
const GetByID = async (req, res) => {
    try {
        const id = req.params.id;

        // Corrected the findOne query to use the 'where' clause
        const findData = await customerModel.findOne({
            where: {
                customerID: id,
                IsDeleted: 0
            }
        });

        if (!findData) {
            return res.status(400).send({
                success: false,
                message: 'Customer not found.',
            });
        }

        return res.status(200).send({
            success: true,
            message: 'Customer found successfully.',
            Data: findData
        });

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        });
    }
}

//Update Customer
const UpdateCustomer = async (req, res) => {
    try {
        const id = req.params.id;

        const { name, email, phone, tags, dateofbirth, country, state, postcode, city, streetaddress, additionaladdress, streetnumber, note } = req.body;

        const existingcustomer = await customerModel.findByPk(id);

        if (!existingcustomer) {
            return res.status(404).send({
                message: 'Staff not found',
                success: false
            });
        }

        // Save old data to the history table
        await customerhistoryModel.create({
            customerID: existingcustomer.customerID,
            image: existingcustomer.image,
            name: existingcustomer.name,
            user: existingcustomer.user,
            email: existingcustomer.email,
            phone: existingcustomer.phone,
            tags: existingcustomer.tags,
            dateofbirth: existingcustomer.dateofbirth,
            country: existingcustomer.country,
            state: existingcustomer.state,
            postalcode: existingcustomer.postalcode,
            city: existingcustomer.city,
            streetaddress: existingcustomer.streetaddress,
            additionaladdress: existingcustomer.additionaladdress,
            streetnumber: existingcustomer.streetnumber,
            note: existingcustomer.note,
            BackupCreatedBy: existingcustomer.createdBy,
            BackupCreatedOn: new Date()
        });

        // If a new image is uploaded, handle the image replacement
        let imagePath = existingcustomer.image;
        if (req.file) {
            const newImagePath = req.file.path;

            if (existingcustomer.image && fs.existsSync(path.resolve(existingcustomer.image))) {
                fs.unlinkSync(path.resolve(existingcustomer.image));
            }

            imagePath = newImagePath;
        }

        const updatedData = await existingcustomer.update({
            name, email, phone, tags, dateofbirth, country, state, postcode, city, streetaddress, additionaladdress, streetnumber, note
        });

        return res.status(200).send({
            message: 'Customer updated successfully.',
            success: true,
            updatedData
        });

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        })
    }
}

// Delete Customer
const DeleteCustomer = async (req, res) => {
    try {
        const id = req.params.id.split(',');

        if (!Array.isArray(id) || id.length === 0) {
            return res.status(400).send({
                success: false,
                message: 'No Customer IDs provided for deletion.'
            });
        }

        // Find existing staff members that are not deleted
        const existingCustomer = await customerModel.findAll({
            where: {
                customerID: id,
                IsDeleted: 0
            }
        });

        // Check if any of the staff exist
        if (existingCustomer.length === 0) {
            return res.status(400).send({
                success: false,
                message: 'No Staff found for the provided ID.'
            });
        }

        // Create history entries for each staff member
        const historyPromises = existingCustomer.map(async (customer) => {
            return customerhistoryModel.create({
                customerID: customer.customerID,
                image: customer.image,
                name: customer.name,
                user: customer.user,
                email: customer.email,
                phone: customer.phone,
                tags: customer.tags,
                dateofbirth: customer.dateofbirth,
                country: customer.country,
                state: customer.state,
                postalcode: customer.postalcode,
                city: customer.city,
                streetaddress: customer.streetaddress,
                additionaladdress: customer.additionaladdress,
                streetnumber: customer.streetnumber,
                note: customer.note,
                BackupCreatedBy: customer.createdBy,
                BackupCreatedOn: new Date()
            });
        });

        await Promise.all(historyPromises);

        // Update the deletion status of the staff members
        const changedStatus = await customerModel.update(
            { IsDeleted: 1 },
            { where: { customerID: id } }
        );

        // Check if any staff were updated
        if (changedStatus[0] === 0) {
            return res.status(500).send({
                success: false,
                message: "No Customer were deleted."
            });
        }

        return res.status(200).send({
            success: true,
            message: "Customer deleted successfully."
        });

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        });
    }
}

module.exports = ({ AddCustomer, GetAllData, GetList, GetConfiguration, GetByID, UpdateCustomer, DeleteCustomer })  