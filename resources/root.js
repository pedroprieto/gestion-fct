
module.exports = function(app) {
    app.get("/", function(req, res) {
	//res.redirect(302, req.routeToPath('cliente'));
	res.redirect(302, req.routeToPath('fcts', {user: req.user.username}));
    });

}
