'use strict';

var service = function(){
    var character = new Object();
    return{
        getCharacter: function(){
            return character;
        },

        updateCharacter: function(newChar){
            character = newChar;
            console.log(character);
        },

        // Used to generate a dice roll, 2d12 + 5 = diceRoll(2, 12, 5)
        diceRoll: function(amt, type, mod){
            var total = 0;
            if(mod){
                total = total + mod;
            }
            for (var i = 0; i < amt; i ++){
                total = total + (Math.floor((Math.random() * type) + 1));
            }
            return total;
        },

        // Used to calculate ability modifier
        calcAbilityMod(stat){
            return(Math.floor((stat - 10)/2));
        }
    };
};

angular.module('PFCM').factory('CharacterService', service);
