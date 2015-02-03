'use strict';

/*
 * http://www.scotchmedia.com/tutorials/express/authentication/2/02
 * Modified from https://github.com/elliotf/mocha-mongoose
 */

var db_config = require('../config.js');
var mongoose = require('mongoose');

// ensure the NODE_ENV is set to 'test'
// this is helpful when you would like to change behavior when testing
process.env.NODE_ENV = 'test';


// TODO: actualizar

beforeEach(function (done) {

    function clearDB() {
	//for (var i in mongoose.connection.collections) {
	//  mongoose.connection.collections[i].remove();
    //}
    return done();
    }

    function reconnect() {
	//mongoose.connect(db_config.uri);
	//mongoose.connect(config.db.test, function (err) {
	//if (err) {
	//	throw err;
	//  }
	//  return clearDB();
	//	});
	
    }

    function checkState() {
	switch (mongoose.connection.readyState) {
	case 0:
	    reconnect();
	    break;
	case 1:
	    clearDB();
	    break;
	default:
	    process.nextTick(checkState);
	}
    }

    //checkState();
    return done();
});

afterEach(function (done) {
    //mongoose.disconnect();
    return done();
});
