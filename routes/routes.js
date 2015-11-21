// Build routes

module.exports = function(app) {
    app.defineRoute('home', '/api', 'home', 'Inicio');
    app.defineRoute('visits', '/api/users/:user/fcts/items/:fct/visits', 'visits', 'Lista de visitas');
    app.defineRoute('visit', '/api/users/:user/fcts/items/:fct/visits/items/:visit', 'item', 'Visita');
    app.defineRoute('users', '/api/users');
    app.defineRoute('user', '/api/users/:user');
    app.defineRoute('fm34s', '/api/users/:user/fm34s', 'fm34s collection', 'Conjunto de FM 34');
    app.defineRoute('fm34sdocx', '/api/users/:user/fm34s/docx', 'document', 'FM34 en formato DOCX', 'attachment');
    app.defineRoute('fm34', '/api/users/:user/fm34s/items/:fm34', 'fm34 item', 'FM 34');
    app.defineRoute('fm34docx', '/api/users/:user/fm34s/items/:fm34/docx', 'fm34 item', 'FM 34 en formato DOCX', 'attachment');
    app.defineRoute('fcts', '/api/users/:user/fcts', 'fcts', 'Lista de FCTs del usuario');
    app.defineRoute('certs_alumno', '/api/users/:user/fcts/certs_alumno', 'certs_alumno collection', 'Lista de certificados del alumno', 'attachment');
    app.defineRoute('certs_instructor', '/api/users/:user/fcts/certs_instructor', 'certs_instructor collection', 'Lista de certificados del instructor', 'attachment');
    app.defineRoute('fm18s', '/api/users/:user/fcts/fm18s', 'fm18 collection', 'Lista de FM 18', 'attachment');
    app.defineRoute('fct', '/api/users/:user/fcts/items/:fct', 'item', 'FCT');
    app.defineRoute('login', '/api/login', 'url', 'Login');
    app.defineRoute('import_fcts', '/api/users/:user/import_fcts', 'url', 'Importar FCTs de SAO');

    // Templates para crear visitas
    app.defineRoute('template_visita', '/api/users/:user/fcts/items/:fct/visits/templates/:tipo', 'template visits', 'Crear visita');

    // Cliente
    app.defineRoute('cliente', '/client', 'cliente', 'Cliente');

    // Collection types
    app.defineRoute('type_mensajes', '/api/alps/gestion_fct_profile#mensajes', 'type', 'Collection tipo mensajes');

    
    
}
