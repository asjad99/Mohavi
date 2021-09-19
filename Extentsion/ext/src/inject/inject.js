$(document).ready(function(){
	/*when user types something in email and password of the login dialog, hide the red background color
	that may be there previsouly*/
		
	$("#email").change(function(){
		$("#email").css({"background-color": "#fff"});
	});
	
	$("#password").change(function(){
		$("#password").css({"background-color": "#fff"});
	});	
});

//---------------------------HTML inject code ---------------------------------------
/*Saving message that is shown when a profile is being saved*/
var save_msg_bar = '<div id="save-msg-bar">'+
  '<div class="junglebar-container">' +
  '<div id = "junglebar-link"><a href="http://www.usescope.com/" class="jungle-logo" target = "_blank">Scope</a></div>' +
  '<div id = "save_msg">Saving to Scope...</div>' +
  '</div>' +
  '</div>';

/*login popup dialog using Twitter bootstrap*/
var login_dialog = '<div class="modal fade" id="loginModal" tabindex="-1" role="dialog" aria-hidden="true">' +  
  '<div class="modal-dialog">' + 
    '<div class="modal-content">' +
      '<div class="modal-header">' + 
        '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' + 
        '<h3 class="modal-title">Login to Scope</h3>' + 
      '</div>' + 
      '<div class="modal-body">' + 
        '<form class = "well" action="" method="post">' + 
			'<input type="text" id = "email" placeholder="email"><br><br>' + 
			'<input type="password" id = "password" placeholder="Password"><br><br>' +
			'<input type="hidden" id = "dialog_called_from" value="">' + 
		'</form>' +
      '</div>' +
      '<div class="modal-footer">' +
        '<button type="button" class="btn" data-dismiss="modal">Close</button>' +
        '<button type="button" class="btn btn-primary" id = "btn-login">Login</button>' +
      '</div>' +
    '</div>' +
  '</div>' +
'</div>';

/*iframe for scrapping shared connections*/
var overlay_html = '<div id="overlay" class="overlay">' +
	'<div id="my_awesome_iframe_container">' +
	'<iframe id="1click_iframe" width=100% height=100% frameborder=0></iframe>' +
	'</div>' +  
	'<div id="my_awesome_iframe_container_2">' +
	'<iframe id="1click_iframe_2" width=100% height=100% frameborder=0></iframe>' +
	'</div>'+
	'</div>'
//--------------------------- HTML inject code end---------------------------------------


var protocol = window.location.protocol;

//--START POINT - 1. Inject html for save button, save msg, and login dialog
InjectJS_ONProfile();
//2. inserts scope button,save msg, and login dialog html
injectJS_onSearch();
//3. insert HTML for iframe(for fetching shared connections) 
document.querySelector('div#top-header').insertAdjacentHTML('beforeend',overlay_html);



// --------------------------includes event listner functions-----------------------------------------------
//Event Listner for '+Scope' button on LinkedIn profile
var isSaved = false;
function clickHandler(e){

	//check if we have a user token; if not, we'll ask user to login...
	token = retrieveToken();

	if (typeof token === 'undefined'){
		login("profile");		
		return;
	}
	
	//token already exists, so user is logged in. proceed with the +scope...
	if (isSaved == false){
		scopeIt();	
		isSaved = true;
	}
	//in case the profile is already saved
	else {
		//Show 'already saved' msg on top... 
		$("#save_msg").html("Already Saved!")
		$("#save-msg-bar").slideDown(300);
		
		setTimeout(removeOverlay, 2000);
			
	}
	
}


//Event Listener for handling '+Scope' click on search results pages. 
var ClickedID=""; 
//var prev_pageVal = $("ul.pagination li.active").text();
function clickHandler_search(e){	
	//check if we have a user token; if not, we'll ask user to login...
	token = retrieveToken();
	if (typeof token === 'undefined'){
		login(this.id);			//this = the link (user profile) which user wants to scrap...		
		return;
	}
	//token already exists, so user is logged in. proceed with the +scope...
	//var current_pageVal = $("ul.pagination li.active").text();
	if (this.id != ClickedID){
		scopeIt_onSearch(this.id);	
		ClickedID = this.id;
		//prev_pageVal = current_pageVal;
	}
	else {
		//Show 'already saved' msg on top... 
		$("#save_msg").html("Already Saved!")
		$("#save-msg-bar").slideDown(300);		
		setTimeout(removeOverlay, 2000);
	}
}
// --------------------------includes event listner functions-----------------------------------------------
// ------------------------------------END------------------------------------------------------------------


