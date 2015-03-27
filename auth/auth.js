var querystring = require('querystring');
var http = require('https');

module.exports = function(passport, LocalStrategy) {
    // Estrategia para autenticar contra el servidor https://fct.edu.gva.es
    passport.use(new LocalStrategy(function(username, password, done) {
	var post_data = querystring.stringify({
	    'login': 'Entrar',
	    'usuario' : username,
	    'password': password
	});
	
	var options = {
	    host: 'fct.edu.gva.es',
	    port: 443,
	    path: '/index.php',
	    method: 'POST',
	    headers: {
		'Content-Type': 'application/x-www-form-urlencoded',
		'Content-Length': post_data.length
	    }
	};

	var pet = http.request(options, function(r){
	    r.setEncoding('utf8');
	    var sessionCookie = r.headers['set-cookie'][0];
	    sessionCookie = sessionCookie.split(';');
	    sessionCookie = sessionCookie[0];
	    var sessionCookie2 = r.headers['set-cookie'][1];
	    sessionCookie2 = sessionCookie2.split(';');
	    sessionCookie2 = sessionCookie2[0];
	    sessionCookie = sessionCookie + ';' + sessionCookie2;
	    var exito = false;
	    
	    r.on('data', function(chunk){
		// Hay que consumir los datos; si no, no acaba la petición
		// Si la página contiene el enlace al logout, es que se ha hecho el login
		if (chunk.indexOf('name="logout"') > -1)
		    exito = true;
	    }).on('end', function() {
		if (exito) {
		    return done(null, {nombre: username, cookiesSAO: sessionCookie});
		} else {
		    return done(null, false, { message: 'Usuario o password de SAO incorrecto.' });
		}
	    });
	});

	pet.on('error', function(e) {
	    console.log('problem with request: ' + e.message);
	    return done(err);
	});

	pet.write(post_data);
	pet.end();
    }));

    passport.serializeUser(function(user, done) {
	done(null, user);
    });

    passport.deserializeUser(function(user, done) {
	done(null,user);
    });

};
