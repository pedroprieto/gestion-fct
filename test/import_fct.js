'use strict';

// import the moongoose helper utilities
var utils = require('./utils');
var req = require('supertest-as-promised');
var should = require('should');
var app = require('../fct.js').app;
var cps = require('../aux/cursoperiodofct');

describe('Importar FCTs del sistema SAO', function () {
    var user = process.env.APP_USER;
    var password = process.env.APP_PASSWORD;
    var contenttype ='application/vnd.collection+json';

    it('Debe crear las fcts del usuario correspondiente (último período activo en SAO) al hacer una petición POST a /import_fcts', function (done) {
	this.timeout(40000);
	var request = req('');
	var cpvalido = "2014-2015_2";
	var data = {
	    template: {
		data: [
		    {name: "periodo", value: cpvalido}
		]
	    }
	};
	request
	    .post(app.buildLink('import_fcts',{'user': process.env.APP_USER}).href)
	    .set("Authorization", "basic " + new Buffer(user + ':' + password).toString("base64"))
	    .set('Content-Type', contenttype)
	    .send(JSON.stringify(data))
	    .expect(201)
	    .end(function (err, res) {
		var loc = res.header['location'];
		should.not.exist(err);
		should.exist(loc);
		request
		// Conexión a la 'location' especificada al llamar a /import_fcts
		// Añadimos la query
		    .get(loc)
		    .query({ curso: cps.getcurso(cpvalido) })
		    .query({ periodo: cps.getperiodo(cpvalido) })
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

