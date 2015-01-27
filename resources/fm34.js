//var mongoose = require('mongoose');
var fm34 = require('../models/fm34');
module.exports.controller = function(app,route,baseUrl) {

    /**
     * GET
     */
    app.get(route, function(req, res) {
	var id = req.params.id;
	fm34.findOne({ '_id': id }, function (err,fm34) {
	    if (err) return console.error(err);
	    res.header('content-type',contentType);
	    res.render('fm34', {
		site: baseUrl + "fm34s",
		item: fm34
	    });


	    
	    
	});

    });

    /**
     * GET para versión DOCX del FM34
     */
    app.get(route + "/docx", function(req, res) {

	fs=require('fs');
	Docxtemplater=require('docxtemplater');

	//Load the docx file as a binary
	content=fs
	    .readFileSync(__dirname+"/../office_templates/prueba.docx","binary")

	doc=new Docxtemplater(content);

	//set the templateVariables
	doc.setData({ "semanaDe":"Pedro" });

	//apply them (replace all occurences of {first_name} by Hipp, ...)
	doc.render();

	var buf = doc.getZip()
            .generate({type:"nodebuffer"});

	res.sendFile(buf);
	

    });

}
