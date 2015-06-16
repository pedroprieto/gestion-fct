var cps = require('../aux/cursoperiodofct');
var moment = require('moment');

describe('Comprobar que se generan los períodos de FCTs correctos.', function () {
    it.only('Períodos FCTS correctos.', function () {
	var valid_cp = '2011-2012_1';
	var valid_course = '2011-2012';
	var valid_period = '1';
	var cur_month = moment().month();
	var cur_year = moment().year();
	var cur_course = (cur_year -1) + '-' + (cur_year);
	
	console.log(cps.getlist());
	cps.validate(valid_cp).should.be.true;
	cps.getcurso(valid_cp).should.be.equal(valid_course);
	cps.getperiodo(valid_cp).should.be.equal(valid_period);
	
	cps.validate('2011-20121').should.be.false;
	cps.validate('20112012-1').should.be.false;
	cps.validate('201120121').should.be.false;
	cps.validate('2012012-1').should.be.false;

	// Curso actual debe existir primer período
	var cp = cur_course + '_1';
	cps.validate(cp).should.be.true;

	// El segundo período debe existir si estamos en agosto o más
	cp = cur_course + '_2';
	if (cur_month >= 7) {
	    cps.validate(cp).should.be.true;
	} else {
	    // El segundo período NO debe existir si estamos antes de agosto
	    cps.validate(cp).should.be.false;
	}

    });

});
