// Passport
const passport = require('koa-passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const options = {};
const Users = require("./newmodels/user");
var auth_sao = require('./auth_sao');

passport.use(new BasicStrategy(options, function (username, password, done) {
    Users.getUser(username).then(user => {
        if (!user || !user.checkPass(password)) {
            console.log("no encontrado: acceso a SAO");
            // Buscamos en SAO
            auth_sao(username, password)
                .then(function (res) {
                    if (res.statusText == 'OK') {
                        // Acceso a SAO correcto
                        var usuario = new User(username, password);
                        usuario.updatePass(password);
                        usuario.save()
                            .then(function () {
                                // Para importación de FCT (conexión a SAO)
                                user.plainpassword = password;
                                return done(null, user);
                            });
                    } else {
                        // Acceso a SAO incorrecto
                    }
                }).catch(error => {
                    return done(null, false);
                });
        } else {
            user.plainpassword = password;
            return done(null, user);
            console.log("usuario existe y password válido");
        }

    });

    return done(null, { username: "pedro" });
    
}))
