var TourneyState = Object.freeze({"pending": 0, "underway": 1, "complete": 2});
var MatchState = Object.freeze({"pending": 0, "open": 1, "complete": 2});

var tournament_state = TourneyState.underway;
var tournament_owner = true;

class APIManager {

	constructor(tournament_location){
		this.tournament_location = tournament_location;
		this.tournament_id = "";
		this.is_owner = false;
		this.is_authenticated = false;
		this.user = "";
		this.key = "";
		this.url_id = "";
	}

	initAuth(callback){
		var manager = this;
		manager.retrieveUser(function(){
			manager.retrieveKey(function(){
				manager.testAuth(function(data, textStatus, jqXHR){
					console.log("success auth");
					manager.is_authenticated = true;
					manager.setIsOwner(callback, data);
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

	setIsOwner(callback, my_tournaments){
		if(this.is_authenticated){
			var self = this;
			var hosts = this.tournament_location.host.split(".");
			var id = this.tournament_location.pathname.replace(/^\/+/g, '');
			if(hosts.length == 3) this.url_id = hosts[0] + "-" + id;
			else this.url_id = id;

			this.getTournament(function(data, textStatus, jqXHR){
				self.tournament_id = data.tournament.id;
				self.is_owner = false;
				$.each(my_tournaments, function(index, tournament_obj){
					if(tournament_obj.tournament.id == self.tournament_id){
						self.is_owner = true;
						return false;
					}
				});
				callback();
			},
			function(jqXHR, textStatus, errorThrown){
				self.is_owner = false;
				callback();
			});
		}
		else{
			this.is_owner = false;
			callback();
		}
	}

	testAuth(success, fail){
		if(this.user != "" && this.key != ""){
			this.getMyTournaments(function(data, textStatus, jqXHR){
				success(data, textStatus, jqXHR);
			},
			function(jqXHR, textStatus, errorThrown){
				fail(jqXHR, textStatus, errorThrown, true);
			});
		}
		else{
			console.log("failed bc null");
			fail(null, null, null, false);
		}
	}

	getTournament(success, fail){
		var api_url = this.getAPIURL("tournaments/"+this.url_id+".json");
		APIManager.request({
			url: api_url,
			method: "GET",
			success: function(data, textStatus, jqXHR){
				success(data, textStatus, jqXHR);
			},
			error: function(jqXHR, textStatus, errorThrown){
				fail(jqXHR, textStatus, errorThrown);
			}
		});
	}

	getMyTournaments(success, fail){
		var api_url = this.getAPIURL("tournaments.json");
		APIManager.request({
			url: api_url,
			method: "GET",
			success: function(data, textStatus, jqXHR){
				success(data, textStatus, jqXHR);
			},
			error: function(jqXHR, textStatus, errorThrown){
				fail(jqXHR, textStatus, errorThrown);
			}
		});
	}

	getMatches(success, fail){
		var api_url = this.getAPIURL("tournaments/"+this.url_id+"/matches.json");
		APIManager.request({
			url: api_url,
			method: "GET",
			success: function(data, textStatus, jqXHR){
				success(data, textStatus, jqXHR);
			},
			error: function(jqXHR, textStatus, errorThrown){
				fail(jqXHR, textStatus, errorThrown);
			}
		});
	}

	retrieveUser(callback){
		var self = this;
    	chrome.storage.sync.get('user', function (data) {
        	self.user = data.user;
        	callback();
    	});
	}

	retrieveKey(callback){
		var self = this;
		chrome.storage.sync.get('key', function (data) {
        	self.key = data.key;
        	callback();
    	});
	}

	getAPIURL(api_path){
		return "https://"+this.user+":"+this.key+"@api.challonge.com/v1/"+api_path;
	}

	static request(settings){
		$.ajax(settings);
	}

}