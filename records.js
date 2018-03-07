const Discord = require("discord.js");
const fs = require('fs');  

module.exports = {
	setRecord: async function (winner, loser){
		//First check if the duelists have their own records
		let winnerExists;
		let loserExists;
		let winnerRecord;
		let loserRecord;
		try{
			winnerRecord = await getRecord(winner);
			winnerExists = true;
		}
		catch(err){
			winnerExists = false;
		}
		try{
			loserRecord = await getRecord(loser);
			loserExists = true;
		}
		catch(err){
			loserExists = false;
		}
		//Create records if they don't have them already
		if(!winnerExists){
			await createRecord(winner);
			winnerRecord = await getRecord(winner);
		}
		if(!loserExists){
			await createRecord(loser);
			loserRecord = await getRecord(loser);
		};
		//Check if the two have an existing record. If not, make it
		if(winnerRecord[loser] !== undefined){
			await updateRecords(winner, loser);
		}
		else{
			await addRecord(winner, loser);
		}
	},

	printRecord: async function(duelist, arena){
		try{
			arena.send(await getRecord(duelist));
		}
		catch (err){
			arena.send("Could not retrieve record. Have you dueled before?");
		}
	}	
}

async function addRecord(winner, loser){
	let winnerRecord = await getRecord(winner);
	let loserRecord = await getRecord(loser);
	console.log("Winner Record" + winnerRecord);
	winnerRecord[loser.user.username] = '1-0';
	loserRecord[winner.user.username] = '0-1';
	await fs.writeFile('./recordFile.json', JSON.stringify(winnerRecord));
	await fs.writeFile('./recordFile.json', JSON.stringify(loserRecord));
}

//Get the record of a given duelist
async function getRecord(duelist){
	var allRecords;
	await fs.readFile('./recordFile.json', 'utf8', function (err, data){
		if(err) throw err;
		allRecords = JSON.parse(data);
		console.log(allRecords);
		//Check if the given duelist already has a record. If so, return it
		if(allRecords[duelist.user.username] !== undefined){
			return allRecords[duelist.user.username];
		}
		else{
			throw "Record Not Found";
		}
	});
}

//Create a new duelist record
async function createRecord(duelist){
	await fs.writeFile('./recordFile.json', JSON.stringify({"tag": duelist.user.username}));
}

//Update existing record
async function updateRecords(winner, loser){
	let winnerRecord = getRecord(winner.username);
	let loserRecord = getRecord(loser.username);
	let winRecOnLoser = winnerRecord[loser.user.username].split('-');
	let loserRecOnWinner = loserRecord[winner.user.username].split('-');
	winRecOnLoser[0] = parseInt(winRecOnLoser[0], 10) + 1;
	loserRecOnWinner[1] = parseInt(loserRecOnWinner[1], 10) + 1;
	winnerRecord[loser] = winRecOnLoser[0] + '-' + winRecOnLoser[1];
	loserRecord[winner] = loserRecOnWinner[0] + '-' + loserRecOnWinner[1];
	await fs.writeFile('./recordFile.json', JSON.stringify(winnerRecord));
	await fs.writeFile('./recordFile.json', JSON.stringify(loserRecord));
}