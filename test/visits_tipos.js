// Fuente: https://gist.github.com/lingo/d972e618b4f226866be2

'use strict';

var utils = require('./utils');
var req = require('supertest-as-promised');
var should = require('should');
var Visit = require('../models/visit');
var User = require('../models/user');
var Fct = require('../models/fct');


describe('Comprobar que no se pueden grabar visitas del mismo tipo.', function () {

    var datos_user = {
	username: 'testuser1',
	password: 'testuser1'
    };
    
    var datos_fct = {
	tutor: "Tutor test",
	ciclo: "Ciclo test",
	empresa: "Empresa test",
	dir_empresa: "Dir empresa 2",
	localidad: "Alicante",
	nif_alumno: "12345678k",
	nif_instructor: "12345678k",
	alumno: "alumno test",
	instructor: "instructor test",
	grupo: "grupo test",
	curso: "2014-2015",
	periodo: "2",
	fecha_inicio: new Date(),
	fecha_fin:new Date(),
	horas: '400'
    };

    var datos_visita = {
	empresa: 'empresa1',
	tipo: 'inicial',
	distancia: 35,
	fecha: new Date(2015,4,8),
	hora_salida: '09:00',
	hora_regreso: '11:00',
	localidad: 'localidad test 1',
	impresion: 'texto impresión test 1'
    };

    var usuario, fct;

    // Devuelve promesa
    function dosiguales(visita) {
	var v1, fct1, user_test1;
	user_test1 = new User(datos_user);
	fct1 = new Fct(datos_fct);
	
	
	return user_test1.saveAsync()
	    .then(function(user) {
		usuario = user[0];
		fct1.usuario = usuario._id;
		return fct1.saveAsync();
	    })
	    .then(function(f) {
		fct = f[0];
		var v1 = new Visit(visita);
		v1._fct = fct._id;
		v1._usuario = usuario._id;
		return v1.saveAsync();
	    })
	    .then(function(v) {
		var v2 = new Visit(visita);
		v2._fct = fct._id;
		v2._usuario = usuario._id;
		return v2.saveAsync();
	    });

    }

    it('No debe grabar dos visitas iniciales', function () {
	datos_visita.tipo = 'inicial';
	
	return dosiguales(datos_visita)
	    .then(function(v) {
		throw new Error('Dos iniciales guardadas.');
	    })	
	    .catch(function(e) {
		should(e.message).not.be.equal('Dos iniciales guardadas.');
	    });

    });

    it('No debe grabar dos visitas de seguimiento', function () {
	datos_visita.tipo = 'seguimiento';
	
	return dosiguales(datos_visita)
	    .then(function(v) {
		throw new Error('Dos de seguimiento guardadas.');
	    })	
	    .catch(function(e) {
		should(e.message).not.be.equal('Dos de seguimiento guardadas.');
	    });

    });

    it('No debe grabar dos visitas finales', function () {
	datos_visita.tipo = 'final';
	
	return dosiguales(datos_visita)
	    .then(function(v) {
		throw new Error('Dos finales guardadas.');
	    })	
	    .catch(function(e) {
		should(e.message).not.be.equal('Dos finales guardadas.');
	    });

    });
    

    it('Debe grabar dos visitas de tipo "otra".', function () {
	datos_visita.tipo = 'otra';

	return dosiguales(datos_visita);

    });

    




        
});
