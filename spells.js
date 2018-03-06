const Discord = require("discord.js");

module.exports = {
	cast: function (splitMessage, castChannel, caster){
		//The first parameter is the school of magic. This will be used to determine the element of the spell
		//We will first find the sum of the ASCII values of all the characters in the school
		let schoolNum = 0;
		for(let i = 0; i < splitMessage[1].length; i++){
			schoolNum += splitMessage[1].charCodeAt(i);
		}
		//We will now calculate the digital root of this sum. This will be a number from 1 to 9, though it could be 0 if given 0
		schoolNum = (schoolNum - 1) % 9 + 1;
		//Use the digital root to find the element of the spell
		let element = getSchool(schoolNum);
		//Now we use their spell name to determine the type of spell in much the same way
		let spellNum = 0;
		let fullSpellName = "";
		for(let i = 2; i < splitMessage.length; i++){
			fullSpellName += splitMessage[i];
		}
		for(let j = 0; j < fullSpellName.length; j++){
			spellNum += fullSpellName.charCodeAt(j);
		}
		spellNum = (spellNum - 1) % 9 + 1;
		let finalSpell = caster + ", remembering the teachings of the "+ splitMessage[1] + " school of magic, calls upon the power of " + element[1] + getSpell(spellNum, element[0]);
		castChannel.send(finalSpell);
	}
}

function getSpell(digitalRoot, element){
	switch(digitalRoot){
		case 0:
			spell = " to create a giant fist made of " + element + " to crush their foes!";
			break;
		case 1:
			spell = " to construct a terrifying creature made of " + element + "!";
			break;
		case 2:
			spell = ", surrounding their fists in " + element + ". Looks like they're more of a puncher than a caster.";
			break;
		case 3:
			spell = ", creating long tentacles of " + element + " to lash out at foes!";
		 	break;
		 case 4:
		 	spell = " to create several orbs of " + element + " swirling around their head, ready to fly out at any nearby enemies.";
		 	break;
		 case 5:
		 	spell = ", forming a spear of " + element + ", ready for either lunging or tossing.";
		 	break;
		 case 6:
		 	spell = ", forming a suit of dense armor made of " + element + " around them.";
		 	break;
		 case 7:
		 	spell = ", shapeshifting into a powerful " + element + " elemental!";
		 	break;
		 case 8:
		 	spell = "! Right beside them, a clone made of " + element + " appears!";
		 	break;
		 case 9:
		 	spell = ", covering the land around them with mines which, when triggered, will erupt in an explosion of deadly " + element + "!";
		 	break;
	}
	return spell;
}

function getSchool (digitalRoot){
	switch(digitalRoot){
		case 0:
			element = "Void Energy";
		 	magicSource = "the Forbidden Entity of the Void";
			break;
		case 1:
			element = "Flame";
		 	magicSource = "the Spirits of Flame";
			break;
		case 2:
			element = "Wind";
		 	magicSource = "the Sylphs of the Wind";
			break;
		case 3:
			element = "Stone"
		 	magicSource = "the Spirits of Stone";
		 	break;
		 case 4:
		 	element = "Lightning";
		 	magicSource = "the Rulers of the Storm";
		 	break;
		 case 5:
		 	element = "Ice";
		 	magicSource = "the Glacial Gods";
		 	break;
		 case 6:
		 	element = "Darkness";
		 	magicSource = "the Spirits which lurk in the night"
		 	break;
		 case 7:
		 	element = "Water";
		 	magicSource = "the Undines of the sea";
		 	break;
		 case 8:
		 	element = "Wood";
		 	magicSource = "the Forest Nymphs";
		 	break;
		 case 9:
		 	element = "Cosmic Energy";
		 	magicSource = "the Outer Gods of the Cosmos";
		 	break;
	}
	return [element, magicSource];
}