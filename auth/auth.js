var querystring = require('querystring');
var http = require('https');
var User = require('../models/user');
var auth_sao = require('./auth_sao');

module.exports = function(passport, BasicStrategy) {
    // Estrategia de autenticación Basic
    // Si el usuario existe en la base de datos, se utilizan esos datos para el acceso
    // Si el usuario no existe en la base de datos, se busca el usuario en el sistema SAO (https://fct.edu.gva.es) y se crea el usuario correspondiente
    // Si el usuario no existe en base de datos ni en SAO, se deniega el acceso

    passport.use(new BasicStrategy(function(username, password, done) {
	User.findOne({ username: username }, function (err, user) {
	    if (err) {
		return done(err);
	    }
	    
	    // Si no existe el usuario o el password es incorrecto, buscamos en SAO
	    if (!user || (user.password != password) ) {
		auth_sao(username,password,function(res) {
		    console.log("Conectado con SAO.");
		    if (res) {
			// Acceso a SAO correcto

			if (user) {
			    // El usuario existía pero la contraseña era incorrecta
			    user.password = password;
			} else {
			    // El usuario no existía
			    user = new User();
			    user.username = username;
			    user.password = password;			    
			}
			user.save(function(err) {
			    if (err) {return done(err);}

			    return done(null,user);
			});
			
		    } else {
			// Acceso a SAO incorrecto
			return done(null,false);
		    }
		});

		
		//return done(null, false);
	    } else {
		// Existe usuario y la contraseña coincide
		return done(null, user);
	    }
	   

	});
	
    }));


};
