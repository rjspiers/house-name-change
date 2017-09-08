const express = require('express');
const request = require('request');
const router = express.Router();
// const bodyParser = require('body-parser')
// const twilio = require('twilio');
const Promise = require('bluebird');
const winston = require('winston');

// require('../lib/tools.js')();
const tools = require('../lib/tools')

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
			res.status(500).json({"error":"internal server error", "err":err, "error-stack":err.stack})
			return console.error('error running query:', err);
		}
		res.json({
			status: 'success',
			testDbConn: results.rows
		})
	}) // pool.query
})

// /api/uprn?uprn=10007099272
router.get('/uprn', function(req, res, next) {
	var uprn = req.query.uprn;
	request('https://address.digitalservices.surreyi.gov.uk/addresses?format=all&uprn=' + uprn,
		{'auth': {'bearer': process.env.bearerToken}}, function (err, response, body) {
		if (err) {
			res.status(500).json({"error":"internal server error", "err":err, "error-stack":err.stack})
			console.error('error:', err);
		}
		else if (response.statusCode !== 200) {
			res.status(response.statusCode).json(JSON.parse(body));
		}
		else if (response.statusCode === 200) {
			res.json(JSON.parse(body));
		}
		else {
			res.status(500).json({"error":"internal server error"});
		}
	});
});

// /api/postcode?postcode=gu13au
router.get('/postcode', function(req, res, next) {
	var postcode = req.query.postcode;
	request('https://address.digitalservices.surreyi.gov.uk/addresses?postcode=' + postcode, {'auth': {'bearer': process.env.bearerToken}}, function (err, response, body) {
		if (err) {
			res.status(500).json({"error":"internal server error", "err":err, "error-stack":err.stack})
			console.error('error:', err);
		}
		else if (response.statusCode !== 200) {
			res.status(response.statusCode).json(JSON.parse(body)); // example 422 = {"error":"postcode is invalid"}
		}
		else if (response.statusCode === 200) {
			var jsonArray = JSON.parse(response.body)
			var filteredJsonArray = jsonArray.filter(function(obj) {
				return (obj.gssCode === 'E07000209')
			})
			if (filteredJsonArray.length > 0) {
				res.json(filteredJsonArray);
			}
			else if (filteredJsonArray.length === 0) {
				res.status(422).json({"error":"no Guildford Borough addresses in this postcode"})
			}
		}
		else {
			res.status(500).json({"error":"internal server error"});
		}
	});
});

// /api/postcodeStatic
router.get('/postcodeStatic', function(req, res, next) {
	var postcode = 'gu13au';
	request('https://address.digitalservices.surreyi.gov.uk/addresses?postcode=' + postcode, {'auth': {'bearer': process.env.bearerToken}}, function (err, response, body) {
		if (err) {
			res.status(500).json({"error":"internal server error", "err":err, "error-stack":err.stack})
			console.error('error:', err);
		}
		else if (response.statusCode !== 200) {
			res.status(response.statusCode).json(JSON.parse(body)); // example 422 = {"error":"postcode is invalid"}
		}
		else if (response.statusCode === 200) {
			res.json(JSON.parse(body));
		}
		else {
			res.status(500).json({"error":"internal server error"});
		}
	});
});

router.get('/isNumeric', function(req, res) {
	tools.isNumeric(req.query.v)
	.then(function (result) {
		logger.debug(result)
		if (result === false) {
			return res.status(422).json({"isNumeric":result})
		}
		else if (result === true) {
			return res.status(200).json({"isNumeric":result})
		}
	})
})

router.get('/isAlphaOrSpace', function(req, res) {
	tools.isAlphaOrSpace(req.query.v)
	.then(function (result) {
		logger.debug(result)
		if (result === false) {
			return res.status(422).json({"isAlphaOrSpace":result})
		}
		else if (result === true) {
			return res.status(200).json({"isAlphaOrSpace":result})
		}
	})
})

// /api/nameCheck?newHouseName=Beechanger&uprn=10007060106
router.get('/nameCheck', function(req, res) {
	logger.info(req.query.uprn + ',' + req.query.newHouseName)
	// q.uprn & q.newHouseName
	var q = req.query

	/* response body json */
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
	nameChecks.rule.isAlphaOrSpace = false
	nameChecks.rule.max255Chars = false

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

	// promise.then(onFullfilled, onRejected)
	apiFunctions.max255Chars(q.newHouseName).then(
		// onFullfilled - apiFunctions.max255Chars(q.newHouseName)
		function () {
		// promise.then(onFullfilled, onRejected)
		apiFunctions.getRecordDetail(q.uprn)
		.then(
			// onFullfilled - apiFunctions.getRecordDetail(q.uprn)
			function () {
				Promise.all([
					apiFunctions.profanityCheck(q.newHouseName),
					apiFunctions.identicalNameInUSRN(q.newHouseName, recordDetail.usrn),
					apiFunctions.identicalNameInPostcodeSector(q.newHouseName, recordDetail.postcode_sector),
					apiFunctions.identicalSoundingNameInUSRN(q.newHouseName, recordDetail.usrn),
					apiFunctions.identicalSoundingNameInPostcodeSector(q.newHouseName, recordDetail.postcode_sector),
					apiFunctions.checkSuffix(q.newHouseName),
					apiFunctions.isAlphaOrSpace(q.newHouseName),
					apiFunctions.max255Chars(q.newHouseName),
				])
				.then(function () {
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
						&& nameChecks.rule.isAlphaOrSpace === true
						&& nameChecks.rule.max255Chars === true
					) {
						nameChecks.summary.pass = true
					}
					else {
						nameChecks.summary.pass = false
					}
				})
				// TODO: move this .catch to the end of the promise
				.catch(function () {
					res.status(500).json({"error":"Internal server error"})
				})
				.then(function () {
					res.json({
						status: 'success',
						message: 'here is the data',
						nameChecks: nameChecks
					})
				});
			},
			// onRejected - apiFunctions.getRecordDetail(q.uprn)
			function ({status, error}) {
				// this can be 422 or 500
				res.status(status).json({"error":error})
			}
		)
		},
		// onRejected - apiFunctions.max255Chars(q.newHouseName)
		function () {
			res.status(422).json({"error":"New house name must be less than 256 characters"})
		}
	);

}); // router.get

module.exports = router;