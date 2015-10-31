var OSRM = require('osrm-client');
var osrm2 = new OSRM("http://router.project-osrm.org");
var promise = require('bluebird');
var osrm = promise.promisifyAll(osrm2);
var dis = require('../aux/calc_distancia');

describe.skip('Calculador de distancias.', function () {
    it('Distancia aproximada.', function () {

	// Esta dirección no es capturada correctamente por el sistema de mapas
	// Se calcula la distancia hasta el código postal
	var dir = 'C/ Los Monegros, edif. a7';
	var cp = '03006';
	var ciudad = 'Alicante';

	return dis(dir,cp,ciudad)
	    .then(function(res) {
		res.aprox.should.be.true;
		res.distancia.should.be.above(0);
	    });
    });

    it('Distancia exacta.', function () {

	// Esta dirección sí es capturada correctamente por el sistema de mapas
	var dir = 'C/ Los Monegros';
	var cp = '03006';
	var ciudad = 'Alicante';

	return dis(dir,cp,ciudad)
	    .then(function(res) {
		res.aprox.should.be.false;
		res.distancia.should.be.above(0);
	    });
    });

});
