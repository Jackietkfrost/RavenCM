'use strict';

angular.module('PFCM').directive('abilityScores', function(){
    return {
        restrict: 'E',
        templateUrl: 'components/create/ability-scores/ability-scores.html',
        controller: 'AbilityScoreGenCtrl',
        controllerAs: 'absc'
    };
});
