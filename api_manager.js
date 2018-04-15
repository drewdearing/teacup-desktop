var TourneyState = Object.freeze({"pending": 0, "underway": 1, "complete": 2});
var MatchState = Object.freeze({"pending": 0, "open": 1, "complete": 2});

var tournament_state = TourneyState.underway;
var tournament_owner = true;

class APIManager {

	constructor(tournament_id){
		this.tournament_id = tournament_id;
		this.is_owner = false;
		this.authentication_data = ""
		this.on_success_callback = ""
		this.is_authenticated = false;
		this.user = "";
		this.key = "";
		self.default_url = "";
	}

	static request(settings){
		$.ajax(settings);
	}

	initialize(callback){
		this.on_success_callback = callback
		this.initAuth()
	}

	setIsOwner() {
		$.each(this.authentication_data, function(index, tournament_obj){
			console.log(tournament_obj.tournament.id + " " + this.tournament_id);
			if(tournament_obj.tournament.id == this.tournament_id){
				this.is_owner = true;
				return false;
				//this will not work because id is not the same thing as URL code.
				//need a second api call to retrieve the tournament object by url code.
				//and then compare.
			}
		});
	}

	initAuth(){
		this.retrieveUser();
	}

	retrieveUser(){
		var self = this
    	chrome.storage.sync.get('user', function (data) {
        	self.user = data.user;
        	self.retrieveKey();
    	});
	}

	retrieveKey(){
		var self = this
		chrome.storage.sync.get('key', function (data) {
        	self.key = data.key;
        	self.testAuth();
    	});
	}

	failAuth(){
		console.log("failed auth.");
		chrome.storage.sync.set({auth_error: true }, function() {
			chrome.runtime.sendMessage({cmd: "options"}, function(response) {});
		});
	}

	successAuth(self){
		return function(data) {
			console.log("success auth");
			console.log(self)
			self.is_authenticated = true;
			self.authentication_data = data
			self.setIsOwner()
			self.on_success_callback(self)			
		}

	}

	testAuth(){
		if(this.user != "" && this.key != ""){
			this.default_url = "https://" + this.user + ":" + this.key +
		 		"@api.challonge.com/v1/tournaments";
			APIManager.request({
				url: this.default_url + ".json",
				method: "GET",
				success: this.successAuth(this),
				error: this.failAuth
			});
		}
		else{
			console.log("failed bc null");
			chrome.storage.sync.set({auth_error: true }, function() {
							chrome.runtime.sendMessage({cmd: "options"},
								function(response) {});
							});
		}
	}

	requestFail(url){
		console.log("failed request with : " + url);
	}

	onSuccessfulMatches(callback) {
		return function(data) {
			callback(data);
		}
	}

	getMatches(callback){
		var request_url = this.default_url + "/" +
			this.tournament_id + "/matches.json";
		APIManager.request({
				url: request_url,
				method: "GET",
				success: this.onSuccessfulMatches(callback),
				error: this.requestFail(request_url)
			});
	}

}
