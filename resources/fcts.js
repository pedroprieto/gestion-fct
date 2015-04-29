var mongoose = require('mongoose');
var visit = require('../models/visit');
var fct = require('../models/fct');
var User = require('../models/user');
module.exports = function(app) {

    /**
     * ALL
     */

    // Cargamos el usuario del parámetro de la URL
    app.all(app.lookupRoute('fcts'), function(req, res, next) {
	var username = req.params.user;
	User.findOne({ 'username': username }, function (err,user) {
	    if (err) return console.error(err);
	    // Opcional: si no coincide con el usuario autenticado, devolvemos error
	    // user: usuario de la url
	    // req.user: usuario autenticado
	    if ( !user._id.equals(req.user._id) ) {
		console.log(user._id);
		console.log(req.user._id);
		var errcol = req.app.locals.errcj();
		errcol.href = req.protocol + '://' + req.get('host') + req.originalUrl;
		errcol.error.title = 'No autorizado';
		errcol.error.message = 'El usuario ' + req.user.username + ' no está autorizado para acceder a los recursos del usuario ' + username + '.';
		res.status(401).json(errcol);		
	    } else {
		// Pasamos la info del usuario indicado en el parámetro a res.locals
		res.locals.user = user;
		next();		
	    }
	    
	});
    });
    
    
    /**
     * GET
     * Lista de fcts de un usuario determinado
     */
    app.get(app.lookupRoute('fcts'), function(req, res) {
	
	fct.find({ 'usuario': res.locals.user._id }, function (err,fcts) {
	    if (err) return console.error(err);
	    var col = req.app.locals.cj();

	    // Links
	    col.links.push(req.app.buildLink('fcts', {user: res.locals.user.username}));
	    col.links.push({'rel':'collection', "prompt": "FCTs", 'href' : "/fcts"});
	    col.links.push({'rel':'collection', "prompt": "Visitas", 'href' : "/visits"});
	    col.links.push({'rel':'collection', "prompt": "FM34s", 'href' : "/fm34s"});

	    // Items
	    col.items = fcts.map(function(f) {
		return f.toObject({transform: fct.tx_cj});
	    });

	    // Queries

	    // Template
	    
	    res.json({collection: col});
	});
	
	

    });

    /**
     * POST
     */
    app.post(app.lookupRoute('fcts'), function(req, res) {
	var data, item,id,tutor,ciclo,empresa,instructor,alumno,grupo,periodo;
	var fecha_lunes_semana;

	// get data array
		console.log(req.body);

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
	item.visitas = new Array();
	item.save(function (err, item) {
	    if (err) {
		return console.error(err);
		res.status=400;
		res.send('error');  
	    } else {
		res.redirect(302,route);
	    }
	});

	
	
    });  

}
