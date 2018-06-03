'use strict';
var express = require('express');
var router = express.Router();
var request = require("request");
/* GET home page. */
router.get('/:id', function(req, res, next) {
  var companyIdentifier = req.params.id;
  var response = {
      code: 0,
      error: undefined,
      message: {
        company: { 
            logo: '/images/company-logo.png', 
            icon: '/images/company-logo-only.png',
            name: 'Company Name', 
            detail: 'This the company slogan. Put here any inspirational idea that inspire customer\'s advocacy.',
            socialNetworks: [
              { url:'', img:'/images/twitter.png', provider:'Twitter'},
              { url:'', img:'/images/linkedin.ico', provider:'LinkedIn'},
              { url:'', img:'/images/fb.png', provider:'Facebook'}
            ] 
        }
      }  
  }

  res.header('Content-type','application/json');
  res.header('Charset','utf8');
  res.status(200).jsonp(response);
});

router.get('/:id/:category/:path', function(req, res, next) {
  var companyIdentifier = req.params.id;
  var category = req.params.category;
  var path = req.params.path;
  var message = {};

  var data = {
    customers: { 
      types: [
        { 
          img: '/images/IMG_3529.JPG', 
          title: 'Consumers', 
          detail: 'This is the information of the customer type 1. The fallowing lines are generated content. Please replace this content with the corresponding customer\'s information.' },
        { 
          img: '/images/IMG_3651.JPG', 
          title: 'Companies', 
          detail: 'This is the information of the customer type 3. The fallowing lines are generated content. Please replace this content with the corresponding customer\'s information.' 
        }
      ]
    },
    products: [
      { 
        id:1,
        name: 'Debt Platform', 
        advertising: { 
          brief: 'Debt Platform is an initiative that seeks for a comprehensive intermediation between creditor and debtors.', 
          summary: 'This text corresponds to the footer of the actual presented content. Please replace with any additional message that concludes the actual displayed content.' 
        }
      }
    ],
    portfolio:[
      {
        customerType:0,
        img: '/images/IMG_3529.JPG', 
        title: 'Consumer Portfolio', 
        detail: 'This area corresponds to a general description of the customer type. Please replace with the customer type information and portfolio introduction.',
        items:[
            { title:'Troubles with Debt', img: '/images/IMG_3529.JPG',details: [
                { img: '/images/IMG_3651.JPG', title: 'Feature 1', content: 'This is the information of the feature 1. The fallowing lines are generated content. Please replace this content with the corresponding detail\'s feature information.' },
                { img: '/images/IMG_3248.JPG', title: 'Feature 2', content: 'This is the information of the feature 2. The fallowing lines are generated content. Please replace this content with the corresponding detail\'s feature information.' },
                { img: '/images/IMG_3247.JPG', title: 'Feature 3', content: 'This is the information of the feature 3. The fallowing lines are generated content. Please replace this content with the corresponding detail\'s feature information.' }
                ]
            }, { title:'Debt Prepaid', img: '/images/IMG_3247.JPG',details:[
                    { img: '/images/IMG_3651.JPG', title: 'Feature 1', content: 'This is the information of the feature 1. The fallowing lines are generated content. Please replace this content with the corresponding detail\'s feature information.' },
                    { img: '/images/IMG_3248.JPG', title: 'Feature 2', content: 'This is the information of the feature 2. The fallowing lines are generated content. Please replace this content with the corresponding detail\'s feature information.' }
                
                ]
            }, { title:'Investment Opportunities', img: '/images/IMG_3247.JPG',details:[
                    { img: '/images/IMG_3651.JPG', title: 'Feature 1', content: 'This is the information of the feature 1. The fallowing lines are generated content. Please replace this content with the corresponding detail\'s feature information.' },
                    { img: '/images/IMG_3248.JPG', title: 'Feature 2', content: 'This is the information of the feature 2. The fallowing lines are generated content. Please replace this content with the corresponding detail\'s feature information.' }
                
                ]
            }
                
        ]
      },
      {
        customerType:1,
        img: '/images/IMG_3529.JPG', 
        title: 'Companies Portfolio', 
        detail: 'This area corresponds to a general description of the customer type. Please replace with the customer type information and portfolio introduction.',
        items:[
            { title:'Troubles with Debt', img: '/images/IMG_3529.JPG',details: [
                { img: '/images/IMG_3651.JPG', title: 'Feature 1', content: 'This is the information of the feature 1. The fallowing lines are generated content. Please replace this content with the corresponding detail\'s feature information.' },
                { img: '/images/IMG_3248.JPG', title: 'Feature 2', content: 'This is the information of the feature 2. The fallowing lines are generated content. Please replace this content with the corresponding detail\'s feature information.' },
                { img: '/images/IMG_3247.JPG', title: 'Feature 3', content: 'This is the information of the feature 3. The fallowing lines are generated content. Please replace this content with the corresponding detail\'s feature information.' }
                ]
            }, { title:'Debt Prepaid', img: '/images/IMG_3247.JPG',details:[
                    { img: '/images/IMG_3651.JPG', title: 'Feature 1', content: 'This is the information of the feature 1. The fallowing lines are generated content. Please replace this content with the corresponding detail\'s feature information.' },
                    { img: '/images/IMG_3248.JPG', title: 'Feature 2', content: 'This is the information of the feature 2. The fallowing lines are generated content. Please replace this content with the corresponding detail\'s feature information.' }
                
                ]
            }, { title:'Investment Opportunities', img: '/images/IMG_3247.JPG',details:[
                    { img: '/images/IMG_3651.JPG', title: 'Feature 1', content: 'This is the information of the feature 1. The fallowing lines are generated content. Please replace this content with the corresponding detail\'s feature information.' },
                    { img: '/images/IMG_3248.JPG', title: 'Feature 2', content: 'This is the information of the feature 2. The fallowing lines are generated content. Please replace this content with the corresponding detail\'s feature information.' }
                
                ]
            }
                
        ]
      },
    ]
  }
  
  var message = {};
  
  if (category == "portfolio"){
    var rawData = data[category];
    message = rawData.filter((p)=>{
      return p.customerType == path;
    })
  } else if (category == "products") {
    var rawData = data[category];
    message = rawData.filter((p)=>{
      return p.id == path;
    })
  } else {
    message = data[category];
  }

  var response = {
      code: 0,
      error: undefined,
      message: message
  }

  res.header('Content-type','application/json');
  res.header('Charset','utf8');
  res.status(200).jsonp(response);
});


module.exports = router;