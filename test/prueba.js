'use strict';

// import the moongoose helper utilities
var utils = require('./utils');
var request = require('supertest');
var should = require('should');
var app = require('../fct.js').app;

describe('lista visitas', function () {
    //... previous test    
    it('debe devolver código 200 y objecto collection al llamar a /fcts', function (done) {
	request(app)
	    .get('/fcts')
	    .expect('Content-Type', /json/)
	    .expect(200)
	    .end(function (err, res) {
		should.not.exist(err);
		res.body.should.have.property('collection');
		done();
	    });
	
	    
    });

    it('debe crear un elemento en fcts', function(done) {
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
    });
});

