'use strict';

var ctrl = function($scope, $rootScope, CharacterService){
    var self = this;

    self.currentIndex = 0;

    self.races = [
        {
            name: 'Human',
            description: 'Ambitious, sometimes heroic, and always confident, humans have an ability to work together toward common goals that makes them a force to be reckoned with. Though short-lived compared to other races, their boundless energy and drive allow them to accomplish much in their brief lifetimes.',
            img: 'assets/races/human.png'
        },
        {
            name: 'Dwarf',
            description: 'These short and stocky defenders of mountain fortresses are often seen as stern and humorless. Known for mining the earth’s treasures and crafting magnificent items from ore and gemstones, they have an unrivaled affinity for the bounties of the deep earth. Dwarves also have a tendency toward traditionalism and isolation that sometimes manifests as xenophobia.',
            img: 'assets/races/dwarf.jpg'
        },
        {
            name: 'Elf',
            description: 'Tall, noble, and often haughty, elves are long-lived and subtle masters of the wilderness. Elves excel in the arcane arts. Often they use their intrinsic link to nature to forge new spells and create wondrous items that, like their creators, seem nearly impervious to the ravages of time. A private and often introverted race, elves can give the impression they are indifferent to the plights of others.',
            img: 'assets/races/elf.png'
        },
        {
            name: 'Half-elf',
            description: 'Often caught between the worlds of their progenitor races, half-elves are a race of both grace and contradiction. Their dual heritage and natural gifts often create brilliant diplomats and peacemakers, but half-elves are often susceptible to an intense and even melancholic isolation, realizing that they are never truly part of elven or human society.',
            img: 'assets/races/half-elf.png'
        },
        {
            name: 'Gnome',
            description: 'Expatriates of the strange land of fey, these small folk have a reputation for flighty and eccentric behavior. Many gnomes are whimsical artisans and tinkers, creating strange devices powered by magic, alchemy, and their quirky imagination. Gnomes have an insatiable need for new experiences that often gets them in trouble.',
            img: 'assets/races/gnome.jpg'
        },
        {
            name: 'Halfling',
            description: 'Members of this diminutive race find strength in family, community, and their own innate and seemingly inexhaustible luck. While their fierce curiosity is sometimes at odds with their intrinsic common sense, half lings are eternal optimists and cunning opportunists with an incredible knack for getting out the worst situations.',
            img: 'assets/races/halfling.jpg'
        },
        {
            name: 'Half-orc',
            description: 'Often fierce and savage, sometimes noble and resolute, half-orcs can manifest the best and worst qualities of their parent races. Many half-orcs struggle to keep their more bestial natures in check in order to epitomize the most heroic values of humanity. Unfortunately, many outsiders see half-orcs as hopeless abominations devoid of civility, if not monsters unworthy of pity or parley.',
            img: 'assets/races/half-orc.jpg'
        },
        {
            name: 'Tiefling',
            description: 'To be greeted with stares and whispers, to suffer violence and insult on the street, to see mistrust and fear in every eye: this is the lot of the tiefling. And to twist the knife, tieflings know that this is because a pact struck generations ago infused the essence of Asmodeus—overlord of the Nine Hells—into their bloodline. Their appearance and their nature are not their fault but the result of an ancient sin, for which they and their children and their children’s children will always be held accountable.',
            img: 'assets/races/tiefling.png'
        },
        {
            name:'Dragonborn',
            description: 'Born of dragons, as their name proclaims, the dragonborn walk proudly through a world that greets them with fearful incomprehension. Shaped by draconic gods or the dragons themselves, dragonborn originally hatched from dragon eggs as a unique race, combining the best attributes of dragons and humanoids. Some dragonborn are faithful servants to true dragons, others form the ranks of soldiers in great wars, and still others find themselves adrift, with no clear calling in life.',
            img: 'assets/races/dragonborn.png'
        },
        {
            name:'Warforged',
            description: 'Warforged are a rare race of humanoid constructs created through powerful rituals. Made up of bulky (albeit resilient) metallic or stone body that weighs roughly 270‒300 lb (120‒140 kg), they are extremely powerful, durable, and able fighters. Unlike most constructs, warforged are fully self-aware and maintain mental faculties on par with elves, humans, or similar races.',
            img: 'assets/races/warforged.png'
        }
    ];

    self.submit = function(){
        var char = CharacterService.getCharacter();
        char.race = self.races[self.currentIndex].name;
        CharacterService.updateCharacter(char);
        $rootScope.$broadcast('creation-change-steps', {step: 1});
    };

};

angular.module('PFCM').controller('RaceSelectCtrl', ctrl);
