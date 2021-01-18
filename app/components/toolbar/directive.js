'use strict';

angular.module('PFCM').directive('toolbar', function(){
    return {
        restrict: 'E',
        templateUrl: 'components/toolbar/toolbar.html',
        controller: 'ToolbarCtrl',
        controllerAs: 'toolbar'
    };
});
