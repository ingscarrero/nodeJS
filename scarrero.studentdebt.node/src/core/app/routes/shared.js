'use strict';
var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/site/:category', function(req, res, next) {
  var category = req.params.category;

  var response = {
      code: 0,
      error: undefined,
      message: []  
  }

  switch (category) {
    case 'map':
      response.message = [
        { 
            caption:"Link 1", 
            uri:"/link1", 
            items: [
                { caption: 'Sub-link 1', uri: '/link1/sublink1' },
                { caption: 'Sub-link 2', uri: '/link1/sublink2' },
                { caption: 'Sub-link 3', uri: '/link1/sublink3' },
                { caption: 'Sub-link 4', uri: '/link1/sublink4' },
                { caption: 'Sub-link 5', uri: '/link1/sublink5' }
            ]
        },
        { 
            caption:"Link 2", 
            uri:"/link2", 
            items: [
                { caption: 'Sub-link 1', uri: '/link2/sublink1' },
                { caption: 'Sub-link 2', uri: '/link2/sublink2' },
                  { caption: 'Sub-link 3', uri: '/link2/sublink3' }
            ]
        },
        { 
            caption:"Link 3", 
            uri:"/link3", 
            items: [
                { caption: 'Sub-link 1', uri: '/link3/sublink1' },
                { caption: 'Sub-link 2', uri: '/link3/sublink2' }
            ]
        },
        { 
            caption:"Link 4", 
            uri:"/link4", 
            items: [
                { caption: 'Sub-link 1', uri: '/link4/sublink1' },
                { caption: 'Sub-link 2', uri: '/link4/sublink2' }
            ]
        },
      ]
      break;
    case 'version':
      response.message = [
          'Version 0.0.1',
          'Social Solutions Technologies © All rights reserved',
          'San Francisco (CA), USA',
          '2017'
      ] 
      break;
    default:
      break;
  }

  

  res.header('Content-type','application/json');
  res.header('Charset','utf8');
  res.status(200).jsonp(response);
});

module.exports = router;