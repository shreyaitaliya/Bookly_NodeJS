module.exports = (sequelize, DataTypes) => {
    const stafflogcol = sequelize.define("stafflogcol", {
        staffLogID: {
            type: DataTypes.INTEGER,
            primaryKey: true,  // Make this the primary key
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
    return stafflogcol;
};