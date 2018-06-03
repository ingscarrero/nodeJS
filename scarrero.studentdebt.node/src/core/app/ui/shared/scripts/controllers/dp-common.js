
(function() {
'use strict';

    angular
        .module('debtPlatform')
        .controller('indexController', indexController)
        .controller('homeController', homeController);


    // Home

    // Injection
    homeController.inject = [
        '$routeParams', 
        '$location', 
        '$scope',
        'Company'    
    ];

    // Controllers

    function homeController(
        $routeParams, 
        $location, 
        $scope,
        Company
    ) {
        var ctrl = this;
        activate();
        ////////////////
        function activate() {
            // TODO: Extract Id from config
            var companyId = 1; 

            ctrl.banner = {};
            ctrl.click = redirectToPlatform
                        
            Company.getCompany(companyId).then(response =>{
                ctrl.banner.owner = response.message.company;
            });
        }

        function redirectToPlatform() {
            $location.path('/platform');
        }
    }

    // Index
    
    // Injection

    indexController.inject = [
        '$routeParams', 
        '$location',  
        '$scope',
        'Company',
        'Shared' ];
    function indexController(
        $routeParams, 
        $location, 
        $scope,
        Company,
        Shared) { 

        var ctrl = this;
        activate();

        ////////////////

        function activate() {
            
            // TODO: Extract Id from config
            var companyId = 1; 

            ctrl.footer = initFooter();

            Shared.getSiteMap().then(result=>{
                ctrl.footer.items = result.message
            });

            Shared.getSiteVersionInformation().then(result=>{
                ctrl.footer.copyingRights = result.message
            });

            Company.getCompany(companyId).then(response =>{
                ctrl.footer.socialNetworks = response.message.company.socialNetworks;
            });
        }

        function initFooter(){
             var footer = {
                columns: 3,
                items_per_col: 3,
                items : [],
                socialNetworks: [],
                copyingRights: []               
            };
            
            return footer;
        }

        
    }

})();
