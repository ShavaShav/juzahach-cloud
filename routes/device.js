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

module.exports = router;
