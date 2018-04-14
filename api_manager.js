var TourneyState = Object.freeze({"pending": 0, "underway": 1, "complete": 2});
var MatchState = Object.freeze({"pending": 0, "open": 1, "complete": 2});

var tournament_state = TourneyState.underway;
var tournament_owner = true;

class APIManager {

	constructor(tournament_id){
		this.tournament_id = tournament_id;
		this.is_owner = false;
		this.is_authenticated = false;
		this.user = "";
		this.key = "";
	}

	static initAuth(manager, callback){
		APIManager.retrieveUser(manager, callback);
	}

	static retrieveUser(self, callback){
    	chrome.storage.sync.get('user', function (data) {
        	self.user = data.user;
        	APIManager.retrieveKey(self, callback);
    	});
	}

	static retrieveKey(self, callback){
		chrome.storage.sync.get('key', function (data) {
        	self.key = data.key;
        	self.testAuth(callback);
    	});
	}

	static request(settings){
		$.ajax(settings);
	}

	failAuth(){
		console.log("failed auth.");
		chrome.storage.sync.set({auth_error: true }, function() {
			chrome.runtime.sendMessage({cmd: "options"}, function(response) {});
		});
	}

	successAuth(callback){
		console.log("success auth");
		this.is_authenticated = true;
		return function(data){
			callback(data);
		}
	}

	testAuth(callback){
		if(this.user != "" && this.key != ""){
			var api_url = "https://"+this.user+":"+this.key+"@api.challonge.com/v1/tournaments/"+ this.tournament_id +".json";
			APIManager.request({
				url: api_url,
				method: "GET",
				success: this.successAuth(callback),
				error: this.failAuth
			});
		}
		else{
			console.log("failed bc null");
			this.failAuth();
		}
	}

	authenticated(){
		return this.is_authenticated;
	}

}