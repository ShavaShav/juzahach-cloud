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
    console.log(err);
    return res.status(501).json({error: {message: err.message}});
  });

});

// GET /device/#
// Get single device
// router.get('/:id', auth.required, function(req, res, next) {
//   const userId = req.user.id;
//
//   return Device.findById(req.params.id).then(device=> {
//     if (!device || device.userId != userId) {
//       // doesn't exist or doesn't belong to user
//       return res.status(404).json({error: "Device not found"});
//     }
//     // Return device
//     return res.json(device));
//   });
// });

//GET /device
// Returns all devices for authorized user
router.get('/', auth.required, function(req, res, next){

  models.Device.findAll().then(function(deviceList) {
    // Return the device
    return res.json({devices: deviceList});
  }).catch(next);
});


module.exports = router;
