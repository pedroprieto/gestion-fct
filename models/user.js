var Promise = require("bluebird");
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var mongoose = require('mongoose')
,Schema = mongoose.Schema
userSchema = new Schema( {
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true }
});

// Hash password
userSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    //if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            return next();
        });
    });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        return cb(null, isMatch);
    });
};




// Función estática para mensajes prompt
userSchema.statics.prompts = {};

var es_ES = {
    username: "Nombre de usuario",
    password: "Contraseña de usuario"
};

userSchema.statics.prompts.es_ES =  es_ES;

// Función estática de transformación de datos en formato Collection + JSON
// Para usarla con el método toObject()

userSchema.statics.tx_cj = function (doc, ret, options) {
    item = {};
    //item.href = base + '/' + coll[i].name;
    item.href = "prueba";
    item.data = [];
    item.links = [];

    // Elimino campo _id y __v
    delete ret._id;
    delete ret.__v;

    for(var p in ret) {

        if(p==='blog') {
	    item.links.push({
	 	rel : 'alternate',
	 	href : ret[p],
	 	prompt : userSchema.statics.prompts.es_ES[p]
	    });
        }
        else {
	    item.data.push({
                name : p,
                value : ret[p],
                prompt :  userSchema.statics.prompts.es_ES[p]
	    });
        }
    }

    return item;

};

User = mongoose.model('user', userSchema);

Promise.promisifyAll(User);
Promise.promisifyAll(User.prototype);

module.exports = User;
