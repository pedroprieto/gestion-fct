'use strict';

var req = require('supertest-as-promised');
var should = require('should');
var app = require('../fct.js').app;
var routes = require('../routes/routes');

describe('Ingresar en la aplicación con usuario y contraseña', function () {

    var user = process.env.APP_USER;
    var password = process.env.APP_PASSWORD;
    var request = req('');

    it('Debe negar acceso si no hay usuario', function (done) {
	request
	    .get(app.buildLink('users').href)
	    .expect(401,done);
	
	
    });

    it('Debe negar acceso si hay usuario incorrecto', function (done) {
	this.timeout(40000);
	request
	    .get(app.buildLink('users').href)
	    .set("Authorization", "basic " + new Buffer('wronguser:wrongpass').toString("base64"))
	    .expect(401,done);
	
	
    });

    it('Debe permitir acceso con usuario correcto.', function(done) {
	this.timeout(40000);
	request
	    .get(app.buildLink('users').href)
	    .set("Authorization", "basic " + new Buffer(user + ':' + password).toString("base64"))
	    .expect(200)
	    .end(function(err,res) {
		should.not.exist(err);
		res.body.should.have.property('collection');
		done();
	    });
    });
});

