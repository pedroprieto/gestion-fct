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
visitSchema.statics.tx_cj = function (items) {

    // TODO: mirar si se puede hacer con el método transform de toObject
    // ASí podemos convertir cualquier documento a Collection JS independientemente
    // Mirar cómo convertir un objeto query de Mongoose a un array de docs

    var item,p;

    return items.map(function(visit) {

	visit = visit.toObject();
	item = {};
	//item.href = base + '/' + coll[i].name;
	item.href = "prueba";
	item.data = [];
	item.links = [];

	for(p in visit) {

            if(p==='blog') {
	 	item.links.push({
	 	    'rel' : 'alternate',
	 	    'href' : visit[p],
	 	    'prompt' : visitSchema.statics.prompts["es_ES"][p]
	 	});
            }
            else {
	 	item.data.push({
                    'name' : p,
                    'value' : visit[p],
                    'prompt' :  visitSchema.statics.prompts["es_ES"][p]
	 	});
            }
	}

	return item;

    });

};

// Modelo
Visit = mongoose.model('visit', visitSchema);

module.exports = Visit;
