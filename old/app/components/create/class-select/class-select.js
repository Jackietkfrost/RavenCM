'use strict';

var ctrl = function($scope, $rootScope, $mdDialog, CharacterService){
    var self = this;
    var char = CharacterService.getCharacter();

    self.currentIndex = 0;

    self.classes = [
        {
            name: 'Barbarian',
            description: 'Barbarians excel in combat, possessing the martial prowess and fortitude to take on foes seemingly far superior to themselves. With rage granting them boldness and daring beyond that of most other warriors, barbarians charge furiously into battle and ruin all who would stand in their way.',
            img: 'assets/classes/human.jpg'
        },
        {
            name: 'Bard',
            description: 'Bards capably confuse and confound their foes while inspiring their allies to ever-greater daring. While accomplished with both weapons and magic, the true strength of bards lies outside melee, where they can support their companions and undermine their foes without fear of interruptions to their performances.',
            img: 'assets/classes/dwarf.jpg'
        },
        {
            name: 'Cleric',
            description: 'More than capable of upholding the honor of their deities in battle, clerics often prove stalwart and capable combatants. Their true strength lies in their capability to draw upon the power of their deities, whether to increase their own and their allies\' prowess in battle, to vex their foes with divine magic, or to lend healing to companions in need. As their powers are influenced by their faith, all clerics must focus their worship upon a divine source.',
            img: 'assets/classes/elf.jpg'
        },
        {
            name: 'Druid',
            description: 'While some druids might keep to the fringe of battle, allowing companions and summoned creatures to fight while they confound foes with the powers of nature, others transform into deadly beasts and savagely wade into combat. Druids worship personifications of elemental forces, natural powers, or nature itself. Typically this means devotion to a nature deity, though druids are just as likely to revere vague spirits, animalistic demigods, or even specific awe-inspiring natural wonders.',
            img: 'assets/classes/half-elf.jpg'
        },
        {
            name: 'Fighter',
            description: 'Fighters excel at combat—defeating their enemies, controlling the flow of battle, and surviving such sorties themselves. While their specific weapons and methods grant them a wide variety of tactics, few can match fighters for sheer battle prowess.',
            img: 'assets/classes/gnome.jpg'
        },
        {
            name: 'Monk',
            description: 'Monks excel at overcoming even the most daunting perils, striking where it\'s least expected, and taking advantage of enemy vulnerabilities. Fleet of foot and skilled in combat, monks can navigate any battlefield with ease, aiding allies wherever they are needed most.',
            img: 'assets/classes/halfling.jpg'
        },
        {
            name: 'Paladin',
            description: 'Paladins serve as beacons for their allies within the chaos of battle. While deadly opponents of evil, they can also empower goodly souls to aid in their crusades. Their magic and martial skills also make them well suited to defending others and blessing the fallen with the strength to continue fighting.',
            img: 'assets/classes/half-orc.jpg'
        },
        {
            name: 'Ranger',
            description: 'Ranger are deft skirmishers, either in melee or at range, capable of skillfully dancing in and out of battle. Their abilities allow them to deal significant harm to specific types of foes, but their skills are valuable against all manner of enemies.',
            img: 'assets/classes/human.jpg'
        },
        {
            name: 'Rogue',
            description: 'Rogues excel at moving about unseen and catching foes unaware, and tend to avoid head-to-head combat. Their varied skills and abilities allow them to be highly versatile, with great variations in expertise existing between different rogues. Most, however, excel in overcoming hindrances of all types, from unlocking doors and disarming traps to outwitting magical hazards and conning dull-witted opponents.',
            img: 'assets/classes/dwarf.jpg'
        },
        {
            name: 'Sorcerer',
            description: 'Sorcerers excel at casting a selection of favored spells frequently, making them powerful battle mages. As they become familiar with a specific and ever-widening set of spells, sorcerers often discover new and versatile ways of making use of magics other spellcasters might overlook. Their bloodlines also grant them additional abilities, assuring that no two sorcerers are ever quite alike.',
            img: 'assets/classes/sorceror.jpg'
        },
        {
            name: 'Warlock',
            description: 'Warlocks are seekers of the knowledge that lies hidden in the fabric of the multiverse. Through pacts made with mysterious beings of supernatural power, warlocks unlock magical effects both subtle and spectacular.',
            img: 'assets/classes/warlock.png'
        },
        {
            name: 'Wizard',
            description: 'While universalist wizards might study to prepare themselves for any manner of danger, specialist wizards research schools of magic that make them exceptionally skilled within a specific focus. Yet no matter their specialty, all wizards are masters of the impossible and can aid their allies in overcoming any danger.',
            img: 'assets/classes/wizard.jpg'
        },
        {
            name: 'Artificer',
            description: 'Masters of invention, artificers use ingenuity and magic to unlock extraordinary capabilities in items.',
            img: 'assets/classes/artificer.png'
        },
        {
            name: 'Blood Hunter',
            description: 'Often feared or misunderstood, and driven by an unending drive to destroy the wicked, blood hunters are clever, arcane warriors who have bound their essence to the dark creatures they hunt to better stalk and survive their prey. Armed with the rites of forbidden blood magic and a willingness to sacrifice their own vitality and humanity for the cause, they protect the realms from the shadows, ever vigilant to avoid becoming the same monsters they choose to hunt.',
            img:'assets/classes/bloodhunter.png'
        }
    ];

    self.submit = function(){
        char.class = self.classes[self.currentIndex].name;
        if (char.class === 'Cleric'){
            $mdDialog.show({
                controller: 'DeitySelectCtrl',
                templateUrl: 'components/create/class-select/deity-select-dialog.html',
                parent: angular.element(document.body),
                clickOutsideToClose: true,
                fullscreen: true
            })
            .then(function(deityInfo) {
                console.log(deityInfo);
                char.deity = deityInfo.deity;
                char.domains = deityInfo.domains;
                CharacterService.updateCharacter(char);
                $rootScope.$broadcast('creation-change-steps', {step: 3});
            }, function(){});
        } else{
            CharacterService.updateCharacter(char);
            $rootScope.$broadcast('creation-change-steps', {step: 3});
        }
    };
};

angular.module('PFCM').controller('ClassSelectCtrl', ctrl);
