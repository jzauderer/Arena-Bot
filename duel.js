const Discord = require("discord.js");

module.exports ={
	beginDuel: function (duelist1, duelist2, arena){
		let hp1 = 4;
		let hp2 = 4;
		let dm1 = duelist1.createDM();
		let dm2 = duelist2.createDM();
		let move1 = "";
		let move2 = "";
		let tutorial = "Your duel begins!\nYou have 4 health and 3 options each turn: slash, lunge, and counter.\nSlash: Does 1 damage. If both slash, no damage is dealt to either duelist.\nLunge: Does 2 damage, can be countered.\nCounter: If the opponent lunges, does 3 damage. If they slash, you take 2 damage instead of the normal 1. If they counter, nothing happens.\nTo input a command, type either \"slash\", \"lunge\", or \"counter\". You have 1 minute to input a command, and will lose if you do not input in time. Good luck!";
		dm1.send(tutorial);
		dm2.send(tutorial);
		while(hp1 > 0 && hp2 > 0){
			dm1.send("Input your move against " +duelist2.displayName+" now");
			dm2.send("Input your move against " +duelist1.displayName+" now");
			const filter = m => (m.content === "slash" || m.content === "counter" || m.content === "lunge");
			dm1.awaitMessages(filter, {max:1, time:60000})
				.then(collected => {
					if(collected.size === 1){
						move1 = collected[0];
					}
					else{
						move1 = "none";
					}
				})
			dm2.awaitMessages(filter, {max:1, time:60000})
			.then(collected => {
				if(collected.size === 1){
					move2 = collected[0];
				}
				else{
					move2 = "none";
				}
			})
			tradeBlows(move1,move2,duelist1,duelist2,hp1,hp2,arena);
		}
		if(hp1 <= 0 && hp2 <= 0){
			arena.send("Both combatants have slain each other at the same time! The duel between " + duelist1.displayName + " and "+duelist2.displayName+" ends in a draw!");
		}
		else if(hp1<=0){
			arena.send(duelist1.displayName + "has been struck down by "+duelist2.displayName+"! "+duelist2.displayName+" is victorious!");
		}
		else{
			arena.send(duelist2.displayName + "has been struck down by "+duelist1.displayName+"! "+duelist1.displayName+" is victorious!");
		}
	}
}

function tradeBlows(att1, att2, duelist1, duelist2, hp1, hp2, arena){
	//Takes the duelists display names, not the duelists themselves
	let report = "";
	//Both players slash
	if(att1 === "slash" && att2 === "slash"){
		report = duelist1 + " and " + duelist2 + " clash blades, but neither land a hit.\n";
	}
	//One slashes, the other lunges
	else if(att1 === "slash" && att2 === "lunge"){
		hp1 -= 2;
		hp2 -= 1;
		report = duelist1 + "slashes at " + duelist2+ ", who returns with a violent lunge.\n";
	}
	else if(att1 === "slash" && att2 === "lunge"){
		hp1 -= 1;
		hp2 -= 2;
		report = duelist2 + "slashes at " + duelist1+ ", who returns with a violent lunge.\n";
	}
	//Both lunge
	else if(att1 === "lunge" && att2 === "lunge"){
		hp1 -= 2;
		hp2 -= 2;
		report = duelist1 + " and " + duelist2 + " both lunge at each other, landing gruesome stabs. The crowd goes wild.\n"
	}
	//Both counter
	else if(att1 === "counter" && att2 === "counter"){
		report = duelist1 + " and " +duelist2 + " sit behind their shields, anticipating a lunge. The crowd boos at the boring display of patience.";
	}
	//One lunges, one counters
	else if(att1 === "lunge" && att2 === "counter"){
		hp1 -= 3;
		report = duelist1 + " goes for a lunge, but "+ duelist2+ ", anticipating this, swiftly bats the sword aside and stabs "+duelist1;
	}
	else if(att1 === "counter" && att2 === "lunge"){
		hp2 -= 3;
		report = duelist2 + " goes for a lunge, but "+ duelist1+ ", anticipating this, swiftly bats the sword aside and stabs "+duelist2;
	}
	//One slashes, one counters
	else if(att1 === "slash" && att2 === "counter"){
		hp2 -= 2;
		report = duelist2 +" prepares to counter a lunge, but is caught off guard by a powerful overhead slash from " + duelist1;
	}
	else if(att1 === "counter" && att2 === "slash"){
		hp1 -= 2;
		report = duelist1 +" prepares to counter a lunge, but is caught off guard by a powerful overhead slash from " + duelist2;
	}
	//One doesn't input a command
	else if(att1 === "none" && att2 !== "none"){
		hp1 = 0;
		report = duelist1 +" stares off into space. "+duelist2+" takes advantage of his inaction by decapitating him with a powerful blow to the neck!";
	}
	else if(att1 !== "none" && att2 === "none"){
		hp2 = 0;
		report = duelist2 +" stares off into space. "+duelist1+" takes advantage of his inaction by decapitating him with a powerful blow to the neck!";
	}
	//Neither input a command
	else{
		hp1 = 0;
		hp2 = 0;
		report = "Both "+duelist1+ " and "+duelist2+" suddenly lose focus and just stand around idly. The crowd boos and throws rocks, killing both duelists!";
	}
	report += duelist1 + " health: " + hp1 + ", " + duelist2 + " health: " + hp2;
	//Return new health values
	arena.send(report);
	return [hp1,hp2];
}