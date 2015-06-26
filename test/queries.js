var cps = require('../routes/queries');
var moment = require('moment');

describe('Comprobar la generación de consultas a partir de queries.', function () {
    
    it('Función cursosperiodos.', function () {
	var c1_t = '2012-2013';
	var c2_t = '2012-2013,2011-2012';
	var c3_f = '20122013';
	var c4_t = '20122013,2013-2014';
	var p1_t = '1';
	var p2_t = '2';
	var p3_t = '1,2';
	var p4_f = 'af';
	var p5_t = 'af,2';
	var cur_month = moment().month();
	var cur_year = moment().year();
	var cp;
	// El segundo período debe existir si estamos en agosto o más
	if (cur_month >= 7) {
	    cp = (cur_year) + '-' + (cur_year + 1) + '_1';
	} else {
	    cp = (cur_year - 1) + '-' + (cur_year) + '_2';
	}
	
	cps.cursosperiodos(c1_t, p1_t).should.have.length(1);
	cps.cursosperiodos(c2_t, p2_t).should.have.length(2);
	cps.cursosperiodos(c2_t, p3_t).should.have.length(4);
	cps.cursosperiodos(c3_f, p3_t).should.have.length(0);
	cps.cursosperiodos(c3_f, p4_f).should.have.length(0);
	cps.cursosperiodos(c4_t, p5_t).should.have.length(1);
        
    });

});
