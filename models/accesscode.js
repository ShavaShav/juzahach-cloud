'use strict';

var crypto   = require('crypto');

module.exports = (sequelize, DataTypes) => {
  
  const ACCESS_CODE_LENGTH = 6;    // 6 characters
  const ACCESS_CODE_TTL = 3600000; // expires in 1 hour
  
  const AccessCode = sequelize.define('AccessCode', {
    accessCode: DataTypes.STRING
  }, {
    freezeTableName: true,
    tableName: 'AccessCodes',
    timestamps: true
  });

  AccessCode.associate = function(models) {
    // Access code belongs to a single user (adds userId field)
    AccessCode.belongsTo(models.User, {as: 'user', foreignKey: 'userId'});
  };
  
  // Static helper function to retry access code creation on taken/duplicate
  AccessCode.createUnique = function(userId, retries = 5){

    // Create an access token (random string)
    let accessCode = crypto.randomBytes(ACCESS_CODE_LENGTH / 2).toString('hex');
    // Add to database with user id
    return AccessCode.create({
      accessCode: accessCode, 
      userId: userId
    }).then(accessCodePair => {
      // Set to delete when expired. 
      // TODO: instead, set up a chron job to goes through db for old access tokens
      setTimeout(() => {
        accessCodePair.destroy();
      }, ACCESS_CODE_TTL);
      // Return the new access code object
      return accessCodePair;
    }).catch(err => {
      // Access code is probably taken, retry
      if (--retries < 0) throw err;
      return createUniqueAccessCode(userId, retries);
    });
  }

  return AccessCode;
};