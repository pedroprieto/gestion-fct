require.config({
    "baseUrl": "/client/js/lib",
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
	"validate": "validate.min",
	"fetch": "fetch",
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
//require(["app/main_ractive2"]);

require([ 'ractive', 'rvc!ui/app' ], function ( Ractive, mainpage ) {

    'use strict';

    //ractiveload().then(function(c) {
    console.log('Iniciando');
    //console.log(Ractive.components);
    //Ractive.components['c1'] = mainpage;

    var ractive = new Ractive({
	el: '#app',
	template: '<c1/>',
	enhance: true, //PROBAR
	data: function() {
	    // Cambiar a URL actual
	    req(window.location.href , 'get', null, this);
	    return {collection: {}};
	},
	components: {
	    c1: mainpage
	}
    });


    function req(url, method, body, ins) {
	// Disable submit buttons
	/*var x = document.querySelectorAll("[type=submit]");
	  for (var i = 0; i < x.length; i++) {
	  x[i].disabled = true;
	  }*/
	var ajax = new XMLHttpRequest();
	ajax.onreadystatechange = function() {rsp(ajax,ins)};
	ajax.open(method, url);
	var ctype = "application/vnd.collection+json";
	ajax.setRequestHeader("accept",ctype);

	if(body && body!==null) {
	    ajax.setRequestHeader("content-type", ctype);
	}
	ajax.send(body);
	return false;
	
    }

    function rsp(ajax, ins) {
	if(ajax.readyState===4) {
	    ins.set({'collection': JSON.parse(ajax.responseText).collection});
	}
    }

    //});


    

});

