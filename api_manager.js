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
		self.default_url = "";
	}

	static request(settings){
		$.ajax(settings);
	}

	initAuth(callback){
		this._retrieveUser(callback);
	}

	_retrieveUser(callback){
		self = this
    	chrome.storage.sync.get('user', function (data) {
        	self.user = data.user;
        	self._retrieveKey(callback);
    	});
	}

	_retrieveKey(callback){
		self = this
		chrome.storage.sync.get('key', function (data) {
        	self.key = data.key;
        	self.testAuth(callback);
    	});
	}

	failAuth(){
		console.log("failed auth.");
		chrome.storage.sync.set({auth_error: true }, function() {
			chrome.runtime.sendMessage({cmd: "options"}, function(response) {});
		});
	}

	successAuth(callback){
		console.log("success auth");
		self = this
		self.is_authenticated = true;
		return function(data){
			callback(self, data);
		}
	}

	testAuth(callback){
		this.user = "Reatret";
		this.key = "smJEuy7K2f7Gi7O01e3RzsR4RjLnAx8tVYeKurpW";
		if(this.user != "" && this.key != ""){
		 self.default_url = "https://" + self.user + ":" + self.key +
		 	"@api.challonge.com/v1/tournaments";
			APIManager.request({
				url: self.default_url + ".json",
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

	requestFail(){
		console.log("failed request with : " + url);
	}

	onSuccessfulMatches(callback) {
		return function(data) {
			
			callback("ss");
		}
	}

	getMatches(callback){
		var request_url = self.default_url + "/" +
			self.tournament_id + "/matches.json";
		console.log("attempting: " + request_url);
		APIManager.request({
				url: request_url,
				method: "GET",
				success: this.onSuccessfulMatches(callback),
				error: this.requestFail
			});
	}

}
