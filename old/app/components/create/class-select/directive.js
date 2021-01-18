'use strict';

angular.module('PFCM').directive('classSelect', function(){
    return {
        restrict: 'E',
        templateUrl: 'components/create/class-select/class-select.html',
        controller: 'ClassSelectCtrl',
        controllerAs: 'classSel'
    };
});
