let periodoTest = '5';
let cursoTest = '2013-2014';
let axios = require('axios');

module.exports = {
    request: axios.create({
        baseURL: 'http://localhost:3000',
        auth: {
            username: process.env.APP_USER,
            password: process.env.APP_PASSWORD
        }
    }),
    userName: "47061241K",
    cursoTest: cursoTest,
    periodoTest: periodoTest,
    testFCT: {
        alumno: "alumno test",
        nif_alumno: "123456789k",
        empresa: "empresa test",
        dir_empresa: "dir_empresa_test",
        localidad: "localidad test",
        ciclo: "ciclo test",
        grupo: "grupo test",
        tutor: "tutor test",
        instructor: "instructor test",
        nif_instructor: "987654321e",
        curso: cursoTest,
        periodo: periodoTest,
        fecha_inicio: "2023-03-11",
        fecha_fin: "2023-06-30",
        horas: 400
    },
    visit_test: {
        template: {
            data: [
                { name: "tipo", value: "inicial" },
                { name: "distancia", value: "30" },
                { name: "fecha", value: new Date().toString() },
                { name: "hora_salida", value: "11:00" },
                { name: "hora_regreso", value: "12:00" },
                { name: "localidad", value: "Localidad test" },
                { name: "impresion", value: "Impresión de la visita test" },
                { name: "presencial", value: "true" }
            ]
        }
    }
}
