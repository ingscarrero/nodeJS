'use strict';
var debtPlatformApp = angular.module('debtPlatform', [
  'ngRoute',
  'ngResource',
  'ngMessages',
  'ngSanitize'
]);

debtPlatformApp.config(['$routeProvider', function($routeProvider){
    $routeProvider
        .when('/', { templateUrl: '/company/partials/home.html'} )
        .when('/platform', { templateUrl: '/debt/partials/platform.html'} )
        .when('/portfolio/:index', { templateUrl: '/debt/partials/portfolio.html'} )
        .when('/apply', { templateUrl: '/debt/partials/apply.html'})
        .when('/register', { templateUrl: '/debt/partials/register.html'})
        .otherwise('/');
}]);

