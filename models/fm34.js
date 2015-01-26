var mongoose = require('mongoose')
,Schema = mongoose.Schema
fm34Schema = new Schema( {
    semanaDe: Date,
    semanaAl: Date,
    visitas: [visitSchema]
}),
Fm34 = mongoose.model('fm34', fm34Schema);

module.exports = Fm34;