function InjectJS_ONProfile(){
var download_links = document.querySelectorAll('a.button-primary');
if(download_links.length){
		var link = download_links[0];
		plugin_name = link.href.split('/').pop().split('.')[0];
		var p = document.createElement('p');
			p.innerHTML = '<a href="#" class = "button-primary" id = "button-scope">+Scope</a>';
			link.parentElement.insertAdjacentElement('beforebegin',p);
			p.dataset.name = plugin_name;
			p.querySelector('a').addEventListener('click',clickHandler,true);
	document.querySelector('div#top-header').insertAdjacentHTML('beforebegin',save_msg_bar);
	document.querySelector('div#top-header').insertAdjacentHTML('beforebegin',login_dialog);
	}
}  

function injectJS_onSearch(){

var connect_buttons = document.querySelectorAll('div.primary-action-button a');
if(connect_buttons.length){
	for (var i = 0; i < connect_buttons.length; i++) {
		var link = connect_buttons[i];
		var Button_id = '"'+i+'"';
		var p = document.createElement('p');
			p.innerHTML = '<a href="#" id='+Button_id+'class="btn btn-primary search">+Scope</a>';
			link.parentElement.insertAdjacentElement('beforebegin',p);
			p.querySelector('a').addEventListener('click',clickHandler_search,true);
	}
	document.querySelector('div#top-header').insertAdjacentHTML('beforebegin',save_msg_bar);
	document.querySelector('div#top-header').insertAdjacentHTML('beforeend',login_dialog);
	}
}



// --------------------------Portion/Module handles login-----------------------------------------------

/*login button click event, this will first validate the input fields, then send an ajax request to check credentials,
then save the profile*/
$('#btn-login').click(function(){
	
		var email = $("#email").val();
		var password = $("#password").val();
		
		//data validation...
		error = false;
		if (email == ""){
			$("#email").css({"background-color": "#d66"});
			error = true;
		}
		
		if (password == ""){
			$("#password").css({"background-color": "#d66"});
			error = true;
		}
		
		if (error)
			return false;
			
		//no error, so proceed...		
		$("#btn-login").attr("disabled", true);
			
		//send an ajax request here with user credentials and get the token...
		$.ajax({
		  type: "POST",
		  url: "http://scopeapi.herokuapp.com/login",
		  /*contentType: "application/json",*/
		  data: {'email' : email, 'password' : password},
		  success: function(data){
			  var token = data['token'];
			  $('#loginModal').modal('hide');
			  $("#btn-login").attr("disabled", false);
			
			  saveToken(token);			//save user token for next time use...
			  
			  //call scopeIt or scopeIt_onSearch depending on which page we are at...
			  if ($("#dialog_called_from").val() == "profile")
				  scopeIt();				   //save the profile that user wants to...	
			  else
			  	  scopeIt_onSearch($("#dialog_called_from").val());	  
		  },
		  	error : function(jqXHR, textStatus, errorThrown ){
				if(jqXHR.status == 401){
					 alert("Invalid email/password");
					 $("#btn-login").attr("disabled", false);
				}	
			}
		});  
		
		
	});
	
function login(called_from){
	if (called_from == "profile")
		$("#dialog_called_from").val("profile");			//just an indication that the page accessed was a profile page...
	else
		$("#dialog_called_from").val(called_from);		 //pass the link id which is clicked, to be used further...
			
	$('#loginModal').modal('show');
}

function saveToken(token) {
 	//Save it using the Chrome extension storage API... 
	localStorage["token"] = token;
}

function retrieveToken() {
	//Retrieve using the Chrome extension storage API...
	return localStorage["token"];
}	

// --------------------------Portion/Module handles login-----------------------------------------------
//-----------------------------------ENDS---------------------------------------------------------



