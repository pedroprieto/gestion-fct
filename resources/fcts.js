var mongoose = require('mongoose');
var visit = require('../models/visit');
var Fct = require('../models/fct');
var User = require('../models/user');
var Queries = require('../routes/queries');

module.exports = function(app) {

    /**
     * Function to render a collection of fcts
     * @param {array} fctlist
     * @return {Object} collection
     */
    function renderCollectionFcts(req,res,fctlist) {
	var col = res.app.locals.cj();

	// Collection href
	col.href = req.buildLink('fcts').href;
	
	
	// Collection Links
	col.links.push(req.buildLink('fcts'));
	col.links.push(req.buildLink('import_fcts'));
	col.links.push(req.buildLink('fm34s'));
	col.links.push(req.buildLink('certs_alumno'));
	col.links.push(req.buildLink('certs_instructor'));

	// Items
	col.items = fctlist.map(function(f) {

	    // Item data
	    var item = f.toObject({transform: Fct.tx_cj});

	    // Item href
	    item.href = req.buildLink('fct', {fct: f._id}).href;

	    // Item links
	    item.links.push(req.buildLink('visits', {fct: f._id.toString()}));
	    
	    return item;
	});

	// Queries

	// Template

	// Return collection object
	return {collection: col};

    }
    
    /**
     * GET
     * Lista de fcts de un usuario determinado
     */
    app.get(app.lookupRoute('fcts'), function(req, res, next) {

	// Obtenemos parámetros de query
	// curso, periodo
	// Pueden indicarse varios separados por comas
	var curso = req.query.curso;
	var periodo = req.query.periodo;

	Queries.cursosperiodos(curso,periodo)
	    .then(function(cps) {
		var q = {};
		q.usuario = res.locals.user._id;
		q.periodo = {};
		q.periodo.$in = cps;
		return Fct.findAsync(q);
	    })
	    .then(function(fcts) {
		var col = renderCollectionFcts(req, res, fcts);
		res.json(col);
	    })
	    .catch(next);

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
	item.visitas = [];

	item.saveAsync()
	    .then(function (f) {
		// f es un vector: la segunda casilla es el número de registros
		f=f[0];
		res.location(req.buildLink('fct', {fct: f._id}).href);
		res.status(201).end();
	    })
	    .catch(next);	
    });

    /**
     * GET FCT      
     */

    app.get(app.lookupRoute('fct'), function(req, res, next) {


	var fct = res.locals.fct;

	var fcts = [];
	fcts.push(fct);

	var col = renderCollectionFcts(req, res, fcts);
	    
	res.json(col);

    });

    /**
     * DELETE FCT
     */

    app.delete(app.lookupRoute('fct'), function(req, res, next) {


	var fct = res.locals.fct;

	// Eliminamos visitas asociadas
	visit.find({'_id': { $in: fct.visitas}}).remove().execAsync()
	    .then(function(vs) {
		return fct.removeAsync();
	    })
	    .then(function(fctborrada) {
		//res.location(req.app.buildLink('visit', {user: res.locals.user.username, fct: res.locals.fct._id, visit: item._id}).href);
		res.status(204).end();
		
	    })
	    .catch(next);


    });


}
