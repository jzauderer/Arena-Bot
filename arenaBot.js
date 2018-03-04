const Discord = require("discord.js");
const client = new Discord.Client();
const duelFunc = require("./duel");
const fs = require('fs');

client.on("ready", () => {
  console.log("Reactor Online, Sensors Online, Weapons Online, All Systems Nominal");
});

client.on("message", function(message) {
	//Duel command
  	if (message.content.startsWith(")duel")){
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
	//blini command, post random image of blini
	else if(message.content.startsWith("!blini")){
		let blini = [];
		console.log("registered");
		let arrayOfBlinis = fs.readdirSync('./blinis');
		arrayOfBlinis.forEach(function(file){
			blini.push(file);
		});
		let result = Math.floor((Math.random()*blini.length));
		try{
			message.channel.send({file: `./blinis/${blini[result]}`});
		}
		catch(err){
			message.channel.send("Failed to post image. Perhaps this bot doesn't have image posting permissions?");
		}
	}
});

client.login("your token here");