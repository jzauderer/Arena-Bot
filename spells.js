const Discord = require("discord.js");

module.exports = {
	wizardDuel: async function(wizard1, wizard2, arena){

	}
}

function cast(splitMessage, castChannel, caster){
	//The first parameter is the school of magic. This will be used to determine the element of the spell
	//We will first find the sum of the ASCII values of all the characters in the school
	let schoolNum = 0;
	for(let i = 0; i < splitMessage[1].length; i++){
		schoolNum += splitMessage[1].toLowerCase().charCodeAt(i);
	}
	//We will now calculate the digital root of this sum. This will be a number from 1 to 9, though it could be 0 if given 0
	schoolNum = (schoolNum - 1) % 9 + 1;
	//Use the digital root to find the element of the spell
	let element = getSchool(schoolNum);
	//Now we use their spell name to determine the type of spell in much the same way, with a slightly different algorithm
	let spellNum = 0;
	//First we put together the name of the spell so we can add it to the message
	let fullSpellName = "";
	for(let i = 2; i < splitMessage.length; i++){
		fullSpellName += splitMessage[i];
		fullSpellName += " ";
	}
	//Then we take the sum of the ASCII values
	fullSpellName = fullSpellName.trim();
	for(let j = 0; j < fullSpellName.length; j++){
		if(fullSpellName.charAt(j) != " "){
			spellNum += fullSpellName.toLowerCase().charCodeAt(j);
		}
	}
	//We will now calculate that sum modulo 5. This will be a number from 0 to 4
	spellNum = spellNum % 5;
	let finalSpell = caster + " draws on their knowledge of the "+ splitMessage[1] + " magic style, calling upon the power of " + element[1] + " to casy "+ fullSpellName + getSpell(spellNum, element[0]);
	castChannel.send(finalSpell);
}

function getSpell(num, element){
	switch(num){
		case 0:
			spell = " to construct a terrifying creature made of " + element + "!";
			break;
		case 1:
			spell = ", surrounding their fists in " + element + ". Looks like they're more of a puncher than a caster.";
			break;
		case 2:
			spell = ", creating long tentacles of " + element + " to lash out at foes!";
		 	break;
		case 3:
			spell = " to create a giant fist made of " + element + " to crush their foes!";
			break;
		case 4:
			spell = ", forming a spear of " + element + ", ready for either lunging or tossing.";
			break;
	}
	return spell;
}

function getSchool (digitalRoot){
	switch(digitalRoot){
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
		 	element = "Light";
		 	magicSource = "the Divine Spirits";
		 	break;
		 case 9:
		 	element = "Cosmic Energy";
		 	magicSource = "the Outer Gods of the Cosmos";
		 	break;
	}
	return [element, magicSource];
}