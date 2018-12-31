var TourneyState = Object.freeze({"pending": 0, "underway": 1, "complete": 2});
var MatchState = Object.freeze({"pending": 0, "open": 1, "complete": 2});

var tournament_state = TourneyState.underway;
var tournament_owner = true;

class APIManager {

	constructor(tournament_location){
		this.tournament_cache = null;
		this.is_owner = false;
		this.is_authenticated = false;
		this.user = "";
		this.key = "";
		var hosts = tournament_location.host.split(".");
		var id = tournament_location.pathname.replace(/^\/+/g, '');
		this.url_id = (hosts.length == 3) ? hosts[0] + "-" + id : id;
	}

	initAuth(callback){
		this.retrieveUser(() => {
			this.retrieveKey(() => {
				this.testAuth((data, textStatus, jqXHR) => {
					console.log("success auth");
					this.is_authenticated = true;
					this.setIsOwner(() => {
						this.initCache(callback);
					}, data);
				},
				(jqXHR, textStatus, errorThrown, loginAttempt) => {
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
    	chrome.storage.sync.get('tournament_cache', (data) => {
        	var cache = data.tournament_cache;
        	this.tournament_cache = (this.url_id in cache) ? cache[this.url_id] : null;
        	if(this.tournament_cache == null){
        		console.log("cache is null");
        		this.tournament_cache = {
        			"url_id": this.url_id,
        			"current_match": null,
        			"next_match": null,
        			"labels": null,
        			"participants": null
        		}
        		cache[this.url_id] = this.tournament_cache;
        		chrome.storage.sync.set({tournament_cache: cache}, () => {
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
        $.each(data, (key, value) => {
            this.tournament_cache[key] = value;
        });
        chrome.storage.sync.get('tournament_cache', (data) => {
            var cache = data.tournament_cache;
            cache[this.url_id] = this.tournament_cache;
            chrome.storage.sync.set({tournament_cache: cache}, () => {
                console.log("update cache in storage");
                callback();
            });
        });
    }

	setIsOwner(callback, this_tournament){
		if(this.is_authenticated){
			var current_desc = this_tournament.tournament.description;
			var api_url = this.getAPIURL("tournaments/"+this.url_id+".json");
			APIManager.request({
				url: api_url,
				method: "PUT",
				dataType: 'json',
				contentType: 'application/json',
				data: JSON.stringify({tournament: {description: current_desc}}),
				success: (data, textStatus, jqXHR) => {
					this.is_owner = true;
					callback();
				},
				error: (jqXHR, textStatus, errorThrown) => {
					this.is_owner = false;
					callback();
				}
			});
		}
		else{
			this.is_owner = false;
			callback();
		}
	}

	testAuth(success, fail){
		if(this.user != "" && this.key != ""){
			this.getTournament((data, textStatus, jqXHR) => {
				success(data, textStatus, jqXHR);
			},
			(jqXHR, textStatus, errorThrown) => {
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
			success: (data, textStatus, jqXHR) => {
				success(data, textStatus, jqXHR);
			},
			error: (jqXHR, textStatus, errorThrown) => {
				fail(jqXHR, textStatus, errorThrown);
			}
		});
	}

	getMyTournaments(success, fail){
		var api_url = this.getAPIURL("tournaments.json");
		APIManager.request({
			url: api_url,
			method: "GET",
			success: (data, textStatus, jqXHR) => {
				success(data, textStatus, jqXHR);
			},
			error: (jqXHR, textStatus, errorThrown) => {
				fail(jqXHR, textStatus, errorThrown);
			}
		});
	}

	getMatches(success, fail){
		var api_url = this.getAPIURL("tournaments/"+this.url_id+"/matches.json");
		APIManager.request({
			url: api_url,
			method: "GET",
			success: (data, textStatus, jqXHR) => {
				success(data, textStatus, jqXHR);
			},
			error: (jqXHR, textStatus, errorThrown) => {
				fail(jqXHR, textStatus, errorThrown);
			}
		});
	}

	getParticipants(success, fail){
		var api_url = this.getAPIURL("tournaments/"+this.url_id+"/participants.json");
		APIManager.request({
			url: api_url,
			method: "GET",
			success: (data, textStatus, jqXHR) => {
				success(data, textStatus, jqXHR);
			},
			error: (jqXHR, textStatus, errorThrown) => {
				fail(jqXHR, textStatus, errorThrown);
			}
		});
	}

	getMatch(match_id, success, fail){
		var api_url = this.getAPIURL("tournaments/"+this.url_id+"/matches/"+match_id+".json");
		APIManager.request({
			url: api_url,
			method: "GET",
			success: (data, textStatus, jqXHR) => {
				success(data, textStatus, jqXHR);
			},
			error: (jqXHR, textStatus, errorThrown) => {
				fail(jqXHR, textStatus, errorThrown);
			}
		});
	}

	retrieveUser(callback){
    	chrome.storage.sync.get('user', (data) => {
        	this.user = data.user;
        	callback();
    	});
	}

	retrieveKey(callback){
		chrome.storage.sync.get('key', (data) => {
        	this.key = data.key;
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