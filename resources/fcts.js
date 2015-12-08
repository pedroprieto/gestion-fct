var mongoose = require('mongoose');
var visit = require('../models/visit');
var Fct = require('../models/fct');
var User = require('../models/user');
var cps = require('../aux/cursoperiodofct');

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

	var c = req.query.curso || cps.getCursoActual();
	var p = req.query.periodo || cps.getPeriodoActual();

	// Collection title
	col.title = "FCTs " + c + " período " + p;

	
	// Collection Links
	var fctlink = req.buildLink('fcts');
	fctlink.href += "?curso=" + c + "&periodo=" + p;
	col.links.push(fctlink);
	col.links.push(req.buildLink('import_fcts'));
	col.links.push(req.buildLink('fm34s'));
	var doclink = req.buildLink('documentacion');
	doclink.href += "?curso=" + c + "&periodo=" + p;
	col.links.push(doclink);
	col.links.push(req.buildLink('type_fcts'));
	

	// Items
	col.items = fctlist.map(function(f) {

	    // Item data
	    var item = f.toObject({transform: Fct.tx_cj});

	    // Item href
	    item.href = req.buildLink('fct', {fct: f._id}).href;

	    // Item links
	    item.links.push(req.buildLink('visits', {fct: f._id.toString()}));
	    item.links.push(req.buildLink('cert_alumno', {fct: f._id.toString()}));
	    item.links.push(req.buildLink('cert_instructor', {fct: f._id.toString()}));
	    item.links.push(req.buildLink('fm18', {fct: f._id.toString()}));
	    
	    return item;
	});

	// If no items
	if (fctlist.length == 0) {
	    var item = {};
	    item.data = [];
	    var d = {};
	    d.name = "mensaje";
	    d.prompt = "No hay FCTs en este período. Si desea importar, haga click aquí en el enlace de importar";
	    item.data.push(d);
	    item.links = [];
	    item.links.push(req.buildLink('import_fcts'));
	    col.items.push(item);
	    col.links.push(req.buildLink('type_mensajes'));
	}

	// Queries
	var c_actual = cps.getCursoActual();
	var p_actual = cps.getPeriodoActual();
	col.queries = [];
	// TODO: queda pendiente problema con valores actuales cuando campos vacíos
	col.queries.push(
	    {
		href: req.buildLink('fcts').href,
		rel: "search",
		name: "searchfct",
		prompt: "Búsqueda de FCTs",
		data: [
		    {
			name: "datosfct",
			value: req.query.datosfct || "",
			prompt: "Búsqueda por texto"
		    },
		    {
			name: "curso",
			value: (typeof req.query.curso!== 'undefined' && req.query.curso !== "") ? req.query.curso : c_actual,
			prompt: "Curso",
			options: cps.getcursoslist()
			//options: [{"value" : "1", "prompt" : "qui"}, {"value" : "2", "prompt" : "quo"}, {"value" : "2", "prompt" : "qua"}] 
		    },
		    {
			name: "periodo",
			value: (typeof req.query.periodo!== 'undefined' && req.query.periodo !== "") ? req.query.periodo : p_actual,
			prompt: "Período",
			options: cps.getperiodoslist()
		    }
		    
		]
	    }
	);

	// Template

	// Return collection object
	return {collection: col};

    }
    
    /**
     * GET
     * Lista de fcts de un usuario determinado
     */
    app.get(app.lookupRoute('fcts'), function(req, res, next) {

	Fct.findQueryAsync(req.query, res.locals.user)
	    .then(function(fcts) {
		res.locals.col = renderCollectionFcts(req, res, fcts);
		next();
		

		//res.json(col);
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

	// Link lista FCTs
	var fctslinks = req.buildLink('fcts');
	fctslinks.href += "?curso=" + res.locals.fct.curso + "&periodo=" + res.locals.fct.periodo;
	// Cambiamos el enlace de lista de FCTs porque en este caso no hay query.
	col.collection.links[0] = fctslinks;

	// Collection title
	col.collection.title = "FCT " + fct.empresa + " - " + fct.alumno;
	    
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
		//res.status(204).end();
		// Respondemos con una collection con mensaje al usuario
		var col = res.app.locals.cj();

		// Collection href
		col.href = req.buildLink('fcts').href;

		// Collection title
		col.title = "Mensaje";
				
		// Collection Links
		col.links.push(req.buildLink('fcts'));
		col.links.push(req.buildLink('type_mensajes'));
		var item = {};
		item.data = [];
		var d = {};
		d.name = "mensaje";
		d.prompt = "FCT eliminada correctamente. Haga click en el enlace para volver a la lista de FCTs.";
		item.data.push(d);
		item.links = [];
		item.links.push(req.buildLink('fcts'));
		col.items.push(item);

		res.status(200).json({collection: col});
		
	    })
	    .catch(next);


    });


}
