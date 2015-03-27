var passport = require('passport');

module.exports = function(app) {

/**
 * GET página de login
 */
//    app.post(app.lookupRoute('visits'), passport.authenticate('local',{ session: false }), function(req, res) {


    app.get(app.lookupRoute('login'), function(req, res){
	//res.render('login', { user: req.user, message: req.flash('error') });
	res.send('login page');
    });
    
    // POST /login
    // Use passport.authenticate() as route middleware to authenticate the
    // request. If authentication fails, the user will be redirected back to the
    // login page. Otherwise, the primary route function function will be called,
    // which, in this example, will redirect the user to the home page.
    //
    // curl -v -d "username=bob&password=secret" http://127.0.0.1:3000/login
    
    app.post(app.lookupRoute('login'), passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login'}), function(req, res) {
    });
};
