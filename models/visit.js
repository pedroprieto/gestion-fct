// Mongoose con Bluebird (promises)
// https://github.com/jeduan/express4-mongoose-bluebird/blob/master/models.js

var Promise = require("bluebird");
var moment = require('moment');
var mongoose = require('mongoose')
,Schema = mongoose.Schema;
var tipos = 'inicial seguimiento final otra'.split(' ');

var schemaOptions = {
    toObject: {
      virtuals: true
    }
    ,toJSON: {
      virtuals: true
    }
};

var visitSchema = new Schema( {
    empresa: {type: String, required: true},
    tipo: {type: String, enum: tipos, required: true },
    distancia: {type: Number, required: true},
    fecha: {type: Date, required: true},
    semana: Number,
    anyo: Number,
    hora_salida: {type: String, match: /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, required: true},
    hora_regreso: {type: String, match: /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, required: true},
    localidad: {type: String,required: true},
    impresion: {type: String, required: true},
    presencial: { type: Boolean, default: true },
    _fct : { type: Schema.Types.ObjectId, ref: 'Fct' },
    _usuario: { type: Schema.Types.ObjectId, ref: 'User' }
}, schemaOptions);

// Propiedades virtuales
visitSchema.virtual('fecha_texto').get(function () {
    return moment(this.fecha).format("LL");
});

// Middleware para añadir semana y año en formato ISO 8601
visitSchema.pre('save', function (next) {
    var m = moment(this.fecha);
    this.semana = m.isoWeek();
    this.anyo = m.isoWeekYear();
    return next();
});

// Middleware para impedir que se guarden dos visitas con tipo distinto de 'otra'
visitSchema.pre('save', function (next) {
    var tipo = this.tipo;

    // Si la visita es del tipo 'otra', se pueden crear varias
    // Si la visita no es nueva (estamos haciendo una actualización), no hay que comprobar nada
    if ((tipo === 'otra') || (!this.isNew)) return next();

    this.constructor.find({_fct: this._fct, _usuario: this._usuario, tipo: tipo}, function (err, docs) {
	if (err) next(err);
	
        if (!docs.length){
            return next();
        } else {
	    var e = new Error('Ya hay una visita de tipo: ' + tipo);
	    return next(e);
        }
    });

});



// Función estática para mensajes prompt
visitSchema.statics.prompts = {};

var es_ES = {
    empresa: "Nombre de la empresa",
    tipo: "Tipo de la visita",
    distancia: "Distancia a la empresa en KM",
    fecha: "Fecha de la visita",
    hora_salida: "Hora de salida",
    hora_regreso: "Hora de regreso",
    localidad: "Localidad",
    presencial: "Presencial",
    impresion: "Impresión general de la visita"
};

visitSchema.statics.prompts.es_ES =  es_ES;

// Función estática de transformación de datos en formato Collection + JSON
// Para usarla con el método toObject()

visitSchema.statics.tx_cj = function (doc, ret, options) {
    item = {};
    //item.href = base + '/' + coll[i].name;
    item.href = "";
    item.data = [];
    item.links = [];

    // Elimino campos
    delete ret._id;
    delete ret.__v;
    delete ret.anyo;
    delete ret.semana;
    delete ret._fct;
    delete ret._usuario;

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
visitSchema.statics.visit_template = function (localidad, tipo, related, distancia) {
    var template = {};
    
    template.data = [];

    for (p in this.schema.paths) {
	var v = '';
	if (p.substring(0,1) != '_') {

	    if (p === 'localidad') {
		if (typeof localidad !== undefined) v = localidad;
	    }
	    if (p === 'tipo') {
		if (typeof tipo !== undefined) v = tipo;
	    }
	    if (p === 'distancia') {
		if (typeof distancia !== undefined) v = distancia;
	    }
	    if (p === 'presencial') {
		v='true';
		if (typeof tipo !== undefined) {
		    if (tipo === 'otra') {
			v='false';
		    }
		}
	    }
	    if (p==='anyo' || p==='semana' || p==='empresa') continue;
	    
	    template.data.push({
		name : p,
		value: v,
		prompt :  visitSchema.statics.prompts.es_ES[p]
	    });
	}
    }

    // Añadimos FCTs relacionadas en el campo 'related' de la plantilla
    if (typeof related !== undefined) {
	template.data.push({
	    name : 'related',
	    value : related,
	    prompt : 'Crear una visita igual en las siguientes FCTs'
	});
    }

    return template;
}

// Función estática para generar FM34
visitSchema.statics.genfm34 = function (userid, cb) {
    return this.aggregate(
	{
	    $match: {
		_usuario: userid,
		presencial: true
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
	// Ordenación de resultados
	{ "$sort": {
	    '_id.year': 1, 
            '_id.month': 1, 
            '_id.dayOfMonth': 1
	} },
	{
	    $group: {
		_id: {semana: '$semana', anyo: '$anyo'},
		visits: { $push: '$$ROOT'}
	    }

	},
	// Ordenación de resultados
	{ "$sort": {
	    '_id.anyo': 1, 
            '_id.semana': 1
	} },
	cb);
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
