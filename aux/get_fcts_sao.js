// Función para obtener las FCTs del sistema SAO

var request = require('request');

module.exports = function(data, callback) {

    //TODO: ver tema periodo y curso
    var options = {
	url: 'https://fct.edu.gva.es/inc/ajax/fcts/rellenar_fct.php?prof=' + data.idSAO +  ' &curso=2014-2015&periodo=2',
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

	    callback(res);
	} else {
	    callback(false);
	}
    }
    
    request(options, retorno);

};
