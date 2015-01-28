//var mongoose = require('mongoose');
var fm34 = require('../models/fm34');

function fecha(d) {
    var curr_date = d.getDate();
    var curr_month = d.getMonth() + 1;
    var curr_year = d.getFullYear();
    return curr_date + "-" + curr_month + "-" + curr_year;
}

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
	    // Construir el array de visitas quitando el formato de fecha
	    visitas = new Array();
	    for (i=0;i<fm34.visitas.length;i++) {
		x=fm34.visitas[i];
		var a = {
		    fecha: fecha(x.fecha),
		    hora_salida: x.hora_salida,
		    hora_regreso: x.hora_regreso,
		    empresa: x.empresa,
		    localidad: x.localidad,
		    distancia: x.distancia,
		    tipo: x.tipo
		};
		visitas.push(a);
	    }
	    
	    doc.setData({
		"semanaDe": fecha(fm34.semanaDe),
		"semanaAl": fecha(fm34.semanaAl),
		"visits" : visitas
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
