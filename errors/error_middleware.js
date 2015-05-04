
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
    var status, message
    status = err.status || 500
    res.status(status)
    message = ((err.productionMessage && err.message) ||
	       err.customProductionMessage)
    if (!message) {
	if (status === 403) {
	    message = 'Not allowed'
	} else {
	    message = 'Oops, there was a problem!'
	}
    }
    if (req.accepts('json')) {
	res.send({error: message});
	return
    } else {
	res.type('txt').send(message + '\n');
	return
    }
};
