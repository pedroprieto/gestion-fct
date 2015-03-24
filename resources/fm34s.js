var mongoose = require('mongoose');
var fecha = require('../aux/convert_date.js');
var fm34 = require('../models/fm34');

module.exports = function(app) {
    // TODO
    route = '';
    baseUrl = '';
    
    /**
     * GET
     */
    app.get(app.lookupRoute('fm34s'), function(req, res) {

	fm34.find(function (err,fm34s) {
	    if (err) return console.error(err);
	    res.header('content-type',contentType);
	    res.render('fm34s', {
		site: baseUrl + route,
		items: fm34s
	    });
	    
	});

    });

    /**
     * GET para versión DOCX del FM34
     */
    app.get(app.lookupRoute('fm34s') + "/docx", function(req, res) {
	fs=require('fs');
 	Docxtemplater=require('docxtemplater');

	//Load the docx file as a binary
	content=fs
	    .readFileSync(__dirname+"/../office_templates/prueba.docx","binary")

	doc=new Docxtemplater(content);

	fm34.find(function (err,fm34s) {
	    if (err) return console.error(err);


	    //set the templateVariables
	    // Construir el array de visitas quitando el formato de fecha
	    doc.setData({
		"fm34s" :
		// Para cambiar el formato de la fecha
		JSON.parse(JSON.stringify(fm34s,fecha.reemplaza))
	    });

	    //apply them (replace all occurences of {first_name} by Hipp, ...)
	    doc.render();

	    var buf = doc.getZip()
		.generate({type:"nodebuffer"});

	    fs.writeFile("test.docx", buf, function(err) {
		if (err) throw err;
		//res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
		//res.download("test.docx");
		res.download("test.docx", function(err){
		    if (err) {
			// handle error, keep in mind the response may be partially-sent
			// so check res.headerSent
		    } else {
			// descarga completada
			fs.unlink("test.docx");
		    }
		});
	    });
	    
	});

    });
    



    /**
     * GET
     */
    app.get(app.lookupRoute('fm34'), function(req, res) {
	var id = req.params.id;
	fm34.findOne({ '_id': id }, function (err,fm34) {
	    if (err) return console.error(err);
	    res.header('content-type',contentType);
	    fm34.populate('visitas', function (err, user) {
		res.render('fm34', {
		    site: baseUrl + route,
		    item: fm34
		});
	    })
	      
	});
	

    });

    /**
     * GET para versión DOCX del FM34
     */
    app.get(app.lookupRoute('fm34') + "/docx", function(req, res) {
	var id = req.params.id;
	fs=require('fs');
 	Docxtemplater=require('docxtemplater');

	//Load the docx file as a binary
	content=fs
	    .readFileSync(__dirname+"/../office_templates/prueba.docx","binary")

	doc=new Docxtemplater(content);

	fm34.findOne({ '_id': id }, function (err,fm34) {
	    if (err) return console.error(err);


	    
	    //set the templateVariables
	    
	    doc.setData({
		"fm34s" : [
		    // Para cambiar el formato de la fecha
		    JSON.parse(JSON.stringify(fm34,fecha.reemplaza))
		]
	    });

	    //apply them (replace all occurences of {first_name} by Hipp, ...)
	    doc.render();

	    var buf = doc.getZip()
		.generate({type:"nodebuffer"});

	    fs.writeFile("test.docx", buf, function(err) {
		if (err) throw err;
		//res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
		//res.download("test.docx");
		res.download("test.docx", function(err){
		    if (err) {
			// handle error, keep in mind the response may be partially-sent
			// so check res.headerSent
		    } else {
			// descarga completada
			fs.unlink("test.docx");
		    }
		});
	    });
	    
	});

    });
	    


}

