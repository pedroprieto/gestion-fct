var mongoose = require('mongoose')
      ,Schema = mongoose.Schema
      fctSchema = new Schema( {
          usuario: String,
	  empresa: String,
	  alumno: String,
	  periodo: String
      }),
User = mongoose.model('fct', fctSchema);

module.exports = Fct;
