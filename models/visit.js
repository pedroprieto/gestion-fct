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
    impresion: String
}),
Visit = mongoose.model('visit', visitSchema);

module.exports = Visit;
