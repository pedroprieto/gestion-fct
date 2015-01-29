var mongoose = require('mongoose');
var fct = require('../models/fct');
var fct = require('../models/fm18');
module.exports.controller = function(app,route,baseUrl) {

    /**
     * GET
     */
    app.get(route, function(req, res) {
	fct.find(function (err,fcts) {
	    if (err) return console.error(err);
	    res.header('content-type',contentType);
	    res.render('fcts', {
		site: baseUrl + route,
		items: fcts
	    });
	    
	});

    });

    /**
     * POST
     */
    app.post(route, function(req, res) {
	var item,id,tutor,ciclo,empresa,instructor,alumno,grupo,periodo;
	var fecha_lunes_semana;

	// get data array
	data = req.body.template.data; 
	// pull out values we want
	for(i=0,x=data.length;i<x;i++) {
	    switch(data[i].name) {
	    case 'tutor' :
		tutor = data[i].value;
		break;
	    case 'ciclo' :
		ciclo = data[i].value;
		break;
	    case 'empresa' :
		empresa = data[i].value;
		break;
	    case 'instructor' :
		instructor = data[i].value;
		break;
	    case 'alumno' :
		alumno = data[i].value;
		break;
	    case 'grupo' :
		grupo = data[i].value;
		break;
	    case 'periodo' :
		periodo = data[i].value;
		break;
		
	    }    
	}
	// Creamos elemento fct en la base de datos
	item = new fct();
	item.tutor=tutor;
	item.ciclo = ciclo;
	item.empresa=empresa;
	item.instructor = instructor;
	item.alumno = alumno;
	item.grupo = grupo;
	item.periodo = periodo;
	item.save(function (err, item) {
	    if (err) {
		return console.error(err);
		res.status=400;
		res.send('error');  
	    }
	    // Creamos fm 18
	    fm18doc = new fm18();
	    fm18doc.fct = item;
	    fm18doc.save(function (err, item) {
		if (err) {
		    return console.error(err);
		    res.status=400;
		    res.send('error');  
		} else {
		    res.redirect(route, 302);
		}
	    });
	});

	
	
    });  

}
