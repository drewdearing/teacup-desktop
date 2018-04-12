let userField = document.getElementById('user');
let keyField = document.getElementById('key');
let form = document.getElementById('setkey');
let save = document.getElementById('save');

chrome.storage.sync.get('user', function(data) {
	userField.value = data.user;
});

chrome.storage.sync.get('key', function(data) {
	keyField.value = data.key;
});

userField.onchange = function(){
};

keyField.onchange = function(){
};

form.onsubmit = function(){
	chrome.storage.sync.set({user: userField.value, key: keyField.value}, function() {});
	window.close();
};