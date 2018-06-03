/// <reference path='vibez.ts' />
module vibez{
    'use strict';
    export var vibezApp = angular.module(
        'vibezApp', 
        [
            'ngRoute',
            'ngResource',
            'ngMessages',
            'ngSanitize',
            'ngAnimate'
        ]);       
}