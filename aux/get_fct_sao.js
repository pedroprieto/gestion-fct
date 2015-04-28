// Función para obtener los detalles de una FCT concreta del SAO

var request = require('request');
var cheerio = require('cheerio');

module.exports = function(data, idFCT, callback) {

    var options = { 
	url: 'https://fct.edu.gva.es/inc/ajax/fcts/detalles_fct.php?id=' + idFCT,
	method: 'GET',
	headers: {
	    'Cookie': data.cookiesSAO
	}
    };

    var grupos = {
	'Desarrollo De Aplicaciones Web': "2º M"
    };

    function retorno(error, response, body) {
	if (!error && response.statusCode == 200) {

	    $ = cheerio.load(body);
	    var fechas = $('td').eq(39).text();
	    var fecha_inicio = fechas.split('-')[0].trim();
	    var fecha_fin = fechas.split('-')[1].trim();

	    var finicio_part = fecha_inicio.split("/");
	    var ffin_part = fecha_fin.split("/");
	    
	    fecha_inicio = new Date(finicio_part[2], (finicio_part[1] - 1), finicio_part[0]);
	    fecha_fin = new Date(ffin_part[2], (ffin_part[1] - 1), ffin_part[0]);

	    var res = {
		alumno: $('td').eq(1).text().trim(),
		empresa: $('td').eq(3).text().trim(),
		ciclo: $('td').eq(13).text().trim(),
		grupo: grupos[$('td').eq(13).text().trim()],
		tutor: $('td').eq(29).text().trim(),
		instructor: $('td').eq(33).text().trim(),
		periodo: $('td').eq(37).text().trim(),
		fecha_inicio: fecha_inicio,
		fecha_fin: fecha_fin,
		horas: $('td').eq(43).text().split('/')[1].trim()

	    };
	    callback(res);
	} else {
	    callback(false);
	}
    }
    
    request(options, retorno);

};
