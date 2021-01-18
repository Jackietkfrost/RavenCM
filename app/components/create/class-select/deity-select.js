'use strict';

var ctrl = function($scope, $mdDialog, DeityService){
    $scope.deities = DeityService.getDeities();
    $scope.deityId = 0;
    $scope.domains = DeityService.getDomains($scope.deities[$scope.deityId].domains);
    $scope.domainId1 = 0;
    $scope.domainId2 = 1;
    // Initialized to false
    $scope.invalidDomain1NavPrev = true;
    $scope.invalidDomain2NavPrev = true;

    // Used to make sure that when navigating domains no two identical domains can be selected
    $scope.domainNav = function(direction, id){
        if (id === 1){
            if (direction === 'next'){
                $scope.invalidDomain1NavPrev = false;
                if (($scope.domainId1 + 1) === $scope.domainId2){
                    if($scope.domainId1 + 2 < $scope.domains.length){
                        $scope.domainId1 +=2;
                    }
                } else{
                    $scope.domainId1++;
                }
            } else if (direction === 'previous'){
                $scope.invalidDomain1NavNext = false;
                if (($scope.domainId1 - 1) === $scope.domainId2){
                    if($scope.domainId1 - 2 >= 0){
                        $scope.domainId1 -=2;
                    }
                } else{
                    $scope.domainId1--;
                }
            }
            //$scope.updateInvalids(1, $scope.domainId1);
        }
        if (id === 2){
            if (direction === 'next'){
                $scope.invalidDomain2NavPrev = false;
                if (($scope.domainId2 + 1) === $scope.domainId1){
                    if($scope.domainId2 + 2 < $scope.domains.length){
                        $scope.domainId2 +=2;
                    }
                } else{
                    $scope.domainId2++;
                }
            } else if (direction === 'previous'){
                $scope.invalidDomain2NavNext = false;
                if (($scope.domainId2 - 1) === $scope.domainId1){
                    if($scope.domainId2 - 2 >= 0){
                        $scope.domainId2 -=2;
                    }
                } else{
                    $scope.domainId2--;
                }
            }
            //$scope.updateInvalids(id, $scope.domainId2);
        }
        $scope.updateInvalids(1, $scope.domainId1);
        $scope.updateInvalids(2, $scope.domainId2);
    };

    // To set the limit on how far you can select with domains
    $scope.updateInvalids = function(id, newV){
        if (id === 1){
            if (newV === 0 || (newV === 1 && $scope.domainId2 === 0)){
                $scope.invalidDomain1NavPrev = true;
            } else{
                $scope.invalidDomain1NavPrev = false;
            }
            if(newV === $scope.domains.length - 1 || (newV === $scope.domains.length - 2 && $scope.domainId2 === $scope.domains.length - 1)){
                $scope.invalidDomain1NavNext = true;
            } else{
                $scope.invalidDomain1NavNext = false;
            }
        } else if (id === 2){
            if (newV === 0 || (newV === 1 && $scope.domainId1 === 0)){
                $scope.invalidDomain2NavPrev = true;
            } else{
                $scope.invalidDomain2NavPrev = false;
            }
            if(newV === $scope.domains.length - 1 || (newV === $scope.domains.length - 2 && $scope.domainId1 === $scope.domains.length - 1)){
                $scope.invalidDomain2NavNext = true;
            } else{
                $scope.invalidDomain2NavNext = false;
            }
        }
    };

    $scope.submit = function(){
        $scope.returnDomains = [$scope.domains[$scope.domainId1], $scope.domains[$scope.domainId2]];
        console.log($scope.returnDomains);
        var returnObj = {
            deity: $scope.deities[$scope.deityId],
            domains: $scope.returnDomains
        };
        $mdDialog.hide(returnObj);
    };

    $scope.$watch('deityId', function(newV){
        $scope.domainId1 = 0;
        $scope.domainId2 = 1;
        $scope.domains = DeityService.getDomains($scope.deities[newV].domains);
        $scope.updateInvalids(1, $scope.domainId1);
        $scope.updateInvalids(2, $scope.domainId2);
    });

};

angular.module('PFCM').controller('DeitySelectCtrl', ctrl);
