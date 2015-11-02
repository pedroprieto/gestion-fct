requirejs.config({
    "baseUrl": "js/lib",
    "paths": {
	"app": "../app",
	"jquery": "http://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min",
	"materialize": "http://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.1/js/materialize.min"
    },
    shim: {
        'materialize': {
            deps: ['jquery']
        },
        'jquery': {
            exports: '$'
        }
    }
});

// Load the main app module to start the app
requirejs(["app/main"]);
