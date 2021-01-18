'use strict';

var ctrl = function($scope, $location){
    var self = this;

    self.redirect = function(page){
        if (page === 'new'){
            $location.path('/create-character');
        } else if (page === 'load'){
            //TODO load characters
        }
    };
};

angular.module('PFCM').controller('HomeCtrl', ctrl);
