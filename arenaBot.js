const Discord = require("discord.js");
const client = new Discord.Client();
const duelFunc = require("./duel");
const phraseFunc = require("./phrase");
const record = require("./records");
const fs = require('fs');
const auth = require('./auth.json');

client.on("ready", () => {
  console.log("Reactor Online, Sensors Online, Weapons Online, All Systems Nominal");
  client.user.setActivity('!arenahelp');
});

client.on('error', (error) => console.log(error));

client.on("message", function(message) {
	//Help message
	if(message.content.trim().toLowerCase() === "!arenahelp"){
		message.channel.send("Arena-Bot has 4 commands so far:\n**!duel [user]**: Challenges tagged user to a duel\n**!record**: Posts your win/loss record in the duel minigame\n**!blini [optional number]**: Posts a random blini. If given a number, will print the corresponding blini.\n**!blinivideo**: Posts a random blini video")
	}

	else if (message.content.startsWith("!phrase")){
		phraseFunc.printPhrase(message.channel);
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

	//Print user record
	else if(message.content.trim().toLowerCase() === "!record"){
		record.printRecord(message.member, message.channel);
	}

	//Print duel Power Rankings for the given server
	else if(message.content.trim().toLowerCase() === "!pr"){
		record.printPR(message.channel, message.channel.guild);
	}

	else if(message.content.toLowerCase().trim() === "!phrase"){
		phraseFunc.printPhrase();
	}

	//blini command, post random image of blini
	else if(message.content.toLowerCase().trim().split(" ")[0] === "!blini"){
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
					//Check if the number is valid
					if((Math.floor(splitMessage[1]) > blini.length) || (Math.floor(splitMessage[1]) <= -2)){
						message.channel.send("There is no blini of that number. There are currently "+blini.length+" blinis.");
						return;
					}
					//If the number is -1, post bliniGlitch
					if(Math.floor(splitMessage[1]) === -1){
						try{
							message.channel.send({file: `./misc_images/bliniGlitch.gif`});
						}
						catch(err){
							message.channel.send("Failed to post image. Perhaps this bot doesn't have image posting permissions?");
						}
					}
					//If the number is 0, choose between two special "dream" blinis
					else if(Math.floor(splitMessage[1]) === 0){
						let result = Math.floor(Math.random()*2);
						try{
							if(result === 1){
								message.channel.send({file: `./misc_images/bliniDream1.jpg`});
							}
							else{
								message.channel.send({file: `./misc_images/bliniDream2.jpg`});
							}
						}
						catch(err){
							message.channel.send("Failed to post image. Perhaps this bot doesn't have image posting permissions?");
						}
					}
					//Otherwise just post the requested blini
					else{
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

	//Blini video command
	else if(message.content.trim().toLowerCase() === "!blinivideo"){
		//Read from the text file of video links
		let bliniVideos = fs.readFileSync('./bliniVideos.txt', "utf-8");
		//Split it into an array of each video, then post a random one
		bliniVideos = bliniVideos.split('\n');
		//Send a random video from the array
		message.channel.send(bliniVideos[Math.floor(Math.random()*bliniVideos.length)]);
	}

	else if(message.content.trim().split(" ").length > 1 && !message.member.user.bot){
		phraseFunc.catalogMessage(message.content);
	}
});

client.login(auth.token);