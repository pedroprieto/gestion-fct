'use strict';

var utils = require('./utils');
var request = require('supertest');
var should = require('should');
var app = require('../fct.js').app;
var routes = require('../routes/routes');

describe('Crear una visita en una FCT', function () {
    var user = process.env.APP_USER;
    var password = process.env.APP_PASSWORD;

    var fct_test = {
	template: {
	    data: [
		{
		    tutor: 'Tutor test',
		    ciclo: 'Ciclo test',
		    empresa: 'empresa test',
		    instructor: 'instructor test',
		    alumno: 'alumno test',
		    grupo: 'grupo test',
		    periodo: 'período test',
		    fecha_inicio: new Date(),
		    fecha_fin: new Date(),
		    horas: '400'
		}
	    ]
	}
    };

    var visit_test = {
	template: {
	    data: [
		{
		    tipo: 'tipo visita test',
		    distancia: 'distancia test',
		    fecha: new Date(),
		    hora_salida: 'hora salida test',
		    hora_regreso: 'hora regreso test',
		    localidad: 'localidad test',
		    impresion: 'texto de impresión test'
		}
	    ]
	}
    };

    

    it('Debe crear una visita y que aparezca como enlace en la FCT correspondiente', function (done) {
	this.timeout(20000);
	request(app)
	// Creamos una FCT de prueba
	    .post(app.buildLink('fcts',{'user': process.env.APP_USER}).href)
	    .set("Authorization", "basic " + new Buffer(user + ':' + password).toString("base64"))
	    .send(fct_test)
	    //.expect('Content-Type', /json/)
	    .expect(201)
	    .end(function (err, res) {
		var loc = res.header.location;
		should.not.exist(err);
		should.exist(loc);
		request(app)
		// Conexión a la 'location' especificada al llamar a /fcts
		// Es el item con la FCT creada
		    .get(loc)
		    .set("Authorization", "basic " + new Buffer(user + ':' + password).toString("base64"))
		    .expect(200)
		    .end(function (err, res) {
			if (err) throw err;
			res.body.should.have.property('collection');
			var links = res.body.collection.items[0].links;
			links.should.containDeep({rel: 'visits'});
			var visitslink = links.filter(function (el) {
			    return el.rel == 'visits';
			})[0].href;

			request(app)
			// Petición POST al link de visitas para crear una visita
			    .post(visitslink)
			    .set("Authorization", "basic " + new Buffer(user + ':' + password).toString("base64"))
			    .send(visit_test)
			    .expect(201)
			    .end(function (err, res) {
				if (err) throw err;
				var loc2 = res.header.location;
				should.not.exist(err);
				should.exist(loc2);
				request(app)
				// Conexión a la visita creada
				    .get(loc2)
				    .set("Authorization", "basic " + new Buffer(user + ':' + password).toString("base64"))
				    .expect(200)
				    .end(function (err, res) {
					if (err) throw err;
					res.body.should.have.property('collection');
					var v = res.body.collection.items[0].data;
					v.length.should.be.above(0);
					console.log(v);
					done();
				    });
				
				
				done();
			    });
		    });
	    });
	
	
    });
	    
});
