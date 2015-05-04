var mongoose = require('mongoose');
var visit = require('../models/visit');
var Fct = require('../models/fct');
var User = require('../models/user');
module.exports = function(app) {

    /**
     * ALL
     */

    // Cargamos el usuario del parámetro de la URL
    /*app.all([app.lookupRoute('fcts'), app.lookupRoute('fct')], function(req, res, next) {
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
    });*/
    
    
    /**
     * GET
     * Lista de fcts de un usuario determinado
     */
    app.get(app.lookupRoute('fcts'), function(req, res, next) {
	console.log('aa');
	
	Fct.find({ 'usuario': res.locals.user._id }, function (err,fcts) {
	    if (err) return console.error(err);
	    var col = req.app.locals.cj();

	    // Links
	    col.links.push(req.app.buildLink('fcts', {user: res.locals.user.username}));
	    col.links.push({'rel':'collection', "prompt": "FCTs", 'href' : "/fcts"});
	    col.links.push({'rel':'collection', "prompt": "Visitas", 'href' : "/visits"});
	    col.links.push({'rel':'collection', "prompt": "FM34s", 'href' : "/fm34s"});

	    // Items
	    col.items = fcts.map(function(f) {
		var item = f.toObject({transform: Fct.tx_cj});
		item.links.push(req.app.buildLink('visits', {user: res.locals.user.username, fct: f._id.toString()}));
		return item;
	    });

	    // Queries

	    // Template
	    
	    res.json({collection: col});
	});
	
	

    });

    /**
     * POST
     */
    app.post(app.lookupRoute('fcts'), function(req, res, next) {
	var data, item,id,tutor,ciclo,empresa,instructor,alumno,grupo,periodo;
	var fecha_lunes_semana;

	data = req.body.template.data;
	
	if (!Array.isArray(data)) {
	    res.status(400).send('Los datos enviados no se ajustan al formato collection + json.');  
	}


	// Aprovechamos que Mongoose elimina los campos no definidos en el modelo. Por tanto, no hay que filtrar los datos
	// Convertimos el formato "template" de collection.json y devolvemos un objecto JavaScript convencional
	var fctdata = data.reduce(function(a,b){
	    a[b.name] = b.value;
	    return a;
	} , {});
	
	// Añadimos el usuario que ha creado la FCT
	fctdata.usuario = res.locals.user._id;


	item = new Fct(fctdata);

	// Creamos un array de visitas. ¿Es necesario realmente?
	item.visitas = new Array();

	item.save(function (err, item) {
	    if (err) {
		return console.error(err);
		res.status(400).send('Error al guardar los datos de la base de datos');  
	    } else {
		res.location(req.app.buildLink('fct', {user: res.locals.user.username, fct: item._id}).href);
		res.status(201).end();
	    }
	});

	
	
    });

    /**
     * GET FCT      
     */

    app.get(app.lookupRoute('fct'), function(req, res, next) {


	var fct = res.locals.fct;
	var col = req.app.locals.cj();

	// Links
	col.links.push(req.app.buildLink('fcts', {user: res.locals.user.username}));
	col.links.push({'rel':'collection', "prompt": "FCTs", 'href' : "/fcts"});
	col.links.push({'rel':'collection', "prompt": "Visitas", 'href' : "/visits"});
	col.links.push({'rel':'collection', "prompt": "FM34s", 'href' : "/fm34s"});

	// Items

	var item = fct.toObject({transform: Fct.tx_cj});
	item.links.push(req.app.buildLink('visits', {user: res.locals.user.username, fct: fct._id.toString()}));
	col.items.push(item);
	
	
	
	/* col.items = fcts.map(function(f) {
	   var item = f.toObject({transform: Fct.tx_cj});
	   item.links.push(req.app.buildLink('visits', {user: res.locals.user.username, fct: f._id.toString()}));
	   return item;
	   });*/

	// Queries

	// Template
	
	res.json({collection: col});




	
	/*res.render('fct', {
	  site: req.protocol + '://' + req.get('host') + req.originalUrl + '/..',
	  item: fct
	  });*/    

    });


}
