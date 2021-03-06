// Fuente: https://gist.github.com/lingo/d972e618b4f226866be2

'use strict';

var utils = require('./utils');
var req = require('supertest-as-promised');
var should = require('should');
var app = require('../fct.js').app;
var routes = require('../routes/routes');
var contenttype ='application/vnd.collection+json';


describe('Crear una visita en una FCT', function () {
    var user = process.env.APP_USER;
    var password = process.env.APP_PASSWORD;

    var fct_test = {
	template: {
	    data: [
		{name: "tutor", value: "Tutor test"},
		{name: "ciclo", value: "Ciclo test"},
		{name: "empresa", value: "empresa test"},
		{name: "dir_empresa", value: "dir empresa test"},
		{name: "localidad", value: "Alicante"},
		{name: "alumno", value: "alumno test"},
		{name: "nif_alumno", value: "123456789k"},
		{name: "instructor", value: "instructor test"},
		{name: "nif_instructor", value: "123456789k"},
		{name: "grupo", value: "grupo test"},
		{name: "curso", value: "2014-2015"},
		{name: "periodo", value: "2"},
		{name: "fecha_inicio", value: new Date().toString()},
		{name: "fecha_fin", value: new Date().toString()},
		{name: "horas", value: "400"}
	    ]
	}
    };

    var visit_test = {
	template: {
	    data: [
		{name: "tipo", value: "inicial"},
		{name: "distancia", value: "30"},
		{name: "fecha", value:  new Date().toString()},
		{name: "hora_salida", value: "11:00"},
		{name: "hora_regreso", value: "12:00"},
		{name: "localidad", value: "Localidad test"},
		{name: "impresion", value: "Impresión de la visita test"},
		{name: "presencial", value: "true"}
	    ]
	}
    };

    

    it('Debe crear una visita y que aparezca como enlace en la FCT correspondiente', function () {
	this.timeout(20000);
	var request = req('');
	return request
	// Creamos una FCT de prueba
	    .post(app.buildLink('fcts',{'user': process.env.APP_USER}).href)
	    .set("Authorization", "basic " + new Buffer(user + ':' + password).toString("base64"))
	    .set('Content-Type', contenttype)
	    .send(JSON.stringify(fct_test))
	//.expect('Content-Type', /json/)
	    .expect(201)
	    .then(function(res) {
		var loc = res.header.location;
		should.exist(loc);
		return request
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
		return request
		// Petición POST al link de visitas para crear una visita
		    .post(visitslink)
		    .set("Authorization", "basic " + new Buffer(user + ':' + password).toString("base64"))
		    .set('Content-Type', contenttype)
		    .send(JSON.stringify(visit_test))
		    .expect(201);
	    }).then(function(res) {
		var loc2 = res.header.location;
		should.exist(loc2);
		return request
		// Conexión a la visita creada
		    .get(loc2)
		    .set("Authorization", "basic " + new Buffer(user + ':' + password).toString("base64"))
		    .expect(200);
	    }).then(function(res) {
		res.body.should.have.property('collection');
		var v = res.body.collection.items[0].data;
		v.length.should.be.above(0);
		return request
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
