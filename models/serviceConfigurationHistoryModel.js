module.exports = (sequelize, DataTypes) => {
    const serviceConfigurationhistory = sequelize.define("servicefConfigurationhistory", {
        historyserviceConfigurationID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        serviceConfigurationID: {
            type: DataTypes.INTEGER,
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
    return serviceConfigurationhistory;
};  