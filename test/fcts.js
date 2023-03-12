var expect = require('chai').expect;
var FCT = require('../newmodels/fct');
var db = require('../db/db');
let app = require('../index');
let { request, userName, cursoTest, periodoTest, testFCT } = require('../testdata/testdata');

let server;

describe('Crear FCT', function () {

    it('Debe crearse la FCT correctamente', async function () {
        db.clearDB();
        let fct = FCT.createFCT(testFCT, userName);
        expect(fct.usuario).to.equal(userName);
        await fct.save();
        expect((await FCT.getFCTSByUsuarioCursoPeriodo('wronguser', cursoTest, periodoTest)).length).to.equal(0);
        expect((await FCT.getFCTSByUsuarioCursoPeriodo(userName, 'wrongcurso', periodoTest)).length).to.equal(0);
        expect((await FCT.getFCTSByUsuarioCursoPeriodo(userName, cursoTest, 'wrongperiodo')).length).to.equal(0);
        expect((await FCT.getFCTSByUsuarioCursoPeriodo(userName, cursoTest, periodoTest)).length).to.equal(1);
    });

    it('Borrar FCT', async function () {
        db.clearDB();
        let fct = FCT.createFCT(testFCT, userName);
        expect(fct.usuario).to.equal(userName);
        await fct.save();
        fct.alumno = "nuevo";
        await fct.save();
        let fcts = await FCT.getFCTSByUsuarioCursoPeriodo(userName, cursoTest, periodoTest);
        expect(fcts.length).to.equal(2);
        await fcts[0].delete();
        expect((await FCT.getFCTSByUsuarioCursoPeriodo(userName, cursoTest, periodoTest)).length).to.equal(1);
    });


    it('Get FCTs en API', async function () {
        db.clearDB();
        let fct = FCT.createFCT(testFCT, userName);
        expect(fct.usuario).to.equal(userName);
        await fct.save();
        let url = app.router.url('fcts', { user: userName });
        server = app.startServer();

        // Petición a curso-período actual: solo devuelve mensaje
        let res = await request(url);
        expect(res.data.collection).to.exist;
        expect(res.data.collection.items.length).to.equal(1);
        expect(res.data.collection.items[0].data.length).to.equal(1);
        expect(res.data.collection.items[0].data[0].name).to.equal('mensaje');

        // Petición a curso-período de la FCT
        url = app.router.url('fcts', { user: userName }, { query: { curso: cursoTest, periodo: periodoTest } });
        res = await request(url);
        expect(res.data.collection).to.exist;

        expect(res.data.collection.items.length).to.equal(1);
        expect(res.data.collection.items[0].data.length).to.equal(7);
        expect(res.data.collection.items[0].data[0].name).to.not.equal('mensaje');
        expect(res.data.collection.items[0].data.find(d => d.name == 'empresa').value).to.equal(testFCT.empresa);
        expect(res.data.collection.items[0].links.length).to.equal(5);
    });

    it.only('Borrar FCT en API', async function () {
        db.clearDB();
        let fct = FCT.createFCT(testFCT, userName);
        await fct.save();
        let fcts = await FCT.getFCTSByUsuarioCursoPeriodo(userName, cursoTest, periodoTest);
        expect(fcts.length).to.equal(1);
        let url = app.router.url('fct', { user: userName, fct: fcts[0].id});
        server = app.startServer();
        res = await request(url, {method: 'DELETE'});
        expect(res.status).to.equal(200);

        expect((await FCT.getFCTSByUsuarioCursoPeriodo(userName, cursoTest, periodoTest)).length).to.equal(0);
    });

    after(async function () {
        // Cerrar servidor
        await app.stopServer(server);
    });
});
