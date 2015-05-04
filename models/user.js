var Promise = require("bluebird");
var mongoose = require('mongoose')
,Schema = mongoose.Schema
userSchema = new Schema( {
    username: String,
    password: String
}),


User = mongoose.model('user', userSchema);

Promise.promisifyAll(User);
Promise.promisifyAll(User.prototype);

module.exports = User;
