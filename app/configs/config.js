var prodConfig = require('./config.prod.json');
var devConfig = require('./config.dev.json');

if(process.env.NODE_ENV && process.env.NODE_ENV == "production") {
	var config = prodConfig;
} else {
	console.log('Loading Dev Config');
	var config = devConfig;
	// config.discord = prodConfig.discord;
}

module.exports = config;