function scopeIt(){

	//---1. Show 'saving' msg on top

	showOverlay();	

	//---2. Scraping the Profile details from main profile page

	var full_name = $('span.full-name').text();
	var Title=$('p.title').text();
    var twitter = $("#twitter-view ul li a").text();
	var location = $('span.locality a').text();
	var profile_url = $('dl.public-profile span, dl.public-profile dd > a').text();

	//---2.1 Clean-up and handling special cases
	//In case of 3rd degree connection, limited access profiles use browser location for fetching url
	if (typeof profile_url === 'undefined')
	  profile_url = $(location).attr('href');

	//Incase of multiple current companies store them in an array.
	company_names_array = [];
	var Company_Name=$('tr#overview-summary-current li a').each(function( index ) {
			 company_names_array.push($(this).text());
 			 console.log( index + ": " + $( this ).text());
	});
	
	//TODO - when API end points supports array for companies, send array instead
	//saving only 1st company only for now
	Company_Name = company_names_array[0];
	
	//Fetching Company Name from title if 'current' is empty   
    if (typeof Company_Name === 'undefined'){
    	var temp = Title.split(" at ");
    	if (temp.length>1) {
    		Title = temp[0]
    		Company_Name = temp[1];
    	}
    	else {
    		Company_Name == "";
    	}
    }
    if (Title == '--')
		Title = "";

	//---3. Scraping shared connections details
	
	//scrap getIntroduced URL for viewing shared connections details 
	var get_introduced_url;
	
	if ($("span.fp-degree-icon abbr.degree-icon").text() == "3rd"){
		get_introduced_url = "degree3"
	}
	else{
 		get_introduced_url = $('p.connections-map-actions a').attr('href');
	}
 
 	var jsonObj_Sharedconnections; 
	
 	//load get connection details URL in iFrame(only for 2nd degree connections)
 	if ((typeof get_introduced_url != 'undefined') && !(get_introduced_url === "degree3"))
 	{
 		
 		url = protocol + '//www.linkedin.com' + get_introduced_url;
		var iframe = document.querySelector('#my_awesome_iframe_container iframe');
		iframe.src = url; 

		var profile_names = new Array();
		var profile_titles = new Array();
		var locations_array = new Array();

		$("#my_awesome_iframe_container iframe").load(function (){
			$( "div.body h3",$("#my_awesome_iframe_container iframe").contents()).each(function() {
				profile_names.push($(this).text());
			});
			$( "div.body span.title",$("#my_awesome_iframe_container iframe").contents()).each(function() {
				profile_titles.push($(this).text());
			});
			Profile_Scrap = true;
			jsonObj_Sharedconnections = createJSON(profile_names,profile_titles,locations_array,Profile_Scrap);
			//Convert Scrapped details into JSON and concatenate person's profile details with his connection's details
 				
			var token = retrieveToken();

			var jsonObj = {"full_name" : full_name,
						   "title" : Title,
						   "twitter" : twitter,
						   "company" : Company_Name,
						   "linkedin" : profile_url,
						   "location" : location,
						   "connections" : jsonObj_Sharedconnections
						   };
					
			
			json = JSON.stringify(jsonObj);
			console.log(json);
			
			//---4. make an Ajax call to save the object
			$.ajax({
				  type: "POST",
				  url: "http://scopeapi.herokuapp.com/leads?token=" + token,
				  contentType: "application/json",
				  data: json,
				  success: function(data){
					  console.log(data);
					  $("#save_msg").html("Profile Saved!")
					  setTimeout(removeOverlay, 2000);
			
				  },
				  error : function(jqXHR, textStatus, errorThrown ){
				  	console.log(jqXHR.status)
					console.log(errorThrown)
					
				 }
				  
		    });
					  
	});			
 	}
 	//Don't scrap shared connection details
 	else
 	{
 		//Convert Scrapped details into JSON and concatenate person's profile details with his connection's details
		var token = retrieveToken();
	
		var jsonObj = {"full_name" : full_name,
					   "title" : Title,
					   "twitter" : twitter,
					   "company" : Company_Name,
					   "linkedin" : profile_url,
					   "location" : location,
					   };
					  
		json = JSON.stringify(jsonObj);
		console.log(json);
		
		//make an Ajax call to save the object
		$.ajax({
			  type: "POST",
			  url: "http://scopeapi.herokuapp.com/leads?token=" + token,
			  contentType: "application/json",
			  data: json,
			  success: function(data){
				  console.log(data);
				  $("#save_msg").html("Profile Saved!")
				  setTimeout(removeOverlay, 2000);
		
			  },
			  error : function(jqXHR, textStatus, errorThrown ){
				console.log(jqXHR.status)
				console.log(errorThrown)
				
			 }
			  
		});
	
 	}	
}//EOF
//var hasfetch_sh_connections = false;
//var isSecondDegreeCon = false;
//	var jsonObj_Sharedconnections;


