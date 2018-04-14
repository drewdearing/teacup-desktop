let userField = document.getElementById('user');
let keyField = document.getElementById('key');
let form = document.getElementById('setkey');
let save = document.getElementById('save');
let error = document.getElementById('error');

chrome.storage.sync.get('user', function(data) {
	userField.value = data.user;
});

chrome.storage.sync.get('key', function(data) {
	keyField.value = data.key;
});

chrome.storage.sync.get('auth_error', function(data) {
	var isAuthError = data.auth_error;
	if(isAuthError){
		error.innerHTML = "We ran into an error authenticating your API Key. Please be sure the information is correct.";
	}
});

form.onsubmit = function(){
	chrome.storage.sync.set({user: userField.value, key: keyField.value, auth_error: false }, function() {
		window.close();
	});
};