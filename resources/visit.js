//var mongoose = require('mongoose');
var visit = require('../models/visit');
module.exports.controller = function(app,route,baseUrl) {

    /**
     * GET
     */
    app.get(route, function(req, res) {
	var id = req.params.id;
	visit.findOne({ '_id': id }, function (err,visit) {
	    if (err) return console.error(err);
	    res.header('content-type',contentType);
	    res.render('visit', {
		site: req.protocol + '://' + req.get('host') + req.originalUrl + '/..',
		item: visit
	    });    
	});

    });

}
