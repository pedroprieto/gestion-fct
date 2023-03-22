var expect = require('chai').expect;
var db = require('../db/db_dynamo');
let app = require('../index');
let { request, userName, cursoTest, periodoTest, testFCT } = require('../testdata/testdata');
const crypto = require('crypto');

let server;

describe('Crear FCT', function () {
    it('Acceso a recursos de otro usuario', async function () {
        let url = app.router.url('fcts', { user: 'usuarioDistinto'});
        server = app.startServer();
        try {
            let res = await request(url);
            expect(res).to.not.exist;
            expect(res.data).to.not.exist;
        } catch (error) {
            expect(error.response.status).to.equal(401);
        }
    });

    it('Get FCTs en API y borrado', async function () {
        this.timeout(15000);
        await db.clearTable();
        await db.addFCT(process.env.APP_USER, cursoTest, periodoTest, testFCT);

        let url = app.router.url('fcts', { user: process.env.APP_USER});
        server = app.startServer();

        // Petición a curso-período actual: solo devuelve mensaje
        // let res = await request(url);
        // expect(res.data.length).to.equal(0);;
        
        // Petición a curso-período de la FCT
        url = app.router.url('fcts', { user: process.env.APP_USER}, { query: { curso: cursoTest, periodo: periodoTest } });
        res = await request(url);
        expect(res.data).to.exist;
        expect(res.data.length).to.equal(1);

        let shasum = crypto.createHash('sha1');
        shasum.update(`${testFCT.nif_alumno}_${testFCT.empresa}`);
        let fctId = shasum.digest('hex');
        expect(res.data[0].id).to.equal(fctId);
        expect(res.data[0].href).to.equal(`/api/users/47061241K/fcts/items/2013-2014/5/${fctId}`);
        expect(res.data[0].hrefVisit).to.equal(`/api/users/47061241K/fcts/items/2013-2014/5/${fctId}/visits`);
        
        // Crear una nueva
        testFCT.empresa = "Otra empresa nueva";
        await db.addFCT(process.env.APP_USER, cursoTest, periodoTest, testFCT);
        // Petición a curso-período de la FCT
        url = app.router.url('fcts', { user: process.env.APP_USER}, { query: { curso: cursoTest, periodo: periodoTest } });
        res = await request(url);
        expect(res.data.length).to.equal(2);
        
        // Borrar FCT
        url = res.data[0].href;
        res = await request(url, {method: 'DELETE'});

        // Petición a curso-período de la FCT
        url = app.router.url('fcts', { user: process.env.APP_USER}, { query: { curso: cursoTest, periodo: periodoTest } });
        res = await request(url);
        expect(res.data.length).to.equal(1);
    });

    afterEach(async function () {
        if (server)
            await app.stopServer(server);
  });
});
