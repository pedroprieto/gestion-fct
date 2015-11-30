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
	$("#local-nav-list a").addClass("btn waves-effect waves-light");
	
	// Items container
	$("#items ul").addClass("");
	$("#items ul li").addClass("card  teal");
	$("#items ul li .item-data").addClass("card-content white-text");
	$("#items ul li .item-links").addClass("card-action");
	$("#items ul li .item-actions").addClass(" right");

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
	$(".query_title").addClass("collapsible-header");
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
	$(".submit-template-button").html('<i class="material-icons">done</i>').css("width","100%");;


	// Edit
	$(".submit-edit-button").html('<i class="material-icons">done</i>');

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
	//$(".collection-item .item-links a").addClass("btn waves-effect waves-light");

	// Delete button
	$(".item-delete").html('<i class="material-icons">delete</i>').addClass(" white-text");

	// Edit button
	// No funciona por tema herencia clicks
	//$(".item-edit").html('<i class="material-icons">edit</i>');
    };
    
});
