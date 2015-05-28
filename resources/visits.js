var Visit = require('../models/visit');
var fm34 = require('../models/fm34');
var Fct = require('../models/fct');
var Promise = require("bluebird");
// Si no, no funciona el populate de Mongoose
Promise.promisifyAll(require("mongoose"));

module.exports = function(app) {

    /**
     * GET lista de visitas
     */
    app.get(app.lookupRoute('visits'), function(req, res) {

	Visit.find({ '_usuario': res.locals.user._id , '_fct': res.locals.fct._id},function (err,visits) {
	    if (err) return console.error(err);

	    var col = req.app.locals.cj();
	    col.href = req.protocol + '://' + req.get('host') + req.originalUrl;

	    // Links
	    col.links.push(res.app.buildLink('fcts', {user: res.locals.user.username}));
	    col.links.push(res.app.buildLink('fct', {user: res.locals.user.username, fct: res.locals.fct._id}));
	    	   

	    // Template links para visitas
	    var t1;
	    var tipos_existentes = '';
	    for (var i in visits) {
		tipos_existentes += visits[i].tipo;
	    }
	    
	    if (tipos_existentes.indexOf('inicial') === -1) {
		t1 = req.app.buildLink('template_visita', {user: res.locals.user.username, fct: res.locals.fct._id, tipo: 'inicial'});
		t1.prompt += " inicial";
		col.links.push(t1);
	    }

	    if (tipos_existentes.indexOf('seguimiento') === -1) {
		t1 = req.app.buildLink('template_visita', {user: res.locals.user.username, fct: res.locals.fct._id, tipo: 'seguimiento'});
		t1.prompt += " seguimiento";
		col.links.push(t1);
	    }

	    if (tipos_existentes.indexOf('final') === -1) {
		t1 = req.app.buildLink('template_visita', {user: res.locals.user.username, fct: res.locals.fct._id, tipo: 'final'});
		t1.prompt += " final";
		col.links.push(t1);
	    }

	    t1 = req.app.buildLink('template_visita', {user: res.locals.user.username, fct: res.locals.fct._id, tipo: 'otra'});
	    t1.prompt += " adicional";
	    col.links.push(t1);
	    
	    

	    // Items
	    col.items = visits.map(function(v) {
		return v.toObject({transform: Visit.tx_cj});
	    });

	    // Queries

	    // Template
	    // col.template = Visit.visit_template();
	    

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
	
	// Añadimos el id de la FCT
	visitdata._fct = res.locals.fct._id;

	// Añadimos el usuario
	visitdata._usuario = res.locals.user._id;


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


    /**
     * GET - Templates para crear visitas     
     */

    app.get(app.lookupRoute('template_visita'), function(req, res, next) {

	var tipo = res.locals.tipo_visita;

	// Collection object
	var col = req.app.locals.cj();

	// Collection href
	col.href = req.app.buildLink('visits', {user: res.locals.user.username, fct: res.locals.fct._id}).href;
	
	// Links
	//col.links.push(req.app.buildLink('fcts', {user: res.locals.user.username}));
	// col.links.push({'rel':'collection', "prompt": "FCTs", 'href' : "/fcts"});
	// col.links.push({'rel':'collection', "prompt": "Visitas", 'href' : "/visits"});
	// col.links.push({'rel':'collection', "prompt": "FM34s", 'href' : "/fm34s"});

	// Items

	// Queries

	// Template
	col.template = Visit.visit_template(tipo);
	
	//Send
	res.json({collection: col});

    });


}
