(function() {
'use strict';

    // Usage:
    // 
    // Creates:
    // 

    angular
        .module('debtPlatform')
        .component('pageFooter', {
            //template:'htmlTemplate',
            templateUrl: '/shared/partials/footer.html',
            controller: PageFooterController,
            bindings: {
                footer: '<'
            },
        })
        .component('pageHeader', {
            //template:'htmlTemplate',
            templateUrl: '/shared/partials/pageHeader.html',
            controller: PageHeaderController,
            bindings: {
                content: '<'
            },
        })
        .component('content', {
            //template:'htmlTemplate',
            templateUrl: '/shared/partials/content.html',
            controller: ContentController,
            bindings: {
                content: '<',
                onClick: '&'
            },
        })
        .component('detail', {
            //template:'htmlTemplate',
            templateUrl: '/shared/partials/detail.html',
            controller: DetailController,
            bindings: {
                content: '<',
                detail: '<',
                onClick: '&'
            },
        })
        .component('question', {
            //template:'htmlTemplate',
            templateUrl: '/shared/partials/question.html',
            controller: QuestionController,
            bindings: {
                content: '<',
                question: '<',
                provider: '<',
                answer: '<',
                onNext: '&',
                onBack: '&',
                onCancel: '&',
            }
        })
        .component('genericForm', {
            //template:'htmlTemplate',
            templateUrl: '/shared/partials/genericForm.html',
            controller: GenericFormController,
            bindings: {
                content: '<',
                formConfiguration: '<',
                providers: '<',
                model: '<',
                onSubmit: '&',
                onBack: '&',
                onCancel: '&',
            }
        });

    PageHeaderController.inject = ['$http', 'Shared'];
    function PageHeaderController($http, Shared) {
        var ctrl = this;
        
        
        ////////////////
        ctrl.trustContent = Shared.trustContent;
        ctrl.onInit = function() { };
        ctrl.onChanges = function(changesObj) { };
        ctrl.onDestroy = function() { };
    }

    PageFooterController.inject = ['$http', 'Shared'];
    function PageFooterController($http, Shared) {
        var ctrl = this;
        
        ////////////////
        ctrl.trustContent = Shared.trustContent;
        ctrl.onInit = function() { };
        ctrl.onChanges = function(changesObj) { };
        ctrl.onDestroy = function() { };
    }

    ContentController.inject = ['$http', 'Shared'];
    function ContentController($http, Shared) {
        var ctrl = this;
        
        ////////////////
        ctrl.trustContent = Shared.trustContent;
        ctrl.onInit = function() { };
        ctrl.onChanges = function(changesObj) { };
        ctrl.onDestroy = function() { };
        ctrl.click = function(itemIndex) { 
            ctrl.onClick({index:itemIndex}); 
        }
    }

    DetailController.inject = ['$http', 'Shared'];
    function DetailController($http, Shared) {
        var ctrl = this;
        
        ////////////////
        ctrl.trustContent = Shared.trustContent;
        ctrl.onInit = function() { };
        ctrl.onChanges = function(changesObj) { };
        ctrl.onDestroy = function() { };
        ctrl.click = function(detailIndex,featureIndex) { 
            ctrl.onClick(); 
        }
    }

    QuestionController.inject = ['$http', 'Shared'];
    function QuestionController($http, Shared) {
        var ctrl = this;
        
        ////////////////
        ctrl.trustContent = Shared.trustContent;
        ctrl.onInit = function() { };
        ctrl.onChanges = function(changesObj) { };
        ctrl.onDestroy = function() { };
        
        ctrl.nextQuestion = function(data) { 
            ctrl.onNext({data:data}); 
        }
        ctrl.back = function() { 
            ctrl.onBack(); 
        }
        ctrl.cancel = function() { 
            ctrl.onCancel(); 
        }
    }

    GenericFormController.inject = ['$http', 'Shared'];
    function GenericFormController($http, Shared) {
        var ctrl = this;
        
        ////////////////
        ctrl.trustContent = Shared.trustContent;
        ctrl.onInit = function() { };
        ctrl.onChanges = function(changesObj) { };
        ctrl.onDestroy = function() { };
        
        ctrl.submit = function(data) { 
            ctrl.onSubmit({data:data}); 
        }
        ctrl.back = function() { 
            ctrl.onBack(); 
        }
        ctrl.cancel = function() { 
            ctrl.onCancel(); 
        }
    }
    
})();