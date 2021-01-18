'use strict';

angular.module('PFCM').directive('nameEntry', function(){
    return {
        restrict: 'E',
        templateUrl: 'components/create/name/name.html',
        controller: 'NameEntryCtrl',
        controllerAs: 'nameEntry'
    };
});
