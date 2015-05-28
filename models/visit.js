// Mongoose con Bluebird (promises)
// https://github.com/jeduan/express4-mongoose-bluebird/blob/master/models.js

var Promise = require("bluebird");
var moment = require('moment');
var mongoose = require('mongoose')
,Schema = mongoose.Schema;
var tipos = 'inicial seguimiento final otra'.split(' ');
var visitSchema = new Schema( {
    empresa: String,
    tipo: {type: String, enum: tipos },
    distancia: String,
    fecha: Date,
    semana: Number,
    anyo: Number,
    hora_salida: String,
    hora_regreso: String,
    localidad: String,
    impresion: String,
    _fct : { type: Schema.Types.ObjectId, ref: 'Fct' },
    _usuario: { type: Schema.Types.ObjectId, ref: 'User' }
});

// Middleware para añadir semana y año en formato ISO 8601
visitSchema.pre('save', function (next) {
    var m = moment(this.fecha);
    this.semana = m.isoWeek();
    this.anyo = m.isoWeekYear();
    next();
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

visitSchema.statics.prompts.es_ES =  es_ES;

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

    for(var p in ret) {

        if(p==='blog') {
	    item.links.push({
	 	rel : 'alternate',
	 	href : ret[p],
	 	prompt : visitSchema.statics.prompts.es_ES[p]
	    });
        }
        else {
	    item.data.push({
                name : p,
                value : ret[p],
                prompt :  visitSchema.statics.prompts.es_ES[p]
	    });
        }
    }

    return item;

};

// Función estática para generar template
visitSchema.statics.visit_template = function () {
    var template = {};
    
    template.data = [];

    for (p in this.schema.paths) {
	if (p.substring(0,1) != '_') {
	    
	template.data.push({
	    name : p,
	    value: '',
	    prompt :  visitSchema.statics.prompts.es_ES[p]
	});
	    console.log(p);
	}
    }

    
//    template.data.push(
    return template;
}

// Función estática para generar FM34
visitSchema.statics.genfm34 = function (userid, cb) {
    return this.aggregate(
	{
	    $match: {
		_usuario: userid
	    }
	},
	{
	    $group: {
		_id: {
		    year: { $year: '$fecha'},
		    month: { $month: '$fecha'},
		    dayOfMonth: { $dayOfMonth: '$fecha'},
		    hora_salida: '$hora_salida',
		    hora_regreso: '$hora_regreso'
		},	    
		empresa: { $first: "$empresa" },
		tipo: { $addToSet: "$tipo" }, // Para eliminar duplicados
		distancia: { $first: "$distancia" },
		fecha: { $first: "$fecha" },
		hora_salida: { $first: "$hora_salida" },
		hora_regreso: { $first: "$hora_regreso" },
		localidad: { $first: "$localidad" },
		semana: { $first: "$semana"},
		anyo: { $first: "$anyo"}
	    }

	},
	{
	    $group: {
		_id: {semana: '$semana', anyo: '$anyo'},
		visits: { $push: '$$ROOT'}
	    }

	}, cb);
};

// Función estática para generar un FM34 devuelto por la función anterior en formato Collection + JS
visitSchema.statics.genfm34_cj = function (fm34) {

  
    var item = {};
    //item.href = base + '/' + coll[i].name;
    item.href = "prueba";
    item.data = [];
    item.links = [];

    var isoweek = moment(fm34._id.anyo + "-W" + fm34._id.semana, moment.ISO_8601);

    var princ = isoweek.startOf('isoWeek').format("DD/MM/YYYY");
    var fin = isoweek.endOf('isoWeek').format("DD/MM/YYYY");

    item.data.push({
	name: 'semanaDe',
	value: princ,
	prompt: 'Semana de:'
    });

    item.data.push({
	name: 'semanaAl',
	value: fin,
	prompt: 'Semana al:'
    });

    // TODO: en realidad no son enlaces a recursos, sino al resumen (agrupadas visitas con misma fecha y hora
    // Falta aclarar cómo hacerlo

    for(var p in fm34.visits) {
	item.links.push({
	    rel : 'visit item',
	    href : p._id,
	    prompt : 'Visita'
	});
    };		

    return item;
    
};

// Modelo
var Visit = mongoose.model('visit', visitSchema);
Promise.promisifyAll(Visit);
Promise.promisifyAll(Visit.prototype);

module.exports = Visit;
