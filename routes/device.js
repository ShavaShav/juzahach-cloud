var router   = require('express').Router();
var auth     = require('../auth');
var models   = require('../models');

const Op = models.Sequelize.Op;

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
router.get('/:id', auth.required, function(req, res, next) {
  const userId = req.user.id;

  return models.Device.find({
    where: { id: req.params.id },
    include: {
      model: models.User,
      as: 'user',
      where: { id: userId },
      through: { attributes: [] }, // remove UserDevices data
      attributes: [] // remove User data
    }
  }).then(device=> {

    if (!device) {
      // doesn't exist or doesn't belong to user
      return res.status(404).json({error: "Device not found"});
    }
    // Return device
    return res.json({device: device});
  });
});

// GET /device
// Returns all devices for authorized user
router.get('/', auth.required, function(req, res, next){
  const userId = req.user.id;

  return models.Device.findAll({
    include: {
      model: models.User,
      as: 'user',
      where: { id: userId },
      through: { attributes: [] }, // remove UserDevices data
      attributes: [] // remove User data
    },
  }).then(function(deviceList) {

    // Return the device list
    return res.json({devices: deviceList});
  }).catch(next);
});

// PUT /device/#1
// Updates existing device, if belonging to use
router.put('/:id', auth.required, function(req, res, next){
  const userId = req.user.id;
  const deviceUpdates = req.body.device;

  return models.Device.find({
    where: { id: req.params.id },
    include: {
      model: models.User,
      as: 'user',
      where: { id: userId },
      through: { attributes: [] }, // remove UserDevices data
      attributes: [] // remove User data
    }
  }).then(function(device) {

    // Check if device exists or doesn't belong to user
    if (!device) {
      return res.status(404).json({errors: { message: "Device not found for user."}});
    }

    // Good, update the device
    return device.update(deviceUpdates).then(device => {
      // Return the updated device
      return res.json({device: device});
    });
  }).catch(next);
});

// GET /device/#/locations
// Returns all locations for device for authorized user
router.get('/:id/locations', auth.required, function(req, res, next){
  const userId = req.user.id;
  const deviceId = req.params.id;

  var timeFilter = []; // add the before/after times in an AND select

  if (req.query.start)
    timeFilter.push({ timestamp: { [Op.gt]: new Date(req.query.start) } } ); // exclusive start

  if (req.query.end) 
    timeFilter.push({ timestamp: { [Op.lte]: new Date(req.query.end) } } ); // inclusive end

  return models.Location.findAll({
    order: [ [ 'timestamp', 'DESC' ]],
    limit: parseInt(req.query.limit) || undefined, // if limit arg unset or bad, then gets all
    where: { 
      [Op.and]: timeFilter
    },
    include: {
      model: models.Device,
      as: 'device',
      where: { id: deviceId },
      attributes: [], // remove Device data
      duplicating: false,
      include: {
        model: models.User,
        as: 'user',
        where: { id: userId },
        through: { attributes: [] }, // remove UserDevices data
        attributes: [], // remove User data
        duplicating: false
      }
    }
  }).then(function(locationList) {
    // Return the location list
    return res.json({locations: locationList});
  }).catch(next);
});

module.exports = router;
