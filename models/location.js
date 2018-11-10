'use strict'

module.exports = (sequelize, DataType) => {
  const Location = sequelize.define('Location', {
    latitude: DataType.DOUBLE,
    longitude: DataType.DOUBLE,
    timestamp: DataType.DATE
  }, {

    freezeTableName: true,
    tableName: 'Locations',
    timestamps: true
  });

  Location.associate = function(models){
    // Each location belongs to one device
    Location.belongsTo(models.Device, {as: 'device'});
  };

  return Location;
};