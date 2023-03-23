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
    testVisit: {
        tipo: "adicional",
        distancia: 30,
        fecha: new Date().toISOString(),
        hora_salida: "11:00",
        hora_regreso: "12:00",
        localidad: "Localidad test",
        impresion: "Impresión de la visita test",
        presencial: true
    },
}
