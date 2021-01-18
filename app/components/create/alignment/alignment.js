'use strict';

var ctrl = function($scope, $rootScope, CharacterService){
    var self = this;
    var char = CharacterService.getCharacter();

    self.classWarn = false;
    self.currentIndex = 0;

    var genClericAlign = function(alignment){
        var tmpAlign = alignment.split(' ');
        var possibleAlignments = [];
        switch(tmpAlign[0]){
        case 'Lawful':
            switch(tmpAlign[1]){
            case 'Good': possibleAlignments = ['Lawful Good', 'Lawful Neutral', 'Neutral Good'];
                break;
            case 'Neutral': possibleAlignments = ['Lawful Good', 'Lawful Neutral', 'Lawful Evil', 'Neutral'];
                break;
            case 'Evil': possibleAlignments = ['Lawful Evil', 'Neutral Evil', 'Lawful Neutral'];
                break;
            }
            break;
        case 'Neutral':
            if (tmpAlign[1]){
                switch(tmpAlign[1]){
                case 'Good': possibleAlignments = ['Neutral Good', 'Lawful Good', 'Chatoic Good', 'Neutral'];
                    break;
                case 'Evil': possibleAlignments = ['Neutral Evil', 'Lawful Evil', 'Chaotic Evil', 'Neutral'];
                    break;
                }
            } else{
                possibleAlignments = ['Neutral', 'Neutral Evil', 'Lawful Neutral', 'Neutral Good', 'Chaotic Neutral'];
            }
            break;
        case 'Chaotic':
            switch(tmpAlign[1]){
            case 'Good': possibleAlignments = ['Chaotic Good', 'Neutral Good', 'Chaotic Neutral'];
                break;
            case 'Neutral': possibleAlignments = ['Chaotic Neutral', 'Neutral', 'Chaotic Evil', 'Chaotic Good'];
                break;
            case 'Evil': possibleAlignments = ['Chaotic Evil', 'Neutral Evil', 'Chaotic Neutral'];
                break;
            }
            break;
        }

        return possibleAlignments;
    };

    self.checkClasses = function(){
        switch(char.class){
        case 'Barbarian': self.alignments = ['Neutral Good', 'Chaotic Good', 'Neutral', 'Chaotic Neutral', 'Neutral Evil', 'Chaotic Evil'];
            self.classWarn = true;
            break;
        case 'Cleric': self.alignments = genClericAlign(char.deity.alignment);
            self.classWarn = true;
            break;
        case 'Druid': self.alignments = ['Neutral Good', 'Lawful Neutral', 'Neutral', 'Chaotic Neutral', 'Neutral Evil'];
            self.classWarn = true;
            break;
        case 'Monk': self.alignments = ['Lawful Good', 'Lawful Neutral', 'Lawful Evil'];
            self.classWarn = true;
            break;
        case 'Paladin': self.alignments = ['Lawful Good'];
            self.classWarn = true;
            break;
        default: self.classWarn = false;
            self.alignments = ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'];
        }
    };

    self.submit = function(){
        char.alignment = self.alignment;
        CharacterService.updateCharacter(char);
        // Will move on to the next step
        $rootScope.$broadcast('creation-change-steps', {step: 4});
    };

    $scope.$on('creation-change-steps', function(event, args){
        if(args.step === 3){
            self.checkClasses();
        }
    });
};

angular.module('PFCM').controller('AlignmentCtrl', ctrl);
