'use strict';

var ctrl = function($scope){
    var self = this;

    $scope.activeIndex = 0;

    $scope.$on('creation-change-steps', function(event, args){
        $scope.activeIndex = args.step;
    });
};

angular.module('PFCM').controller('CreationCtrl', ctrl);
