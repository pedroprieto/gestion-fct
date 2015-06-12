
module.exports = function(app) {
    app.get("/", function(req, res) {
	res.redirect(302, req.routeToPath('cliente'));
    });

}
