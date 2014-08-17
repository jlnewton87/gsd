//load user records
//on interval - check for new mail
	//if new mail - broadcast message
	//else - rest
var async = require('async');
var client = require('./redisClient');
var emailApi = require('./contextIOClient');

client.redisClient.on("error", function (err) {
    console.log("Error: " + err);
});

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
					client.setLastSeen(user.Id, resp.body[0].date);
				}
				callback();
			});
		}, function(err){
			if(err){console.log('Error getting new messages -> ' + err);}
			else{
				console.log(newMessages);
			}
		});
	}
});
