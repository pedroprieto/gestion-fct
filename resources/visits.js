var Visit = require('../models/visit');
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
	col.href = req.buildLink('visits').href;
	
	
	// Collection Links
	col.links.push(req.buildLink('fcts'));
	col.links.push(req.buildLink('fct'));
	req.buildLink('visits');
	col.links.push(req.buildLink('fm34s'));

	// Items
	col.items = visitlist.map(function(v) {

	    // Item data
	    var item = v.toObject({transform: Visit.tx_cj});

	    // Item href
	    item.href = req.buildLink('visit', {visit: v._id}).href;

	    // Item links
	    
	    return item;
	});

	// Queries

	// Template (para PUT sólo)
	col.template = Visit.visit_template();


	// Links a templates para visitas específicas
	var t1;
	var tipos_existentes = '';
	for (var i in visitlist) {
	    tipos_existentes += visitlist[i].tipo;
	}
	
	if (tipos_existentes.indexOf('inicial') === -1) {
	    t1 = req.buildLink('template_visita', {tipo: 'inicial'});
	    t1.prompt += " inicial";
	    col.links.push(t1);
	}

	if (tipos_existentes.indexOf('seguimiento') === -1) {
	    t1 = req.buildLink('template_visita', {tipo: 'seguimiento'});
	    t1.prompt += " seguimiento";
	    col.links.push(t1);
	}

	if (tipos_existentes.indexOf('final') === -1) {
	    t1 = req.buildLink('template_visita', {tipo: 'final'});
	    t1.prompt += " final";
	    col.links.push(t1);
	}

	t1 = req.buildLink('template_visita', {tipo: 'otra'});
	t1.prompt += " adicional";
	col.links.push(t1);

	// Return collection object
	return {collection: col};

    }
    

    /**
     * GET lista de visitas
     */
    app.get(app.lookupRoute('visits'), function(req, res, next) {

	Visit.findAsync({ '_usuario': res.locals.user._id , '_fct': res.locals.fct._id}, null, { sort: {fecha: 1} })
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
	var data,id,empresa,tipo,distancia,fecha,hora_salida,hora_regreso,localidad,fct_nombre;
	var fecha_lunes_semana;
	var list_fcts = [];
	
	// get data array
	data = req.body.template.data;
	
	if (!Array.isArray(data)) {
	    var err = new Error('Los datos enviados no se ajustan al formato collection + json.');
	    err.status = 400;
	    return next(err);
	}


	// Aprovechamos que Mongoose elimina los campos no definidos en el modelo. Por tanto, no hay que filtrar los datos
	// Convertimos el formato "template" de collection.json y devolvemos un objecto JavaScript convencional
	var visitdata = data.reduce(function(a,b){
	    a[b.name] = b.value;
	    return a;
	} , {});

	// Añadimos el usuario
	visitdata._usuario = res.locals.user._id;

	// Añadimos la empresa (no está puesta en el template)
	visitdata.empresa = res.locals.fct.empresa;


	// Comprobamos si se quieren crear visitas relacionadas
	// La propiedad 'related' es una cadena con las ids de las FCTs relacionadas separadas por coma
	if (visitdata.hasOwnProperty('related')) {
	    if (visitdata.related !== "") {
		list_fcts = visitdata.related.split(",");
	    }
	}
	
	// Añadimos la FCT actual
	list_fcts.push(res.locals.fct._id);


	// De toda la lista de FCTs, filtramos sólo las que sean del usuario
	var list_fcts_filtradas;
	var visita_base;
	Fct.findAsync({usuario: res.locals.user._id, _id: {$in: list_fcts}})
	    .then(function(fcts) {
		list_fcts_filtradas = fcts;
		
		// Creamos lista de promesas de visitas
		var visitas_promesas = [];
		
		// Iteramos para el conjunto de FCTs que tengamos
		for (var i in list_fcts_filtradas) {
		    // Añadimos el id de la FCT
		    visitdata._fct = list_fcts_filtradas[i]._id;
		    var item = new Visit(visitdata);
		    visitas_promesas.push(item.saveAsync());	    
		}
		return Promise.all(visitas_promesas);
		
	    })
	    .then(function(vs) {
		// Cuando se guarden las visitas
		var fcts_promises = [];
		for (var i in vs) {
		    var f = Fct.updateAsync({usuario: res.locals.user._id, _id: list_fcts_filtradas[i]}, {
			$push: {visitas: vs[i][0]._id},
			distancia: vs[i][0].distancia
		    });
		    fcts_promises.push(f);
		}
		visita_base = vs[vs.length-1][0]._id;
		return Promise.all(fcts_promises);
	    })
	    .then(function(fctsactualizadas) {
		res.location(req.buildLink('visit', {visit: visita_base}).href);
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
     * PUT visita
     */
    app.put(app.lookupRoute('visit'), function(req, res, next) {

	var visit = res.locals.visit;
	var fct = res.locals.fct;

	// get data array
	var data = req.body.template.data;
	
	if (!Array.isArray(data)) {
	    var err = new Error('Los datos enviados no se ajustan al formato collection + json.');
	    err.status = 400;
	    return next(err);
	}


	// Aprovechamos que Mongoose elimina los campos no definidos en el modelo. Por tanto, no hay que filtrar los datos
	// Convertimos el formato "template" de collection.json y devolvemos un objecto JavaScript convencional
	var visitdata = data.reduce(function(a,b){
	    a[b.name] = b.value;
	    return a;
	} , {});

	// Añadimos el usuario
	visitdata._usuario = res.locals.user._id;

	// Añadimos la empresa (no está puesta en el template)
	visitdata.empresa = res.locals.fct.empresa;

	// Añadimos la FCT
	visitdata._fct = fct._id;

	// Guardamos
	visit.set(visitdata);
	visit.saveAsync()
	    .then(function (vs) {
		res.location(req.buildLink('visit').href);
		res.status(200).end();
	    })
	    .catch(next);
	
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
	var fct = res.locals.fct;
	var localidad = fct.localidad;
	var distancia = fct.distancia;

	// Collection object
	var col = req.app.locals.cj();

	// Collection href
	col.href = req.buildLink('visits').href;
	
	// Links
	//col.links.push(req.app.buildLink('fcts'));
	// col.links.push({'rel':'collection', "prompt": "FCTs", 'href' : "/fcts"});
	// col.links.push({'rel':'collection', "prompt": "Visitas", 'href' : "/visits"});
	// col.links.push({'rel':'collection', "prompt": "FM34s", 'href' : "/fm34s"});

	// Items

	// Queries

	// Template

	// Obtenemos FCTs con la misma empresa que la actual, del mismo usuario, para incluirlas en la template
	var related = "";
	Fct.findAsync({empresa: res.locals.fct.empresa, usuario: res.locals.user._id, _id: {'$ne': fct._id}}, '_id')
	    .then(function(fcts) {
		related = fcts.map(function (key) {return key._id;}).join();
		col.template = Visit.visit_template(localidad, tipo, related, distancia);
		
		//Send
		res.json({collection: col});

	    })
	    .catch(next);
	

    });


}
