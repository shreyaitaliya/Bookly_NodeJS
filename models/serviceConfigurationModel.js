module.exports = (sequelize, DataTypes) => {
    const serviceconfiguration = sequelize.define("serviceconfiguration", {
        serviceConfigurationID: {
            type: DataTypes.INTEGER,
            primaryKey: true,  // Make this the primary key
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
    return serviceconfiguration;
};