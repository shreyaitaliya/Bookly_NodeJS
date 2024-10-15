const express = require('express');

const routes = express.Router();

// Login Routes
routes.use('/login', require('../routes/loginRoutes'));

// Profile Routes
routes.use('/profile', require('../routes/profileRoutes'));

// Category Routes
routes.use('/category', require('../routes/categoryRoutes'));

// Staff Routes
routes.use('/staff', require('../routes/staffRoutes'));

// Cutsomer Routes
routes.use('/customer', require('../routes/customerRoutes'));

// Service Routes
routes.use('/service', require('../routes/serviceRoutes'));

// Appoinmnet Routes
routes.use('/appoinment', require('../routes/appionmentRoutes'));

// Dicount Routes
routes.use('/discount', require('../routes/discountRoutes'));

// Notification Routes
routes.use('/notification', require('../routes/notificationRoutes'))

routes.use('/cancel', require('../routes/cancelRoutes'));

//Payment Routes
routes.use('/payment', require('../routes/paymentRoutes'))

module.exports = routes 