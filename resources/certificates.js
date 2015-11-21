var Fct = require('../models/fct');
var moment = require('moment');
var gendoc = require('../aux/generate_doc');

var alumno_doc_file = 'cert_alumno';
var instructor_doc_file = 'cert_instructor';
var fm18_doc_file = 'fm18';


module.exports = function(app) {


    /**
     * GET para certificados de alumno o instructor o para FM18s en formato DOCX
     */
    app.get([app.lookupRoute('certs_alumno') , app.lookupRoute('certs_instructor'), app.lookupRoute('fm18s')], function(req, res, next) {

	var docfile;

	if (req.path.indexOf('certs_alumno') > -1) {
	    docfile = alumno_doc_file;
	} else if (req.path.indexOf('certs_instructor') > -1) {
	    docfile = instructor_doc_file;
	} else {
	    // FM18s
	    docfile = fm18_doc_file;
	}

	var filename = res.locals.user.username + "_" + docfile + ".docx";

	Fct.findQuery(req.query, res.locals.user).populate('visitas').execAsync()
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

    /**
     * GET para certificado individual de alumno o instructor o para FM18 en formato DOCX
     */
    app.get([app.lookupRoute('cert_alumno') , app.lookupRoute('cert_instructor'), app.lookupRoute('fm18')], function(req, res, next) {

	var docfile;
	var fct = res.locals.fct;
	var filename;


	if (req.path.indexOf('cert_alumno') > -1) {
	    docfile = alumno_doc_file;
	    filename = fct.alumno + "_" + docfile + ".docx";
	} else if (req.path.indexOf('cert_instructor') > -1) {
	    docfile = instructor_doc_file;
	    filename = fct.instructor + "_" + docfile + ".docx";
	} else {
	    // FM18
	    docfile = fm18_doc_file;
	    filename = fct.alumno + "_" + fct.empresa + "_" + docfile + ".docx";
	}

	

	fct.populateAsync('visitas')
	    .then(function(fct) {
		var fcts = [];
		fcts.push(fct);
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
