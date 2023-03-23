var expect = require('chai').expect;
var auth_sao_function = require('../auth/auth_sao');
var get_fcts_sao = require('../aux/get_fcts_sao');
var get_fct_sao = require('../aux/get_fct_sao');

describe('Importar FCTs del sistema SAO', function () {
    var user = process.env.APP_USER;
    var password = process.env.APP_PASSWORD;
    
    it('Debe obtener las FCTs del SAO', function () {
	this.timeout(40000);
	var curso = "2016-2017";
	var periodo = -1;
	return auth_sao_function(user, password).then(data => {
            return get_fcts_sao(data, curso, periodo);
        }).then(fcts => {
            expect(fcts.length).to.be.above(0);
        }).catch(error=> {
            console.log(error);
            expect(error).to.not.exist;
        });
    });
});

describe('Importar FCT individual del sistema SAO', function () {
    var user = process.env.APP_USER;
    var password = process.env.APP_PASSWORD;
    
    it('Debe obtener los datos de una FCT del SAO', function () {
	this.timeout(40000);
	var curso = "2016-2017";
	var periodo = -1;
        let dataConn;
	return auth_sao_function(user, password).then(data => {
            dataConn = data;
            return get_fcts_sao(data, curso, periodo);
        }).then(fcts => {
            expect(fcts.length).to.be.above(0);
            let fctId = fcts[0]; // FCT id 749723
            return get_fct_sao(dataConn, fctId);
        }).then(fct => {
            expect(fct).to.exist;
            expect(fct.tutor).to.equal("PEDRO PRIETO ALARCON");
        }).catch(error=> {
            console.log(error);
            expect(error).to.not.exist;
        });
    });
});
