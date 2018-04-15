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

	initAuth(callback){
		var manager = this;
		APIManager.retrieveUser(manager, function(){
			APIManager.retrieveKey(manager, function(){
				manager.testAuth(function(data, textStatus, jqXHR){
					console.log("success auth");
					manager.is_authenticated = true;
					$.each(data, function(index, tournament_obj){
						console.log(tournament_obj.tournament.id + " " + manager.tournament_id);
						if(tournament_obj.tournament.id == manager.tournament_id){
							manager.is_owner = true;
							return false;
							//this will not work because id is not the same thing as URL code.
							//need a second api call to retrieve the tournament object by url code.
							//and then compare.
						}
					});
					callback();
				},
				function(jqXHR, textStatus, errorThrown, loginAttempt){
					console.log("failed auth.");
					if(loginAttempt){
						chrome.storage.sync.set({auth_error: true }, function() {
							chrome.runtime.sendMessage({cmd: "options"}, function(response) {});
						});
					}
					else{
						chrome.runtime.sendMessage({cmd: "options"}, function(response) {});
					}
				});
			});
		});
	}

	testAuth(success, fail){
		if(this.user != "" && this.key != ""){
			var api_url = "https://"+this.user+":"+this.key+"@api.challonge.com/v1/tournaments.json";
			console.log(api_url);
			APIManager.request({
				url: api_url,
				method: "GET",
				success: function(data, textStatus, jqXHR){
					success(data, textStatus, jqXHR);
				},
				error: function(jqXHR, textStatus, errorThrown){
					fail(jqXHR, textStatus, errorThrown, true);
				}
			});
		}
		else{
			console.log("failed bc null");
			fail(null, null, null, false);
		}
	}



	static retrieveUser(manager, callback){
    	chrome.storage.sync.get('user', function (data) {
        	manager.user = data.user;
        	callback();
    	});
	}

	static retrieveKey(manager, callback){
		chrome.storage.sync.get('key', function (data) {
        	manager.key = data.key;
        	callback();
    	});
	}

	static request(settings){
		$.ajax(settings);
	}

}