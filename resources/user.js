//var mongoose = require('mongoose');
var user = require('../models/user');
module.exports.controller = function(app,route,baseUrl) {

/**
 * GET
 */
  app.get(route, function(req, res) {
      var id = req.params.id;
      user.findOne({ 'name': id }, function (err,user) {
	  if (err) return console.error(err);
	  res.header('content-type',contentType);
	  res.render('user', {
	      site: baseUrl + "users",
	      item: user
	  });


	
	 
  });

});

}