function scopeIt_onSearch(element_id) {
	//----------------------------------------
	//1. Show 'Save Profile' message on top
	//----------------------------------------

	showOverlay();
	
	var full_name;
	var title;
	var twitter;
	var location;
	var profile_url;
	var Company_Name = "";


	var profile_url_clicked = $('div.bd a.title').eq(element_id).attr('href');
	profile_url_clicked = protocol + '//www.linkedin.com' + profile_url_clicked;

	//---2. Scraping the Profile details from main profile page by loading the profile url(scraped from search results) in current iframe
	
	var iframe_2 = document.querySelector('#my_awesome_iframe_container_2 iframe');
	iframe_2.src = profile_url_clicked;

	$("#my_awesome_iframe_container_2 iframe").unbind('load');
	
	$("#my_awesome_iframe_container_2 iframe").load(function (){
	full_name = $('span.full-name',$("#my_awesome_iframe_container_2 iframe").contents()).text();
	title=$('p.title',$("#my_awesome_iframe_container_2 iframe").contents()).text();
    twitter = $("#twitter-view ul li a",$("#my_awesome_iframe_container_2 iframe").contents()).text();
	location = $('span.locality a',$("#my_awesome_iframe_container_2 iframe").contents()).text();
	profile_url = $('dl.public-profile span, dl.public-profile dd > a',$("#my_awesome_iframe_container_2 iframe").contents()).text();

	company_names_array = [];
	Company_Name=$('tr#overview-summary-current li a',$("#my_awesome_iframe_container_2 iframe").contents()).each(function( index ) {
			 company_names_array.push($(this).text());
 			 console.log( index + ": " + $( this ).text());
	});

	//TODO - when API end points supports array for companies, send array instead
	//saving only 1st company only for now
	Company_Name = company_names_array[0];
	

	//Fetching Company Name from title if 'current' is empty   
    if (typeof Company_Name === 'undefined'){
    	var temp = title.split(" at ");
    	if (temp.length>1) {
    		title = temp[0]
    		Company_Name = temp[1];
    	}
    	else {
    		Company_Name == "";
    	}
    }
    console.log(Company_Name)
    if (title == '--')
		title = "";

	//---3. fetch shared connections of the user
	var get_introduced_url;
	
	if ($("span.fp-degree-icon abbr.degree-icon",$("#my_awesome_iframe_container_2 iframe").contents()).text() == "3rd"){
		get_introduced_url = "degree3"
	}
	else{
 		get_introduced_url = $("p.connections-map-actions a",$("#my_awesome_iframe_container_2 iframe").contents()).attr('href');
	}
	var jsonObj_Sharedconnections; 
	
 	//load get connection details URL in iFrame(only for 2nd degree connections)
 	if ((typeof get_introduced_url != 'undefined') && !(get_introduced_url === "degree3"))
 	{
 		
 		url = protocol + '//www.linkedin.com' + get_introduced_url;
		var iframe = document.querySelector('#my_awesome_iframe_container iframe');
		iframe.src = url; 

		var profile_names = new Array();
		var profile_titles = new Array();
		var locations_array = new Array();

		$("#my_awesome_iframe_container iframe").unbind('load');
		$("#my_awesome_iframe_container iframe").load(function (){
			$( "div.body h3",$("#my_awesome_iframe_container iframe").contents()).each(function() {
				profile_names.push($(this).text());
			});
			$( "div.body span.title",$("#my_awesome_iframe_container iframe").contents()).each(function() {
				profile_titles.push($(this).text());
			});
			Profile_Scrap = true;
			jsonObj_Sharedconnections = createJSON(profile_names,profile_titles,locations_array,Profile_Scrap);
			
			//Convert Scrapped details into JSON and concatenate person's profile details with his connection's details
 				
			var token = retrieveToken();

			var jsonObj = {"full_name" : full_name,
						   "title" : title,
						   "twitter" : twitter,
						   "company" : Company_Name,
						   "linkedin" : profile_url,
						   "location" : location,
						   "connections" : jsonObj_Sharedconnections
						   };
					
			
			json = JSON.stringify(jsonObj);
			console.log(json);
			
			//---4. make an Ajax call to save the object
			$.ajax({
				  type: "POST",
				  url: "http://scopeapi.herokuapp.com/leads?token=" + token,
				  contentType: "application/json",
				  data: json,
				  success: function(data){
					  console.log(data);
					  $("#save_msg").html("Profile Saved!")
					  setTimeout(removeOverlay, 2000);
			
				  },
				  error : function(jqXHR, textStatus, errorThrown ){
				  	console.log(jqXHR.status)
					console.log(errorThrown)
					
				 }
				  
		    });
					  
	});			
 	}
 	//Don't scrap shared connection details
 	else
 	{
 		//Convert Scrapped details into JSON and concatenate person's profile details with his connection's details
		var token = retrieveToken();
	
		var jsonObj = {"full_name" : full_name,
					   "title" : title,
					   "twitter" : twitter,
					   "company" : Company_Name,
					   "linkedin" : profile_url,
					   "location" : location,
					   };
					  
		json = JSON.stringify(jsonObj);
		console.log(json);
		
		//make an Ajax call to save the object
		$.ajax({
			  type: "POST",
			  url: "http://scopeapi.herokuapp.com/leads?token=" + token,
			  contentType: "application/json",
			  data: json,
			  success: function(data){
				  console.log(data);
				  $("#save_msg").html("Profile Saved!")
				  setTimeout(removeOverlay, 2000);
		
			  },
			  error : function(jqXHR, textStatus, errorThrown ){
				console.log(jqXHR.status)
				console.log(errorThrown)
				
			 }
			  
		});
	
 	}

	});   //end iframe_1 load
	
}
	//--------------------------old code to be deprecated------------------------------

	//--------------------------------------------------------
	//2. Scraping the Main Profile details from search results
	//--------------------------------------------------------
	/*
	var full_name=$('div.bd a.title').eq(element_id).text();
	var profile_url = $('div.bd a.title').eq(element_id).attr('href');
	profile_url = protocol + '//www.linkedin.com' + profile_url;
	var split_url = profile_url.split('&');
	if (split_url.length>1){
		var profile_url = split_url[0];
	}
	else {
		profile_url = "";
	}
	var title = $('div.bd p.description').eq(element_id).text();
	if (title == '--')
		title = "";
	
	var split_title = title.split(' at ');
	if (split_title.length>1){
		title = split_title[0]
		var Company_Name = split_title[1];
	}
	else {
		Company_Name = "";
	}
	
	var location = $('div.bd dl.demographic dd').eq(element_id).each(function( index ) {
			 //company_names_array.push($(this).text());
 			 console.log(index + ": " + $(this).text());
	});
	
	*/
	//----------------------------------------------------------------------
	//3. Scraping shared connections details
	//-----------------------------------------------------------------------
	/*
	var get_introduced_url;
	if ($("abbr.degree-icon").eq(element_id).text() == "3rd"){
		get_introduced_url = "degree3";
	}
	else if ($("abbr.degree-icon").eq(element_id).text() == "1st") {
		get_introduced_url = "degree1";
	}
	else{
		
		console.log("----------id clicked-------" + element_id)
		console.log(element_id )
 		get_introduced_url = $('div.bd div.social-wrapper ul.social-line li.shared-conn a.shared-conn-expando').eq(element_id).attr('href');
 		//console.log(get_introduced_url)
	}


	if ((typeof get_introduced_url != 'undefined') && !(get_introduced_url === "degree3") &&
		!(get_introduced_url === "degree1"))
 	{
		url = protocol + '//www.linkedin.com' + get_introduced_url;
		console.log("----------get introdcued url-------")
		console.log(url);
		
		var iframe = document.querySelector('#my_awesome_iframe_container iframe');
		iframe.src = url; 
	
	var profile_names = new Array();
	var profile_titles = new Array();
	var locations_array = new Array();

		//to handle multiple iframe load bug
		$("#my_awesome_iframe_container iframe").unbind('load');

		//load the shared connections url and scrap details.	
		$("#my_awesome_iframe_container iframe").load(function (){
		

		$( "div.bd a.title",$("#my_awesome_iframe_container iframe").contents()).each(function() {
				profile_names.push($(this).text());

			});
			$( "div.bd p.description",$("#my_awesome_iframe_container iframe").contents()).each(function() {
				profile_titles.push($(this).text());
			});
			
			/*$( "div.bd dl.demographic dd",$("#my_awesome_iframe_container iframe").contents()).each(function() {
				locations_array.push($(this).text());
			});*/
		
		//---->Profile_Scrap = false;
		//----->jsonObj_Sharedconnections = createJSON(profile_names,profile_titles,locations_array,Profile_Scrap);
		//console.log(json);
	    //profile_names = [];
	    //profile_titles = [];
	    //locations_array = [];
		
		/*
		var token = retrieveToken();
		
		var jsonObj = {"full_name" : full_name,
					   "title" : title,
					   "company" : Company_Name,
					   "linkedin" : profile_url,
					   "location" : location,
						"shared_connections" : jsonObj_Sharedconnections	 
					   };
		
		json = JSON.stringify(jsonObj);
		console.log(json);
		
		//make an Ajax call to save the object
		$.ajax({
			  type: "POST",
			  url: "http://scopeapi.herokuapp.com/leads?token=" + token,
			  contentType: "application/json",
			  data: json,
			  success: function(data){
				  console.log(data);
				  $("#save_msg").html("Profile Saved!")
				  setTimeout(removeOverlay, 2000);
		
			  },
			  error : function(jqXHR, textStatus, errorThrown ){
				console.log(jqXHR.status)
				console.log(errorThrown)
				
			 }
		
		});
		

		hasfetch_sh_connections = true;	
		});			//end load...
	isSecondDegreeCon = true;
	}
	else {
		console.log("inside else");
		hasfetch_sh_connections = true;
		isSecondDegreeCon = false;	
 	}*/

