var Promise = require("bluebird");
var mongoose = require('mongoose')
,Schema = mongoose.Schema
fm34Schema = new Schema( {
    semanaDe: Date,
    semanaAl: Date,
    visitas: [{ type: Schema.Types.ObjectId, ref: 'visit' }]
});

// Función estática para mensajes prompt
fm34Schema.statics.prompts = {};

var es_ES = {
    semanaDe: "Semana de",
    semanaAl: "Semana al"
};

fm34Schema.statics.prompts.es_ES =  es_ES;

// Función estática de transformación de datos en formato Collection + JSON
// Para usarla con el método toObject()

fm34Schema.statics.tx_cj = function (doc, ret, options) {
    var item = {};
    //item.href = base + '/' + coll[i].name;
    item.href = "prueba";
    item.data = [];
    item.links = [];

    // Elimino campo _id y __v
    delete ret._id;
    delete ret.__v;
    delete ret.visitas;

    for(var p in ret) {

        if(p==='blog') {
	    item.links.push({
	 	rel : 'alternate',
	 	href : ret[p],
	 	prompt : fm34Schema.statics.prompts.es_ES[p]
	    });
        }
        else {
	    item.data.push({
                name : p,
                value : ret[p],
                prompt :  fm34Schema.statics.prompts.es_ES[p]
	    });
        }
    }

    return item;

};


Fm34 = mongoose.model('fm34', fm34Schema);
Promise.promisifyAll(Fm34);
Promise.promisifyAll(Fm34.prototype);

module.exports = Fm34;
