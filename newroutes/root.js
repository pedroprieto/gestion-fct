
module.exports = function(router) {
    router.get('/api', (ctx, next) => {
        // ctx.body = 'Hello World!';
        // console.log(ctx.state.user);
	ctx.redirect(router.url('fcts', {user: ctx.state.user.name}), 302);
    });
}
