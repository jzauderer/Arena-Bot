const Discord = require("discord.js");
const record = require("./records");

module.exports ={
	beginDuel: async function (duelist1, duelist2, arena){
		let hp1 = 5;
		let hp2 = 5;
		let move1 = "";
		let move2 = "";
		let dm1 = await duelist1.createDM();
		let dm2 = await duelist2.createDM();
		let hpUpdate = [];
		let tutorial = "Your duel begins!\nYou have 5 health and 3 options each turn: slash, lunge, and counter.\nSlash: Does 2 damage. If both slash, no damage is dealt to either duelist. If the opponent lunges, slash does no damage.\nLunge: Does 2 damage, can be countered. If the opponent slashes, you avoid the damage.\nCounter: If the opponent lunges, does 3 damage and negates the lunge. If they slash, you take 2 damage. If they counter, nothing happens.\nTo input a command, type either \"slash\", \"lunge\", or \"counter\". You have 1 minute to input a command, and will lose if you do not input in time. Good luck!";

		//try/catches are used to make sure we can send DMs to both parties, in case one has DMs turned off for example
		try{
			await duelist1.send(tutorial);
		}
		catch(err){
			arena.send(duelist1.displayName + " could not receive the DM. Perhaps check your discord settings?");
			return;
		}
		try{
			await duelist2.send(tutorial);
		}
		catch(err){
			arena.send(duelist2.displayName + " could not receive the DM. Perhaps check your discord settings?");
			return;
		}

		//Main combat loop, represents 1 "turn"
		while(hp1 > 0 && hp2 > 0){
			await duelist1.send("Input your move against " +duelist2.displayName+" now");
			await duelist2.send("You must wait for your opponent to lock in a move, then you may lock in yours.");
			//Get input from first player
			let move1 = await getInput1(duelist1);
			//After the first, get input from the second player
			await duelist2.send("You may now input your move against " +duelist1.displayName+" now");
			let move2 = await getInput2(duelist2);
			//Calculate the results of both moves
			hpUpdate = await tradeBlows(move1,move2,duelist1.displayName,duelist2.displayName,hp1,hp2,arena,duelist1,duelist2);
			//Update the hp values
			hp1 = hpUpdate[0];
			hp2 = hpUpdate[1];
		}

		//Construct the final victory message and post it
		let victoryMessage = "";
		if(hp1 <= 0 && hp2 <= 0){
			victoryMessage = "Both combatants have slain each other at the same time! The duel between " + duelist1.displayName + " and "+duelist2.displayName+" ends in a draw!";
		}
		else if(hp1<=0){
			victoryMessage = duelist2.displayName + " has struck down "+duelist1.displayName+"! "+duelist2.displayName+" is victorious!";
			//record.setRecord(duelist2.user.username, duelist1.user.username);
		}
		else{
			victoryMessage = duelist1.displayName + " has struck down "+duelist2.displayName+"! "+duelist1.displayName+" is victorious!";
			//record.setRecord(duelist1.user.username, duelist2.user.username);
		}
		await duelist1.send(victoryMessage);
		await duelist2.send(victoryMessage);
		console.log(victoryMessage);
		arena.send(victoryMessage);
	}
}

async function getInput1(duelist1){
	const filter = m => (m.content.toLowerCase().trim() === "slash" || m.content.toLowerCase().trim() === "counter" || m.content.toLowerCase().trim() === "lunge");
	await duelist1.user.dmChannel.awaitMessages(filter, {max:1, time:60000})
		.then(collected => {
			//If they send a valid move, use that. Otherwise, send the input "none"
			if(collected.size === 1){
				move1 = collected.array().toString();
			}
			else{
				move1 = "none";
			}
		})
		return move1;
}

async function getInput2(duelist2){
	const filter = m => (m.content.toLowerCase().trim() === "slash" || m.content.toLowerCase().trim() === "counter" || m.content.toLowerCase().trim() === "lunge");
	await duelist2.user.dmChannel.awaitMessages(filter, {max:1, time:60000})
	.then(collected => {
			//If they send a valid move, use that. Otherwise, send the input "none"
			if(collected.size === 1){
				move2 = collected.array().toString();
			}
			else{
				move2 = "none";
			}
		})
		return move2;
}

async function tradeBlows(att1, att2, duelist1, duelist2, hp1, hp2, arena,duelistTag1,duelistTag2){
	//Takes the duelist's display names, not the duelists themselves
	let report = "";
	att1 = att1.toLowerCase().trim();
	att2 = att2.toLowerCase().trim();
	//Both players slash
	if(att1 === "slash" && att2 === "slash"){
		report = duelist1 + " and " + duelist2 + " clash blades, but neither land a hit.";
	}
	//One slashes, the other lunges
	else if(att1 === "lunge" && att2 === "slash"){
		hp2 -= 2;
		report = duelist2 + " slashes at " + duelist1 +", but " + duelist1 + " slips past it and stabs "+ duelist2 + " with a lunge!";
		//report = duelist2 + " slashes at " + duelist1+ ", who returns with a violent lunge.";
	}
	else if(att1 === "slash" && att2 === "lunge"){
		hp1 -= 2;
		report = duelist1 + " slashes at " + duelist2 +", but " + duelist2 + " slips past it and stabs "+ duelist1 + " with a lunge!";
		//report = duelist1 + " slashes at " + duelist2+ ", who returns with a violent lunge.";
	}
	//Both lunge
	else if(att1 === "lunge" && att2 === "lunge"){
		hp1 -= 2;
		hp2 -= 2;
		report = duelist1 + " and " + duelist2 + " both lunge at each other, landing gruesome stabs. The crowd goes wild!"
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
	report += "\n" + duelist1 + " health: " + hp1 + ", " + duelist2 + " health: " + hp2;
	//Return new health values
	await duelistTag1.send(report);
	await duelistTag2.send(report);
	arena.send(report);
	return [hp1,hp2];
}