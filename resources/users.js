var mongoose = require('mongoose');
var user = require('../models/user');
module.exports = function(app) {
    // TODO
    route = '';
    baseUrl = '';
/**
 * GET
 */
    app.get(app.lookupRoute('users'), function(req, res) {

	user.find(function (err,users) {
	    if (err) return console.error(err);
	    //res.send(users);
	    res.header('content-type',contentType);
	    res.render('users', {
		site: baseUrl + "users",
		items: users
	    }); 
	    
	});

    });

/**
 * POST
 */
    app.post(app.lookupRoute('users'), function(req, res) {
	var item,id,name; 

	// get data array
	data = req.body.template.data; 

	

	// pull out values we want
	for(i=0,x=data.length;i<x;i++) {
	    switch(data[i].name) {
	    case 'name' :
		name = data[i].value;
		break;
	    }    
	}

	item = new user();
	item.name = name;
	item.save(function (err, item) {
	    if (err) {
		return console.error(err);
		res.status=400;
		res.send('error');  
	    } else {
		res.redirect('/users/', 302);
	    }
    
	});

	
    });
    
    app.get(app.lookupRoute('user'), function(req, res) {
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

    
};

    


