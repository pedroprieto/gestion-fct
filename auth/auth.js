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
		usuario = user;
		// Si no existe el usuario o el password es incorrecto, buscamos en SAO
		if (!user || (user.password != password) ) {
		    auth_sao(username,password)
		    	.then(function(res) {
			    // Buscamos en SAO
			    console.log("Conectado con SAO.");
			    if (res) {
				// Acceso a SAO correcto
				if (usuario) {
				    // El usuario existía pero la contraseña era incorrecta
				    usuario.password = password;
				} else {
				    // El usuario no existía
				    usuario = new User();
				    usuario.username = username;
				    usuario.password = password;			    
				}
				return usuario.saveAsync();
			    } else {
				// Acceso a SAO incorrecto
				return done(null,false);
			    }
			})
			.then(function(user) {
			    user=user[0];
			    return done(null,user);
			})
			.catch(done)
		} else {
		    // Existe usuario y la contraseña coincide
		    return done(null, user);
		}
	    })
	    .catch(done);
    }));
};
