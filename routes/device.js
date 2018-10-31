var router   = require('express').Router();
var auth     = require('./auth');
var models   = require('../models');

// POST /device/register
// Create an access token for user, to be used by device in the edge-route
router.post('/register', auth.required, function(req, res, next){

  models.AccessCode.createUnique(req.user.id).then(accessCode => {    
    // Return entire access code object
    return res.json(accessCode);
  }).catch(err => {
    return res.status(501).json({error: {message: "Unable to create a unique access code"}});
  });
  
});

//GET /Device
router.get('/device', function(req, res, next){
  models.Device.findAll().then(function(deviceList) {
    if (!deviceList) {
        return res.status(404).json({errors: {message: "No device found"}}); // No device found
    }
    // Return the device
    return res.json({device: deviceList});
  }).catch(next);
});

module.exports = router;
