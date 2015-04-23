var mongoose = require('mongoose');
var user = require('../models/user');
module.exports = function(app) {
    // TODO
    route = '';
    baseUrl = '';
/**
 * POST
 */
    app.post(app.lookupRoute('import_fcts'), function(req, res) {
	// var item,id,name; 

	// // get data array
	// data = req.body.template.data; 

	

	// // pull out values we want
	// for(i=0,x=data.length;i<x;i++) {
	//     switch(data[i].name) {
	//     case 'name' :
	// 	name = data[i].value;
	// 	break;
	//     }    
	// }

	// item = new user();
	// item.name = name;
	// item.save(function (err, item) {
	//     if (err) {
	// 	return console.error(err);
	// 	res.status=400;
	// 	res.send('error');  
	//     } else {
	// 	res.redirect('/users/', 302);
	//     }
    
	// });

	res.status=200;
	res.send('todo');

	
    });
    
   
};

    


