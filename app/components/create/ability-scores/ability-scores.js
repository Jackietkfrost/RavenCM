'use strict'

var ctrl = function($scope, $rootScope, CharacterService, $timeout, $mdDialog){
    var self = this;
    var char = CharacterService.getCharacter();
    self.statPoints = [];
    self.displayRolls = false;
    // Player ability scores
    self.str = 0;
    self.dex = 0;
    self.con = 0;
    self.int = 0;
    self.wis = 0;
    self.cha = 0;
    var statUses = [];

    // Disables stat points that are in use
    self.disable = function(index, statNum){
        // Timeout is used here to give the DOM time to have the user's selected value be picked and displayed before disabling
        $timeout(function(){
            if(statUses[statNum] !== undefined){
                self.statPoints[statUses[statNum]].inUse = false;
            }
            self.statPoints[index].inUse = true;
            statUses[statNum] = index;
        }, 10);
    };

    var abilityRoll = function(){
        var rolls = [];
        statUses = [];
        var total = 0;
        var min = 7;

        // Roll 4d6
        for(var i = 0; i < 4; i++){
            rolls.push(CharacterService.diceRoll(1, 6));
        }
        // Get rid of lowest value
        for(var i = 0; i < 4; i++){
            if(rolls[i] < min){
                min = rolls[i];
            }
        }
        var minFound = false;
        for(var i = 0; i < 4; i++){
            if(rolls[i] == min && !minFound){
                minFound = true;
            } else{
                total = rolls[i] + total;
            }
        }

        return total;
    };

    self.generateStatPoints = function(){
        self.statPoints = [];
        for(var i = 0; i < 6; i++){
            self.statPoints.push({
                value: abilityRoll(),
                inUse: false
            });
        }
        self.resetSkills();
        self.displayRolls = true;
    };

    self.resetSkills = function(){
        self.str = 0;
        self.dex = 0;
        self.con = 0;
        self.int = 0;
        self.wis = 0;
        self.cha = 0;
    };

    self.reset = function(){
        statUses = [];
        self.resetSkills();
        for(var i = 0; i < self.statPoints.length; i++){
            self.statPoints[i].inUse = false;
        }
    };

    self.submit = function(){
        char.str = self.str;
        char.dex = self.dex;
        char.con = self.con;
        char.int = self.int;
        char.wis = self.wis;
        char.cha = self.cha;

        CharacterService.updateCharacter(char);
        // Will move on to the next step
        $rootScope.$broadcast('creation-change-steps', {step: 5});
    };

    // Help dialogs
    self.strHelp = function(ev) {
        $mdDialog.show({
            controller: DialogController,
            templateUrl: 'components/create/ability-scores/dialogs/str.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        });
    };
    self.dexHelp = function(ev) {
        $mdDialog.show({
            controller: DialogController,
            templateUrl: 'components/create/ability-scores/dialogs/dex.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        });
    };
    self.conHelp = function(ev) {
        $mdDialog.show({
            controller: DialogController,
            templateUrl: 'components/create/ability-scores/dialogs/const.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        });
    };

    self.intHelp = function(ev) {
        $mdDialog.show({
            controller: DialogController,
            templateUrl: 'components/create/ability-scores/dialogs/int.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        });
    };
    self.wisHelp = function(ev) {
        $mdDialog.show({
            controller: DialogController,
            templateUrl: 'components/create/ability-scores/dialogs/wis.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        });
    };
    self.chaHelp = function(ev) {
        $mdDialog.show({
            controller: DialogController,
            templateUrl: 'components/create/ability-scores/dialogs/cha.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        });
    };

    function DialogController($scope, $mdDialog){
        $scope.cancel = function(){
            $mdDialog.cancel();
        };
    }
};

angular.module('PFCM').controller('AbilityScoreGenCtrl', ctrl);
