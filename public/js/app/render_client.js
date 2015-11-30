define(["jquery", "materialize"], function() {

    return function() {
	
	// Problemas con labels Materialize
	$("input,textarea").filter(function() {
            return this.value.length !== 0;
	}).siblings().addClass("active");

	// Problemas con labels Firefox
	$("input[type=date],input[type=time]").siblings().addClass("active");

	// Local navs (template links)
	$("#local-nav-list li").css("display", "inline-block");
	$("#local-nav-list a").addClass("btn-flat teal-text");
	
	// Items container
	$("#items ul").addClass("collection");
	$("#items ul li").addClass("collection-item");
	$("#items ul li .item-data").addClass("row");
	$("#items ul li .item-data-object").addClass("col s12");
	//$("#items ul li .item-data-object .prompt").addClass("col s6");
	    


	$("#items ul li .item-links").addClass("row valign-wrapper");
	$("#items ul li .item-actions").addClass("row right-align").css("margin-bottom", "0");
	$("#items ul li .item-actions a").addClass("teal-text");

	// Items container para collection "mensajes"
	$("#items .mensajes").removeClass("collection");
	$("#items .mensajes li").removeClass("collection-item").addClass("card blue-grey darken-1");
	$("#items .mensajes li .item-data").addClass("card-content white-text");
	$("#items .mensajes li .item-links").addClass("card-action");
	$("#items .mensajes li .item-actions").hide();
	$("#items .mensajes li .item-data").prepend('<span class="card-title"> <i class="material-icons">info_outline</i> Información</span>');

	//$(".item-href").html('<i class="material-icons">delete</i>');
	// No funciona por el tema de herencia de onclicks. FIX
	//$(".item-delete").html('<i class="material-icons">delete</i>');
	//$("a[rel=visits]").html('<i class="material-icons">phone</i>');
	

	// Queries container
	$("#queries ul").addClass("collapsible").attr("data-collapsible","accordion");
	$(".query_title").addClass("collapsible-header teal white-text");
	$("#queries form").addClass("collapsible-body");
	$('.collapsible').collapsible();
	$("#queries fieldset").addClass("row");
	$("#queries div.datosfct, #queries div.mes").addClass("offset-s1 col s12 m5");
	$("#queries div.curso").addClass("col s12 m3 input-field");
	$("#queries div.periodo").addClass("col s12 m2 input-field");
	$("#queries .submit-query").addClass("col s12 m2 input-field");
	$(".submit-query-button").html('<i class="material-icons">search</i>').css("width","100%");

	// Search query
	$(".searchfct .query_title, .searchfm34 .query_title").append('<i class="material-icons">search</i>');

	// Template
	$("#template div.curso").addClass("col s12 m5 input-field");
	$("#template div.periodo").addClass("col s12 m5 input-field");
	$("#template .submit-template").addClass("col s12 m2 input-field");
	$(".submit-template-button").html('<i class="material-icons">done</i>').css("width","100%");

	$("fieldset").addClass("row");
	$("div.tipo").addClass("col s12 m3 input-field");
	$("div.distancia").addClass("col s12 m3 input-field");
	$("div.fecha").addClass("col s12 m3 input-field");
	$("div.hora_salida").addClass("col s12 m3 input-field");
	$("div.hora_regreso").addClass("col s12 m3 input-field");
	$("div.localidad").addClass("col s12 m4 input-field");
	$("div.impresion").addClass("col s12 input-field");
	$("div.empresa").addClass("col s12 input-field");
	$("div.presencial").addClass("col s12 input-field");
	$(".submit-edit").addClass("row col s12 input-field");

	// Edit
	$(".submit-edit-button").html('<i class="material-icons">done</i>').addClass("col s6");	;
	$(".submit-edit-cancel-button").html('<i class="material-icons">cancel</i>').addClass("col s6");	;

	// General
	$("button").addClass("btn waves-effect waves-light");

	// Select
	$('select').material_select();
	//$('select').addClass('browser-default');

	// Textarea
	$('textarea').addClass('materialize-textarea');

	// Form inputs
	$("#template fieldset").addClass("row");
	$("#template .input-field").addClass("col s12");

	// Item links
	$(".collection-item .item-links a").addClass("teal-text col");

	// Delete button
	$(".item-delete").html('<i class="material-icons">delete</i>');

	// Edit button
	// No funciona por tema herencia clicks
	$(".item-edit").html('<i class="material-icons">edit</i>');
    };
    
});
