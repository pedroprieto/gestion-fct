/*!
 * express-named-routes
 * Copyright(c) 2012 RGBboy <me@rgbboy.com>
 * MIT Licensed
 */
/**
 * Library version.
 */

/* Modified by Pedro Prieto to support link generation in CJ format

 */
exports.version = '0.0.9';
/**
 * Add named routes functionality to `app`.
 *
 * @param {express.HTTPServer} app
 * @api public
 */
exports.extend = function (app) {
    var namedRoutes = {},
	defineRoute,
	lookupRoute,
	buildLink;
    /**
     * Define a route;
     *
     * @param {String} routeName (the name of the route)
     * @param {String|Object} route, can be a string or another namedRoutes object
     * @param {String} rel (link relation of the route)
     * @param {String} prompt (text to display with the link)
     * @return {Application} for chaining
     * @api public
     */
    defineRoute = function (routeName, route, rel, prompt) {
	namedRoutes[routeName] = {
	    route: route,
	    rel: rel,
	    prompt: prompt
	};
	return app;
    };
    /**
     * Lookup a route;
     *
     * If routeName references an object of routes it will return routeName.index
     *
     * @param {String} routeName (optional)
     * @return {String|Object}
     * @api public
     */
    lookupRoute = function (routeName) {
	// If no argument, return namedRoutes object;
	if (!routeName) {
	    return namedRoutes;
	}
	var route = resolve(namedRoutes, routeName);
	if(!route) {
	    throw new Error('Route "' + routeName + '" Does Not Exist');
	}
	return route.route;
    };
    /**
     * Build a CJ link;
     *
     * takes a routeName and returns a resolved path using
     * the object passed in.
     *
     * If routeName references an object of routes it will return routeName.index
     *
     * @param {String} routeName (optional)
     * @param {Object} params (optional)
     * @return {Object}
     * @api public
     */
    buildLink = function (routeName, params) {
	// If no argument, return error
	if (!routeName) {
	    throw new Error('No route name specified');
	}
	var route = resolve(namedRoutes, routeName);
	if(!route) {
	    throw new Error('Route "' + routeName + '" Does Not Exist');
	}

	link = {};
	url = route.route;
	for (key in params) {
	    url = url.replace('/:' + key, '/' + params[key]);
	}
	
	link.href = url;
	link.rel = route.rel;
	link.prompt = route.prompt;
	
	return link;
    };

    
    app.defineRoute = defineRoute;
    app.lookupRoute = lookupRoute;
    app.buildLink = buildLink;
    return app; // for chaining;
};

/**
 * Resolves a nested property lookup
 *
 * @param {Object} obj
 * @param {String} string
 * @return {Object|String}
 * @api private
 */
function resolve (obj, string) {
    var resolution = obj,
	i;
    string = string.split('.');
    for (i = 0; i < string.length; i += 1) {
	resolution = resolution[string[i]];
	if (!resolution) {
	    return;
	}
    }
    return resolution;
}
