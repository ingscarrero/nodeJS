
(function() {
'use strict';

    angular
        .module('debtPlatform')
        .controller('platformController', platformController)
        .controller('portfolioController', portfolioController);

    // Platform 

    // Injection
    platformController.inject = [
        '$routeParams', 
        '$location',  
        '$scope',
        'Company',
        'Shared'    
    ];

    function platformController(
        $routeParams, 
        $location, 
        $scope,
        Company
    ) {
        var ctrl = this;
        ctrl.selectItemWithIndex =  selectItemWithIndex;
        activate();
        ////////////////
        function activate() { 
            //TODO: Get company ID from app parameters
            var companyId = 1;
            var productId = 1;

            ctrl.content = {};

            Company.getCompany(companyId)
            .then(result => { ctrl.content.owner=result.message.company;});
            Company.getCompanyCustomerTypes(companyId)
            .then(result => { ctrl.content.items=result.message.types;});
            Company.getCompanyProduct(companyId, productId)
            .then(result=>{
               if (result.message.length > 0) {
                    let product = result.message[0];
                    ctrl.content.title = product.name;
                    ctrl.content.detail = product.advertising.brief;
                    ctrl.content.footer = product.advertising.summary;
               } 
            });
        }

        function selectItemWithIndex(index){
            $location.path('/portfolio/' + index);
        }
    }

    // Portfolio
    // Injection
    portfolioController.inject = [
        '$routeParams', 
        '$location', 
        '$scope',
        'Company',
        //'Debt',    
    ];

    function portfolioController(
        $routeParams, 
        $location, 
        $scope,
        Company,
        //Debt
    ) {

        var customerTypeId = parseInt($routeParams.index);
        
        var ctrl = this;
        ctrl.apply =  apply;
        activate();
        ////////////////
        function activate() { 
            //TODO: Get company ID from app parameters
            var companyId = 1;
            var productId = 1;
            var customerType = customerTypeId;
            
            ctrl.content = {}

            Company.getCompany(companyId)
            .then(result => { ctrl.content.owner=result.message.company;});
            Company.getCompanyProductPortfolio(companyId, productId, customerType)
            .then(result => { ctrl.detail=result.message[0];});
        }

        function apply(){
            $location.path('/apply');
        }
    }

    

})();
