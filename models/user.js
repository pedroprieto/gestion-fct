var Promise = require("bluebird");
var mongoose = require('mongoose')
,Schema = mongoose.Schema
userSchema = new Schema( {
    username: String,
    password: String
}),


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
