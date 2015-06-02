var Visit = require('../models/visit');
var fm34 = require('../models/fm34');
var Fct = require('../models/fct');
var Promise = require("bluebird");
// Si no, no funciona el populate de Mongoose
Promise.promisifyAll(require("mongoose"));

module.exports = function(app) {

        /**
     * Function to render a collection of visits
     * @param {array} visitlist
     * @return {Object} collection
     */
    function renderCollectionVisits(req,res,visitlist) {
	var col = res.app.locals.cj();

	// Collection href
	col.href = res.app.buildLink('visits', {user: res.locals.user.username, fct: res.locals.fct._id}).href;
	
	
	// Collection Links
	col.links.push(res.app.buildLink('fcts', {user: res.locals.user.username}));
	col.links.push(res.app.buildLink('fct', {user: res.locals.user.username, fct: res.locals.fct._id}));
	res.app.buildLink('visits', {user: res.locals.user.username, fct: res.locals.fct._id});
	col.links.push(res.app.buildLink('fm34s', {user: res.locals.user.username}));

	// Items
	col.items = visitlist.map(function(v) {

	    // Item data
	    var item = v.toObject({transform: Visit.tx_cj});

	    // Item href
	    item.href = res.app.buildLink('visit', {user: res.locals.user.username, fct: res.locals.fct._id, visit: v._id}).href;

	    // Item links
	    
	    return item;
	});

	// Queries

	// Template
	var t1;
	var tipos_existentes = '';
	for (var i in visitlist) {
	    tipos_existentes += visitlist[i].tipo;
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

	// Return collection object
	return {collection: col};

    }
    

    /**
     * GET lista de visitas
     */
    app.get(app.lookupRoute('visits'), function(req, res, next) {

	Visit.findAsync({ '_usuario': res.locals.user._id , '_fct': res.locals.fct._id})
	    .then(function (visits) {
		var col = renderCollectionVisits(req, res, visits);
		res.json(col);
	    })
	    .catch(next);
	
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
		// Al terminar, actualizamos y guardamos la FCT
		res.locals.fct.visitas.push(item._id);

		// Guardamos la FCT con promise
		return res.locals.fct.saveAsync();

	    }).then(function(fctactualizada) {
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

	var visits = [];
	visits.push(visit);

	var col = renderCollectionVisits(req, res, visits);
	    
	res.json(col);
    });

    /**
     * DELETE visita
     */

    app.delete(app.lookupRoute('visit'), function(req, res, next) {


	var fct = res.locals.fct;
	var visit = res.locals.visit;

	// Eliminamos referencia en la FCT
	fct.visitas.pull(visit._id);

	// Eliminamos visita
	visit.removeAsync()
	    .then(function(v) {
		res.status(204).end();
	    })
	    .catch(next);


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
