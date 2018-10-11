const Discord = require("discord.js");
const fs = require('fs');
const async = require("async");

module.exports ={
	//The main function that will be called. Form a pseudo-random phrase from the collection in the txt file
	printPhrase: async function (channel){
		channel.send(parseDictionary());
	},

	catalogMessage: async function (message){
		let splitMessage = message.split(" ");
		for(let i = 0; i < splitMessage.length - 1; i++){
			await addWord(splitMessage[i], splitMessage[i+1]);
		}
	}
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

function writeDictionary(newDictionary){
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

async function addWord(keyWord, followingWord){
	let dictionary = parseDictionary();

	//Find line in which the first word is the word you're adding
	for(let i = 0; i < dictionary.length; i++){
		if(dictionary[i][0] === keyWord){
			//Then push the new following word to the line (array)
			dictionary[i].push(followingWord);
			writeDictionary(dictionary);
			return;
		}
	}
	//If the key is not found, create a new line with that keyword and following
	dictionary.push([keyWord, followingWord]);
	writeDictionary(dictionary);
}