const { DataTypes, Op, where } = require("sequelize");
const db = require('../config/db');
const sequelize = db.sequelize;
const paymentModel = require("../models/paymentModel")(sequelize, DataTypes);
const appointmentModel = require('../models/appoinmentModel')(sequelize, DataTypes);
const customerModel = require('../models/customerModel')(sequelize, DataTypes);
const maunualModel = require('../models/manualpaymentModel')(sequelize, DataTypes);


// Add Payment
const AddPayment = async (req, res) => {
    try {
        const { priceofpayment, customerID, appointmentID } = req.body;
        const createdBy = req.user.username;
        const LastModifiedBy = req.user.username;

        // Manual checks for customer and appointment
        const customer = await customerModel.findOne({ where: { customerID: customerID } });
        if (!customer) {
            return res.status(404).send({
                success: false,
                message: 'Customer not found.'
            });
        }

        const appointment = await appointmentModel.findOne({ where: { appointmentID: appointmentID, customerID: customerID } });
        if (!appointment) {
            return res.status(404).send({
                success: false,
                message: 'Appointment not found for this customer.'
            });
        }

        // Create the payment record
        const addpayment = await paymentModel.create({
            priceofpayment,
            customerID,
            appointmentID,
            createdBy,
            LastModifiedBy
        });

        return res.status(200).send({
            success: true,
            message: 'Payment added successfully.',
            Data: addpayment
        });

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        })
    }
}

// View Data 
const viewPayment = async (req, res) => {
    try {
        // Fetch all payment data
        const findpayment = await paymentModel.findAll({});

        if (findpayment.length > 0) {
            // Fetch customer details for all payments
            const customerIDs = findpayment.map(payment => payment.customerID);
            const findCustomers = await customerModel.findAll({
                where: { customerID: customerIDs }
            });

            // Fetch manual payments
            const manualPayments = await maunualModel.findAll({});

            // Combine payment data with corresponding customer, appointment, and manual payment data
            const paymentWithCustomerData = await Promise.all(findpayment.map(async (payment) => {
                const customer = await customerModel.findOne({
                    where: { customerID: payment.customerID },
                    attributes: ['name']
                });
                const appoinmnet = await appointmentModel.findOne({
                    where: { appointmentID: payment.appointmentID },
                    attributes: ['date', 'provider', 'service', 'createdOn']
                });

                // Fetch the total amount of manual payments linked to this paymentID
                const manualPaymentTotal = manualPayments
                    .filter(manual => manual.paymentID === payment.paymentID)
                    .reduce((total, manual) => total + manual.amount, 0);

                // Calculate the total for each payment (price + linked manual payments)
                const perPaymentTotal = payment.priceofpayment + manualPaymentTotal;

                return {
                    ...payment.toJSON(),
                    customerDetails: customer ? customer.toJSON() : null,
                    appointmentDetails: appoinmnet ? appoinmnet.toJSON() : null,
                    manualPaymentTotal, // Total manual payments for this payment
                    perPaymentTotal, // Sum of priceofpayment and manual payments
                };
            }));

            return res.status(200).send({
                success: true,
                message: 'Payment and Customer Data Viewed Successfully.',
                Data: paymentWithCustomerData,
            });
        } else {
            return res.status(200).send({
                success: true,
                message: 'No payment records found.',
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        });
    }
};


// GetById
const GetByID = async (req, res) => {
    try {
        const id = req.params.id;

        // Fetch payment details
        const findData = await paymentModel.findOne({ where: { paymentID: id, IsDeleted: 0 } });
        if (!findData) {
            return res.status(400).send({
                success: false,
                message: 'Payment Not Found...',
            });
        }

        // Fetch appointment details for the payment
        const appointment = await appointmentModel.findOne({
            where: { appointmentID: findData.appointmentID },
            attributes: ['date', 'provider', 'service', 'createdOn']
        });

        // Fetch customer details for the payment
        const customer = await customerModel.findOne({
            where: { customerID: findData.customerID },
            attributes: ['name']
        });

        // Combine payment, customer, and appointment details
        const paymentWithDetails = {
            ...findData.toJSON(),
            customerDetails: customer ? customer.toJSON() : null,
            appointmentDetails: appointment ? appointment.toJSON() : null,
        };

        return res.status(200).send({
            success: true,
            message: 'Payment Data Retrieved Successfully.',
            Data: paymentWithDetails
        });

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message
        });
    }
};

// MaunualAdd
const maunualAdd = async (req, res) => {
    try {
        const { reason, amount, paymentID } = req.body; // paymentID can be null or undefined
        const createdBy = req.user.username;
        const LastModifiedBy = req.user.username;

        // Create a manual payment entry
        const newManualPayment = await maunualModel.create({
            reason,
            amount,
            createdBy,
            LastModifiedBy,
            paymentID: paymentID || null, // Set paymentID to null if not provided
        });

        return res.status(200).send({
            success: true,
            message: 'Manual payment added successfully.',
            Data: newManualPayment,
        });

    } catch (error) {
        console.log(error);
        return res.status(400).send({
            success: false,
            message: error.message,
        });
    }
};


module.exports = ({ AddPayment, viewPayment, GetByID, maunualAdd })