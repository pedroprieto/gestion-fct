// Función para realizar la conexión al sistema SAO
var axios = require('axios');
var cheerio = require('cheerio');

module.exports = function (username, password) {
    var post_data = {
        'login': 'Entrar',
        'usuario': username,
        'password': password
    };

    var options = {
        url: 'https://foremp.edu.gva.es/index.php?op=2&subop=0', // para poder acceder al id del usuario, que aparece en esta página
        method: 'POST',
        data: new URLSearchParams(post_data),
        timeout: 2000,
        headers: {
            'Cookie': '',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Content-Type': 'application/x-www-form-urlencoded',
            // 'Content-Length': post_data.length
        }
    };

    return axios(options).then(response => {
        if (response.statusText == 'OK') {
            let sessionCookiesArray = [];
            for (let cookie of response.headers['set-cookie']) {
                sessionCookiesArray.push(cookie.split(';')[0]);
            }
            let sessionCookies = sessionCookiesArray.join(';');

            var idSAO = 0;
            var cheHeader = response.headers['che'];

            // Comprobar que aparece logout
            var $ = cheerio.load(response.data);
            if ($("input[name='logout']").length) {
                // Éxito
                // Almacenamos el id del usuario conectado
                idSAO = $("#usuarioActual").val();
                return { nombre: username, idSAO: idSAO, cookiesSAO: sessionCookies, cheHeader: cheHeader };
            } else {
                throw new Error("Autenticación SAO incorrecta");
            }
        } else {
            throw new Error("Usuario no encontrado");
        }
    });

}
