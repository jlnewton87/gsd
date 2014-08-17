var redis = require('redis');

var client = {
	redisClient : redis.createClient(6379, "josh-redis.cloudapp.net", {}),

	getUsers : function(callback){
		this.redisClient.get('imappeeper:users', function(err, resp){
			callback(err, JSON.parse(resp));
		});
	},
	getLastSeen : function(userId, callback){
		this.redisClient.get('imappeeper:users:lastSeen:' + userId, function(err, resp){
			callback(err, JSON.parse(resp));
		});
	},
	setLastSeen : function(userId, lastSeen){
		this.redisClient.set('imappeeper:users:lastSeen:' + userId, lastSeen + 1);
	},
	addMessage : function(message, callback){
		this.redisClient.set('imappeeper:messages:' + message.message_id, JSON.stringify(message), function(err){
			callback(err);
		});
	}
}



module.exports = client;