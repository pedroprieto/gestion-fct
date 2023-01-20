var Promise = require("bluebird");
var moment = require('moment');
var cps = require('../aux/cursoperiodofct');
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
    localidad: {type: String, required: true},
    instructor: {type: String, required: true},
    nif_instructor: {type: String, required: true},
    alumno: {type: String, required: true},
    nif_alumno: {type: String, required: true},
    grupo: {type: String, required: true},
    curso: {type: String, required: true},
    periodo: {type: Number, required: true},
    fecha_inicio: {type: Date, required: true},
    fecha_fin: {type: Date, required: true},
    horas: { type: Number, min: 0, max: 1000, required: true },
    distancia: {type: Number},
    usuario: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    visitas: [{ type: Schema.Types.ObjectId, ref: 'visit' }]
}, schemaOptions);

// Función estática para mensajes prompt
fctSchema.statics.prompts = {};

var es_ES = {
    tutor: "Tutor",
    ciclo: "Ciclo",
    empresa: "Empresa",
    dir_empresa: "Dirección",
    localidad: "Localidad",
    distancia: "Distancia",
    instructor: "Instructor",
    nif_instructor: "NIF instructor",
    alumno: "Alumno",
    nif_alumno: "NIF alumno",
    grupo: "Curso y grupo",
    periodo: "Año y período",
    fecha_inicio: "Inicio",
    fecha_fin: "Fin",
    horas: "Horas"
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
    if (this.visitas == null) return null;
    if (this.visitas.length == 0) return null;
    return this.visitas.filter(function (v) {
	return v.tipo == "inicial";
    })[0];
});

// Devuelve la visita de seguimiento. Requiere que 'visitas' esté populado
fctSchema.virtual('visita_seg').get(function () {
    if (this.visitas == null) return null;
    if (this.visitas.length == 0) return null;
    return this.visitas.filter(function (v) {
	return v.tipo == "seguimiento";
    })[0];
});

// Devuelve la visita final. Requiere que 'visitas' esté populado
fctSchema.virtual('visita_fin').get(function () {
    if (this.visitas == null) return null;
    if (this.visitas.length == 0) return null;
    return this.visitas.filter(function (v) {
	return v.tipo == "final";
    })[0];
});

// Devuelve las visitas adicionales. Requiere que 'visitas' esté populado
fctSchema.virtual('visita_otra').get(function () {
    if (this.visitas == null) return null;
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

    // Elimino campo __v y usuario
    // Dejo campo _id para queries de búsqueda por id
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.usuario;
    delete ret.visitas;

    ret.fecha_inicio = moment(ret.fecha_inicio).format('YYYY-MM-DD');
    ret.fecha_fin = moment(ret.fecha_fin).format('YYYY-MM-DD');

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

// Función que devuelve una lista de FCTs filtradas por los parámetros de la query pasada como parámetro
fctSchema.statics.findQuery = function (query, usuario, cb) {
    // Parámetros de query: curso, periodo, datosfct,ids
    // Curso y periodo: pueden indicarse varios separados por comas

    // Query
    var q = {};
    q.usuario = usuario._id;

    // Búsqueda por id. Si existe el parámetro, se ignora todo lo demás
    // Lista de ids separados por comas
    if (typeof query.fctsid !== 'undefined') {
	var ids = query.fctsid.split(',');
	q._id = {};
	q._id.$in = ids;
    } else {
	// Crear vectores con cursos y períodos para búsqueda
	var cursos = [];
	var periodos = [];

	// Si no existe parámetro curso, por defecto se indican todos los cursos
	if ((typeof query.curso === 'undefined') || (query.curso === "")) {
	    if ((typeof query.periodo === 'undefined') || (query.periodo === "")) {
		// Si no existe curso ni período, se indica el actual
		cursos.push(cps.getCursoActual());
		periodos.push(cps.getPeriodoActual());
	    } else {
		cursos = cps.getcursoslist();
		periodos = query.periodo.split(',');
	    }
	} else {
	    cursos = query.curso.split(',');
	    if ((typeof query.periodo === 'undefined') || (query.periodo === "")) {
		periodos = cps.getperiodoslist();
	    } else {
		periodos = query.periodo.split(',');
	    }

	}

	// Convertir periodos a número y eliminar los no números
        // Apaño para transformar período -1 en 5,6
        var perMenosUnoFound = false;
	var periodos = periodos
	    .map(function (n) {
		return parseInt(n); 
	    })
	    .filter(function( x ) {
		return !isNaN(x);
	    }).filter(function(x) {
                if (x == -1) {
                    perMenosUnoFound = true;
                    return false;
                } else {
                    return true;
                }
            });
        if (perMenosUnoFound) {
            periodos.push(5);
            periodos.push(6);
        }

	q.curso = {};
	q.curso.$in = cursos;
	
	q.periodo = {};
	q.periodo.$in = periodos;
	
	// Búsqueda general
	if (typeof query.datosfct !== 'undefined') {
	    var re =  new RegExp(query.datosfct, "i");
	    q.$or = [];
	    //q.$or.push({tutor: re});
	    //q.$or.push({ciclo: re});
	    q.$or.push({empresa: re});
	    q.$or.push({dir_empresa: re});
	    q.$or.push({instructor: re});
	    q.$or.push({nif_instructor: re});
	    q.$or.push({alumno: re});
	    q.$or.push({nif_alumno: re});
	    //q.$or.push({grupo: re});
	    //q.$or.push({curso: re});
	    //q.$or.push({periodo: re});
	    //q.$or.push({fecha_inicio: re});
	    //q.$or.push({fecha_fin: re});
	    //q.$or.push({horas: re});
	}

    }

    return this.find(q, null, { sort: {empresa: 1} }, cb);

};

// Modelo
Fct = mongoose.model('fct', fctSchema);
Promise.promisifyAll(Fct);
Promise.promisifyAll(Fct.prototype);

module.exports = Fct;
