var Promise = require("bluebird");
var moment = require('moment');
var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

moment.locale('es');

var schemaOptions = {
    toObject: {
      virtuals: true
    }
    ,toJSON: {
      virtuals: true
    }
};
fctSchema = new Schema( {
    tutor: {type: String, required: true},
    ciclo: {type: String, required: true},
    empresa: {type: String, required: true},
    dir_empresa: {type: String, required: true},
    instructor: {type: String, required: true},
    nif_instructor: {type: String, required: true},
    alumno: {type: String, required: true},
    nif_alumno: {type: String, required: true},
    grupo: {type: String, required: true},
    periodo: {type: String, required: true},
    fecha_inicio: {type: Date, required: true},
    fecha_fin: {type: Date, required: true},
    horas: { type: Number, min: 0, max: 1000, required: true },
    usuario: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    visitas: [{ type: Schema.Types.ObjectId, ref: 'visit' }]
}, schemaOptions);

// Función estática para mensajes prompt
fctSchema.statics.prompts = {};

var es_ES = {
    tutor: "Tutor de la FCT",
    ciclo: "Ciclo formativo",
    empresa: "Nombre de la empresa",
    dir_empresa: "Dirección de la empresa",
    instructor: "Nombre del instructor",
    nif_instructor: "NIF del instructor",
    alumno: "Nombre del alumno",
    nif_alumno: "NIF del alumno",
    grupo: "Curso y grupo de clase",
    periodo: "Año y período de la FCT",
    fecha_inicio: "Fecha de inicio de la FCT",
    fecha_fin: "Fecha de fin de la FCT",
    horas: "Duración en horas de la FCT"
};

// Propiedades virtuales
fctSchema.virtual('finicio_texto').get(function () {
    return moment(this.fecha_inicio).format("LL");
});

fctSchema.virtual('ffin_texto').get(function () {
    return moment(this.fecha_fin).format("LL");
});

// Devuelve la visita inicial. Requiere que 'visitas' esté populado
fctSchema.virtual('visita_ini').get(function () {
    if (this.visitas.length == 0) return null;
    return this.visitas.filter(function (v) {
	return v.tipo == "inicial";
    })[0];
});

// Devuelve la visita de seguimiento. Requiere que 'visitas' esté populado
fctSchema.virtual('visita_seg').get(function () {
    if (this.visitas.length == 0) return null;
    return this.visitas.filter(function (v) {
	return v.tipo == "seguimiento";
    })[0];
});

// Devuelve la visita final. Requiere que 'visitas' esté populado
fctSchema.virtual('visita_fin').get(function () {
    if (this.visitas.length == 0) return null;
    return this.visitas.filter(function (v) {
	return v.tipo == "final";
    })[0];
});

// Devuelve las visitas adicionales. Requiere que 'visitas' esté populado
fctSchema.virtual('visita_otra').get(function () {
    if (this.visitas.length == 0) return null;
    return this.visitas.filter(function (v) {
	return v.tipo == "otra";
    });
});

fctSchema.statics.prompts.es_ES =  es_ES;

// Función estática de transformación de datos en formato Collection + JSON
// Para usarla con el método toObject()

fctSchema.statics.tx_cj = function (doc, ret, options) {
    var item = {};
    //item.href = base + '/' + coll[i].name;
    item.href = "prueba";
    item.data = [];
    item.links = [];

    // Elimino campo _id, __v y usuario
    delete ret._id;
    delete ret.__v;
    delete ret.usuario;
    delete ret.visitas;

    for(var p in ret) {

        if(p==='visitas') {
	    for(var i in ret[p]) {
		
		item.links.push({
	 	    rel : 'alternate',
	 	    href : ret[p],
	 	    prompt : fctSchema.statics.prompts.es_ES[p]
		});
	    }
	    
        }
        else {
	    item.data.push({
                name : p,
                value : ret[p],
                prompt :  fctSchema.statics.prompts.es_ES[p]
	    });
        }
    }

    return item;

};

// Modelo
Fct = mongoose.model('fct', fctSchema);
Promise.promisifyAll(Fct);
Promise.promisifyAll(Fct.prototype);

module.exports = Fct;
