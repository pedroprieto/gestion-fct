// Build routes

module.exports = function(app) {
    app.defineRoute('visits', '/users/:user/fcts/items/:fct/visits', 'visits', 'Lista de visitas');
    app.defineRoute('visit', '/users/:user/fcts/items/:fct/visits/items/:visit', 'item', 'Visita');
    app.defineRoute('users', '/users');
    app.defineRoute('user', '/users/:user');
    app.defineRoute('fm34s', '/users/:user/fm34s', 'fm34s collection', 'Conjunto de FM 34');
    app.defineRoute('fm34sdocx', '/users/:user/fm34s/docx', 'document', 'FM34 en formato DOCX');
    app.defineRoute('fm34', '/users/:user/fm34s/items/:fm34', 'fm34 item', 'FM 34');
    app.defineRoute('fcts', '/users/:user/fcts', 'fcts', 'Lista de FCTs del usuario');
    app.defineRoute('certs_alumno', '/users/:user/fcts/certs_alumno', 'certs_alumno collection', 'Lista de certificados del alumno');
    app.defineRoute('certs_instructor', '/users/:user/fcts/certs_instructor', 'certs_instructor collection', 'Lista de certificados del instructor');
    app.defineRoute('fm18s', '/users/:user/fcts/fm18s', 'fm18 collection', 'Lista de FM 18');
    app.defineRoute('fct', '/users/:user/fcts/items/:fct', 'item', 'FCT');
    app.defineRoute('login', '/login', 'url', 'Login');
    app.defineRoute('import_fcts', '/users/:user/import_fcts', 'url', 'Importar FCTs de SAO');

    // Templates para crear visitas
    app.defineRoute('template_visita', '/users/:user/fcts/items/:fct/visits/templates/:tipo', 'template visits', 'Crear visita');

    
    
}
