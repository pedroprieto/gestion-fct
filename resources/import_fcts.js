var Fct = require('../models/fct');
var auth_sao = require('../auth/auth_sao');
var fctnums = require('../aux/get_fcts_sao');
var detallesFCT = require('../aux/get_fct_sao');
var cps = require('../aux/cursoperiodofct');
var Promise = require('bluebird');

module.exports = function(app) {


    /**
     * GET
     */
    app.get(app.lookupRoute('import_fcts'), function(req, res) {

	var col = res.app.locals.cj();

	// Collection href
	col.href = req.buildLink('import_fcts').href;
	
	
	// Collection Links
	col.links.push(req.buildLink('fcts'));
	col.links.push(req.buildLink('import_fcts'));
	col.links.push(req.buildLink('fm34s'));
	col.links.push(req.buildLink('documentacion'));

	// Items

	// Queries

	// Template
	var data = [];
	
	var itemdata1 = {
	    prompt: "Introduzca el curso que desea importar",
	    name: "curso",
	    value: cps.getCursoActual(),
	    options: cps.getcursoslist()
	};

	var itemdata2 = {
	    prompt: "Introduzca el período que desea importar",
	    name: "periodo",
	    value: cps.getPeriodoActual(),
	    options: cps.getperiodoslist()
	};
	
	data.push(itemdata1);
	data.push(itemdata2);

	col.template.data = data;

	// Return collection object
	res.json({collection: col});

    });

    
    /**
     * POST
     */
    app.post(app.lookupRoute('import_fcts'), function(req, res, next) {

	// TODO: mejorar
	var curso = req.body.template.data.filter(function( obj ) {
	    return obj.name == 'curso';
	})[0].value;
	var periodo = req.body.template.data.filter(function( obj ) {
	    return obj.name == 'periodo';
	})[0].value;
	
	var sao_conn;
	
	var errcol = req.app.locals.errcj();
	// TODO: poner ruta absoluta
	errcol.href = req.protocol + '://' + req.get('host') + req.originalUrl;
	
	auth_sao(req.user.username,req.user.password)
	    .then(function(sao_conn_data) {
		if (sao_conn_data === false) {
		    var err = new Error();
		    err.name = 'Error al iniciar sesión en SAO';
		    err.message = 'Error al iniciar sesión en SAO';
		    err.status = 500;
		    throw err;
		} else {
		    // Obtenemos la lista de FCTs de SAO
		    sao_conn = sao_conn_data;
		    return fctnums(sao_conn_data, curso, periodo);
		}
	    })
	    .then(function(lista_fcts) {
		var promises_fct = [];
		lista_fcts.forEach(function(key) {
		    // Para cada FCT de la lista obtenemos sus datos
		    promises_fct.push(detallesFCT(sao_conn, key[0]));
		});
		return Promise.all(promises_fct);
	    })
	    .then(function(fcts_data) {
		var fcts = [];
		fcts_data.forEach(function(f) {
		    // Guardamos la referencia al usuario
		    f.usuario = res.locals.user._id;
		    // Hacemos un upsert: si existe FCT con mismo NIF de alumno y nombre de empresa, se actualiza;
		    // En caso contrario, se crea un nuevo registro
		    fcts.push(Fct.findOneAndUpdateAsync({nif_alumno: f.nif_alumno, empresa: f.empresa }, f, {upsert: true}));
		});
		return Promise.all(fcts);
	    })
	    .then(function(fcts) {
		// TODO
		/*res.location(req.buildLink('fcts').href);
		  res.status(201).end();*/
		// Respondemos con una collection con mensaje al usuario
		var col = res.app.locals.cj();

		// Collection href
		col.href = req.buildLink('fcts').href;
				
		// Collection Links
		var l = req.buildLink('fcts');
		l.href += "?curso=" + curso + "&periodo=" + periodo;
		col.links.push(req.buildLink('type_mensajes'));
		
		col.links.push(l);
		var item = {};
		item.data = [];
		var d = {};
		d.name = "mensaje";
		d.prompt = "FCTs importadas correctamente. Haga click en el enlace para visualizar la lista de FCTs.";
		item.data.push(d);
		item.links = [];		
		item.links.push(l);
		col.items.push(item);

		res.status(201).location(req.buildLink('fcts').href).json({collection: col});
	    })
	    .catch(next);
    });
};
