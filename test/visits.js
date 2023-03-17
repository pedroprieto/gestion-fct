var expect = require('chai').expect;
var db = require('../db/db_dynamo');
let app = require('../index');
let { request, userName, cursoTest, periodoTest, testFCT, testVisit } = require('../testdata/testdata');

let server;

describe('Crear visitas, duplicados y borrar FCT con visitas', function () {
    it('Crear visitas', async function () {
        this.timeout(15000);
        await db.clearTable();
        await db.addFCT(process.env.APP_USER, cursoTest, periodoTest, testFCT);

        let url = app.router.url('fcts', { user: process.env.APP_USER});
        server = app.startServer();

        // Petición a curso-período de la FCT
        url = app.router.url('fcts', { user: process.env.APP_USER}, { query: { curso: cursoTest, periodo: periodoTest } });
        res = await request(url);
        expect(res.data).to.exist;
        expect(res.data.length).to.equal(1);
        
        
        // Crear visita
        let urlVisits = res.data[0].hrefVisit;
        res = await request(urlVisits, {method: 'POST', data: testVisit});

        // Petición a curso-período de la FCT
        url = app.router.url('fcts', { user: process.env.APP_USER}, { query: { curso: cursoTest, periodo: periodoTest } });
        res = await request(url);
        expect(res.data).to.exist;
        expect(res.data.length).to.equal(2);
        let f = res.data.find(el => el.type=='FCT');
        let v = res.data.find(el => el.type=='VIS');
        expect(f).to.exist;
        expect(v).to.exist;
        expect(v.fctId).to.equal(f.id);
        
        // Nueva visita
        let otraVisita = JSON.parse(JSON.stringify(testVisit));
        otraVisita.tipo = 'inicial';
        res = await request(urlVisits, {method: 'POST', data: otraVisita});
        url = app.router.url('fcts', { user: process.env.APP_USER}, { query: { curso: cursoTest, periodo: periodoTest } });
        res = await request(url);
        expect(res.data).to.exist;
        expect(res.data.length).to.equal(3);
        
        // No se deben crear visitas del mismo tipo (inicial)
        try {
            res = await request(urlVisits, {method: 'POST', data: otraVisita});
            url = app.router.url('fcts', { user: process.env.APP_USER}, { query: { curso: cursoTest, periodo: periodoTest } });
            res = await request(url);
            expect(res).to.not.exist;
        } catch (error) {
            expect(error.response.status).to.equal(400);
        }
        
        res = await request(url);
        expect(res.data).to.exist;
        expect(res.data.length).to.equal(3);

        // Sí que se debe crear otra visita de tipo adicional
        otraVisita.tipo = 'adicional';
        res = await request(urlVisits, {method: 'POST', data: otraVisita});
        url = app.router.url('fcts', { user: process.env.APP_USER}, { query: { curso: cursoTest, periodo: periodoTest } });
        res = await request(url);
        expect(res.data).to.exist;
        expect(res.data.length).to.equal(4);
        
        // // Borrar FCT con visitas
        url = res.data[0].href;
        res = await request(url, {method: 'DELETE'});
        
        // // Petición a curso-período de la FCT
        url = app.router.url('fcts', { user: process.env.APP_USER}, { query: { curso: cursoTest, periodo: periodoTest } });
        res = await request(url);
        expect(res.data.length).to.equal(0);
    });
    
    it('Borrar Visita en API', async function () {
        this.timeout(15000);
        await db.clearTable();
        
        await db.addFCT(process.env.APP_USER, cursoTest, periodoTest, testFCT);
        server = app.startServer();

        // Petición a curso-período de la FCT
        let url = app.router.url('fcts', { user: process.env.APP_USER}, { query: { curso: cursoTest, periodo: periodoTest } });
        res = await request(url);
        expect(res.data).to.exist;
        expect(res.data.length).to.equal(1);
        let fct = res.data[0];
        
        // Crear visita
        let urlVisits = fct.hrefVisit;
        res = await request(urlVisits, {method: 'POST', data: testVisit});
        res = await request(url);
        expect (res.data.length).to.equal(2);
        let visit = res.data.find(it => it.type == 'VIS');
        res = await request(visit.href, { method: 'DELETE' });
        expect(res.status).to.equal(200);
        res = await request(url);
        expect(res.data).to.exist;
        expect(res.data.length).to.equal(1);
        expect(res.data.find(it => it.type == 'VIS')).to.not.exist;
        expect(res.data.find(it => it.type == 'FCT')).to.exist;
    });

    it('Actualizar visita en API', async function () {
        this.timeout(15000);
        await db.clearTable();
        
        await db.addFCT(process.env.APP_USER, cursoTest, periodoTest, testFCT);
        server = app.startServer();

        // Petición a curso-período de la FCT
        let url = app.router.url('fcts', { user: process.env.APP_USER}, { query: { curso: cursoTest, periodo: periodoTest } });
        res = await request(url);
        expect(res.data).to.exist;
        expect(res.data.length).to.equal(1);
        let fct = res.data[0];
        
        // Crear visita
        let urlVisits = fct.hrefVisit;
        res = await request(urlVisits, {method: 'POST', data: testVisit});
        res = await request(url);
        expect (res.data.length).to.equal(2);
        let visit = res.data.find(it => it.type == 'VIS');
        let visitData = JSON.parse(JSON.stringify(testVisit));
        let nuevaDistancia = 50;
        visitData.distancia = nuevaDistancia;
        let nuevaFecha = new Date("2020-01-02").toISOString();
        visitData.fecha = nuevaFecha;
        let nuevaImpresion = "nueva impresión";
        visitData.impresion = nuevaImpresion;
        let nuevaHoraSalida = "13:00";
        visitData.hora_salida = nuevaHoraSalida;
        let nuevaHoraRegreso = "18:00";
        visitData.hora_regreso= nuevaHoraRegreso;
        let nuevaLocalidad = "nueva localidad"
        visitData.localidad = nuevaLocalidad;
        let nuevoPresencial = false;
        visitData.presencial = nuevoPresencial;
        res = await request(visit.href, { method: 'PUT', data: visitData });
        expect(res.status).to.equal(200);
        res = await request(url);
        expect(res.data).to.exist;
        expect(res.data.length).to.equal(2);
        let actualizada = res.data.find(it => it.type == 'VIS');
        expect(actualizada).to.exist;
        expect(actualizada.localidad).to.equal(nuevaLocalidad);
        expect(actualizada.fecha).to.equal(nuevaFecha);
        expect(actualizada.distancia).to.equal(nuevaDistancia);
        expect(actualizada.hora_salida).to.equal(nuevaHoraSalida);
        expect(actualizada.hora_regreso).to.equal(nuevaHoraRegreso);
        expect(actualizada.presencial).to.equal(nuevoPresencial);
        expect(actualizada.impresion).to.equal(nuevaImpresion);

    });

    // Visitas relacionadas
    it('Visitas relacionadas', async function () {
        this.timeout(15000);
        await db.clearTable();
        await db.addFCT(process.env.APP_USER, cursoTest, periodoTest, testFCT);
        testFCT.nif_alumno = "nuevoNif1";
        await db.addFCT(process.env.APP_USER, cursoTest, periodoTest, testFCT);
        testFCT.nif_alumno = "nuevoNif2";
        await db.addFCT(process.env.APP_USER, cursoTest, periodoTest, testFCT);

        server = app.startServer();

        // Petición a curso-período de la FCT
        url = app.router.url('fcts', { user: process.env.APP_USER}, { query: { curso: cursoTest, periodo: periodoTest } });
        res = await request(url);
        expect(res.data).to.exist;
        expect(res.data.length).to.equal(3);
        let [fct1, fct2, fct3] = res.data;
        
        
        // Crear visita relacionada: fct1 y fct3
        let urlVisits = fct1.hrefVisit;
        let visit = JSON.parse(JSON.stringify(testVisit));
        visit.related = [fct3.id];
        res = await request(urlVisits, {method: 'POST', data: visit});

        // Petición a curso-período de la FCT
        url = app.router.url('fcts', { user: process.env.APP_USER}, { query: { curso: cursoTest, periodo: periodoTest } });
        res = await request(url);
        expect(res.data).to.exist;
        expect(res.data.length).to.equal(5);
        let visits = res.data.filter(it => it.type == 'VIS');
        expect(visits.length).to.equal(2);
        expect(visits.find(v => v.fctId == fct1.id)).to.exist;
        expect(visits.find(v => v.fctId == fct2.id)).to.not.exist;
        expect(visits.find(v => v.fctId == fct3.id)).to.exist;

    });

    afterEach(async function () {
        if (server)
            await app.stopServer(server);
  });
});
