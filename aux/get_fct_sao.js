// Función para obtener los detalles de una FCT concreta del SAO

var axios = require('axios');
var cheerio = require('cheerio');

module.exports = function (data, idFCT) {

    var options = {
        url: 'https://foremp.edu.gva.es/index.php?accion=10&idFct=' + idFCT,
        method: 'GET',
        timeout: 2000,
        headers: {
            'Cookie': data.cookiesSAO,
            'Che': data.cheHeader
        }
    };

    return axios(options).then(response => {
        if (response.statusText == 'OK') {

            $ = cheerio.load(response.data);
            var fecha_inicio = $("input[name='fecha_inicio']").val().trim();
            var fecha_fin = $("input[name='fecha_fin']").val().trim();

            var finicio_part = fecha_inicio.split("/");
            var ffin_part = fecha_fin.split("/");

            fecha_inicio = new Date(finicio_part[2], (finicio_part[1] - 1), finicio_part[0]);
            fecha_fin = new Date(ffin_part[2], (ffin_part[1] - 1), ffin_part[0]);

            var datos_alumno = $('#celdaDatosAlumno td');
            var datos_empresa = $('#celdaDatosEmpresa td');
            var datos_ct = $('#celdaDatosCT td');
            var datos_tutor = $('#celdaDatosTutor td');
            var res = {
                alumno: datos_alumno.eq(2).text().trim(),
                nif_alumno: datos_alumno.eq(1).text().trim(),
                empresa: datos_empresa.eq(1).text().trim(),
                dir_empresa: datos_empresa.eq(2).text().trim(),
                localidad: datos_ct.eq(2).text().trim(),
                ciclo: $('#seleccionCiclo option[selected]').text().trim(),
                grupo: datos_tutor.eq(2).text().trim(),
                tutor: datos_tutor.eq(1).text().trim(),
                instructor: $("input[name='instructor']").val().trim(),
                nif_instructor: $("input[name='dni_inst']").val().trim(),
                curso: $('#curso option[selected]').text().trim(),
                periodo: $('#periodo option[selected]').val().trim(),
                fecha_inicio: fecha_inicio,
                fecha_fin: fecha_fin,
                horas: $("input[name='fct_horas']").val().trim()

            };
            return res;
        } else {
            throw new Error("Error al obtener datos de la FCT del SAO");
        }
    })
};
