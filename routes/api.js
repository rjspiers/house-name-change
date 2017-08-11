const express = require('express');
const request = require('request');
const router = express.Router();
const bodyParser = require('body-parser')
const twilio = require('twilio');
const Promise = require('bluebird');
const winston = require('winston')

const pool = require('../lib/db');
const logger = winston.loggers.get('logger')

const apiFunctions = require('../lib/apiFunctions')

router.get('/', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ api_message: "api is here" }, null, 2));
});

router.get('/testDbConn', function(req, res) {
	pool.query('SELECT 1 AS number', [], function(err, results) {
		if (err) {
			return console.error('error running query', err);
		}
		res.json({
			status: 'success',
			testDbConn: results.rows
		})
	}) // pool.query
})

// /api/postcodeUk?postcode=gu13au
router.get('/postcodeUk', function(req, res, next) {
    var postcode = req.query.postcode;
    request('https://address.digitalservices.surreyi.gov.uk/addresses?postcode=' + postcode, 
        {'auth': {'bearer': process.env.bearerToken}}, function (err, response, body) {
        if (err || response.statusCode !== 200) {
            res.status(response.statusCode).json(JSON.parse(body)); // example 422 = {"error":"postcode is invalid"}
        } else if (response.statusCode === 200) {
            res.json(JSON.parse(body));
        } else {
            var message = '{"error":"internal server error"}'
            res.status(500).json(message);
        }
    });
});

// /api/postcode?postcode=gu13au
router.get('/postcode', function(req, res, next) {
    var postcode = req.query.postcode;
    request('https://address.digitalservices.surreyi.gov.uk/addresses?postcode=' + postcode, 
        {'auth': {'bearer': process.env.bearerToken}}, function (err, response, body) {
        if (err || response.statusCode !== 200) {
            res.status(response.statusCode).json(JSON.parse(body)); // example 422 = {"error":"postcode is invalid"}
        } else if (response.statusCode === 200) {
			var jsonArray = JSON.parse(response.body)
			var filteredJsonArray = jsonArray.filter(function(obj) {
				return (obj.gssCode === 'E07000209')
			})
			if (filteredJsonArray.length > 0) {
				res.json(filteredJsonArray);
			} else if (filteredJsonArray.length === 0) {
				res.status(422).json({"error":"no Guildford Borough addresses in this postcode"})
			}
        } else {
            var message = '{"error":"internal server error"}'
            res.status(500).json(message);
        }
    });
});

// /api/postcodeStatic
router.get('/postcodeStatic', function(req, res, next) {
    var postcode = 'gu13au';
    request('https://address.digitalservices.surreyi.gov.uk/addresses?postcode=' + postcode, 
        {'auth': {'bearer': process.env.bearerToken}}, function (err, response, body) {
        if (err || response.statusCode !== 200) {
            res.status(response.statusCode).json(JSON.parse(body)); // example 422 = {"error":"postcode is invalid"}
        } else if (response.statusCode === 200) {
            res.json(JSON.parse(body));
        } else {
            var message = '{"error":"internal server error"}'
            res.status(500).json(message);
        }
    });
});

// /api/uprn?uprn=10007099272
router.get('/uprn', function(req, res, next) {
    var uprn = req.query.uprn;
    request('https://address.digitalservices.surreyi.gov.uk/addresses?format=all&uprn=' + uprn, 
        {'auth': {'bearer': process.env.bearerToken}}, function (err, response, body) {
        if (err || response.statusCode !== 200) {
          return res.sendStatus(500);
        }
        //res.render('index', { title : 'Main page', news : JSON.parse(body) });
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.parse(body));
    });
});

