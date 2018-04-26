const Discord = require("discord.js");
const fs = require('fs');  

module.exports = {
	//Takes username of duelists to update records after a duel
	setRecord: async function (winner, loser){
		await fs.readFile('./recordFile.json', 'utf8', function (err, data){
			//Parses the entirety of the records as one object
			let records = JSON.parse(data);
			let wl;
			//Check if the winner already has a record
			if(records.hasOwnProperty(winner)){
				//If they have a record, increment wins by 1
				wl = records[winner].split('-')
				records[winner] = (parseInt(wl[0])+parseInt(1))+'-'+wl[1];
			}
			else{
				//Otherwise, give them a default value of 1-0 for winning
				records[winner] = "1-0";
			}
			if(records.hasOwnProperty(loser)){
				//Same as above. If they're in, increment losses by 1
				wl = records[loser].split('-');
				records[loser] = wl[0]+'-'+(parseInt(wl[1])+parseInt(1));
			}
			else{
				records[loser] = "0-1";
			}
			//Overwrite the old record with the new one
			fs.writeFile('./recordFile.json', JSON.stringify(records), (error)=>{
				
			});
		});
	},

	//Prints out the win/loss record when requested
	printRecord: async function(duelist, arena){
		await fs.readFile('./recordFile.json', 'utf8', function (err, data){
			let records = JSON.parse(data);
			//Parses the entirety of the records, then checks
			//to see if the user is in there
			if(records.hasOwnProperty(duelist.user.username)){
				//If so, print it
				let wl = records[duelist.user.username].split('-')
				arena.send(duelist.displayName + " has " + wl[0] + " wins and " + wl[1] + " losses.");
			}
			else{
				//Otherwise let them know they're not in there
				arena.send("No record found. Have you dueled before?");
			}
		});
	},

	//Prints the Power Ranking for the given server
	printPR: async function(arena, arenaGuild){
		await fs.readFile('./recordFile.json', 'utf8', function (err, data){
			//First, get collection of all records and collection of all users in server
			let records = JSON.parse(data);
			let memberList = arenaGuild.members.array();
			//Second, intersect records keys and userList
			let userList = [];
			let userListIndex = 0;
			for(let i = 0; i < arenaGuild.memberCount; i++){
				if(records.hasOwnProperty(memberList[i].user.username)){
					userList.push(memberList[i].user.username);
				}
			}
			//This gives us a list of the users in the server that have duel records

			//Make sure there's actually users
			if(userList.length === 0){
				arena.send("No users in this server have dueled!");
				return;
			}

			//Bubble sorts from lowest W/L to highest
			for(let i = 0; i < userList.length; i++){
				for(let j = 0; j < userList.length - i - 1; j++){
					let wl = records[userList[j]].split('-');
					let wlNext = records[userList[j+1]].split('-');
					let ratio;
					let ratioNext;
					//If they have a perfect win/loss consider their W/L 1. We don't wanna divide by zero
					if(wl[1] === 0)
						ratio = 1;
					else
						ratio = parseInt(wl[0])/(parseInt(wl[0])+parseInt(wl[1]));
					if(wlNext[1] === 0)
						ratioNext = 1;
					else
						ratioNext = parseInt(wlNext[0])/(parseInt(wlNext[0])+parseInt(wlNext[1]));
					//Swap if the current one has a better win/loss than the next
					if(ratio > ratioNext){
						let temp = userList[j];
						userList[j] = userList[j+1];
						userList[j+1] = temp;
					}
					//If it's a tie, consider the one with more games to be better
					else if(ratio === ratioNext){
						if((parseInt(wl[0]) + parseInt(wl[1])) > ((parseInt(wlNext[0]) + parseInt(wlNext[1])))){
							let temp = userList[j];
							userList[j] = userList[j+1];
							userList[j+1] = temp;
						}
					}
				}
			}

			let PRMessage = "";

			//This loop will put together the PR message in chat
			let count = 1;
			for(let i = userList.length-1; i >= 0 && count <= 10; i--){
				if((parseInt(records[userList[i]].split('-')[0]) + parseInt(records[userList[i]].split('-')[1])) >= 5 ){
					PRMessage += count + ". " + userList[i] + ": " + records[userList[i]] + "\n";
					count++;
				}
			}
			arena.send(PRMessage);
		});
	}
}