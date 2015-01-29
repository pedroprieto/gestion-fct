var mongoose = require('mongoose')
,Schema = mongoose.Schema
fm18Schema = new Schema( {
    _fct: {type: Number, ref: 'Fct'},
    visitas: [visitSchema]
}),
Fm18 = mongoose.model('fm18', fm18Schema);

module.exports = Fm18;
