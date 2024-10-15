const express = require('express');

const routes = express.Router();

// / Payment Controller
const paymentController = require('../controller/PaymentController');

// Token Verification
const TokenVerify = require('../middelware/jwtToken');

// Routes
routes.post('/', TokenVerify, paymentController.AddPayment);

routes.get('/', TokenVerify, paymentController.viewPayment);

routes.get('/:id', TokenVerify, paymentController.GetByID);

routes.post('/manual', TokenVerify, paymentController.maunualAdd);

module.exports = routes;