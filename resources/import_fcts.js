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
	col.links.push(req.buildLink('certs_alumno'));
	col.links.push(req.buildLink('certs_instructor'));

	// Items

	// Queries

	// Template
	var data = [];
	
	var itemdata = {
	    prompt: "Introduzca el período que desea importar",
	    name: "periodo",
	    value: cps.getCpActual()
	};
	data.push(itemdata);

	col.template.data = data;

	// Return collection object
	res.json({collection: col});

    });

    
    /**
     * POST
     */
    app.post(app.lookupRoute('import_fcts'), function(req, res, next) {

	// TODO: mejorar
	var cp = req.body.template.data[0].value;
	var curso = cps.getcurso(cp);
	var periodo = cps.getperiodo(cp);
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
		res.location(req.buildLink('fcts').href);
		res.status(201).end();
	    })
	    .catch(next);
    });
};
