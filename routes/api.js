const express = require('express');
const request = require('request');
const router = express.Router();
const bodyParser = require('body-parser')
const twilio = require('twilio');
const Promise = require('bluebird');
const winston = require('winston')

const pool = require('../lib/db');
const logger = winston.loggers.get('logger')

router.get('/', function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ api_message: "api is here" }, null, 2));
});

// https://house-name-change-rjspiers.c9users.io/searchApi/postcode?postcode=gu13au
router.get('/postcode', function(req, res, next) {
    var postcode = req.query.postcode;
    request('https://address.digitalservices.surreyi.gov.uk/addresses?postcode=' + postcode, 
        {'auth': {'bearer': process.env.bearerToken}}, function (err, response, body) {
        if (err || response.statusCode !== 200) {
            res.status(response.statusCode).send(JSON.parse(body)); // example 422 = {"error":"postcode is invalid"}
        } else if (response.statusCode === 200) {
            res.send(JSON.parse(body));
        } else {
            var message = '{"error":"internal server error"}'
            res.status(500).send(JSON.parse(message));
        }
    });
});

// https://house-name-change-rjspiers.c9users.io/searchApi/postcodeStatic
router.get('/postcodeStatic', function(req, res, next) {
    var postcode = 'gu13au';
    request('https://address.digitalservices.surreyi.gov.uk/addresses?postcode=' + postcode, 
        {'auth': {'bearer': process.env.bearerToken}}, function (err, response, body) {
        if (err || response.statusCode !== 200) {
            res.status(response.statusCode).send(JSON.parse(body)); // example 422 = {"error":"postcode is invalid"}
        } else if (response.statusCode === 200) {
            res.send(JSON.parse(body));
        } else {
            var message = '{"error":"internal server error"}'
            res.status(500).send(JSON.parse(message));
        }
    });
});

// https://house-name-change-rjspiers.c9users.io/searchApi/uprn?uprn=10007099272
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

router.get('/nameCheck', function(req, res) {
	logger.info(req.query.uprn + ',' + req.query.newHouseName)
	// q.uprn & q.newHouseName
	var q = req.query
	
	nameChecks = {}
	nameChecks.profanityDetected = null
	nameChecks.identicalNameInUSRN = {}
	nameChecks.identicalNameInPostcodeSector = {}
	nameChecks.similarNameInUSRN = {}
	nameChecks.similarNameInPostcodeSector = {}
	nameChecks.recordDetail = {}
	
	recordDetail = {}
	recordDetail.uprn = {}
	
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
				nameChecks.identicalNameInUSRN = ar
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
				nameChecks.identicalNameInPostcodeSector = ar
				resolve()
			}); // pool.query	
		})
	}
	
	function similarNameInUSRN () { 
		return new Promise (function (resolve, reject) {
			pool.query('SELECT paon_text, metaphone($1, 255) FROM node_schema.llpg_all_live_addresses WHERE usrn = $2 AND metaphone(paon_text, 255) = metaphone($1, 255)', [q.newHouseName, recordDetail.usrn], function(err, results) {
				if (err) {
					return console.error('error running query', err);
				}
				var ar = []
				results.rows.forEach(function(row) { 
					ar.push(row.paon_text)
				})
				nameChecks.similarNameInUSRN = ar
				resolve()
			}); // pool.query	
		})
	}
	
	function similarNameInPostcodeSector () { 
		return new Promise (function (resolve, reject) {
			pool.query('SELECT paon_text, metaphone($1, 255) FROM node_schema.llpg_all_live_addresses WHERE postcode_sector = $2 AND metaphone(paon_text, 255) = metaphone($1, 255)', [q.newHouseName, recordDetail.postcode_sector], function(err, results) {
				if (err) {
					return console.error('error running query', err);
				}
				var ar = []
				results.rows.forEach(function(row) { 
					ar.push(row.paon_text)
				})
				nameChecks.similarNameInPostcodeSector = ar
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
				if (results.rows.length > 0) {
					nameChecks.profanityDetected = true
					resolve()
				} else {
					nameChecks.profanityDetected = false
					resolve()
				}
			}); // pool.query	
		})
	}
	
	Promise.all([
		getRecordDetail(),
	])
	.then(function () {
		Promise.all([
			profanityCheck(),
			identicalNameInUSRN(),
			identicalNameInPostcodeSector(),
			similarNameInUSRN(),
			similarNameInPostcodeSector()
		])
		.then(function () {
				res.json({
					status: 'success',
					message: 'here is the data',
					nameChecks: nameChecks
				})
			}
		);
	});
	
}); // app.get

module.exports = router;