/*
function saveAPI_call(full_name,title,Company_Name,profile_url,location,jsonObj_Sharedconnections,isSecondDegreeCon){
		var token = retrieveToken();
		var jsonObj
		//console.log(isSecondDegree)
		//console.log(isSecondDegreeCon)
		//alert("alert"+isSecondDegree);
		if(isSecondDegreeCon != true){
			jsonObj =  {"full_name" : full_name,
					   "title" : title,
					   "company" : Company_Name,
					   "linkedin" : profile_url,
					   "location" : location,
					   };
		}
		else{
			jsonObj = {"full_name" : full_name,
					   "title" : title,
					   "company" : Company_Name,
					   "linkedin" : profile_url,
					   "location" : location,
						"shared_connections" : jsonObj_Sharedconnections	 
					   };
		}
					   
		json = JSON.stringify(jsonObj);
		console.log(json);
		
		//make an Ajax call to save the object
		$.ajax({
			  type: "POST",
			  url: "http://scopeapi.herokuapp.com/leads?token=" + token,
			  contentType: "application/json",
			  data: json,
			  success: function(data){
				  console.log(data);
				  $("#save_msg").html("Profile Saved!")
				  setTimeout(removeOverlay, 2000);
		
			  },
			  error : function(jqXHR, textStatus, errorThrown ){
				console.log(jqXHR.status)
				console.log(errorThrown)
				
			 }
			  
		});	

}*/

