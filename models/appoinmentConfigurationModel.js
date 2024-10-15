module.exports = (sequelize, DataTypes) => {
    const appoinmentConfiguration = sequelize.define("appoinmentConfiguration", {
        appoinmentConfigurationID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        profileID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
        },
        ColumnName: {
            type: DataTypes.STRING(100)
        },
        Priority: {
            type: DataTypes.STRING(100)
        },
        IsActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        AddedOn: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: false,
    });
    return appoinmentConfiguration;
};