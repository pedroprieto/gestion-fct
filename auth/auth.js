var querystring = require('querystring');
var User = require('../models/user');
var auth_sao = require('./auth_sao');

module.exports = function(passport, BasicStrategy) {
    // Estrategia de autenticación Basic
    // Si el usuario existe en la base de datos, se utilizan esos datos para el acceso
    // Si el usuario no existe en la base de datos, se busca el usuario en el sistema SAO (https://fct.edu.gva.es) y se crea el usuario correspondiente
    // Si el usuario no existe en base de datos ni en SAO, se deniega el acceso

    var usuario;

    passport.use(new BasicStrategy(function(username, password, done) {
	User.findOneAsync({ username: username })
	    .then(function (user) {
		if (!user) {
		    // Si no existe el usuario
		    auth_sao(username,password)
		    	.then(function(res) {
			    if (res) {
				// Acceso a SAO correcto
				var usuario = new User();
				usuario.username = username;
				usuario.password = password;
				usuario.saveAsync()
				    .then(function(user) {
					user=user[0];
					// Para importación de FCT (conexión a SAO)
					user.plainpassword = password;
					return done(null,user);
				    });
			    } else {
				// Acceso a SAO incorrecto
				return done(null,false);
			    }
			});
		} else {
		    // El usuario existe. Comprobamos password.
		    user.comparePasswordAsync(password)
			.then(function(result) {
			    if (result) {
				// Los passwords coinciden
				// Para importación de FCT (conexión a SAO)
				user.plainpassword = password;
				return done(null, user);
			    } else {
				// Los passwords no coinciden
				// Conectamos a SAO a ver si autentica
				auth_sao(username,password)
		    		    .then(function(res) {
					if (res) {
					    // Acceso a SAO correcto
					    user.password = password;
					    user.saveAsync()
						.then(function(user) {
						    user=user[0];
						    // Para importación de FCT (conexión a SAO)
						    user.plainpassword = password;
						    return done(null,user);
						});
					} else {
					    // Acceso a SAO incorrecto
					    return done(null,false);
					}
				    });
			    }
			});
		}
	    })
	    .catch(done);
    }));
};
