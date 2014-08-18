var async = require('async');
var extras = require('./extras');
var persistence = require('./persistence');
var emailApi = require('./contextIOClient');

var newMessages = [];

extras.initialize();

execute();

setInterval(function(){
	newMessages = [];
	execute();
}, 60000);


function execute(){
	persistence.getUsers(function(err, result){
		if(err){console.log(err);}
		else{
			async.each(result, function(user, callback){
				//get new messages for each user
				emailApi.getNewMessages(user.Id, function(err, resp){
					for (var i = 0; i < resp.body.length; i++) {
						var newMessage = resp.body[i];
						newMessage.userId = user.Id;
						newMessages.push(newMessage);
					};
					if (resp.body.length > 0) {
						persistence.setLastSeen(user.Id, resp.body[0].date);
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
						persistence.addMessage(message, function(err){
							if(err) {console.log(err);}
							else{
								console.log('Message: ' + message.message_id + ' has been processed');
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