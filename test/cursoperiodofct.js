var cps = require('../aux/cursoperiodofct');
var moment = require('moment');

describe('Comprobar que se generan los períodos de FCTs correctos.', function () {
    it('Períodos FCTS correctos.', function () {
	var valid_cp = '2011-2012_1';
	var valid_course = '2011-2012';
	var valid_period = '1';
	var cur_month = moment().month();
	var cur_year = moment().year();
	var cur_course = (cur_year -1) + '-' + (cur_year);
	
	console.log(cps.getlist());
	var c1 = cps.validate(valid_cp);
	c1.should.not.be.null;
	c1.curso.should.be.equal(valid_course);
	c1.periodo.should.be.equal(valid_period);
	
	(cps.validate('2011-20121') === null).should.be.true;
	(cps.validate('20112012-1') === null).should.be.true;
	(cps.validate('201120121') === null).should.be.true;
	(cps.validate('2012012-1') === null).should.be.true;

	// Curso actual debe existir primer período
	var cp = cur_course + '_1';
	cps.validate(cp).should.not.be.null;

	// El segundo período debe existir si estamos en agosto o más
	cp = cur_course + '_2';
	if (cur_month >= 7) {
	    cps.validate(cp).should.not.be.null;
	} else {
	    // El segundo período NO debe existir si estamos antes de agosto
	    (cps.validate(cp) === null).should.be.true;
	}

    });

});
