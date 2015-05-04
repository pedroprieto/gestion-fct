// Build routes

module.exports = function(app) {
    app.defineRoute('visits', '/users/:user/fcts/:fct/visits', 'visits', 'Lista de visitas');
    app.defineRoute('visit', '/users/:user/fcts/:fct/visits/:visit', 'item', 'Visita');
    app.defineRoute('users', '/users');
    app.defineRoute('user', '/users/:user');
    app.defineRoute('fm34s', '/fm34s');
    app.defineRoute('fm34', '/fm34s/items/:id');
    app.defineRoute('fcts', '/users/:user/fcts', 'fcts', 'Lista de FCTs del usuario');
    app.defineRoute('fct', '/users/:user/fcts/:fct', 'item', 'FCT');
    app.defineRoute('login', '/login', 'url', 'Login');
    app.defineRoute('import_fcts', '/users/:user/import_fcts', 'url', 'Importar FCTs de SAO');
    
    
}
