// server.js
require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const winston = require('winston')

// require pg connection pool
const pool = require('./lib/db');

// create logger
const tsFormat = () => (new Date()).toLocaleTimeString()
winston.loggers.add('logger', {
	console: {
		level: 'silly',
		colorize: true,
		label: 'logger',
		timestamp: tsFormat,
	},
	file: {
		filename: './log/logger.log',
		level: 'debug',
	}
})
const logger = winston.loggers.get('logger')
logger.debug('starting application')

// set the view engine to ejs
app.set('view engine', 'ejs');

// set views folder
// app.set('views', path.join(__dirname, 'views/dist'));

// set static folder
app.use(process.env.iisnodeRoute + '/public', express.static(path.resolve('./public')))

// set body-parser
app.use(bodyParser.json()) // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: true})) // to support URL-encoded bodies

/* routers */
var routerIndex = require('./routes/index');
var routerApi = require('./routes/api');

/* set routes */
app.use(process.env.iisnodeRoute + '/', routerIndex);
app.use(process.env.iisnodeRoute + '/api', routerApi);

// c9
app.listen(process.env.PORT, process.env.IP);

// GBC
// app.listen(process.env.PORT);