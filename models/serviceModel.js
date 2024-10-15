const { DataTypes } = require("sequelize");
const sequelize = require("../config/db").sequelize; // Import sequelize directly

module.exports = () => {
    const service = sequelize.define('service', {
        serviceID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        image: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        color: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        visibility: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            validate: {
                isIn: [[1, 2]]
            },
            comment: "'1 PUBLIC', '2 PRIVATE'",
        },
        price: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        providers: {  // staff
            type: DataTypes.STRING,
            allowNull: true,
        },
        providerspreference: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        periodbefore: {  // before and after set number of the day appointment
            type: DataTypes.STRING,
            allowNull: true,
        },
        periodafter: {  // before and after set number of the day appointment
            type: DataTypes.STRING,
            allowNull: true,
        },
        randomstaff: {  // Enable or Disabled to pick a random staff 
            type: DataTypes.INTEGER,
            defaultValue: 1, // Changed to 1 (enabled)
            validate: {
                isIn: [[0, 1]]
            },
            comment: "'0 DISABLED', '1 ENABLED'"
        },
        paymentmethod: {
            type: DataTypes.INTEGER,
            defaultValue: 0, // Changed to 0 (default)
            validate: {
                isIn: [[0, 1, 2]]
            },
            comment: "'0 DEFAULT', '1 LOCAL', '2 PAYPAL'"
        },
        info: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        timelegth: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        beforePaddingTime: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        afterPaddingTime: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        // onlinemetting: { // online meeting created
        //     type: DataTypes.INTEGER,
        //     defaultValue: 1, // Changed to 1 (Zoom)
        //     validate: {
        //         isIn: [[1, 2, 3, 4]]
        //     },
        //     comment: "'1 ZOOM', '2 GOOGLE MEET', '3 JITSI MEET', '4 BIGBLUEBUTTON'"
        // },
        // Limitappoiment: { // limit appointment per customer
        //     type: DataTypes.INTEGER,
        //     defaultValue: 1, // Changed to 1 (upcoming)
        //     validate: {
        //         isIn: [[1, 2, 3, 4, 5]]
        //     },
        //     comment: "'1 UPCOMING', '2 PER 24 HOURS', '3 PER 7 DAYS', '4 PER 30 DAYS', '5 PER 365 DAYS'"
        // },
        // seupurl: {  // set up url disabled or enabled 
        //     type: DataTypes.INTEGER,
        //     defaultValue: 1, // Changed to 1 (enabled)
        //     validate: {
        //         isIn: [[0, 1]]
        //     },
        //     comment: "'0 DISABLED', '1 ENABLED'"
        // },
        // minpriorbooking: {
        //     type: DataTypes.STRING,
        //     defaultValue: '1', // Assuming default as string '1'
        // },
        // minpriorcanceling: {
        //     type: DataTypes.STRING,
        //     defaultValue: '1', // Assuming default as string '1'
        // },
        createdBy: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        createdOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        LastModifiedBy: {
            type: DataTypes.STRING
        },
        LastModifiedOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        IsActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        IsDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
    }, {
        timestamps: false,
        tableName: "service",
    });

    return service;
}; 
