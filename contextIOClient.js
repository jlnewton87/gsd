var redisClient = require('./redisClient');
var ContextIO = require('contextio');
var ctxioClient = new ContextIO.Client({
	key: "x4h1wk9g",
    secret: "J4axGPTL0lyhjk0z"
});

var client = {
	getNewMessages : function(id, callback){
		redisClient.getLastSeen(id, function(err, lastSeen){
			ctxioClient.accounts(id).messages().get({date_after:lastSeen}, function(err, resp){
				callback(err, resp)
			});
		});
	},
	syncAccount : function(id){
		ctxioClient.accounts(id).sync().get();
	}
};

module.exports = client;