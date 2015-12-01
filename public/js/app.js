requirejs.config({
    "baseUrl": "js/lib",
    "paths": {
	"app": "../app",
	"jquery": "jquery-1.11.3.min",
	'hammerjs': 'hammer-2.0.4.min',
	"materialize": "materialize-0.97.3.min",
	"jquery-hammer": "jquery.hammer"
    },
    shim: {
        'materialize': {
            deps: ['jquery','jquery-hammer']
        },
        'jquery': {
            exports: '$'
        }
    }
});

// Load the main app module to start the app
requirejs(["app/main"]);
