const Discord = require("discord.js");
const fs = require('fs');  

module.exports = {
	//Takes username of duelists
	setRecord: async function (winner, loser){
		//First check if the duelists have their own records
		let winnerExists;
		let loserExists;
		let allRecords = getRecord(winner)[0];
		console.log(allRecords);
		let winnerRecord;
		let loserRecord;
		if(getRecord(winner)[1] !== -1){
			winnerExists = true;
		}
		else{
			winnerExists = false;
		}
		if(getRecord(loser)[1] !== -1){
			loserExists = true;
		}
		else{
			loserExists = false;
		}
		console.log(winnerExists);
		console.log(loserExists);
		//Create records if they don't have them already
		if(!winnerExists){
			await createRecord(winner, loser, 1);
			if(loserExists){
				await updateRecords(loser, winner, 0);
			}
		}
		if(!loserExists){
			await createRecord(loser, winner, 0);
			if(winnerExists){
				await updateRecords(winner, loser, 1);
			}
		};
		//Check if the two have an existing record. If not, make it
		if(winnerExists && loserExists){
			await updateRecords(winner, loser, 1);
			await updateRecords(loser, winner, 0);
		}
	},

	printRecord: async function(duelist, arena){
		let duelistRecord = await getRecord(duelist)[1]
		console.log(duelistRecord);
		if(duelistRecord !== -1){
			arena.send(await getRecord(duelist)[0][duelistRecord]);
		}
		else{
			arena.send("Could not retrieve record. Have you dueled before?");
		}
	}	
}

//Get the record of a given duelist. Returns the JSON object
async function getRecord(duelist){
	var allRecords;
	await fs.readFile('./recordFile.json', 'utf8', function (err, data){
		if(err) throw err;
		allRecords = JSON.parse(data);
		console.log(allRecords);
		//Check if the given duelist already has a record. If so, return it
		//Gets an array of all records as JSON objects then checks to
		//find the right one
		for(i = 0; i < allRecords.length; i++){
			if(allRecords[i]["tag"] === duelist){
				return [allRecords,index];
			}
		}
		return [allRecords,-1];
	});
}

//Create a new duelist record with first match. Takes usernames of duelists
async function createRecord(duelist, otherDuelist, winStatus){
	let newRecord;
	let allRecords = await getRecord(duelist)[0];
	//If they won
	if(winStatus === 1){
		newRecord = {"tag": duelist,
		otherDuelist: "1-0"};
	}
	//If they lost
	else{
		newRecord = {"tag": duelist,
		otherDuelist: "0-1"};
	}
	allRecords[duelist] = newRecord;
	await fs.writeFile('./recordFile.json', JSON.stringify(allRecords));
}

//Adds new record to existing duelist
async function addRecord(duelist, otherDuelist, winStatus){
	let duelistRecord = await getRecord(duelist)[1];
	let allRecords = await getRecord(duelist)[0];
	if(winStatus === 1){
		allRecords[duelistRecord][otherDuelist] = "1-0";
	}
	else{
		allRecords[duelistRecord][otherDuelist] = "0-1";
	}
	await fs.writeFile('./recordFile.json', JSON.stringify(allRecords));
}

//Update existing record. Takes usernames of duelists
async function updateRecords(duelist, otherDuelist, winStatus){
	let duelistRecord = await getRecord(duelist)[1];
	let allRecords = await getRecord(duelist)[0];
	//Check if they have a record with the other duelist
	if(allRecords[duelistRecord][otherDuelist] == undefined || allRecords[duelistRecord][otherDuelist] == null){
		//They don't have a record
		if(winStatus === 1){
			allRecords[duelistRecord][otherDuelist] = "1-0";
		}
		else{
			allRecords[duelistRecord][otherDuelist] = "0-1";
		}
	}
	else{
		//They have a record
		let recOnOther = allRecords[duelistRecord][otherDuelist].split('-');
		if(winStatus === 1){
			recOnOther[0] = parseInt(recOnOther[0], 10) + 1;
			allRecords[duelistRecord][otherDuelist] = recOnOther[0] + '-' + recOnOther[1];
		}
		else{
			recOnOther[0] = parseInt(recOnOther[1], 10) + 1;
			allRecords[duelistRecord][otherDuelist] = recOnOther[0] + '-' + recOnOther[1];
		}
	}
	await fs.writeFile('./recordFile.json', JSON.stringify(allRecords));
}