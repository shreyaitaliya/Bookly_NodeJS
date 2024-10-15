const validateRequest = (req, res, next, schema) => {
    const options = {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true,
    };
    const { error, value } = schema.validate(req.body, options);
    if (error) {
        // return res.json(error);
        res.status(400);
        res.send({
            ErrorCode: "VALIDATION",
            ErrorMessage: `Validation error: ${error.details
                .map((x) => x.message)
                .join(", ")}`,
        });
    } else {
        req.body = value;
        next();
    }
}

module.exports = { validateRequest }


// const Joi = require('joi');
// const schemas = require('../routes/index');

// const validate = (schemaName) => (req, res, next) => {
//     const schema = schemas[schemaName];
//     const { error } = schema.validate(req.body, { abortEarly: false });

//     if (error) {
//         const errorMessages = error.details
//             .map((err) => err.message.replace(/"/g, ''))
//             .join(', ');

//         return res.status(400).json({ error: errorMessages });
//     }

//     next();
// };

// module.exports = validate;