// /api/nameCheck?newHouseName=Beechanger&uprn=10007060106
router.get('/nameCheck', function(req, res) {
	logger.info(req.query.uprn + ',' + req.query.newHouseName)
	// q.uprn & q.newHouseName
	var q = req.query
	
	/* ideal json */
	nameChecks = {}
	nameChecks.recordDetail = {}
	recordDetail = {}
	recordDetail.uprn = {}
	
	nameChecks.summary = {}
	nameChecks.summary.pass = null
	
	nameChecks.rule = {}
	nameChecks.rule.profanityDetected = null
	nameChecks.rule.identicalNameInUSRN = {}
	nameChecks.rule.identicalNameInUSRN.pass = false
	nameChecks.rule.identicalNameInUSRN.data = []
	nameChecks.rule.identicalNameInPostcodeSector = {}
	nameChecks.rule.identicalNameInPostcodeSector.pass = false
	nameChecks.rule.identicalNameInPostcodeSector.data = []
	nameChecks.rule.identicalSoundingNameInUSRN = {}
	nameChecks.rule.identicalSoundingNameInUSRN.pass = false
	nameChecks.rule.identicalSoundingNameInUSRN.data = []
	nameChecks.rule.identicalSoundingNameInPostcodeSector = {}
	nameChecks.rule.identicalSoundingNameInPostcodeSector.pass = false
	nameChecks.rule.identicalSoundingNameInPostcodeSector.data = []
	
	nameChecks.rule.suffix = {}
	nameChecks.rule.suffix.isLastWordReservedSuffix = null
	nameChecks.rule.suffix.message = {}
	nameChecks.rule.suffix.identicalNameDifferentSuffixInUSRN = {}
	nameChecks.rule.suffix.identicalNameDifferentSuffixInUSRN.pass = null
	nameChecks.rule.suffix.identicalNameDifferentSuffixInUSRN.data = []
	nameChecks.rule.suffix.identicalNameDifferentSuffixInPostcodeSector = {}
	nameChecks.rule.suffix.identicalNameDifferentSuffixInPostcodeSector.pass = null
	nameChecks.rule.suffix.identicalNameDifferentSuffixInPostcodeSector.data = []
	nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInUSRN = {}
	nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInUSRN.pass = null
	nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInUSRN.data = []
	nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInPostcodeSector = {}
	nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInPostcodeSector.pass = null
	nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInPostcodeSector.data = []
	/* end */
	
	function getRecordDetail () { 
		return new Promise (function (resolve, reject) {
			pool.query('SELECT trim(uprn) As uprn, usrn, isparent, ischild, postcode_sector FROM node_schema.llpg_all_live_addresses WHERE uprn = $1 AND logical_status = \'1\' LIMIT 1', [q.uprn], function(err, results) {
				if (err) {
					return console.error('error running query', err);
				}
				recordDetail.uprn = results.rows[0].uprn
				recordDetail.usrn = results.rows[0].usrn
				recordDetail.isparent = results.rows[0].isparent
				recordDetail.ischild = results.rows[0].ischild
				recordDetail.postcode_sector = results.rows[0].postcode_sector
				
				nameChecks.recordDetail = recordDetail
				
				resolve()
			}); // pool.query	
		})
	}
	
	function identicalNameInUSRN () { 
		return new Promise (function (resolve, reject) {
			pool.query('SELECT paon_text FROM node_schema.llpg_all_live_addresses WHERE usrn = $2 AND lower(paon_text) = $1', [q.newHouseName.toLowerCase(), recordDetail.usrn], function(err, results) {
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
	
	function identicalNameInPostcodeSector () { 
		return new Promise (function (resolve, reject) {
			pool.query('SELECT paon_text FROM node_schema.llpg_all_live_addresses WHERE postcode_sector = $2 AND lower(paon_text) = $1', [q.newHouseName.toLowerCase(), recordDetail.postcode_sector], function(err, results) {
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
	
	function identicalSoundingNameInUSRN () { 
		return new Promise (function (resolve, reject) {
			pool.query('SELECT paon_text, metaphone($1, 255) FROM node_schema.llpg_all_live_addresses WHERE usrn = $2 AND metaphone(paon_text, 255) = metaphone($1, 255)', [q.newHouseName, recordDetail.usrn], function(err, results) {
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
	
	function identicalSoundingNameInPostcodeSector () { 
		return new Promise (function (resolve, reject) {
			pool.query('SELECT paon_text, metaphone($1, 255) FROM node_schema.llpg_all_live_addresses WHERE postcode_sector = $2 AND metaphone(paon_text, 255) = metaphone($1, 255)', [q.newHouseName, recordDetail.postcode_sector], function(err, results) {
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
	
	function profanityCheck () { 
		return new Promise (function (resolve, reject) {
			pool.query('SELECT profanity FROM node_schema.profanity_list WHERE $1 ILIKE \'%\'||profanity||\'%\'', [q.newHouseName], function(err, results) {
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
		
	function checkSuffix () {
		return new Promise (function (resolve, reject) {
			Promise.all([
				apiFunctions.isLastWordReservedSuffix(q.newHouseName)
			]).then(function () {
				if (nameChecks.rule.suffix.isLastWordReservedSuffix === false) {
					nameChecks.rule.suffix.identicalNameDifferentSuffixInUSRN.pass = true
					nameChecks.rule.suffix.identicalNameDifferentSuffixInPostcodeSector.pass = true
					nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInUSRN.pass = true
					nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInPostcodeSector.pass = true
					resolve()
				// if isLastWordReservedSuffix = true
				} else if (nameChecks.rule.suffix.isLastWordReservedSuffix === true) {
					var beforeLastWord = q.newHouseName
					var lastIndex = beforeLastWord.lastIndexOf(" ")
					beforeLastWord = beforeLastWord.substring(0, lastIndex)
					
					Promise.all([
						apiFunctions.identicalNameDifferentSuffixInUSRN(beforeLastWord, recordDetail.usrn),
						apiFunctions.identicalNameDifferentSuffixInPostcodeSector(beforeLastWord, recordDetail.postcode_sector),
						apiFunctions.identicalSoundingNameDifferentSuffixInUSRN(beforeLastWord, recordDetail.usrn),
						apiFunctions.identicalSoundingNameDifferentSuffixInPostcodeSector(beforeLastWord, recordDetail.postcode_sector),
					]).then(function (results) {
						// logger.debug(results[0])
						resolve()
					})
				} 
			})
		})
	}
	
	Promise.all([
		getRecordDetail(),
	]).then(function () {
		Promise.all([
			profanityCheck(),
			identicalNameInUSRN(),
			identicalNameInPostcodeSector(),
			identicalSoundingNameInUSRN(),
			identicalSoundingNameInPostcodeSector(),
			checkSuffix(),
		]).then(function () {
			if (
				nameChecks.rule.profanityDetected === false
				&& nameChecks.rule.identicalNameInUSRN.pass === true
				&& nameChecks.rule.identicalNameInPostcodeSector.pass === true
				&& nameChecks.rule.identicalSoundingNameInUSRN.pass === true
				&& nameChecks.rule.identicalSoundingNameInPostcodeSector.pass === true
				&& nameChecks.rule.suffix.identicalNameDifferentSuffixInUSRN.pass === true
				&& nameChecks.rule.suffix.identicalNameDifferentSuffixInPostcodeSector.pass === true
				&& nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInUSRN.pass === true
				&& nameChecks.rule.suffix.identicalSoundingNameDifferentSuffixInPostcodeSector.pass === true
			) {
				nameChecks.summary.pass = true
			} else {
				nameChecks.summary.pass = false
			}
		}).then(function () {
			res.json({
				status: 'success',
				message: 'here is the data',
				nameChecks: nameChecks
			})
		});
	});
	
}); // app.get

module.exports = router;