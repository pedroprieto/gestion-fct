
module.exports = function(app) {
    app.get(app.lookupRoute('home'), function(req, res) {
	res.redirect(302, req.routeToPath('fcts', {user: req.user.username}));
    });

}
