var mongoose = require('mongoose')
,Schema = mongoose.Schema
visitSchema = new Schema( {
    fct: String,
    name: String
}),
Visit = mongoose.model('visit', visitSchema);

module.exports = Visit;
