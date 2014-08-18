var mongoose = require('mongoose');
mongoose.connect('mongodb://josh-redis.cloudapp.net:27017/mail');

var model = {
    User: mongoose.model('User', {
        Id: String,
        Name: String,
        Email: String,
        LastSeen: String
    }),
    Message: mongoose.model('Message', {
        Id: String,
        message: String
    })
}

module.exports = model;