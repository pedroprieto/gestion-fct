// Build routes

module.exports = function(app) {
    app.defineRoute('visits', '/users/:user/fcts/:fct/visits', 'visits', 'Lista de visitas');
    app.defineRoute('visit', '/users/:user/fcts/:fct/visits/:visit', 'item', 'Visita');
    app.defineRoute('users', '/users');
    app.defineRoute('user', '/users/:user');
    app.defineRoute('fm34s', '/users/:user/fm34s', 'fm34s collection', 'Conjunto de FM 34');
    app.defineRoute('fm34sdocx', '/users/:user/fm34s/docx', 'document', 'FM34 en formato DOCX');
    app.defineRoute('fm34', '/users/:user/fm34s/items/:fm34', 'fm34 item', 'FM 34');
    app.defineRoute('fcts', '/users/:user/fcts', 'fcts', 'Lista de FCTs del usuario');
    app.defineRoute('fct', '/users/:user/fcts/:fct', 'item', 'FCT');
    app.defineRoute('login', '/login', 'url', 'Login');
    app.defineRoute('import_fcts', '/users/:user/import_fcts', 'url', 'Importar FCTs de SAO');
    
    
}