function removeOverlay(){
	$("#save-msg-bar").slideUp(300);
}

function showOverlay(){
	$("#save_msg").html("Saving to Scope...")
	$("#save-msg-bar").slideDown(300);
}

var prev_pageVal = $("ul.pagination li.active").text();
function listener()
{
	var current_pageVal = $("ul.pagination li.active").text();
	if (prev_pageVal != current_pageVal){
		prev_pageVal = current_pageVal;
		injectJS_onSearch();
	}  
}

//Detects changes in DOMsubtree to handle page navigation via AJAX requests 
// in linkedIn search results.
var timeout = null;
document.addEventListener("DOMSubtreeModified", function() {
    if(timeout) {
        clearTimeout(timeout);
    }
    timeout = setTimeout(listener, 500);	
}, false);



//Create a JSON Obj. Array from shared connection details arrays
function createJSON(profile_names,profile_titles,locations_array,Profile_Scrap) {
	
   jsonObj = [];
   var loop_times = profile_names.length;
   
   if (Profile_Scrap == true){
   		loop_times = loop_times - 2;
   }

   for (var i = 0; i < loop_times; i++) {
        profile = {}
        var Profile_name = profile_names.pop();
        var profile_title = profile_titles.pop();
       if (locations_array.length >1){
        var location = locations_array.pop();
        }
        else{
        	//console.log("shared connection locations are not available");
        }
       if (Profile_name){
       	 profile ["Name"] = Profile_name;
       }
       else{
        	 profile ["Name"] ="";
        }
       if(profile_title){
       	 profile ["Title"] = profile_title.split(" at ")[0];
		 profile ["Company"] = profile_title.split(" at ")[1];
       }
       else{
       	 profile ["Title"] = "";
       }
       /*if(location){
       	profile ["Location"] = location;
       } 
       else{
       		
       }*/
       //profile ["Location"] = "";
       jsonObj.push(profile);
    }
	
	return jsonObj;
	//return JSON.stringify(jsonObj);
}

