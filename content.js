var match_dictionary = null;
var api_manager = null;
var service_enabled = true;

class Step {
	constructor(icon = "fa-play-circle"){
		this.hidden = true;
		this.icon_name = icon;
		this.element = $("<div>", {"class": "hide"});
		this.step_contents = $("<div>", {"class": "step-contents"});
		this.icon = $("<i>", {"class": "fa " + this.icon_name});
		this.step_body = $("<div>", {"class": "step-body"});
		this.step_footer = $("<div>", {"class": "step-footer"});
		this.element.append(this.step_contents);
		this.step_contents.append(this.icon);
		this.step_contents.append(this.step_body);
		this.step_contents.append(this.step_footer);

		var clear_steps = $(".next-steps").first().find("div.clear-steps");
		clear_steps.before(this.element);
	}

	hide(){
		if(!this.hidden){
			this.element.addClass('hide').removeClass('step');
			this.hidden = true;
		}
	}

	show(){
		if(this.hidden){
			this.element.addClass('step').removeClass('hide');
			this.hidden = false;
		}
	}

	updateBody(body){
		this.step_body.replaceWith(body);
	}

	updateIcon(new_icon){
		this.icon.addClass(new_icon).removeClass(this.icon_name);
		this.icon_name = new_icon;
	}

	updateFooter(footer){
		this.step_footer.replaceWith(footer);
	}
}

class Match {

	constructor(match){
		this.element = match;
		this.match_id = this.element.attr("data-match-id");
		this.state = this.getState();
		this.hover = false;
		this.setOnHover();
	}

	setOnHover(){
		var id = this.match_id;
		var state = this.state;
		this.element.hover(
			this.getOnHover($(this), true),
			this.getOnHover($(this), false)
		);
	}

	getState(){
		return Match.getMatchState(this.element);
	}

	static getMatchState(element){
		if(element.hasClass("-pending")){
			return MatchState.pending;
		}
		if(element.hasClass("-open")){
			return MatchState.open;
		}		
		if(element.hasClass("-complete")){
			return MatchState.complete;
		}
	}

	getOnHover(match, onHover){
		var self = match.get(0);
		if(onHover){
			return function(){
				var extension = Snap(self.element.get(0)).select(".match-extension");
				var texts = extension.selectAll(".match--fa-icon");
				var background = extension.select(".match--menu-wrapper");
				var state = self.state;
				var id = self.match_id;
				if(!self.hover){
					if(state == MatchState.open){
						var curr_width = eval(background.attr("width"));
						background.attr({width: curr_width + 30});

						texts.forEach( function(text){
							var curr_x = eval(text.attr("x"));
							text.attr({x: curr_x + 30});
						});

						var stream_icon = extension.text(25, 30, "");
						stream_icon.addClass("match--fa-icon");
						stream_icon.attr({
								width: 21,
								height: 25,
								"text-anchor":"middle",
								"data-tooltip":"Add Match to Stream"
						});
					}
					self.hover = true;
				}
				else{
					if(state == MatchState.open){
						console.log(texts);
						texts.forEach(function(text){
							var curr_tip = text.attr("data-tooltip");
							if(curr_tip == "Unmark as In Progress" || curr_tip == "Mark as In Progress"){
								var curr_x = eval(text.attr("x"));
								text.attr({x: curr_x + 30});
							}
						});
					}
				}
			}
		}
		else{
			return function(){
				self.hover = false;
			}
		}
	}
}

class MatchDictionary {
	
	constructor(response_data){
		self.matches = []
		this.match_dictionary = {
			total_matches: 0,
			match_objects: []
		};
		for(let i = 0; i < matches.length; i++){
			var match = new Match(matches.eq(i));
			this.match_dictionary.total_matches++;
			this.match_dictionary.match_objects.push(match);
		}
	}

	checkMatchUpdate(){
		var changed = false;
		var match_dictionary = this.match_dictionary;
		for(let i = 0; i < match_dictionary.match_objects.length; i++){
			var match_obj = match_dictionary.match_objects[i];
			if(match_obj.state != match_obj.getState()){
				changed = true;
				match_obj.state = match_obj.getState();
			}
		}
		return changed;
	}
}

function onGetMatches(data){
	console.log("new matches data: ")
	console.log(data)

	/*
	var stream_step = new Step();
	stream_step.updateBody("Welcome to StreamAssist.");
	stream_step.show();*/
}

function start_service(api_manager){
	console.log(api_manager.initialization_data)
	console.log(api_manager.is_authenticated + " " + api_manager.is_owner);
	var refreshUI = setInterval(function() {
/*		if(match_dictionary.checkMatchUpdate()){
			console.log("bracket updated");
		}*/
		api_manager.getMatches(onGetMatches);
	}, 1000);
}

$(function(){
	var tournament_body = $('.tournaments.tournaments-show');
	if(tournament_body.length > 0){

		var tournament_id = window.location.pathname.replace(/^\/+/g, '');
		console.log("tournament_id: "+tournament_id);

		api_manager = new APIManager(tournament_id);
		api_manager.initialize(start_service);
	}
	else{
		console.log("not a tournament page.");
	}
});
