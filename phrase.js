const Discord = require("discord.js");
const fs = require('fs');
const async = require("async");

//Frequency at which the dictionary is updated
//It will update the dictionary once ever x messages
const frequency = 1;

let messagesLogged = 0;

let dictionary = parseDictionary();

//The frequency at which the dictionary file is overwritten to the new dictionary
//ie Every rewriteFrequency messages parsed, the file will be overwritten
let rewriteFrequency = 500;

//Dictionary will be rewritten when this reaches rewriteFrequency
let rewriteCount = 0;

module.exports ={
	//The main function that will be called. Form a pseudo-random phrase from the collection in the txt file
	printPhrase: async function (channel, starter = ""){
		channel.send(compileMessage(starter.trim()));
	},

	catalogMessage: async function (message){
		message= message.trim().
		messagesLogged++;
		if(messagesLogged >= frequency){
			//console.log("Parsing message: " + message);
			rewriteCount++;
			let splitMessage = message.split(" ");
			for(let i = 0; i < splitMessage.length - 1; i++){
				await addWord(splitMessage[i], splitMessage[i+1]);
			}
			if(rewriteCount  >= rewriteFrequency){
				writeDictionary(dictionary);
				rewriteCount = 0;
			}
			messagesLogged = 0;
			//console.log("Message parsed: " + message);
		}
		
	}
}

function compileMessage(starter = ""){
	let count = 1;
	let constructedMessage;

	//Percent chance to stop printing
	let keepGoing = true;
	let stopPercentage = 8;

	//Max message size
	let maxSize = 25;

	//User can opt to provide the starting word

	if(starter === ""){
		//Choose a random word to start on
		constructedMessage = dictionary[Math.floor(Math.random()*dictionary.length)][0];
		while(constructedMessage === "")
			constructedMessage = dictionary[Math.floor(Math.random()*dictionary.length)][0];
	}
	else{
		constructedMessage = starter;
	}

	//Also keep track of the most recent word that has been added
	let lastWord = constructedMessage;

	while((count < maxSize && keepGoing) || constructedMessage === ""){
		if(Math.floor(Math.random() * 100) < stopPercentage)
			keepGoing = false;
		lastWord = next(lastWord);
		//End message creation if the last word has no followers
		if(lastWord === ""){
			count = maxSize;
		}
		//Otherwise, add the word and keep going
		else{
			constructedMessage += (" " + lastWord);
		}
		count++;
	}

	return constructedMessage;
}

//Given a keyword, choose a pseudo-random word to follow it
function next(keyWord){
	if(keyWord === ""){
		return "";
	}
	//Find line for your keyword
	for(let i = 0; i < dictionary.length; i++){
		if(dictionary[i][0] === keyWord && dictionary[i].length > 1){
			//Choose a random word from this line
			return dictionary[i][((Math.floor(Math.random()*(dictionary[i].length - 1))) + 1)].trim();
		}
	}
	//If there is no entry for the keyword, end it there
	return "";
}

/*
Reads the file and constructs an array of arrays for use in other functions
The outer array contains all the text in the file, with each line being split into an array of strings
The inner array is an array of strings, each string being a single word on the line

For example, if the text file reads as follows:
key word 
key word word word
key word word
key word word word

This will return an array as such:
[ [key, word], [key, word, word, word], [key, word, word], [key, word, word, word] ]
*/
function parseDictionary(){
	let dictionary = [];

	//Split file into lines, put into an array called rawText
	let rawText = fs.readFileSync("dictionary.txt", "utf8").split(/\r?\n/);
	//Split each line into words, push each line to an array called dictionary
	for(let i = 0; i < rawText.length; i++){
		dictionary.push(rawText[i].toString().split(" "));
	}

	return dictionary;
}

//Overwrites the dictionary file
function writeDictionary(newDictionary){
	console.log("Rewriting dictionary");
	let rawText = "";

	//Iterate through each 'line' array in the new dictionary array
	newDictionary.forEach(function(line){
		//Add each 'word' from each 'line' array to the raw text
		line.forEach(function(word){
			rawText += (word + " ");
		});

		//Remove leading space
		rawText = rawText.substring(0, rawText.length - 1);

		//Line break between 'line' arrays
		rawText += "\r\n";
	});

	//Remove last line break
	rawText = rawText.substring(0, rawText.length - 1);

	//Write to file
	fs.writeFileSync('dictionary.txt', rawText, (error)=>{
		if(error)
			throw error;
	});
}

//Pushes an individual word/following pair to the stored dictionary
async function addWord(keyWord, followingWord){
	//console.log("Writing word: " + keyWord);
	//Find line in which the first word is the word you're adding
	for(let i = 0; i < dictionary.length; i++){
		if(dictionary[i][0] === keyWord){
			//Then push the new following word to the line (array)
			dictionary[i].push(followingWord);
		}
	}
	//If the key is not found, create a new line with that keyword and following
	dictionary.push([keyWord, followingWord]);
}