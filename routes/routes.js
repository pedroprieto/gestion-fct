// Build routes

module.exports = function(app) {
    app.defineRoute('home', '/api', 'home', 'Inicio');
    app.defineRoute('visits', '/api/users/:user/fcts/items/:fct/visits', 'visits', 'Visitas');
    app.defineRoute('visit', '/api/users/:user/fcts/items/:fct/visits/items/:visit', 'item', 'Visita');
    app.defineRoute('users', '/api/users');
    app.defineRoute('user', '/api/users/:user');
    app.defineRoute('fm34s', '/api/users/:user/fm34s', 'fm34s collection', 'FM34s');
    app.defineRoute('fm34sdocx', '/api/users/:user/fm34s/docx', 'document', 'FM34s DOCX', 'attachment');
    app.defineRoute('fm34', '/api/users/:user/fm34s/items/:fm34', 'fm34 item', 'FM34');
    app.defineRoute('fm34docx', '/api/users/:user/fm34s/items/:fm34/docx', 'fm34 item', 'FM34 DOCX', 'attachment');
    app.defineRoute('fcts', '/api/users/:user/fcts', 'fcts', 'Lista de FCTs');
    app.defineRoute('documentacion', '/api/users/:user/documentacion', 'documentacion collection', 'Documentación');
    app.defineRoute('certs_alumno', '/api/users/:user/fcts/certs_alumno', 'certs_alumno collection', 'Certificados de alumnos', 'attachment');
    app.defineRoute('certs_instructor', '/api/users/:user/fcts/certs_instructor', 'certs_instructor collection', 'Certificados de instructores', 'attachment');
    app.defineRoute('fm18s', '/api/users/:user/fcts/fm18s', 'fm18 collection', 'FM18s', 'attachment');
    app.defineRoute('cert_alumno', '/api/users/:user/fcts/items/:fct/cert_alumno', 'cert_alumno collection', 'Cert. alumno', 'attachment');
    app.defineRoute('cert_instructor', '/api/users/:user/fcts/items/:fct/cert_instructor', 'cert_instructor collection', 'Cert. instructor', 'attachment');
    app.defineRoute('fm18', '/api/users/:user/fcts/items/:fct/fm18', 'fm18 collection', 'FM18', 'attachment');
    app.defineRoute('fct', '/api/users/:user/fcts/items/:fct', 'item', 'FCT');
    app.defineRoute('login', '/api/login', 'url', 'Login');
    app.defineRoute('import_fcts', '/api/users/:user/import_fcts', 'url', 'Importar FCTs de SAO');

    // Templates para crear visitas
    app.defineRoute('template_visita', '/api/users/:user/fcts/items/:fct/visits/templates/:tipo', 'template visits', 'Crear visita');

    // Cliente
    app.defineRoute('cliente', '/client', 'cliente', 'Cliente');

    // Collection types
    app.defineRoute('type_mensajes', '/api/alps/gestion_fct_profile#mensajes', 'type', 'Collection tipo mensajes');
    app.defineRoute('type_visitas', '/api/alps/gestion_fct_profile#visitas', 'type', 'Collection tipo visitas');
    app.defineRoute('type_fcts', '/api/alps/gestion_fct_profile#fcts', 'type', 'Collection tipo fcts');

    
    
}
