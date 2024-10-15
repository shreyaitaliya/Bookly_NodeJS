// const express = require('express');
// // const port = 3000;
// const app = express();
// const path = require('path')
// const bodyparser = require('body-parser');
// app.use('/', require('./routes/index'))
// const db = require('./config/db');

// app.use(bodyparser.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded
// app.use(bodyparser.json());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// const port = process.env.PORT || 3000;

// app.listen(port, (error) => {
//     if (error) {
//         console.log(error);
//         return false;
//     }
//     console.log(`Server Start On Port :- ${port}`);

// })



const express = require('express');
const bodyparser = require('body-parser');
const path = require('path');

const app = express();
const db = require('./config/db');

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/', require('./routes/index'));

// Middleware to log incoming requests
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

const port = process.env.PORT || 3000;

app.listen(port, (error) => {
    if (error) {
        console.log(error);
        return false;
    }
    console.log(`Server Start On Port :- ${port}`);
});
