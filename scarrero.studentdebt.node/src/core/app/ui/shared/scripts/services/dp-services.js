(function() {
    'use strict';

    angular
        .module('debtPlatform')
        .factory('Shared', SharedAPI)
        .factory('Company',CompanyAPI);

    SharedAPI.$inject = ['$resource', '$q', '$sce'];
    function SharedAPI($resource, $q, $sce) {
        var provider = $resource(
			'/api/shared/site/:category',
			null, {
				category: {
					method: 'GET',
					isArray: false
				}
			}
		)
        
        var service = {
            trustContent: trustContent,
            getSiteMap: getSiteMap,
            getSiteVersionInformation: getSiteVersionInformation
        };
        
        return service;

        ////////////////

        function trustContent(html){
            return $sce.trustAsHtml(html);
        } 

        function getSiteMap(){
            return getSiteInfo('map');
        }

        function getSiteVersionInformation(){
            return getSiteInfo('version');
        }

        function getSiteInfo(category) { 
            return $q(function (resolve, reject) {
                provider.category({
                    category: category
                }).$promise
                    .then(function (response) {
                        resolve(response);
                        return;
                    }).catch(function (error) {
                        console.log(error);
                        reject(error);
                        return;
                    })
            })
        }
    }

    CompanyAPI.$inject = ['$resource', '$q'];
    function CompanyAPI($resource, $q) {
        var provider = $resource('/api/company/:id/:category/:path', {
            id: '@id',
            category: '@category',
            path: '@path',
        }, {
				company: {
					method: 'GET',
					isArray: false
				}
			}
		);


        var service = {
            getCompany:getCompany,
            getCompanyCustomerTypes: getCompanyCustomerTypes,
            getCompanyProduct: getCompanyProduct,
            getCompanyProductPortfolio: getCompanyProductPortfolio
        };
        
        return service;

        ////////////////
        function getCompany(id) { 
            return $q(function (resolve, reject) {
                provider.company({
                    id: id
                }).$promise
                    .then(function (response) {
                        resolve(response);
                        return;
                    }).catch(function (error) {
                        console.log(error);
                        reject(error);
                        return;
                    })
            })
        }

        function getCompanyCustomerTypes(id) { 
            return $q(function (resolve, reject) {
                provider.company({
                    id: id,
                    category: 'customers',
                    path: 'types',
                }).$promise
                    .then(function (response) {
                        resolve(response);
                        return;
                    }).catch(function (error) {
                        console.log(error);
                        reject(error);
                        return;
                    })
            })
        }

        function getCompanyProduct(id, product) { 
            return $q(function (resolve, reject) {
                provider.company({
                    id: id,
                    category: 'products',
                    path: product,
                }).$promise
                    .then(function (response) {
                        resolve(response);
                        return;
                    }).catch(function (error) {
                        console.log(error);
                        reject(error);
                        return;
                    })
            })
        }

        function getCompanyProductPortfolio(id, productID, customerType) { 
            return $q(function (resolve, reject) {
                provider.company({
                    id: id,
                    category: 'portfolio',
                    path: customerType,
                }).$promise
                    .then(function (response) {
                        resolve(response);
                        return;
                    }).catch(function (error) {
                        console.log(error);
                        reject(error);
                        return;
                    })
            })
        }
    }
})();