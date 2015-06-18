// Función para obtener las FCTs del sistema SAO

var request = require('request');
var Promise = require('bluebird');

module.exports = Promise.promisify(function(data, curso, periodo, callback) {

    // Curso: p. ej. 2014-2015
    // Periodo:
    // -1 todos
    // 1 Sept-Dic
    // 2 Abril-Junio
    // 3 Otros
    var options = {
	url: 'https://fct.edu.gva.es/inc/ajax/fcts/rellenar_fct.php?prof=' + data.idSAO +  '&curso=' + curso + '&periodo=' + periodo,
	method: 'GET',
	headers: {
	    'Cookie': data.cookiesSAO
	}
    };


    function retorno(error, response, body) {
	if (!error && response.statusCode == 200) {

	    var res = body.match(/javascript:verDetallesFCT\('(\d+)'\)/g);

	    for (i=0;i<res.length;i++) {
		res[i] = res[i].match(/(\d+)/g);
	    }

	    callback(null, res);
	} else {
	    callback(new Error("Error"));
	}
    }
    
    request(options, retorno);

});
