// Función para realizar la conexión al sistema SAO

var querystring = require('querystring');
var request = require('request');
var cheerio = require('cheerio');
var Promise = require('bluebird');

module.exports = Promise.promisify(function(username, password, callback) {

    var post_data = {
	'login': 'Entrar',
	'usuario' : username,
	'password': password
    };
    
    var options = {
	url: 'https://fct.edu.gva.es/index.php?op=2&subop=0', // para poder acceder al id del usuario, que aparece en esta página
	method: 'POST',
	form: post_data,
	headers: {
	    'Content-Type': 'application/x-www-form-urlencoded',
	    'Content-Length': post_data.length
	}
    };

    function retorno(error, response, body) {
	if (!error && response.statusCode == 200) {

//	    response.setEncoding('utf8');
	    var sessionCookie = response.headers['set-cookie'][0];
	    sessionCookie = sessionCookie.split(';');
	    sessionCookie = sessionCookie[0];
	    var sessionCookie2 = response.headers['set-cookie'][1];
	    sessionCookie2 = sessionCookie2.split(';');
	    sessionCookie2 = sessionCookie2[0];
	    var sessionCookie3 = response.headers['set-cookie'][2];
	    sessionCookie3 = sessionCookie3.split(';');
	    sessionCookie3 = sessionCookie3[0];
	
	    sessionCookie = sessionCookie + ';' + sessionCookie2 + ';' + sessionCookie3;
	    var idSAO = 0;

	    var $ = cheerio.load(body);
	    if ($("input[name='logout']").length) {
		// Éxito
		// Almacenamos el id del usuario conectado
		idSAO = $("#usuarioActual").val();
		return callback(null, {nombre: username, idSAO: idSAO, cookiesSAO: sessionCookie});
	    } else {
		var err = new Error('Autenticación SAO incorrecta');
		return callback(null, false);
	    }
	} else {
	    return callback(new Error("Error en la comunicación con SAO"));
	}
    };
    
    request.post(options, retorno);

});
