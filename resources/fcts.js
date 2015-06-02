var mongoose = require('mongoose');
var visit = require('../models/visit');
var Fct = require('../models/fct');
var User = require('../models/user');
module.exports = function(app) {

    /**
     * Function to render a collection of fcts
     * @param {array} fctlist
     * @return {Object} collection
     */
    function renderCollectionFcts(req,res,fctlist) {
	var col = res.app.locals.cj();

	// Collection href
	col.href = res.app.buildLink('fcts', {user: res.locals.user.username}).href;
	
	
	// Collection Links
	col.links.push(res.app.buildLink('fcts', {user: res.locals.user.username}));
	col.links.push(res.app.buildLink('import_fcts', {user: res.locals.user.username}));
	col.links.push(res.app.buildLink('fm34s', {user: res.locals.user.username}));
	col.links.push(res.app.buildLink('certs_alumno', {user: res.locals.user.username}));
	col.links.push(res.app.buildLink('certs_instructor', {user: res.locals.user.username}));

	// Items
	col.items = fctlist.map(function(f) {

	    // Item data
	    var item = f.toObject({transform: Fct.tx_cj});

	    // Item href
	    item.href = res.app.buildLink('fct', {user: res.locals.user.username, fct: f._id}).href;

	    // Item links
	    item.links.push(res.app.buildLink('visits', {user: res.locals.user.username, fct: f._id.toString()}));
	    
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
	
	Fct.find({ 'usuario': res.locals.user._id }, function (err,fcts) {
	    if (err) return console.error(err);
	    var col = renderCollectionFcts(req, res, fcts);
	    
	    res.json(col);
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
		console.log(vs);
		return fct.removeAsync();
	    })
	    .then(function(fctborrada) {
		console.log('fct borrada');
		//res.location(req.app.buildLink('visit', {user: res.locals.user.username, fct: res.locals.fct._id, visit: item._id}).href);
		res.status(204).end();
		
	    })
	    .catch(next);


    });


}
