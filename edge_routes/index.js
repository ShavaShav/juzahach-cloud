var express = require('express');
var router  = express.Router();
var models  = require('../models');

router.post('/register', function(req, res, next) {

  const accessCode = req.body.device.accessCode;
  const macAddress = req.body.device.macAddress;

  if(!accessCode){
    return res.status(422).json({errors: {accessCode: "can't be blank"}});
  }

  if(!macAddress){
    return res.status(422).json({errors: {macAddress: "can't be blank"}});
  }

  // Get user from access code
  return models.AccessCode.findOne({
    where: {accessCode: accessCode},
    include: ['user'],
  }).then(accessCode => {
    if (!accessCode) 
       throw Error("Invalid access code"); // Doesn't exist
    
    // Search for device by MAC, if exists use it, else create the device (naming it New Device).
    return models.Device.findOrCreate({
      where: {macAddress: macAddress},
      defaults: {name: 'New Device'}
    }).spread((device, created) => {
      // Relate device to user through UserDevices table.
      return device.addUser(accessCode.user).then(() => { 
        // Can now safely delete the access code
        return accessCode.destroy().finally(() => {
          //  Return a JWT for device, regardless of whether access code deletion worked or not
          return res.json({token: device.generateJWT()});
        });
      });
    });
  }).catch(err => { // catch all
    console.log(err);
    res.status(500).json({errors: {message: err.message}});
  });
});

router.post('/location', auth.required, function(req, res, next) {

  // Store location JSON and device's id from request
  const location = req.body.location;
  const deviceId = req.device.id;

  // TODO: Store location with deviceId in database
  
  // Return OK status, indicated we stored location successfully
  return res.status(200);
});

module.exports = router;
