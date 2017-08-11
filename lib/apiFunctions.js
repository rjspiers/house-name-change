const pool = require('./db');
const winston = require('winston')
const logger = winston.loggers.get('logger')

module.exports = {
	
	isLastWordReservedSuffix: function (newHouseName) { 
		return new Promise (function (resolve, reject) {
			suffixArray = ['barn', 'bungalow', 'castle', 'chase', 'cottage', 'court', 'croft', 'end', 'farm', 'gables', 'hall', 'holme', 'house', 'lea', 'leigh', 'lodge', 'manor', 'mansion', 'mill', 'paddock', 'ridge', 'view', 'villa']
						
			var wordCount = newHouseName.split(" ").length
			
			// check if name is 1 word or less
			if (wordCount <= 1) {
				nameChecks.rule.suffix.isLastWordReservedSuffix = false
				nameChecks.rule.suffix.message = 'single word only'
				resolve()
			// Check if name is more than 1 word long
			} else if (wordCount > 1) {
				words = newHouseName.split(" ")
				lastWord = words[words.length - 1].toLowerCase()
				// check if lastWord is in list of reserved suffixes
				if (suffixArray.includes(lastWord)) {
					nameChecks.rule.suffix.isLastWordReservedSuffix = true
					nameChecks.rule.suffix.message = lastWord + ' is in reserved suffix array'
					resolve()
				// if it is not in list of reserved suffixes
				} else {
					nameChecks.rule.suffix.isLastWordReservedSuffix = false
					nameChecks.rule.suffix.message = lastWord + ' not in reserved suffix array'
					resolve()
				}
			} 
		})
	},
	
	identicalNameDifferentSuffixInUSRN: function (beforeLastWord, usrn) { 
		return new Promise (function (resolve, reject) {
			pool.query('SELECT paon_text FROM node_schema.llpg_all_live_addresses WHERE usrn = $2 AND trim(lower(paon_text_no_suffix)) = $1', [beforeLastWord.toLowerCase(), usrn], function(err, results) {
				if (err) {
					return console.error('error running query', err);
				}
				var ar = []
				results.rows.forEach(function(row) { 
					ar.push(row.paon_text)
				})
				nameChecks.rule.suffix.identicalNameDifferentSuffixInUSRN.data = ar
				if (ar.length === 0) {
					nameChecks.rule.suffix.identicalNameDifferentSuffixInUSRN.pass = true
				} else {
					nameChecks.rule.suffix.identicalNameDifferentSuffixInUSRN.pass = false
				}
				resolve(ar)
			}); // pool.query
		})
	},
	
	identicalNameDifferentSuffixInPostcodeSector: function (beforeLastWord, postcodeSector) { 
		return new Promise (function (resolve, reject) {
			pool.query('SELECT paon_text FROM node_schema.llpg_all_live_addresses WHERE postcode_sector = $2 AND lower(paon_text_no_suffix) = $1', [beforeLastWord.toLowerCase(), postcodeSector], function(err, results) {
				if (err) {
					return console.error('error running query', err);
				}
				var ar = []
				results.rows.forEach(function(row) { 
					ar.push(row.paon_text)
				})
				nameChecks.rule.suffix.identicalNameDifferentSuffixInPostcodeSector.data = ar
				if (ar.length === 0) {
					nameChecks.rule.suffix.identicalNameDifferentSuffixInPostcodeSector.pass = true
				} else {
					nameChecks.rule.suffix.identicalNameDifferentSuffixInPostcodeSector.pass = false
				}
				resolve(ar)
			}); // pool.query
		})
	},
	
	identicalSoundingNameDifferentSuffixInUSRN: function (beforeLastWord, usrn) { 
		return new Promise (function (resolve, reject) {
			pool.query('SELECT paon_text, metaphone($1, 255) FROM node_schema.llpg_all_live_addresses WHERE usrn = $2 AND metaphone(paon_text_no_suffix, 255) = metaphone($1, 255)', [beforeLastWord.toLowerCase(), usrn], function(err, results) {
				if (err) {
					return console.error('error running query', err);
				}
				var ar = []
				results.rows.forEach(function(row) { 
					ar.push(row.paon_text)
				})
				nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInUSRN.data = ar
				if (ar.length === 0) {
					nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInUSRN.pass = true
				} else {
					nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInUSRN.pass = false
				}
				resolve(ar)
			}); // pool.query
		})
	},
	
	identicalSoundingNameDifferentSuffixInPostcodeSector: function (beforeLastWord, postcodeSector) { 
		return new Promise (function (resolve, reject) {
			pool.query('SELECT paon_text, metaphone($1, 255) FROM node_schema.llpg_all_live_addresses WHERE postcode_sector = $2 AND metaphone(paon_text_no_suffix, 255) = metaphone($1, 255)', [beforeLastWord.toLowerCase(), postcodeSector], function(err, results) {
				if (err) {
					return console.error('error running query', err);
				}
				var ar = []
				results.rows.forEach(function(row) { 
					ar.push(row.paon_text)
				})
				nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInPostcodeSector.data = ar
				if (ar.length === 0) {
					nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInPostcodeSector.pass = true
				} else {
					nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInPostcodeSector.pass = false
				}
				resolve(ar)
			}); // pool.query
		})
	},
	

	
};