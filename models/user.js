var mongoose = require('mongoose')
      ,Schema = mongoose.Schema
      userSchema = new Schema( {
          name: String
      }),
User = mongoose.model('user', userSchema);

module.exports = User;
