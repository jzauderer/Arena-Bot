const Discord = require("discord.js");
const fs = require('fs');

module.exports ={
	//The main function that will be called. Form a pseudo-random phrase from the collection in the txt file
	printPhrase: async function (){
		parseDictionary();
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
async function parseDictionary(){
	let dictionary = [];
	let rawText = [];
	await fs.readFile("dictionary.txt", "utf8", function(err, data) {
		if(err)
			throw err;

		//Split file into lines, put into an array called rawText
		rawText = data.split(/\r?\n/);

		//Split each line into words, push each line to an array called dictionary
		for(let i = 0; i < rawText.length; i++){
			dictionary.push(rawText[i].toString().split(" "));
		}

		console.log(dictionary);
		return dictionary;
	});
	
}