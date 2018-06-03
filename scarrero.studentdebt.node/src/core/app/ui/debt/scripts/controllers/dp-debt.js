
(function() {
'use strict';

    angular
        .module('debtPlatform')
        .controller('applyController', applyController)
        .controller('registerController', registerController);

    // Application
    
    // Injection
    applyController.inject = [
        '$routeParams', 
        '$location', 
        '$scope',
        'Company',
        //'Debt'    
    ];

    function applyController(
        $routeParams, 
        $location, 
        $scope,
        Company,
        //Debt
    ) {
        //TODO: Get company ID from app parameters
        var companyId = 1;
        var productId = 1;

        var ctrl = this;
        
        ctrl.submit = submit;
        ctrl.back = back;

        activate();
        
        
        ////////////////
        function activate() { 
            
            ctrl.activeQuestionIndex =  0;
            ctrl.content = {};
            ctrl.providers =  {
                'list':[
                    {key:0,value:'============'}, 
                    {key:1,value:'Option 1'}, 
                    {key:2,value:'Option 2'}, 
                    {key:3,value:'Option 3'}
                ],
                'check':[
                    {key:0,value:'Option 1'}, 
                    {key:1,value:'Option 2'}, 
                    {key:2,value:'Option 3'}
                ],
                'radio':[
                    {key:0,value:'Option 1'}, 
                    {key:1,value:'Option 2'} , 
                    {key:2,value:'Option 3'}
                ]
            };


            ctrl.questionnaire = [
                { 
                    topic: { img:'/images/IMG_3651.JPG', title:'Topic 1', detail:'Topic 1 details' }, 
                    number: 1, 
                    title : 'Question 1', 
                    stem:'Question Stem.', 
                    caption: 'Please submit your response:', 
                    class:'open',
                    actions:[
                        { content:'Submit', target:'nextQuestion', parameters:'answer' }, 
                        { content:'Cancel', target:'cancel' }
                    ]
                },
                { 
                    topic: { img:'/images/IMG_3651.JPG', title:'Topic 1', detail:'Topic 1 details' }, 
                    number: 2,  
                    title : 'Question 2', 
                    stem:'Question Stem.', 
                    caption: 'Please select one answer:', 
                    class:'list', 
                    provider:'list',
                    actions:[
                        { content:'Submit', target:'nextQuestion', parameters:'answer' }, 
                        { content:'Back', target:'back' },
                        { content:'Cancel', target:'cancel' }
                    ]
                },
                { 
                    topic: { img:'/images/IMG_3651.JPG', title:'Topic 1', detail:'Topic 1 details' }, 
                    number: 3,  
                    title : 'Question 3', 
                    stem:'Question Stem.',
                    caption: 'Please mark all options that apply:', 
                    class:'check', 
                    provider:'check',
                    actions:[
                        { content:'Submit', target:'nextQuestion', parameters:'answer' }, 
                        { content:'Back', target:'back' }, 
                        { content:'Cancel', target:'cancel' }
                    ]
                },
                { 
                    topic: { img:'/images/IMG_3651.JPG', title:'Topic 1', detail:'Topic 1 details' }, 
                    number: 3,  
                    title : 'Question 4', 
                    stem:'Question Stem.', 
                    caption: 'Please pick one option:', 
                    class:'radio', 
                    provider:'radio',
                    actions:[
                        { content:'Submit', target:'nextQuestion', parameters:'answer' }, 
                        { content:'Back', target:'back' },
                        { content:'Cancel', target:'cancel' }
                    ]
                }
            ]

            Company.getCompany(companyId)
            .then(result => { ctrl.content.owner=result.message.company;});
            
            

            

        }

        function submit(data){
            
            if (ctrl.activeQuestionIndex < (ctrl.questionnaire.length - 1) ){
                ctrl.activeQuestionIndex++;
            } else {
                $location.path('/register');
            }
        }

        function back(){
            
            if (ctrl.activeQuestionIndex > 0){
                ctrl.activeQuestionIndex--;    
            }
        }
    }

    // Registration

    // Injection
    registerController.inject = [
        '$routeParams', 
        '$location', 
        '$scope',
        'Company',
        //'Debt'     
    ];

    function registerController(
        $routeParams, 
        $location, 
        $scope,
        Company,
        //Debt
    ) {
        //TODO: Get company ID from app parameters
        var companyId = 1;
        var productId = 1;

        var ctrl = this;
        
        ctrl.submit = submit;
        ctrl.back = back;
        ctrl.back = back;

        activate();
        
        
        ////////////////
        function activate() { 
            ctrl.content = {}

            ctrl.formConfiguration = {
                title:"Form Title",
                detail:"Form description.",
                img:'/images/IMG_3651.JPG',
                fields: [
                   { caption:'Field 1', class:'open', type:'text', name:'field_1', provider:'' },
                   { caption:'Field 2', class:'open', type:'text', name:'field_2', provider:'' },
                   { caption:'Field 3', class:'list', type:'text', name:'field_3', provider:'list' },
                   { caption:'Field 4', class:'check', type:'', name:'field_4', provider:'check' },
                   { caption:'Field 5', class:'radio', type:'', name:'field_5', provider:'radio' },
                ],
                actions: [
                    { content:'Submit', target:'submit', parameters:'answer' }, 
                    { content:'Back', target:'back' }, 
                    { content:'Cancel', target:'cancel' }
                ]
            };

            ctrl.providers =  {
                'list':[
                    {key:0,value:'============'}, 
                    {key:1,value:'Option 1'}, 
                    {key:2,value:'Option 2'}, 
                    {key:3,value:'Option 3'}
                ],
                'check':[
                    {key:0,value:'Option 1'}, 
                    {key:1,value:'Option 2'}, 
                    {key:2,value:'Option 3'}
                ],
                'radio':[
                    {key:0,value:'Option 1'}, 
                    {key:1,value:'Option 2'} , 
                    {key:2,value:'Option 3'}
                ]
            };

            ctrl.model = {};

            Company.getCompany(companyId)
            .then(result => { ctrl.content.owner=result.message.company;});
            
            
        }

        function submit(data){
            
            /*if (ctrl.activeQuestionIndex < (ctrl.questionnaire.length - 1) ){
                ctrl.activeQuestionIndex++;
            } else {
                $location.path('/register');
            }*/
        }

        function back(){
            
            /*if (ctrl.activeQuestionIndex > 0){
                ctrl.activeQuestionIndex--;    
            }*/
        }
    }

})();
