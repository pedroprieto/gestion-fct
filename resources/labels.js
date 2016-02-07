var Fct = require('../models/fct');

module.exports = function(app) {

    /**
     * GET para etiquetas FCT
     */
    app.get(app.lookupRoute('etiquetas'), function(req, res, next) {

	Fct.findQuery(req.query, res.locals.user).execAsync()
	    .then(function(fcts) {
		res.type('text/html');
		res.render('labels', {
		    fcts: fcts
		});
		
	    })
	    .catch(next);
    });

    /**
     * GET para etiqueta individual
     */

    app.get(app.lookupRoute('etiqueta'), function(req, res, next) {

	var fct = res.locals.fct;
	var fcts = [];
	fcts.push(fct);

	res.type('text/html');
	res.render('labels', {
	    fcts: fcts
	});
    });
};
