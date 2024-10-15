module.exports = (sequelize, DataTypes) => {
    const appionmentLogCol = sequelize.define("appionmentLogCol", {
        appionmentLogColID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        ColumnName: {
            type: DataTypes.STRING(200)
        },
        Alias: {
            type: DataTypes.STRING(200)
        },
        Status: {
            type: DataTypes.STRING(200)
        }
    }, {
        timestamps: false,
    });
    return appionmentLogCol;
};