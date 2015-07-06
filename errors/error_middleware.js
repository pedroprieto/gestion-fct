// Fuente: https://github.com/jeduan/express4-mongoose-bluebird

// TODO: mejorar el tema de mensajes, etc.


module.exports.logErrors = function(err, req, res, next){
    if (err.status === 404) {
	return next(err)
    }
    if (err.logError === false) {
	return next(err)
    }
    console.error(err.stack)
    next(err)
};

module.exports.respondError = function(err, req, res, next){
    var status, message;

    /*switch(err.name) {
    case 'personalizado':
	console.log('pedro personalizado');
	break;
    default:
	console.log('estándar');
    }*/

    var errcol = req.app.locals.errcj();
    errcol.href = req.protocol + '://' + req.get('host') + req.originalUrl;
    
    status = err.status || 500
    res.status(status)
    message = err.message
/*    message = ((err.productionMessage && err.message) ||
	       err.customProductionMessage)*/
    if (!message) {
	if (status === 403) {
	    message = 'Not allowed'
	} else {
	    message = 'Oops, there was a problem!'
	}
    }
    if (req.accepts('application/vnd.collection+json')) {
	errcol.error.title = err.name || 'Error';
	errcol.error.message = message;
//	errcol.error.code = err.stack;
	res.json({collection: errcol});
	return
    } else {
	res.type('txt').send(message + '\n');
	return
    }
};
