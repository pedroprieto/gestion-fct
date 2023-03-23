// Función para obtener las FCTs del sistema SAO
var axios = require('axios');

module.exports = function (data, curso, periodo) {

    // Curso: p. ej. 2014-2015
    // Periodo:
    // -1 todos
    // 1 Sept-Dic
    // 2 Abril-Junio
    // 3 Otros

    // Cambio el parámetro periodo, que viene para "todos" como "1,2", por -1
    if (periodo == "1,2")
        periodo = -1;

    var options = {
        url: 'https://foremp.edu.gva.es/inc/ajax/fcts/rellenar_fct.php?prof=' + data.idSAO + '&curso=' + curso + '&periodo=' + periodo,
        method: 'GET',
        timeout: 2000,
        headers: {
            'Cookie': data.cookiesSAO,
            'che': data.cheHeader
        }
    };

    return axios(options).then(response => {
        if (response.statusText == 'OK') {

            var res = response.data.match(/javascript:verDetallesFCT\('(\d+)'\)/g);

            if (res === null) {
                var er = new Error("No se han encontrado datos del curso " + curso + " período " + periodo + " en el SAO.");
                er.status = 404;
                er.name = "Error de importación";
                throw er;
            }

            for (i = 0; i < res.length; i++) {
                res[i] = res[i].match(/(\d+)/g);
            }
            return res;
        } else {
            throw new Error("Error");
        }
    });
};
