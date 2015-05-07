// Fuente: https://gist.github.com/lingo/d972e618b4f226866be2

'use strict';

var utils = require('./utils');
var request = require('supertest-as-promised');
var should = require('should');
var app = require('../fct.js').app;
var routes = require('../routes/routes');

describe.only('Crear una visita en una FCT', function () {
    var user = process.env.APP_USER;
    var password = process.env.APP_PASSWORD;

    var fct_test = {
	template: {
	    data: [
		{name: "tutor", value: "Tutor test"},
		{name: "ciclo", value: "Ciclo test"},
		{name: "empresa", value: "empresa test"},
		{name: "alumno", value: "alumno test"},
		{name: "instructor", value: "instructor test"},
		{name: "grupo", value: "grupo test"},
		{name: "periodo", value: "periodo test"},
		{name: "fecha_inicio", value: new Date().toString()},
		{name: "fecha_fin", value: new Date().toString()},
		{name: "horas", value: "400"}
	    ]
	}
    };

    var visit_test = {
	template: {
	    data: [
		{name: "tipo", value: "Tipo de visita test"},
		{name: "distancia", value: "Distancia test"},
		{name: "fecha", value:  new Date().toString()},
		{name: "hora_salida", value: "Hora salida test"},
		{name: "hora_regreso", value: "Hora regreso test"},
		{name: "localidad", value: "Localidad test"},
		{name: "impresion", value: "Impresión de la visita test"}
	    ]
	}
    };

    

    it('Debe crear una visita y que aparezca como enlace en la FCT correspondiente', function () {
	this.timeout(20000);
	return request(app)
	// Creamos una FCT de prueba
	    .post(app.buildLink('fcts',{'user': process.env.APP_USER}).href)
	    .set("Authorization", "basic " + new Buffer(user + ':' + password).toString("base64"))
	    .set("Content-Type", "application/json")
	    .send(fct_test)
	//.expect('Content-Type', /json/)
	    .expect(201)
	    .then(function(res) {
		var loc = res.header.location;
		should.exist(loc);
		return request(app)
		// Conexión a la 'location' especificada al llamar a /fcts
		// Es el item con la FCT creada
		    .get(loc)
		    .set("Authorization", "basic " + new Buffer(user + ':' + password).toString("base64"))
		    .expect(200);
	    })
	    .then(function(res) {
		res.body.should.have.property('collection');
		var links = res.body.collection.items[0].links;
		links.should.containDeep([{rel: 'visits'}]);
		var visitslink = links.filter(function (el) {
		    return el.rel == 'visits';
		})[0].href;
		should.exist(visitslink);
		return request(app)
		// Petición POST al link de visitas para crear una visita
		    .post(visitslink)
		    .set("Authorization", "basic " + new Buffer(user + ':' + password).toString("base64"))
		    .send(visit_test)
		    .expect(201);
	    }).then(function(res) {
		var loc2 = res.header.location;
		should.exist(loc2);
		return request(app)
		// Conexión a la visita creada
		    .get(loc2)
		    .set("Authorization", "basic " + new Buffer(user + ':' + password).toString("base64"))
		    .expect(200);
	    }).then(function(res) {
		res.body.should.have.property('collection');
		var v = res.body.collection.items[0].data;
		v.length.should.be.above(0);
		return request(app)
		// Conexión al FM 34
		    .get(app.buildLink('fm34s',{'user': process.env.APP_USER}).href)
		    .set("Authorization", "basic " + new Buffer(user + ':' + password).toString("base64"))
		    .expect(200);
	    }).then(function(res) {
		res.body.should.have.property('collection');
		var v = res.body.collection.items[0].data;
		v.length.should.be.above(0);
		console.log(v);
		
	    });
    });
    
});
