'use strict';

var should = require('should');
var auth_sao_function = require('../auth/auth_sao');

describe('Función auth/auth_sao.js. Debe proporcionar acceso al sistema SAO.', function () {

    var user = process.env.APP_USER;
    var password = process.env.APP_PASSWORD;

    it('Debe negar acceso con usuario incorrecto.', function (done) {
	this.timeout(40000);
	auth_sao_function('wronguser','wrongpass',function(err, res) {
	    should.not.exist(err);
	    res.should.be.false;
	    done();
	});
	
    });

    it('Debe permitir acceso con usuario correcto.', function(done) {
	this.timeout(40000);
	auth_sao_function(user,password,function(err, res) {
	    res.nombre.should.equal(user);
	    should.exist(res.cookiesSAO);
	    res.idSAO.should.be.above(0);
	    done();
	});
    });
});

