var Visit = require('../models/visit');
var fm34 = require('../models/fm34');
var Fct = require('../models/fct');
var Promise = require("bluebird");
// Si no, no funciona el populate de Mongoose
Promise.promisifyAll(require("mongoose"));

module.exports = function(app) {

    /**
     * ALL
     */

    // Cargamos el usuario y la fct del parámetro de la URL
    /*app.all([app.lookupRoute('visits'), app.lookupRoute('visit')], function(req, res, next) {
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
     * GET lista de visitas
     */
    app.get(app.lookupRoute('visits'), function(req, res) {

	Visit.find(function (err,visits) {
	    if (err) return console.error(err);

	    var col = req.app.locals.cj();

	    // Links
	    col.links.push(req.app.buildLink('visits'));
	    col.links.push({'rel':'collection', "prompt": "FCTs", 'href' : "/fcts"});
	    col.links.push({'rel':'collection', "prompt": "Visitas", 'href' : "/visits"});
	    col.links.push({'rel':'collection', "prompt": "FM34s", 'href' : "/fm34s"});

	    // Items
	    col.items = visits.map(function(v) {
		return v.toObject({transform: Visit.tx_cj});
	    });

	    // Queries

	    // Template
	    

	    res.json({collection: col});
	});

    });

    /**
     * POST lista visitas
     */
    app.post(app.lookupRoute('visits'), function(req, res, next) {
	var data,item,id,empresa,tipo,distancia,fecha,hora_salida,hora_regreso,localidad,fct_nombre;
	var fecha_lunes_semana;

	// get data array
	data = req.body.template.data;


	data = req.body.template.data;
	
	if (!Array.isArray(data)) {
	    res.status(400).send('Los datos enviados no se ajustan al formato collection + json.');  
	}


	// Aprovechamos que Mongoose elimina los campos no definidos en el modelo. Por tanto, no hay que filtrar los datos
	// Convertimos el formato "template" de collection.json y devolvemos un objecto JavaScript convencional
	var visitdata = data.reduce(function(a,b){
	    a[b.name] = b.value;
	    return a;
	} , {});
	
	// Añadimos el usuario que ha creado la FCT
	visitdata._fct = res.locals.fct._id;


	item = new Visit(visitdata);

	// Guardamos visita
	item.saveAsync()
	    .then(function(item) {
		// El resultado es un vector con el item y el número de filas afectadas.
		// Nos quedamos sólo con el item
		item = item[0];
		// Alterminar, actualizadmos y guardamos la FCT
		res.locals.fct.visitas.push(item._id);

		// Guardamos la FCT con promise
		var fctpromise = res.locals.fct.saveAsync();

		// Computamos y guardamos el FM34
		// TODO: fallo aquí
		// Creamos fm 34
		// Buscamos si existe
		//      f = new Date(fecha);
		var f=new Date(item.fecha);
		console.log(item.fecha);
		var day = f.getDay();
		var diff = f.getDate() - day + (day == 0 ? -6:1);
		// TODO: mejorar
		fecha_lunes_semana = new Date(f.setDate(diff));
		f = new Date(fecha_lunes_semana);
		day = f.getDay();
		var diff2 = f.getDate() + 6;
		var fecha_domingo_semana = new Date(f.setDate(diff2));
		// Fin del cálculo de lunes y domingo de la semana en cuestión
		
		var fm34doc;
		
		var fm34promise = fm34.findOne({ semanaDe: fecha_lunes_semana}).populate('visitas').execAsync()
		    .then(function (f) {
			if (f) {

			    // Comprobar si existe una visita a la misma hora. Futura mejora
			    if (f.visits.filter(function(v) {
				console.log('repetido');
				(v.fecha == item.fecha) && (v.hora_salida == item.hora_salida);
			    }).length > 0) {
				return;
				/* vendors contains the element we're looking for */
			    }

			    
			    
			    f.visitas.push(item._id);
			    return f.saveAsync();
			    //res.redirect('/visits/', 302);
			} else {
			    // Creamos fm34
			    fm34doc = new fm34();
			    fm34doc.semanaDe = fecha_lunes_semana;
			    fm34doc.semanaAl = fecha_domingo_semana;
			    fm34doc.visitas.push(item._id);
			    return fm34doc.saveAsync();
			}
		    });

		// Por último, devolvemos una promesa que sea la unión de las otras dos
		return Promise.join(fctpromise, fm34promise);

	    }).then(function(fctactualizada, fm34actualizado) {
		res.location(req.app.buildLink('visit', {user: res.locals.user.username, fct: res.locals.fct._id, visit: item._id}).href);
		res.status(201).end();
		
	    })
	    .catch(next);

	
	
	
    });  

    /**
     * GET visita      
     */

    app.get(app.lookupRoute('visit'), function(req, res, next) {

	var visit = res.locals.visit;
	var col = req.app.locals.cj();

	// Links
	//col.links.push(req.app.buildLink('fcts', {user: res.locals.user.username}));
	col.links.push({'rel':'collection', "prompt": "FCTs", 'href' : "/fcts"});
	col.links.push({'rel':'collection', "prompt": "Visitas", 'href' : "/visits"});
	col.links.push({'rel':'collection', "prompt": "FM34s", 'href' : "/fm34s"});

	// Items

	var item = visit.toObject({transform: Visit.tx_cj});
//	item.links.push(req.app.buildLink('visits', {user: res.locals.user.username, fct: visit._id.toString()}));
	col.items.push(item);
	

	// Queries

	// Template
	
	res.json({collection: col});

    });

}
