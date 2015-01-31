var mongoose = require('mongoose')
,Schema = mongoose.Schema
fm34Schema = new Schema( {
    semanaDe: Date,
    semanaAl: Date,
    visitas: [{ type: Schema.Types.ObjectId, ref: 'visit' }]
}),
Fm34 = mongoose.model('fm34', fm34Schema);

module.exports = Fm34;
