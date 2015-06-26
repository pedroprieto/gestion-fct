var cps = require('../aux/cursoperiodofct');
var moment = require('moment');

describe('Módulo cursoperiodofct.', function () {
    it('Períodos FCTS correctos.', function () {
	var cur_month = moment().month();
	var cur_year = moment().year();

	var curso;
	
	if (cur_month >= 7) {
	    curso = (cur_year) + '-' + (cur_year + 1);
	    cps.getCursoActual().should.be.equal(curso);
	    cps.getPeriodoActual().should.be.equal(1);
	} else {
	    curso = (cur_year - 1) + '-' + (cur_year);
	    cps.getCursoActual().should.be.equal(curso);
	    cps.getPeriodoActual().should.be.equal(2);
	}

    });

});
