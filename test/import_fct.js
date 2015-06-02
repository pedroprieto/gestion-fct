'use strict';

// import the moongoose helper utilities
var utils = require('./utils');
var req = require('supertest-as-promised');
var should = require('should');
var app = require('../fct.js').app;

describe('Importar FCTs del sistema SAO', function () {
    var user = process.env.APP_USER;
    var password = process.env.APP_PASSWORD;

    it('Debe crear las fcts del usuario correspondiente (último período activo en SAO) al hacer una petición POST a /import_fcts', function (done) {
	this.timeout(40000);
	var request = req('');
	request
	    .post(app.buildLink('import_fcts',{'user': process.env.APP_USER}).href)
	    .set("Authorization", "basic " + new Buffer(user + ':' + password).toString("base64"))
	    //.expect('Content-Type', /json/)
	    .expect(201)
	    .end(function (err, res) {
		var loc = res.header['location'];
		should.not.exist(err);
		should.exist(loc);
		request
		// Conexión a la 'location' especificada al llamar a /import_fcts
		    .get(loc)
		    .set("Authorization", "basic " + new Buffer(user + ':' + password).toString("base64"))
		    .expect(200)
		    .end(function (err, res) {
			if (err) throw err;
			res.body.should.have.property('collection');
			res.body.collection.items.length.should.be.above(0);
			done();
		});
	    });
	
	
    });
});

