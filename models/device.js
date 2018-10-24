'use strict';

var jwt    = require('jsonwebtoken');
var secret = require('../config').JWT_SECRET;

module.exports = (sequelize, DataTypes) => {
  const Device = sequelize.define('Device', {
    macAddress: DataTypes.STRING,
    name: DataTypes.STRING,
    type: DataTypes.STRING,
    brand: DataTypes.STRING,
    model: DataTypes.STRING
  }, {
    freezeTableName: true,
    tableName: 'Devices',
    timestamps: true
  });

  Device.associate = function(models) {
    // A device can be registered to multiple users (M:N)
    Device.belongsToMany(models.User, {through: 'UserDevices', as: 'user'});
  };

  // Returns a fresh JSON webtoken for device
  Device.prototype.generateJWT = function() {
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 360); // expire in a year, since we don't have a refresh method yet

    return jwt.sign({
      id: this.id,
      macAddress: this.macAddress,
      exp: parseInt(exp.getTime() / 1000),
    }, secret);
  };

  return Device;
};