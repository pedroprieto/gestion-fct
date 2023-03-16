// Passport
const passport = require('koa-passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const options = {};
const Users = require("../models/user");
var auth_sao = require('./auth_sao');

passport.use(new BasicStrategy(options, function (username, password, done) {
    Users.getUser(username).then(user => {
        if (!user || !user.checkPass(password)) {
            console.log("no encontrado: acceso a SAO");
            // Buscamos en SAO
            auth_sao(username, password)
                .then(function (connData) {
                    // Acceso a SAO correcto
                    var usuario = new Users.User(username, password);
                    usuario.updatePass(password);
                    usuario.save()
                        .then(function () {
                            // Para importación de FCT (conexión a SAO)
                            usuario.plainpassword = password;
                            return done(null, usuario);
                        });
                }).catch(error => {
                    console.log(error);
                    return done(null, false);
                });
        } else {
            console.log("usuario existe y password válido");
            user.plainpassword = password;
            return done(null, user);
        }

    });
}))
