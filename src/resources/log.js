const opts = {
	logDirectory:`${__dirname}/../logs`,
    fileNamePattern:'<DATE>.log',
    dateFormat:'YYYY.MM.DD',
    timestampFormat:'YYYY-MM-DD HH:mm:ss.SSS'
};
module.exports = require('simple-node-logger').createRollingFileLogger( opts );