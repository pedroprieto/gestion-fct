var mongoose = require('mongoose')
,Schema = mongoose.Schema
visitSchema = new Schema( {
    empresa: String,
    tipo: String,
    distancia: String,
    fecha: Date,
    hora_salida: String,
    hora_regreso: String,
    localidad: String,
    impresion: String,
    _fct : [{ type: Number, ref: 'Fct' }]
});



// Función estática para mensajes prompt
visitSchema.statics.prompts = {};

var es_ES = {
    empresa: "Nombre de la empresa",
    tipo: "Tipo de la empresa",
    distancia: "Distancia a la empresa en KM",
    fecha: "Fecha de la visita",
    hora_salida: "Hora de salida prueba",
    hora_regreso: "Hora de regreso",
    localidad: "Localidad",
    impresion: "Impresión general de la visita"
};

visitSchema.statics.prompts["es_ES"] =  es_ES;

// Función estática de transformación de datos en formato Collection + JSON
// Para usarla con el método toObject()

visitSchema.statics.tx_cj = function (doc, ret, options) {
    item = {};
    //item.href = base + '/' + coll[i].name;
    item.href = "prueba";
    item.data = [];
    item.links = [];

    // Elimino campo _id y __v
    delete ret._id;
    delete ret.__v;

    for(p in ret) {

        if(p==='blog') {
	    item.links.push({
	 	'rel' : 'alternate',
	 	'href' : ret[p],
	 	'prompt' : visitSchema.statics.prompts["es_ES"][p]
	    });
        }
        else {
	    item.data.push({
                'name' : p,
                'value' : ret[p],
                'prompt' :  visitSchema.statics.prompts["es_ES"][p]
	    });
        }
    }

    return item;

}

// Modelo
Visit = mongoose.model('visit', visitSchema);
module.exports = Visit;
