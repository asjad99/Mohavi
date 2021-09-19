//HTML to be inserted
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


document.querySelector('.topbar').insertAdjacentHTML('beforebegin',save_msg_bar);
document.querySelector('.topbar').insertAdjacentHTML('beforebegin',login_dialog);

$(document).ready(function(){
	//Start point
	main();
	
	$("#email").change(function(){
		$("#email").css({"background-color": "#fff"});
	});
	
	$("#password").change(function(){
		$("#password").css({"background-color": "#fff"});
	});	

});

function main() {

	//inserts HTML for save msg on top and +scope button & attaches clickHandler to the +scope button.
	insert_html();
}

function insert_html(){
	
	var scope_link = document.querySelectorAll('ul.stats');
	if(scope_link.length){
		var link = scope_link[0];
		var p = document.createElement('p');
		p.innerHTML = '<a style = "margin-top:10px;" href="#" class = "btn btn-primary" id = "button-scope">+Scope</a>';
		link.parentElement.insertAdjacentElement('afterend',p);
		p.querySelector('a').addEventListener('click',onClick_scopeButton,true);
	}
}


function onClick_scopeButton(e){
	
	//check if we have a user token; if not, we'll ask user to login...
	token = retrieveToken();

	if (typeof token === 'undefined'){
		login();		
		return;
	}
	
	//token already exists, so user is logged in. proceed with the +scope...
	scopeIt();		
}

function scopeIt(){
	var name = $(".profile-card-inner .fullname .profile-field").text();
	var twitter_handle = $(".profile-card-inner .screen-name").text().substr(1);		//remove '@' ...		
	var location = $(".profile-card-inner .location").text().trim();
	
	console.log(name);
	console.log(twitter_handle);
	console.log(location);
	
}

function saveToken(token) {
 	//Save it using the Chrome extension storage API... 
	localStorage["token"] = token;
}

function retrieveToken() {
	//Retrieve using the Chrome extension storage API...
	return localStorage["token"];
}	

function login(){		
	$('#loginModal').modal('show');
}


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
		  scopeIt();				   //save the profile that user wants to...	
		},
		error : function(jqXHR, textStatus, errorThrown ){
			if(jqXHR.status == 401){
				 alert("Invalid email/password");
				 $("#btn-login").attr("disabled", false);
			}	
		}
	});  
			
});
	
