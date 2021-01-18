'use strict';

angular.module('PFCM').directive('alignmentSelect', function(){
    return {
        restrict: 'E',
        templateUrl: 'components/create/alignment/alignment.html',
        controller: 'AlignmentCtrl',
        controllerAs: 'alignmentCtrl'
    };
});
