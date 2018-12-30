var TourneyState = Object.freeze({"pending": 0, "underway": 1, "complete": 2});
var MatchState = Object.freeze({"pending": 0, "open": 1, "complete": 2});

var tournament_state = TourneyState.underway;
var tournament_owner = true;

class APIManager {

	constructor(tournament_location){
		this.tournament_location = tournament_location;
		this.tournament_id = "";
		this.tournament_cache = null;
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
					manager.setIsOwner(function(){
						manager.initCache(callback);
					}, data);
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

	initCache(callback){
		var self = this;
    	chrome.storage.sync.get('tournament_cache', function (data) {
        	var cache = data.tournament_cache;
        	for(let i = 0; i < cache.length; i++){
        		if(cache[i].url_id === self.url_id){
        			self.tournament_cache = cache[i];
        			break;
        		}
        	}
        	if(self.tournament_cache == null){
        		console.log("cache is null");
        		self.tournament_cache = {
        			"url_id": self.url_id,
        			"current_match": null,
        			"next_match": null,
        			"labels": null,
        			"participants": null
        		}
        		cache.push(self.tournament_cache);
        		chrome.storage.sync.set({tournament_cache: cache}, function() {
        			console.log("set cache in storage");
        			callback();
        		});
        	}
        	else{
        		console.log("was not null, found cache.");
        		callback();
        	}
    	});
	}

	updateCache(data, callback){
		var self = this;
		$.each(data, function(key, value) {
			self.tournament_cache[key] = value;
    	});
		chrome.storage.sync.get('tournament_cache', function (data) {
        	var cache = data.tournament_cache;
        	var index = null;
        	for(let i = 0; i < cache.length; i++){
        		if(cache[i].url_id === self.url_id){
        			index = i;
        			break;
        		}
        	}
        	if(index != null){
        		cache[index] = self.tournament_cache;
        	}
        	else{
        		cache.push(self.tournament_cache);
        	}
        	chrome.storage.sync.set({tournament_cache: cache}, function() {
        		console.log("update cache in storage");
        		callback();
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

	getParticipants(success, fail){
		var api_url = this.getAPIURL("tournaments/"+this.url_id+"/participants.json");
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

	getMatch(match_id, success, fail){
		var api_url = this.getAPIURL("tournaments/"+this.url_id+"/matches/"+match_id+".json");
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