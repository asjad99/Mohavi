function awesomeTask() {
	var query = document.getElementById("search_bar").value;

	var action_url = "https://www.google.com.pk/search?q="+query+"+site:linkedin.com/in/+OR+site:linkedin.com/pub/+site:linkedin.com/pub/dir/";
    chrome.tabs.create({ url: action_url });
}

function clickHandler(e) {
	awesomeTask();
	//alert("hello");
  //setTimeout(awesomeTask, 1000);
}


function main() {
	//chrome.tabs.create({'url': 'https://www.google.com')});
	//alert("in main");
  // Initialization work goes here.
}

// Add event listeners once the DOM has fully loaded by listening for the
// `DOMContentLoaded` event on the document, and adding your listeners to
// specific elements when it triggers.
document.addEventListener('DOMContentLoaded', function () {
document.querySelector('#search').addEventListener('click', clickHandler);

});



