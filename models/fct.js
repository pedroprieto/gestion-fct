var mongoose = require('mongoose')
,Schema = mongoose.Schema
fctSchema = new Schema( {
    tutor: String,
    ciclo: String,
    empresa: String,
    instructor: String,
    alumno: String,
    grupo: String,
    periodo: String,
    fm18: { type: Schema.Types.ObjectId, ref: 'Fm18' }
}),
Fct = mongoose.model('fct', fctSchema);

module.exports = Fct;
