/// <reference path='../../../vibez.ts' />
module vibez{
    angular.module('vibezApp').factory('SamplesProvider', SamplesStorage);
    SamplesStorage.$inject = ['$resource', '$q'];
    function SamplesStorage($resource, $q){
        
        const fetchSamples = '/api/audio/samples';
        const fetchDetails = '/api/audio/spotify/:id';

        var samplesProvider = $resource(fetchSamples, null, {
            get: {
                method: 'GET',
                isArray: false
            }
        });
        var detailsProvider = $resource(fetchDetails, {
            'id':'@id'
        }, {
            get: {
                method: 'GET',
                isArray: false
            }
        });

        var service = {
            get: getSamples,
            detail: getDetails
        };

        function getDetails(id:string){
            return $q((resolve, reject)=>{
                detailsProvider.get({
                    id 
                }).$promise
                .then(result=>{resolve(result)})
                .catch(err=>{reject(err)})}
            );
        }

        function getSamples(){
            return $q((resolve, reject)=>{
                samplesProvider.get().$promise
                .then(result=>{resolve(result)})
                .catch(err=>{reject(err)})}
            );
        }

        return service;
    }        
}


