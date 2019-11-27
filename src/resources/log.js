const fs = require('fs');
const {log_level} = require('../config');

//verify if folder /logs exists
const path = `${__dirname}/../logs`;
if(!fs.existsSync(path)){
    fs.mkdirSync(path)
}

const opts = {
	logDirectory: path,
    fileNamePattern:'<DATE>.log',
    dateFormat:'YYYY.MM.DD',
    timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
};

const log = require('simple-node-logger').createRollingFileLogger( opts );

log.setLevel(log_level);

module.exports = log;