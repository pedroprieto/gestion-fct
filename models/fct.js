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
    visitas: [{ type: Schema.Types.ObjectId, ref: 'visit' }]
});

Fct = mongoose.model('fct', fctSchema);

module.exports = Fct;
