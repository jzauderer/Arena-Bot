const Discord = require("discord.js");
const client = new Discord.Client();
const duelFunc = require("./duel");
const spellFunc = require("./spells");
const record = require("./records");
const fs = require('fs');
const auth = require('./auth.json');

client.on("ready", () => {
  console.log("Reactor Online, Sensors Online, Weapons Online, All Systems Nominal");
  client.user.setActivity('!arenahelp');
});

client.on("message", function(message) {
	//Help message
	if(message.content.trim().toLowerCase() === "!arenahelp"){
		message.channel.send("Arena-Bot has 3 commands so far:\n**!duel [user]**: Challenges tagged user to a duel\n**!blini [optional number]**: Posts a random blini. If given a number, will print the corresponding blini.\n**!cast [school] [spell name]**: Casts a spell based on the parameters. The school can only be one word, but the spell name may be many.")
	}

	//Duel command
  	else if (message.content.startsWith("!duel")){
	  	//Check if anyone has been tagged
	  	if(!message.mentions.members.size){
	  		message.channel.send("You must tag a user to challenge them");
	  		return;
	  	}
	  	else{
	  		let challenged = message.mentions.members.first();
	  		//Check for edge cases
	  		if(challenged.user.bot){
	  			message.channel.send("Bots cannot duel!");
	  			return;
	  		}
	  		if(challenged === message.member){
	  			message.channel.send("You cannot duel yourself!");
	  			return;
	  		}
			message.channel.send(message.member.displayName + " has challenged " +challenged.displayName + " to combat! If you accept, say any message with the word \"accept\" in it! This offer will expire in 1 minute.");
			//Wait for response from the challenged user
			const filter = m => (m.member === challenged && m.content.toLowerCase().includes("accept"));
			message.channel.awaitMessages(filter, {max:1, time:60000})
			.then(collected => {
				if(collected.size > 0){
					message.channel.send("The duel between "+message.member.displayName+" and "+challenged.displayName+" begins! Both players check your DMs");
					duelFunc.beginDuel(message.member, challenged, message.channel);
					console.log("Duel started between "+ message.member.displayName +" and " +challenged.displayName+ " in "+ message.channel.name);
					return;
				}
				else{
					message.channel.send(message.member.displayName + "'s challenge against " + challenged.displayName+ " has gone unanswered!");
					return;
				}
			})
			.catch("The duel was rejected.")
	  	}
	}
/*
	//Print user record
	else if(message.content.trim().toLowerCase() === "!record"){
		record.printRecord(message.member, message.channel);
	}
*/
	//blini command, post random image of blini
	else if(message.content.toLowerCase().startsWith("!blini")){
		//Creates an array of all the blini filenames
		let blini = [];
		let arrayOfBlinis = fs.readdirSync('./blinis');
		arrayOfBlinis.forEach(function(file){
			blini.push(file);
		});
		//Posts a random blini
		if(message.content.trim().toLowerCase() === "!blini"){
			let result = Math.floor((Math.random()*blini.length));
			try{
				message.channel.send({file: `./blinis/${blini[result]}`});
			}
			catch(err){
				message.channel.send("Failed to post image. Perhaps this bot doesn't have image posting permissions?");
			}
		}
		//If given a parameter, check if it's valid. If it's an integer, post the corresponding blini
		else{
			//Split message into an array of separate words, then check parameters
			let splitMessage = message.content.toLowerCase().trim().split(" ");
			//Check if only 1 arg
			if(splitMessage.length === 2){
				//Check if the second arg is a number
				if(!isNaN(splitMessage[1])){
					if((Math.floor(splitMessage[1]) > blini.length-1) || (Math.floor(splitMessage[1]) <= 0)){
						message.channel.send("There is no blini of that number. There are currently "+blini.length+" blinis.");
						return;
					}
					try{
						if(fs.existsSync(`./blinis/blini${splitMessage[1]}.jpg`)){
							message.channel.send({file: `./blinis/blini${splitMessage[1]}.jpg`});
						}
						else{
							message.channel.send({file: `./blinis/blini${splitMessage[1]}.png`});
						}
						
					}
					catch(err){
						message.channel.send("Failed to post image. Perhaps this bot doesn't have image posting permissions?");
					}
				}
				else{
					message.channel.send("That's not a number!");
				}
			}
			else{
				message.channel.send("Blini command takes can take no more than 1 argument.");
			}
		}
	}

	//Casts command, casts a spell. Takes no less than 2 parameters
	else if(message.content.toLowerCase().startsWith("!cast")){
		//Split message into an array of separate words, then check parameters
		let splitMessage = message.content.trim().split(" ");
		//Remove whitespace elements
		splitMessage = splitMessage.filter(function(str){
			return /\S/.test(str);
		})
		if(splitMessage.length <= 2){
			message.channel.send("This command requires at least 2 parameters: The school of magic, followed by the name of the spell.\nThe school must be one word, but the name can be many.");
			return;
		}
		spellFunc.cast(splitMessage, message.channel, message.member.displayName);
	}
});

client.login(auth.token);