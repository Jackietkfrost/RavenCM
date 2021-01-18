'use strict';
var fs = require('fs');

var service = function(){
    var deities = JSON.parse(fs.readFileSync('app/data/deities.json', 'utf8'));
    var domains = JSON.parse(fs.readFileSync('app/data/domains.json', 'utf8'));

    return{
        getDeities: function(){
            return deities;
        },

        getDomains: function(options){
            var tmp = [];
            for(var i = 0; i < options.length; i++){
                tmp[i] = domains[options[i]];
            }
            return tmp;
        }
    };
};

angular.module('PFCM').factory('DeityService', service);
