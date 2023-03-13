var expect = require('chai').expect;
var FCT = require('../newmodels/fct');
var db = require('../db/db');
let app = require('../index');
let { request, userName, cursoTest, periodoTest, testFCT, testTemplateVisit, testTemplateVisitInicial } = require('../testdata/testdata');
let groupByISOWeek = require('../aux/groupByISOWeek');
require('../aux/weeknumber');

let server;

// 2015W19
var v1 = {
    empresa: 'empresa1',
    tipo: 'inicial',
    distancia: 30,
    fecha: new Date(2015, 4, 8),
    hora_salida: '09:00',
    hora_regreso: '11:00',
    localidad: 'localidad test 1',
    impresion: 'texto impresión test 1',
    presencial: true
};

//2015W19
var v2_same_date = {
    empresa: 'empresa1',
    tipo: 'seguimiento',
    distancia: 30,
    fecha: new Date(2015, 4, 8),
    hora_salida: '09:00',
    hora_regreso: '11:00',
    localidad: 'localidad test 1',
    impresion: 'texto impresión test 2',
    presencial: true
};

//2015W19
var v3_other_hour = {
    empresa: 'empresa3',
    tipo: 'final',
    distancia: 30,
    fecha: new Date(2015, 4, 8),
    hora_salida: '15:00',
    hora_regreso: '17:00',
    localidad: 'localidad test 3',
    impresion: 'texto impresión test 3',
    presencial: true
};

//2015W19
var v4_same_week = {
    empresa: 'empresa4',
    tipo: 'inicial',
    distancia: 30,
    fecha: new Date(2015, 4, 5),
    hora_salida: '15:00',
    hora_regreso: '17:00',
    localidad: 'localidad test 4',
    impresion: 'texto impresión test 4',
    presencial: true
};

//2015W15
var v5_other_week = {
    empresa: 'empresa5',
    tipo: 'seguimiento',
    distancia: 30,
    fecha: new Date(2015, 3, 8),
    hora_salida: '15:00',
    hora_regreso: '17:00',
    localidad: 'localidad test 5',
    impresion: 'texto impresión test 5',
    presencial: true
};

//2015W19
var v6_same_week = {
    empresa: 'empresa6',
    tipo: 'final',
    distancia: 30,
    fecha: new Date(2015, 4, 7),
    hora_salida: '15:00',
    hora_regreso: '17:00',
    localidad: 'localidad test 6',
    impresion: 'texto impresión test 6',
    presencial: true
};

var result = {
    "2015W15": {
        start: new Date("2015-04-06"),
        end: new Date("2015-04-12"),
        visits: [
            {
                empresa: 'empresa5',
                tipo: ['seguimiento'],
                distancia: 30,
                fecha: new Date(2015, 3, 8),
                hora_salida: '15:00',
                hora_regreso: '17:00',
                localidad: 'localidad test 5',
                impresion: 'texto impresión test 5',
                presencial: true
            }
        ]
    },
    "2015W19": {
        start: new Date("2015-05-04"),
        end: new Date("2015-05-10"),
        visits: [
            {
                empresa: 'empresa4',
                tipo: ['inicial'],
                distancia: 30,
                fecha: new Date(2015, 4, 5),
                hora_salida: '15:00',
                hora_regreso: '17:00',
                localidad: 'localidad test 4',
                impresion: 'texto impresión test 4',
                presencial: true
            },
            {
                empresa: 'empresa6',
                tipo: ['final'],
                distancia: 30,
                fecha: new Date(2015, 4, 7),
                hora_salida: '15:00',
                hora_regreso: '17:00',
                localidad: 'localidad test 6',
                impresion: 'texto impresión test 6',
                presencial: true
            },
            {
                empresa: 'empresa1',
                tipo: ['inicial', 'seguimiento'],
                distancia: 30,
                fecha: new Date(2015, 4, 8),
                hora_salida: '09:00',
                hora_regreso: '11:00',
                localidad: 'localidad test 1',
                impresion: 'texto impresión test 1',
                presencial: true

            },
            {
                empresa: 'empresa3',
                tipo: ['final'],
                distancia: 30,
                fecha: new Date(2015, 4, 8),
                hora_salida: '15:00',
                hora_regreso: '17:00',
                localidad: 'localidad test 3',
                impresion: 'texto impresión test 3',
                presencial: true
            }
        ]
    }
}

describe('FM34s', function () {
    it('Agrupación de visitas por semana y año', async function () {
        let visits = [v1, v2_same_date, v3_other_hour, v4_same_week, v5_other_week, v6_same_week];
        let res = groupByISOWeek(visits);
        expect(res).to.deep.equal(result);
    });

    it('Crear visita y comprobar FM34', async function () {
        db.clearDB();
        let fct = FCT.createFCT(testFCT, userName);
        await fct.save();

        let fcts = await FCT.getFCTSByUsuarioCursoPeriodo(userName, cursoTest, periodoTest);
        let url = app.router.url('visits', { user: userName, fct: fcts[0].id });

        server = app.startServer();
        let templateVisit = JSON.parse(JSON.stringify(testTemplateVisitInicial));
        let d = new Date();
        // 3 meses antes
        d.setMonth(d.getMonth() - 3);
        templateVisit.template.data[2].value = d.toISOString();
        let start = new Date(d);
        let end = new Date(d);
        start.setDate(start.getDate() - start.getDay() + 1);
        end.setDate(end.getDate() - end.getDay() + 7);
        let isoweek = `${start.getWeekYear()}W${start.getWeek()}`;


        let res = await request(url, { method: 'POST', data: templateVisit });
        expect(res.status).to.equal(201);

        url = app.router.url('fm34s', { user: userName });
        res = await request(url);
        expect(res.status).to.equal(200);
        expect(res.data.collection.items.length).to.equal(0);
        url = app.router.url('fm34s', { user: userName }, { query: { mes: 5 } });
        res = await request(url);
        expect(res.status).to.equal(200);
        expect(res.data.collection.items.length).to.equal(1);
        expect(res.data.collection.items[0].data[0].value).to.equal(start.toLocaleDateString('es'));
        expect(res.data.collection.items[0].data[1].value).to.equal(end.toLocaleDateString('es'));
        expect(res.data.collection.items[0].links[0].href).to.equal(app.router.url('fm34docx', { user: userName, fm34: isoweek }));
    });

    afterEach(async function () {
        if (server)
            await app.stopServer(server);
    });
});
