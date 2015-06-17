var cps = require('../aux/cursoperiodofct');
var moment = require('moment');

describe('Comprobar que se generan los períodos de FCTs correctos.', function () {
    it('Períodos FCTS correctos.', function () {
	var valid_cp = '2011-2012_1';
	var valid_course = '2011-2012';
	var valid_period = '1';
	var cur_month = moment().month();
	var cur_year = moment().year();
	
	console.log(cps.getlist());
	cps.validate(valid_cp).should.be.true;
	cps.getcurso(valid_cp).should.be.equal(valid_course);
	cps.getperiodo(valid_cp).should.be.equal(valid_period);
	
	cps.validate('2011-20121').should.be.false;
	cps.validate('20112012-1').should.be.false;
	cps.validate('201120121').should.be.false;
	cps.validate('2012012-1').should.be.false;

	var curso;
	
	if (cur_month >= 7) {
	    curso = (cur_year) + '-' + (cur_year + 1);
	    cps.validate(curso + '_1').should.be.true;
	    cps.validate(curso + '_2').should.be.false;
	} else {
	    curso = (cur_year - 1) + '-' + (cur_year);
	    cps.validate(curso + '_1').should.be.true;
	    cps.validate(curso + '_2').should.be.true;
	}

    });

});
