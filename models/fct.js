var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
fctSchema = new Schema( {
    tutor: String,
    ciclo: String,
    empresa: String,
    instructor: String,
    alumno: String,
    grupo: String,
    periodo: String,
    fecha_inicio: {type: Date, required: true},
    fecha_fin: {type: Date, required: true},
    horas: String,
    usuario: { type: Schema.Types.ObjectId, ref: 'user', required: true },
    visitas: [{ type: Schema.Types.ObjectId, ref: 'visit' }]
});

// Función estática para mensajes prompt
fctSchema.statics.prompts = {};

var es_ES = {
    tutor: "Tutor de la FCT",
    ciclo: "Ciclo formativo",
    empresa: "Nombre de la empresa",
    instructor: "Nombre del instructor",
    alumno: "Nombre del alumno",
    grupo: "Curso y grupo de clase",
    periodo: "Año y período de la FCT",
    fecha_inicio: "Fecha de inicio de la FCT",
    fecha_fin: "Fecha de fin de la FCT",
    horas: "Duración en horas de la FCT"
};

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
module.exports = Fct;
