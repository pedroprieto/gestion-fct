var expect = require('chai').expect;
var db = require('../db/db_dynamo');
let app = require('../index');
let { request, userName, cursoTest, periodoTest, testFCT } = require('../testdata/testdata');

let server;

describe('Crear FCT', function () {
    it('Get FCTs en API y borrado', async function () {
        this.timeout(15000);
        await db.clearTable();
        await db.addFCT(process.env.APP_USER, cursoTest, periodoTest, testFCT);

        let url = app.router.url('fcts', { user: process.env.APP_USER});
        server = app.startServer();

        // Petición a curso-período actual: solo devuelve mensaje
        let res = await request(url);
        expect(res.data.length).to.equal(0);;
        
        // Petición a curso-período de la FCT
        url = app.router.url('fcts', { user: process.env.APP_USER}, { query: { curso: cursoTest, periodo: periodoTest } });
        res = await request(url);
        expect(res.data).to.exist;
        expect(res.data.length).to.equal(1);
        expect(res.data[0].id).to.equal('47061241K_2013-2014_5*123456789k_empresa test_FCT');
        expect(res.data[0].href).to.equal('/api/users/47061241K/fcts/items/2013-2014/5/123456789k/empresa%20test');
        expect(res.data[0].hrefVisit).to.equal('/api/users/47061241K/fcts/items/2013-2014/5/123456789k/empresa%20test/visits');
        
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
