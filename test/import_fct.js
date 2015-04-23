'use strict';

// import the moongoose helper utilities
var utils = require('./utils');
var request = require('supertest');
var should = require('should');
var app = require('../fct.js').app;
var routes = require('../routes/routes');

describe('Importar FCTs del sistema SAO', function () {
    var user = process.env.APP_USER;
    var password = process.env.APP_PASSWORD;

    it('Debe crear las fcts del usuario correspondiente (último período activo en SAO) al hacer una petición POST a /import_fcts', function (done) {
	request(app)
	    .post(app.buildLink('import_fcts',{'user': process.env.APP_USER}).href)
	    .set("Authorization", "basic " + new Buffer(user + ':' + password).toString("base64"))
	    //.expect('Content-Type', /json/)
	    //.expect(200)
	    .end(function (err, res) {
		should.not.exist(err);
		request(app)
		    .get(app.buildLink('fcts',{'user': process.env.APP_USER}).href)
		    .set("Authorization", "basic " + new Buffer(user + ':' + password).toString("base64"))
		    .expect(200)
		    .end(function (err, res) {
			if (err) throw err;
			console.log(res.body);
			res.body.should.have.property('collection');
			res.body.collection.items.length.should.be.above(0);
			done();
		});
	    });
	
	
    });

    /*it('debe crear un elemento en fcts', function(done) {
	request(app)
	    .post('/fcts')
	    .send({template: {
		data: [{
		    tutor: 'Pedro'} ]
	    }
		  })
	    .expect(201)
	    .end(function(err,res) {
		console.log(err);
		should.not.exist(err);
		done();
	    });
    });*/
});

