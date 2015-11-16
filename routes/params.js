// Procesar parámetros en las URL
// Devuelven los datos en res.locals
// Parámetros: user, fct, visit

var User = require('../models/user');
var Visit = require('../models/visit');
var Fct = require('../models/fct');
var moment = require('moment');


module.exports = function(app) {

    app.param('user', function(req, res, next, username) {

	/*if (! objectIdRegex.test(String(id))) {
	    return next('route')
	    }*/
	User.findOneAsync({ 'username': username }).then(function(user) {

	    if (!user) {
		return next('route')
	    }

	    if ( !user._id.equals(req.user._id) ) {
		var err = new Error();
		err.name = 'No autorizado';
		err.message = 'El usuario ' + req.user.username + ' no está autorizado para acceder a los recursos del usuario ' + username + '.';
		err.status = 401;
		throw err;
	    } else {
		// Pasamos la info del usuario indicado en el parámetro a res.locals
		res.locals.user = user;
		next();		
	    }
	}).catch(next);
    });

    app.param('fct', function(req, res, next, fctid) {
	/*if (! objectIdRegex.test(String(id))) {
	  return next('route')
	  }*/
	Fct.findOneAsync({ '_id': fctid, 'usuario': res.locals.user._id })
	    .then(function(fct) {
		if (!fct) {
		    return next('route');
		}
		
		res.locals.fct = fct;
		next();
	    })
	    .catch(next);
    });

    app.param('visit', function(req, res, next, visitid) {
	/*if (! objectIdRegex.test(String(id))) {
	  return next('route')
	  }*/
	Visit.findOneAsync({ '_id': visitid, '_fct': res.locals.fct._id })
	    .then(function(visit) {

		if (!visit) {
		    return next('route');
		}
		
		res.locals.visit = visit;
		next();
	    })
	    .catch(next);
    });

    app.param('fm34', function(req, res, next, fm34id) {
	// fm34id almacena la fecha del lunes de la semana del fm34

	// Comprobamos si el parámetro es lunes
	var start = moment(fm34id,"DD-MM-YYYY");
	if (( start.isValid() == false ) || ( start.isoWeekday() !== 1)) {
	    return next('route');
	} else {
	    var end = start + 7;
	    console.log(end);
	    Visit.genfm34Async( res.locals.user_id, fm34id )
		.then(function(fm34) {
		    if (!fm34) {
			return next('route');
		    }
		    res.locals.fm34 = fm34;
		    next();
		})
		.catch(next);
	}
    });

    app.param('tipo', function(req, res, next, tipo) {

	// Tipos de visitas válidos de acuerdo con el esquema de Visit
	var tipos = Visit.schema.path('tipo').enumValues;

	if (tipos.indexOf(tipo) > -1) {
	    res.locals.tipo_visita = tipo;
	    next();
	} else {
	    // Not found
	    return next('route');
	}	
    });
};
