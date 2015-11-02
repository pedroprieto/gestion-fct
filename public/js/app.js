requirejs.config({
    "baseUrl": "js/lib",
    "paths": {
	"app": "../app",
	"jquery": "http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min",
	'hammerjs': 'https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.4/hammer.min',
	"materialize": "http://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.1/js/materialize.min",
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
