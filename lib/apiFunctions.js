const pool = require('./db');
const winston = require('winston')
const logger = winston.loggers.get('logger')

	var getRecordDetail = function (uprn) { 
		return new Promise (function (resolve, reject) {
			pool.query('SELECT trim(uprn) As uprn, usrn, isparent, ischild, postcode_sector FROM node_schema.llpg_all_live_addresses WHERE uprn = $1 AND logical_status = \'1\' LIMIT 1', [uprn], function(err, results) {
				if (err) {
					return console.error('error running query', err);
				} else if (results.rows.length === 0) {
					//return res.status(422).json({"error":"No valid uprn match in LLPG database. Is the submitted UPRN correct?"})
					reject()
				} else if (results.rows.length === 1) {
					recordDetail.uprn = results.rows[0].uprn
					recordDetail.usrn = results.rows[0].usrn
					recordDetail.isparent = results.rows[0].isparent
					recordDetail.ischild = results.rows[0].ischild
					recordDetail.postcode_sector = results.rows[0].postcode_sector
					
					nameChecks.recordDetail = recordDetail
					
					resolve()
				}
			}); // pool.query	
		})
	}
	
	var profanityCheck = function (phrase) { 
		return new Promise (function (resolve, reject) {
			pool.query('SELECT profanity FROM node_schema.profanity_list WHERE $1 ILIKE \'%\'||profanity||\'%\'', [phrase], function(err, results) {
				if (err) {
					return console.error('error running query', err);
				}
				else if (results.rows.length > 0) {
					nameChecks.rule.profanityDetected = true
					resolve()
				} else {
					nameChecks.rule.profanityDetected = false
					resolve()
				}
			}); // pool.query	
		})
	}
	
	var identicalNameInUSRN = function (newHouseName, usrn) { 
		return new Promise (function (resolve, reject) {
			pool.query('SELECT paon_text FROM node_schema.llpg_all_live_addresses WHERE usrn = $2 AND lower(paon_text) = $1', [newHouseName.toLowerCase(), usrn], function(err, results) {
				if (err) {
					return console.error('error running query', err);
				}
				var ar = []
				results.rows.forEach(function(row) { 
					ar.push(row.paon_text)
				})
				nameChecks.rule.identicalNameInUSRN.data = ar
				if (ar.length === 0) {
					nameChecks.rule.identicalNameInUSRN.pass = true
				}
				resolve()
			}); // pool.query	
		})
	}
	
	var identicalNameInPostcodeSector = function (newHouseName, postcode_sector) { 
		return new Promise (function (resolve, reject) {
			pool.query('SELECT paon_text FROM node_schema.llpg_all_live_addresses WHERE postcode_sector = $2 AND lower(paon_text) = $1', [newHouseName.toLowerCase(), postcode_sector], function(err, results) {
				if (err) {
					return console.error('error running query', err);
				}
				var ar = []
				results.rows.forEach(function(row) { 
					ar.push(row.paon_text)
				})
				nameChecks.rule.identicalNameInPostcodeSector.data = ar
				if (ar.length === 0) {
					nameChecks.rule.identicalNameInPostcodeSector.pass = true
				}
				resolve()
			}); // pool.query	
		})
	}
	
	var identicalSoundingNameInUSRN = function (newHouseName, usrn) { 
		return new Promise (function (resolve, reject) {
			pool.query('SELECT paon_text, metaphone($1, 255) FROM node_schema.llpg_all_live_addresses WHERE usrn = $2 AND metaphone(paon_text, 255) = metaphone($1, 255)', [newHouseName, usrn], function(err, results) {
				if (err) {
					return console.error('error running query', err);
				}
				var ar = []
				results.rows.forEach(function(row) { 
					ar.push(row.paon_text)
				})
				nameChecks.rule.identicalSoundingNameInUSRN.data = ar
				if (ar.length === 0) {
					nameChecks.rule.identicalSoundingNameInUSRN.pass = true
				}
				resolve()
			}); // pool.query	
		})
	}
	
	var identicalSoundingNameInPostcodeSector = function (newHouseName, postcode_sector) { 
		return new Promise (function (resolve, reject) {
			pool.query('SELECT paon_text, metaphone($1, 255) FROM node_schema.llpg_all_live_addresses WHERE postcode_sector = $2 AND metaphone(paon_text, 255) = metaphone($1, 255)', [newHouseName, postcode_sector], function(err, results) {
				if (err) {
					return console.error('error running query', err);
				}
				var ar = []
				results.rows.forEach(function(row) { 
					ar.push(row.paon_text)
				})
				nameChecks.rule.identicalSoundingNameInPostcodeSector.data = ar
				if (ar.length === 0) {
					nameChecks.rule.identicalSoundingNameInPostcodeSector.pass = true
				}
				resolve()
			}); // pool.query	
		})
	}
	
	var isLastWordReservedSuffix = function (newHouseName) { 
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
	}
	
	var identicalNameDifferentSuffixInUSRN = function (beforeLastWord, usrn) { 
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
	}
	
	var identicalNameDifferentSuffixInPostcodeSector = function (beforeLastWord, postcodeSector) { 
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
	}
	
	var identicalSoundingNameDifferentSuffixInUSRN = function (beforeLastWord, usrn) { 
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
	}
	
	var identicalSoundingNameDifferentSuffixInPostcodeSector = function (beforeLastWord, postcodeSector) { 
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
	}
	
	var checkSuffix = function (newHouseName) {
		return new Promise (function (resolve, reject) {
			Promise.all([
				isLastWordReservedSuffix(newHouseName)
			]).then(function () {
				if (nameChecks.rule.suffix.isLastWordReservedSuffix === false) {
					nameChecks.rule.suffix.identicalNameDifferentSuffixInUSRN.pass = true
					nameChecks.rule.suffix.identicalNameDifferentSuffixInPostcodeSector.pass = true
					nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInUSRN.pass = true
					nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInPostcodeSector.pass = true
					resolve()
				// if isLastWordReservedSuffix = true
				} else if (nameChecks.rule.suffix.isLastWordReservedSuffix === true) {
					var beforeLastWord = newHouseName
					var lastIndex = beforeLastWord.lastIndexOf(" ")
					beforeLastWord = beforeLastWord.substring(0, lastIndex)
					
					Promise.all([
						identicalNameDifferentSuffixInUSRN(beforeLastWord, recordDetail.usrn),
						identicalNameDifferentSuffixInPostcodeSector(beforeLastWord, recordDetail.postcode_sector),
						identicalSoundingNameDifferentSuffixInUSRN(beforeLastWord, recordDetail.usrn),
						identicalSoundingNameDifferentSuffixInPostcodeSector(beforeLastWord, recordDetail.postcode_sector),
					]).then(function (results) {
						// logger.debug(results[0])
						resolve()
					})
				} 
			})
		})
	}
	
	var isAlphaOrSpace = function (f) {
		return new Promise (function (resolve, reject) {
			nameChecks.rule.isAlphaOrSpace = f.match(/^[a-zA-z\s]*$/) != null
			resolve()
		})
	}
	
	var max255Chars = function (f) {
		return new Promise (function (resolve, reject) {
			if (f.length < 256) {
				nameChecks.rule.max255Chars = true
				resolve()
			} else if (f.length >= 256) {
				nameChecks.rule.max255Chars = false
				reject()
			} else {
				nameChecks.rule.max255Chars = false
				reject()
			}
		})
	}
	
module.exports = {
	getRecordDetail: getRecordDetail,
	profanityCheck: profanityCheck,
	identicalNameInUSRN: identicalNameInUSRN,
	identicalNameInPostcodeSector: identicalNameInPostcodeSector,
	identicalSoundingNameInUSRN: identicalSoundingNameInUSRN,
	identicalSoundingNameInPostcodeSector: identicalSoundingNameInPostcodeSector,
	isLastWordReservedSuffix: isLastWordReservedSuffix,
	identicalNameDifferentSuffixInUSRN: identicalNameDifferentSuffixInUSRN,
	identicalNameDifferentSuffixInPostcodeSector: identicalNameDifferentSuffixInPostcodeSector,
	identicalSoundingNameDifferentSuffixInUSRN: identicalSoundingNameDifferentSuffixInUSRN,
	identicalSoundingNameDifferentSuffixInPostcodeSector: identicalSoundingNameDifferentSuffixInPostcodeSector,
	checkSuffix: checkSuffix,
	isAlphaOrSpace: isAlphaOrSpace,
	max255Chars: max255Chars,
};