const Discord = require("discord.js");
const client = new Discord.Client();

client.on("ready", () => {
  console.log("Reactor Online, Sensors Online, Weapons Online, All Systems Nominal");
});

client.on("message", function(message) {
  if (message.content.startsWith(")duel")){
  	if(!message.mentions.members.size){
  		message.channel.send("You must tag a user to challenge them");
  		return;
  	}
  	else{
  		let challenged = message.mentions.members.first();
		message.channel.send(message.member.displayName + " has challenged " +challenged.toString() + " to combat! If you accept, say any message with the word \"accept\" in it! This offer will expire in 1 minute.");
		const filter = m => (m.member === challenged && m.content.includes("accept"));
		message.channel.awaitMessages(filter, {max:1, time:60000})
		.then(collected => {
			if(collected.size > 0){
				message.channel.send("The duel between "+message.member.displayName+" and "+challenged.displayName+" begins!");
				//beginDuel(message.member, challenged, channel);
				return;
			}
		})
		.catch("The duel was rejected.")
  	}
  }
});

client.login("token goes here");