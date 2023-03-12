var expect = require('chai').expect;
var FCT = require('../newmodels/fct');
var db = require('../db/db');
let app = require('../index');
let { request, userName, cursoTest, periodoTest, testFCT, testVisit } = require('../testdata/testdata');

let server;

describe('Crear Visita en FCT', function () {
    
    it('Debe crearse la visita en API correctamente', async function () {
        db.clearDB();
        let fct = FCT.createFCT(testFCT, userName);
        await fct.save();
        
        let fcts = await FCT.getFCTSByUsuarioCursoPeriodo(userName, cursoTest, periodoTest);
        let url = app.router.url('visits', { user: userName, fct: fcts[0].id});

        server = app.startServer();
        res = await request(url, {method: 'POST', data: testVisit});
        expect(res.status).to.equal(201);

        let fctWithVisits = await FCT.getFCTConVisitasById(fcts[0].id);
        expect(fctWithVisits.visitas.length).to.equal(1);
        await app.stopServer(server);
    });
    
    it('Borrar Visita en API', async function () {
        db.clearDB();
        let fct = FCT.createFCT(testFCT, userName);
        await fct.save();
        
        let fcts = await FCT.getFCTSByUsuarioCursoPeriodo(userName, cursoTest, periodoTest);
        let url = app.router.url('visits', { user: userName, fct: fcts[0].id});

        server = app.startServer();
        res = await request(url, {method: 'POST', data: testVisit});
        expect(res.status).to.equal(201);

        res = await request(url, {method: 'POST', data: testVisit});
        expect(res.status).to.equal(201);

        let fctWithVisits = await FCT.getFCTConVisitasById(fcts[0].id);
        expect(fctWithVisits.visitas.length).to.equal(2);
        
        url = app.router.url('visit', { user: userName, fct: fcts[0].id, visit: fctWithVisits.visitas[0].id});
        res = await request(url, {method: 'DELETE'});
        expect(res.status).to.equal(200);
        
        fctWithVisits = await FCT.getFCTConVisitasById(fcts[0].id);
        expect(fctWithVisits.visitas.length).to.equal(1);
        await app.stopServer(server);
    });
    
    afterEach(async function () {
        if (server)
            await app.stopServer(server);
  });
});
