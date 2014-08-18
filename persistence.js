var async = require('async');
var model = require('./model');
var notices = require('notices')();
var notifier = {};
notices.notify(notifier);

var client = {

	getUsers : function(callback){
		model.User.find({}, function(err, users){
			callback(err, users);
		});
	},
	getLastSeen : function(userId, callback){
		model.User.findOne({ Id: userId }, function(err, user){
			callback(err, user.LastSeen);
		});
	},
	setLastSeen : function(userId, lastSeen){
		model.User.findOne({ Id: userId }, function(err, user){
			user.LastSeen = JSON.stringify(parseInt(lastSeen) + 1);
			user.save();
		});
	},
	addMessage : function(message, callback){
		var messageToSave = new model.Message({ Id: message.message_id, message:JSON.stringify(message) });
		messageToSave.save(function (err) {
		  if (err) {console.log(err)}
		  	publishEvent(message);
		});
	}
}

function publishEvent(message){
	notifier.notifyPublish('imappeeper:newMessage', { Id:message.message_id });
}



module.exports = client;