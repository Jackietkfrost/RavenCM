'use strict'

// TODO Get eslint working correctly
angular.module('PFCM',
    ['ngMaterial',
    'ngRoute',
    'ngMessages'])
.controller('mainController', function($scope){
    $scope.test = "test";
})
.config(['$routeProvider', function($routeProvider){
    $routeProvider.
    when('/', {
        templateUrl: 'components/home/home.html',
        controller: 'HomeCtrl',
        controllerAs: 'home'
    }).when('/create-character', {
        templateUrl: 'components/create/create-home.html',
        controller: 'CreationCtrl',
        controllerAs: 'creation'
    })
}]);
