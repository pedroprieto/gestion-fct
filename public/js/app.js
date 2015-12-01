requirejs.config({
    "baseUrl": "js/lib",
    "paths": {
	"app": "../app",
	"jquery": "jquery-1.11.3.min",
	'hammerjs': 'hammer-2.0.4.min',
	'datepicker': 'picker',
	'datepickerdate': 'picker.date',
	'datepickertime': 'picker.time',
	'datepicker_es': 'pickadate_es_ES',
	"materialize": "materialize-0.97.3.min",
	"jquery-hammer": "jquery.hammer"
    },
    shim: {
	'datepicker_es': {
	    deps: ['datepicker', 'datepickerdate', 'datepickertime']
	},
        'materialize': {
            deps: ['jquery','jquery-hammer','datepicker_es']
        },
        'jquery': {
            exports: '$'
        }
    }
});

// Load the main app module to start the app
requirejs(["app/main"]);
