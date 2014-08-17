var ContextIO = require('contextio');
var ctxioClient = new ContextIO.Client({
	key: "x4h1wk9g",
    secret: "J4axGPTL0lyhjk0z"
});

var client = {
	getNewMessages:function(id, callback){
		ctxioClient.accounts(id).messages().get({}, function(err, resp){
			callback(err, resp)
		});
	},
	getUnixTimestamp:function(dateObject){
		if (typeof dateObject.getSeconds() === 'number') {
			return Math.round((dateObject).getTime() / 1000);
		}
		else{
			return null;
		}
	}
};

module.exports = client;