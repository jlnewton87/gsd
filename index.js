//load user records
//on interval - check for new mail
	//if new mail - broadcast message
	//else - rest
var async = require('async');
var extras = require('./extras');
var client = require('./redisClient');
var notifier = require('./notifier');
var emailApi = require('./contextIOClient');
client.redisClient.on("error", function (err) {
    console.log("Error: " + err);
});

extras.initialize();

execute();

setInterval(function(){
	execute();
}, 60000);

function execute(){
	client.getUsers(function(err, result){
		if(err){console.log(err);}
		else{
			var newMessages = [];
			async.each(result, function(user, callback){
				emailApi.getNewMessages(user.Id, function(err, resp){
					for (var i = 0; i < resp.body.length; i++) {
						var newMessage = resp.body[i];
						newMessage.userId = user.Id;
						newMessages.push(newMessage);
					};
					if (resp.body.length > 0) {
						client.setLastSeen(user.Id, resp.body[resp.body.length - 1].date);
					}
					callback();
					emailApi.syncAccount(user.Id);
				});
			}, function(err){
				if(err){console.log('Error getting new messages -> ' + err);}
				else{
					async.each(newMessages, function(message, callback){
						client.addMessage(message, function(err){
							if(err) {console.log(err);}
							else{
								var payload = {
									Event : 'newMessage',
									Id:message.message_id
								}
								notifier.notify(payload);
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