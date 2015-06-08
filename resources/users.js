var mongoose = require('mongoose');
var User = require('../models/user');
module.exports = function(app) {
    // TODO
    route = '';
    baseUrl = '';
/**
 * GET
 */
    app.get(app.lookupRoute('users'), function(req, res) {

	User.find(function (err,users) {
	    if (err) return console.error(err);

	    var col = req.app.locals.cj();
	    col.href = req.protocol + '://' + req.get('host') + req.originalUrl;

	    // Links
	    col.links.push(req.buildLink('visits'));
	    col.links.push({'rel':'collection', "prompt": "FCTs", 'href' : "/fcts"});
	    col.links.push({'rel':'collection', "prompt": "Visitas", 'href' : "/visits"});
	    col.links.push({'rel':'collection', "prompt": "FM34s", 'href' : "/fm34s"});

	    // Items
	    col.items = users.map(function(v) {
		return v.toObject({transform: User.tx_cj});
	    });

	    // Queries

	    // Template

	    res.json({collection: col});
	    
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

	item = new User();
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
	var id = req.params.user;
	User.findOne({ 'name': id }, function (err,user) {
	    if (err) return console.error(err);
	    res.header('content-type',contentType);
	    res.render('user', {
		site: baseUrl + "users",
		item: user
	    });


	    
	    
	});
    });

    
};

    


