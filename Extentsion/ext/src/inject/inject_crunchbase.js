//HTML to be inserted
var save_msg_bar = '<div id="save-msg-bar">'+
  '<div class="junglebar-container">' +
  '<div id = "junglebar-link"><a href="http://www.usescope.com/" class="jungle-logo" target = "_blank">Scope</a></div>' +
  '<div id = "save_msg">Saving to Scope...</div>' +
  '</div>' +
  '</div>';




$(document).ready(function(){
	//Start point
	main();
});

function main() {
	//inserts HTML for save msg on top and +scope button & attaches clickHandler to the +scope button.
	insert_html();

}

function insert_html(){
var download_links = document.querySelectorAll('input.follow_button');
if(download_links.length){
	for (var i = 0; i < 1; i++) {
		var link = download_links[i];
		//plugin_name = link.href.split('/').pop().split('.')[0];
		var p = document.createElement('p');
			p.innerHTML = '<a href="#" class = "button-primary" id = "button-scope">+Scope</a>';
			link.parentElement.insertAdjacentElement('beforebegin',p);
			///p.dataset.name = plugin_name;
			p.querySelector('a').addEventListener('click',onClick_scopeButton,true);
	
	}
	//document.querySelector('div#top-header').insertAdjacentHTML('beforebegin',save_msg_bar);
	//document.querySelector('div#top-header').insertAdjacentHTML('beforebegin',login_dialog);
	}
} 


function onClick_scopeButton(e){
	//Show save message on Top...

	//console.log("name:");
	//var fullName = $('div#col2_internal h1.h1_first').text().replace("edit","").trim();
	//var twitter = $('div.col1_content td.td_right a').text().trim();
	//console.log(fullName);
	//console.log(twitter);
	//var Company_Name=$('tr#overview-summary-current li a').text();
    //var twitter = $("#twitter-view ul li a").text();
	

	/*	var jsonObj = {"full_name" : full_name,
						   "title" : Title,
						   "twitter" : twitter,
						   "company" : Company_Name,
						   "linkedin" : profile_url,
						   "location" : location,
						   "connections" : jsonObj_Sharedconnections
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
				  
		    });*/
			
}

