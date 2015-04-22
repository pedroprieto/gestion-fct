// Build routes

module.exports = function(app) {
    app.defineRoute('visits', '/visits', 'collection', 'Lista de visitas');
    app.defineRoute('visit', '/visits/:id', 'item', 'Visita');
    app.defineRoute('users', '/users');
    app.defineRoute('user', '/users/:user');
    app.defineRoute('fm34s', '/fm34s');
    app.defineRoute('fm34', '/fm34s/items/:id');
    app.defineRoute('fcts', '/users/:user/fcts');
    app.defineRoute('fct', '/fcts/:id');
    app.defineRoute('login', '/login', 'url', 'Login');
    app.defineRoute('import_fcts', '/import_fcts', 'url', 'Importar FCTs de SAO');
    
    
}
