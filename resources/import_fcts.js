var Fct = require('../models/fct');
var auth_sao = require('../auth/auth_sao');
var fctnums = require('../aux/get_fcts_sao');
var detallesFCT = require('../aux/get_fct_sao');

module.exports = function(app) {


    /**
     * GET
     */
    app.get(app.lookupRoute('import_fcts'), function(req, res) {

	var col = res.app.locals.cj();

	// Collection href
	col.href = res.app.buildLink('import_fcts', {user: res.locals.user.username}).href;
	
	
	// Collection Links
	col.links.push(res.app.buildLink('fcts', {user: res.locals.user.username}));
	col.links.push(res.app.buildLink('import_fcts', {user: res.locals.user.username}));
	col.links.push(res.app.buildLink('fm34s', {user: res.locals.user.username}));
	col.links.push(res.app.buildLink('certs_alumno', {user: res.locals.user.username}));
	col.links.push(res.app.buildLink('certs_instructor', {user: res.locals.user.username}));

	// Items

	// Queries

	// Template
	var data = [];
	
	var itemdata = {
	    prompt: "Introduzca el período que desea importar",
	    name: "periodo",
	    value: "ultimo"
	};
	data.push(itemdata);

	col.template.data = data;

	// Return collection object
	res.json({collection: col});

    });

    
    /**
     * POST
     */
    app.post(app.lookupRoute('import_fcts'), function(req, res) {
	var errcol = req.app.locals.errcj();
	// TODO: poner ruta absoluta
	errcol.href = req.protocol + '://' + req.get('host') + req.originalUrl;
	
	auth_sao(req.user.username,req.user.password,function(sao_conn_data) {
	    if (sao_conn_data === false) {
		errcol.error.title = 'Error al iniciar sesión en SAO';
		errcol.error.message = 'Error al iniciar sesión en SAO';
		res.status(500).json(errcol);
	    } else {
		// Obtenemos la lista de FCTs de SAO
		fctnums(sao_conn_data, function(err, lista_fcts) {

		    if (err) {
			errcol.error.message = 'Error al obtener la lista de FCTs de SAO';
			errcol.error.title = 'Error al obtener la lista de FCTs de SAO';
			res.status(500).json(errcol);
		    } else {
			// Tenemos las FCTs
			var fctsrestantes = lista_fcts.length;

			var onComplete = function() {
			    if (errcol.error.title !== "") {
				res.status(500).json(errcol);
			    } else {
				// TODO
				res.location(req.app.buildLink('fcts', {user: res.locals.user.username}).href);
				res.status(201).end();
			    }
			};


			if (fctsrestantes === 0) {
			    onComplete();
			} else {
			    lista_fcts.forEach(function(key) {
				// Para cada FCT de la lista obtenemos sus datos
				detallesFCT(sao_conn_data, key[0], function(err, fct_data) {
				    if (err) {
					errcol.error.message += 'Error al importar la FCT desde SAO. ';
					errcol.error.title = 'Error al importar la FCT desde SAO';
					errcol.code += err;
				    } else {
					// Creamos FCT y salvamos
					var nfct = new Fct(fct_data);
					// Guardamos la referencia al usuario
					nfct.usuario = res.locals.user._id;
					nfct.save(function (er) {
					    if (er) {
						errcol.error.title = 'Error al importar la FCT desde SAO';
						errcol.error.message += 'Error al guardar en base de datos la FCT del alumno ' + nfct.alumno + '. ';
						errcol.error.code += JSON.stringify(er);
					    }
					    // saved!
					    if (--fctsrestantes === 0) {
						// No quedan registros por salvar
						onComplete();
					    }
					});
				    }
				});
			    });
			}
		    }
		});
	    }
	});
    });
};

    


