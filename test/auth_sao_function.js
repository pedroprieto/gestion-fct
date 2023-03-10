var expect = require('chai').expect;
var auth_sao_function = require('../auth/auth_sao');
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

describe('Función auth/auth_sao.js. Debe proporcionar acceso al sistema SAO.', function () {

    var user = process.env.APP_USER;
    var password = process.env.APP_PASSWORD;

    it('Debe negar acceso con usuario incorrecto.', function () {
	this.timeout(40000);
	return auth_sao_function('wronguser','wrongpass').then(res => {
            expect(res).to.not.exist;
        }).catch(error => {
            expect(error).to.exist;
        })
    });

    it('Debe permitir acceso con usuario correcto.', function() {
	this.timeout(40000);
	return auth_sao_function(user, password).then(res => {
            expect(res).to.exist;
	    expect(res.nombre).to.equal(user);
            expect(res.cookiesSAO).to.exist;
	    expect(parseInt(res.idSAO)).to.be.above(0);
        }).catch(error => {
            console.log(error);
            expect(error).to.not.exist;
        })
    });
});

