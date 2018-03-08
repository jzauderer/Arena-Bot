const Discord = require("discord.js");
const fs = require('fs');  

module.exports = {
	//Takes username of duelists to update records after a duel
	setRecord: async function (winner, loser){
		await fs.readFile('./recordFile.json', 'utf8', function (err, data){
			//Parses the entirety of the records as one object
			records = JSON.parse(data);
			//Check if the winner already has a record
			if(records.hasOwnProperty(winner)){
				//If they have a record, increment wins by 1
				wl = records[winner].split('-')
				console.log(wl);
				wl[0] += 1;
				records[winner] = wl[0]+'-'+wl[1];
			}
			else{
				//Otherwise, give them a default value of 1-0 for winning
				records[winner] = "1-0";
			}
			if(records.hasOwnProperty(loser)){
				//Same as above. If they're in, increment losses by 1
				wl = records[loser].split('-');
				wl[1] += 1;
				records[loser] = wl[0]+'-'+wl[1];
			}
			else{
				records[loser] = "0-1";
			}
			//Overwrite the old record with the new one
			fs.writeFile('./recordFile.json', JSON.stringify(records));
		});
	},

	//Prints out the win/loss record when requested
	printRecord: async function(duelist, arena){
		await fs.readFile('./recordFile.json', 'utf8', function (err, data){
			records = JSON.parse(data);
			//Parses the entirety of the records, then checks
			//to see if the user is in there
			if(records.hasOwnProperty(duelist.user.username)){
				//If so, print it
				wl = records[duelist.user.username].split('-')
				arena.send(duelist.displayName + " has " + wl[0] + " wins and " + wl[1] + " losses.");
			}
			else{
				//Otherwise let them know they're not in there
				arena.send("No record found. Have you dueled before?");
			}
		});
	}
}