// Procesar parámetros en las URL
// Devuelven los datos en res.locals
// Parámetros: user, fct, visit

var User = require('../models/user');
var Visit = require('../models/visit');
var Fm34 = require('../models/fm34');
var Fct = require('../models/fct');


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
	/*if (! objectIdRegex.test(String(id))) {
	  return next('route')
	  }*/
	Fm34.findOneAsync({ '_id': fm34id })
	    .then(function(fm34) {

		if (!fm34) {
		    return next('route');
		}
		
		res.locals.fm34 = fm34;
		next();
	    })
	    .catch(next);
    });
};
