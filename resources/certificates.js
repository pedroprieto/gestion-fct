var Fct = require('../models/fct');
var moment = require('moment');
var gendoc = require('../aux/generate_doc');

var alumno_doc_file = 'cert_alumno';
var instructor_doc_file = 'cert_instructor';


module.exports = function(app) {


    /**
     * GET para certificados de alumno o instructor en formato DOCX
     */
    app.get([app.lookupRoute('certs_alumno') , app.lookupRoute('certs_instructor')], function(req, res, next) {

	var docfile;

	if (req.path.indexOf('certs_alumno') !== -1) {
	    docfile = alumno_doc_file;
	} else {
	    docfile = instructor_doc_file;
	}

	var filename = res.locals.user.username + "_" + docfile + ".docx";

	Fct.findAsync({ 'usuario': res.locals.user._id })
	    .then(function(fcts) {
		var doc= {
		    certs: JSON.parse(JSON.stringify(fcts))
		};

		return gendoc(doc, docfile);
	    })
	    .then(function(buf) {
		res.type('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
		res.set({"Content-Disposition":"attachment; filename=\"" + filename +  "\""});
		res.send(buf);

	    })
	    .catch(next);
	

    });



};
