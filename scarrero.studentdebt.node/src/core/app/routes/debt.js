'use strict';
var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/screening/:type', function(req, res, next) {
  //res.sendFile('index.html');
});

module.exports = router;