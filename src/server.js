//=====================================
// Dependencies
//=====================================
const {port, connection_string} = require('./config')
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const log = require('./resources/log');

try {

	//=====================================
	// Express global config
	//=====================================
	app.use(bodyParser.urlencoded({ extended: false }));

	//parse application/json
	app.use(bodyParser.json());

	//Use routes
	app.use(require('./routes'));


	//=====================================
	// Mongoose connection
	//=====================================
	mongoose.connect(connection_string, { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true, useUnifiedTopology: true}, (err, res) => {
		if (err) {
			log.error(`Error connection DB`, err);
			throw err;
		};
		console.log('BASE DE DATOS ONLINE');
	});


	//=====================================
	// Start Server Express
	//=====================================
	app.listen(port, () => console.log(`Escuchando el puerto: ${port}`));


} catch (error) {
	//Error in main process
	log.error(`Server error in main process`, error);
	console.log(error);
}