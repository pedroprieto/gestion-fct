//var mongoose = require('mongoose');
var fm34 = require('../models/fm34');
module.exports.controller = function(app,route,baseUrl) {

    /**
     * GET
     */
    app.get(route, function(req, res) {
	var id = req.params.id;
	fm34.findOne({ '_id': id }, function (err,fm34) {
	    if (err) return console.error(err);
	    res.header('content-type',contentType);
	    res.render('fm34', {
		site: baseUrl + "fm34s",
		item: fm34
	    });


	    
	    
	});

    });

}
