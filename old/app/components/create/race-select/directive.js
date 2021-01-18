'use strict';

angular.module('PFCM').directive('raceSelect', function(){
    return {
        restrict: 'E',
        templateUrl: 'components/create/race-select/race-select.html',
        controller: 'RaceSelectCtrl',
        controllerAs: 'raceSelect'
    };
});
