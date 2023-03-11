var expect = require('chai').expect;
var FCT = require('../newmodels/fct');
var db = require('../db/db');

let userName = "pedroprieto";
let cursoTest = "2013-2014";
let periodoTest = 5;

let testFCT = {
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
}


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
});
