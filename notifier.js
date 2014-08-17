var notices = require('notices')({
	"host":"josh-redis.cloudapp.net"
});

var obj = {};
notices.notify(obj);

module.exports = {
	notify : function(payload){
		obj.notifyPublish('imappeeper:newMessages', payload);
	}
}