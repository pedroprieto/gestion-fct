var cps = require('../aux/cursoperiodofct');
const CJUtils = require('../aux/CJUtils.js');
const FCT = require("../newmodels/fct");
const db = require("../db/db");
var gendoc = require('../aux/generate_doc');
let groupByISOWeek = require('../aux/groupByISOWeek');

var fm34docfile = 'fm34';

module.exports = function (router) {
    router.get('fm34s', '/api/users/:user/fm34s', async (ctx, next) => {
        let col = CJUtils.CJ();

        // Query
        var ultimos_meses = ctx.request.query.mes;

        if (isNaN(ultimos_meses))
            ultimos_meses = 1;

        // Collection title
        if (ultimos_meses == 1) {
            col.title = "FM34 del último mes";
        } else {
            col.title = "FM34s de los últimos " + ultimos_meses + " meses";
        }

        // href
        col.href = router.url('fm34s', ctx.params);

        // Links
        col.links = [
            ctx.buildLink('fcts', 'Listado de FCTs', {}),
            ctx.buildLink('import_fcts', 'Importar FCTs'),
            ctx.buildLink('fm34s', 'FM34s'),
            ctx.buildLink('documentacion', 'Documentación', {}),
        ]

        var start = new Date();
        start.setMonth(start.getMonth() - ultimos_meses);
        // Elegimos el primer lunes
        start.setDate(start.getDate() - start.getDay() + 1)
        start.setHours(0);
        start.setMinutes(0);

        // Obtenemos visitas desde la fecha seleccionada
        let visits = await FCT.getVisitsByUserFromTo(ctx.state.user.name, start);

        let groups = groupByISOWeek(visits);

        // Items
        col.items = Object.entries(groups).map(([clave, data]) => {
            let item = {};
            item.data = [];
            item.links = []
            item.data.push({
                name: 'semanaDe',
                value: new Date(data.start).toLocaleDateString('es'),
                prompt: 'Semana de:'
            });

            item.data.push({
                name: 'semanaAl',
                value: new Date(data.end).toLocaleDateString('es'),
                prompt: 'Semana al:'
            });

            item.links.push(ctx.buildLink('fm34docx', 'FM34 DOCX', { fm34: clave }));
            return item;
        });

        // Queries
        col.queries = [];
        col.queries.push(
            {
                href: router.url('fm34s', ctx.params),
                rel: "search",
                name: "searchfm34",
                prompt: "Búsqueda de FM34s",
                data: [
                    {
                        name: "mes",
                        value: ctx.request.query.mes || "1",
                        prompt: "Últimos meses"
                    }
                ]
            }
        );


        ctx.body = { collection: col };

        return next();
    });


    router.get('fm34docx', '/api/users/:user/fm34s/items/:fm34/docx', async (ctx, next) => {
        let docfile = 'fm34';
	var filename = `${ctx.state.user.name}_${docfile}_${ctx.params.fm34}.docx`;
        
        let year = parseInt(ctx.params.fm34.substring(0,4));
        let week = parseInt(ctx.params.fm34.substring(5,7));
        var now = new Date();
        let start = now.fromWeek(week, year);
        let end = new Date(start);
        end.setDate(end.getDate() + 6);
        console.log(start);
        console.log(end);

        // Obtenemos visitas desde la fecha seleccionada
        let visits = await FCT.getVisitsByUserFromTo(ctx.state.user.name, start, end);
        console.log(visits);
        let groups = groupByISOWeek(visits);
        
        let tutor = "", ciclo = "";
        if (visits) {
            tutor = visits[0].tutor;
            //     ciclo = visits[0].ciclo;
        }
        
        let fm34s = Object.entries(groups).map(([clave, data]) => {
            return {
                semanaDe: data.start.toLocaleDateString('es'),
                semanaAl: data.end.toLocaleDateString('es'),
                tutor: tutor,
                ciclo: ciclo,
                visits: data.visits
            }
        });
        console.log(fm34s);

	var doc= {
	    fm34s: JSON.parse(JSON.stringify(fm34s, function(key, value) {
                if (key == 'fecha') {
                    return new Date(value).toLocaleDateString('es');
                }
                return value;
            }))
	};
        let certificado = gendoc(doc, docfile);
        

        ctx.body = certificado;
        ctx.response.attachment(filename);
        return next();
    });
}
