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
	$("#items ul").addClass("collection");
	$("#items ul li").addClass("collection-item");

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
	$("#queries div.search").addClass("offset-s1 col s5");
	$("#queries div.curso").addClass("col s3 input-field");
	$("#queries div.periodo").addClass("col s2 input-field");
	$("#queries .submit-query").addClass("col s2 right-align input-field");
	$(".submit-query-button").html('<i class="material-icons">search</i>');

	// Search query
	$(".search .query_title").append('<i class="material-icons">search</i>');

	// Template
	$(".submit-template-button").html('<i class="material-icons">done</i>');

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
    };
    
});
