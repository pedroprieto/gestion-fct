module.exports = function(app) {
    app.defineRoute('visits', '/visits');
    app.defineRoute('visit', '/visits/:id');
    app.defineRoute('users', '/users');
    app.defineRoute('user', '/users/:id');
    app.defineRoute('fm34s', '/fm34s');
    app.defineRoute('fm34', '/fm34s/items/:id');
    app.defineRoute('fcts', '/fcts');
    app.defineRoute('fct', '/fcts/:id');
    
    
}
