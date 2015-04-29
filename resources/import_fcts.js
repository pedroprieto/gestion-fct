var Fct = require('../models/fct');
var auth_sao = require('../auth/auth_sao');
var fctnums = require('../aux/get_fcts_sao');
var detallesFCT = require('../aux/get_fct_sao');

module.exports = function(app) {


    /**
     * ALL
     */
    // Cargamos el usuario del parámetro de la URL
    app.all(app.lookupRoute('import_fcts'), function(req, res, next) {
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
		fctnums(sao_conn_data, function(lista_fcts) {

		    if (lista_fcts === false) {
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
				detallesFCT(sao_conn_data, key[0], function(fct_data) {
				    if (fct_data===false) {
					errcol.error.message += 'Error al importar la FCT desde SAO. ';
					errcol.error.title = 'Error al importar la FCT desde SAO';
					// TODO: añadir error de la función anterior
					//errcol.code += 
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

    


