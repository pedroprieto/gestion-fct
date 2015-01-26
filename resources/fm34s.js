var mongoose = require('mongoose');
var fm34 = require('../models/fm34');
module.exports.controller = function(app,route,baseUrl) {

/**
 * GET
 */
  app.get(route, function(req, res) {

     fm34.find(function (err,fm34s) {
      if (err) return console.error(err);
      res.header('content-type',contentType);
      res.render('fm34s', {
	  site: baseUrl + "fm34s",
	  items: fm34s
      });
	 
    });

  });
}
