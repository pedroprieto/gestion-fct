'use strict';

/*
 * http://www.scotchmedia.com/tutorials/express/authentication/2/02
 * Modified from https://github.com/elliotf/mocha-mongoose
 */

var db_config = require('../config.js');
var mongoose = require('mongoose');
var db;

before(function(done) {

    db = mongoose.createConnection();
    done();

});



beforeEach(function (done) {
    process.env.NODE_ENV = 'test';

    function clearDB() {
	db.db.dropDatabase();
	return done();
    }

    function reconnect() {
	db.open(db_config.db.testuri, function (err) {
	    if (err) {
		throw err;
	    }
	    return clearDB();
	});
	
    }

    function checkState() {
	switch (db.readyState) {
	case 0:
	    reconnect();
	    break;
	case 1:
	    clearDB();
	    break;
	default:
	    process.nextTick(checkState);
	    console.log(db.readyState);
	}
    }
    checkState();
});

afterEach(function (done) {
    db.close();
    return done();
});
