var async = require('async');
var extras = require('./extras');
var redis = require('./redisClient');
var notices = require('notices')({
	"host":"josh-redis.cloudapp.net"
});
var notifier = {};
notices.notify(notifier);
var emailApi = require('./contextIOClient');
redis.redisClient.on("error", function (err) {
    console.log("Error: " + err);
});

extras.initialize();

execute();

setInterval(function(){
	execute();
}, 60000);

function execute(){
	redis.getUsers(function(err, result){
		if(err){console.log(err);}
		else{
			var newMessages = [];
			async.each(result, function(user, callback){
				//get new messages for each user
				emailApi.getNewMessages(user.Id, function(err, resp){
					for (var i = 0; i < resp.body.length; i++) {
						var newMessage = resp.body[i];
						newMessage.userId = user.Id;
						newMessages.push(newMessage);
					};
					if (resp.body.length > 0) {
						redis.setLastSeen(user.Id, resp.body[resp.body.length - 1].date);
					}
					callback();
					//sync this account, so new messages can be picked up next time
					emailApi.syncAccount(user.Id);
				});
			}, function(err){
				if(err){console.log('Error getting new messages -> ' + err);}
				else{
					async.each(newMessages, function(message, callback){
						//save each message
						redis.addMessage(message, function(err){
							if(err) {console.log(err);}
							else{
								var payload = {
									Event : 'newMessage',
									Id:message.message_id
								}
								//publish each message to Redis channel
								notifier.notifyPublish('imappeeper:newMessage', payload);
							}
						});
					});
					console.log(newMessages.length + ' new messages found');
				}
			});
		}
	});
	extras.endSession();
}