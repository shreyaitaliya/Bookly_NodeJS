const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('Bookly', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false,
})

sequelize.authenticate().then(() => {
    console.log('connected');
}).catch((error) => {
    console.log(error);
    return false;
})

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// profile 
db.profileModel = require('../models/profilemodel')(sequelize, DataTypes);
db.profileHistoryModel = require('../models/profileHistoryModel')(sequelize, DataTypes);

// category For Customer 
db.categoryModel = require('../models/categoryModel')(sequelize, DataTypes);
db.categoryHistoryModel = require('../models/categoryHistoryModel')(sequelize, DataTypes);

// Staff
db.staffModel = require('../models/staffModel')(sequelize, DataTypes);
db.staffhistoryModel = require('../models/staffhistoryModel')(sequelize, DataTypes);
db.staffLogColModel = require('../models/staffLogColModel')(sequelize, DataTypes);
db.staffConfigurationModel = require('../models/staffConfigurationModel')(sequelize, DataTypes);
db.staffConfigurationhistoryModel = require('../models/staffconfigurationhistoryModel')(sequelize, DataTypes);


db.sequelize.sync({ force: false, alter: false }).then(() => {
    console.log('yes re-sync');
})

module.exports = db;    