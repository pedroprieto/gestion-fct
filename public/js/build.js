({
    "baseUrl": "./lib",
    "paths": {
	"app": "..",
	"jquery": "jquery-1.11.3.min",
	"ractive": "ractive.min",
	"ractive.load": "ractive-load.min",
	"rvc": "rvc",
	"ui": "../components",
	'hammerjs': 'hammer-2.0.4.min',
	'datepicker': 'picker',
	'datepickerdate': 'picker.date',
	'datepickertime': 'picker.time',
	'datepicker_es': 'pickadate_es_ES',
	"materialize": "materialize-0.97.3.min",
	"jquery-hammer": "jquery.hammer"
    },
    stubModules: [ 'rvc' ],
    name: "../main",
    out: "main-built.js"
})
