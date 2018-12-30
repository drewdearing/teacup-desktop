var match_dictionary = null;
var api_manager = null;
var service_enabled = true;
var current_match = null;
var next_match = null;
var participants_dictionary = null;
var label_dictionary = null;
var UIChanged = true;

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

	destroy(){
		this.element.remove();
		this.element = null;
	}

	updateBody(body){
		this.step_body.text(body);
	}

	updateIcon(new_icon){
		this.icon.addClass(new_icon).removeClass(this.icon_name);
		this.icon_name = new_icon;
	}

	updateFooter(footer){
		this.step_footer.text(footer);
	}
}

class StreamIcon {
	constructor(match_snap, extension, match_id){
		this.match_id = match_id;
		this.extension = extension;
		this.match_snap = match_snap;
		this.element = extension.text(25, 30, "");	
		if(current_match == match_id || next_match == match_id){
			this.element.attr({text: ''});
			this.active = true;
		}
		else{
			this.active = false;
		}
		this.element.addClass("fa5-icon");
		this.element.addClass("match--fa-icon");
		this.tip = "Play on Stream";
		this.cancelTip = "Cancel Stream Match";
		this.tooltip = null;
		this.tooltip_rect = null;
		this.tooltip_text = null;
		this.tooltip_poly = null;
		this.element.attr({
			width: 21,
			height: 25,
			"text-anchor":"middle",
			"data-tooltip": this.tip
		});
		this.setOnHover();
		this.setOnClick();
	}

	toggle(){
		if(this.active){
			unqueueStreamMatch(this.match_id);
			this.element.attr({text: ''});
			this.active = false;
			this.tooltip_text.attr({text: this.tip});
			this.tooltip.attr({
				width: 101.925,
				x: 199.032478,
			});
			this.tooltip_rect.attr({
				width: 101.935
			});
			this.tooltip_poly.attr({
				points: "45.9675,5,55.9675,5,50.9675,0"
			});
			this.tooltip_text.attr({
				width: 81.64
			});
		}
		else{
			queueStreamMatch(this.match_id);
			this.element.attr({text: ''});
			this.active = true;
			this.tooltip_text.attr({text: this.cancelTip});
			this.tooltip.attr({
				width: 134.025,
				x: 182.987478,
			});
			this.tooltip_rect.attr({
				width: 134.025
			});
			this.tooltip_poly.attr({
				points: "62.0125,5,72.0125,5,67.0125,0"
			});
			this.tooltip_text.attr({
				width: 113.73
			});
		}
	}

	setOnClick(){
		var self = this;
		this.element.click(function(){
			self.toggle();
		});
	}

	setOnHover(){
		var self = this;
		this.element.hover(function(){
			if(!self.active){
				self.tooltip = Snap(101.935, 31);
				self.tooltip.addClass("svg-tooltip");
				self.tooltip.attr({
					x: 199.032478,
					y: 54
				});
				self.tooltip_rect = self.tooltip.rect(0, 5, 101.935, 26);
				self.tooltip_rect.attr({
					rx: 3,
					ry: 3
				});
				self.tooltip_poly = self.tooltip.polygon(45.9675,5,55.9675,5,50.9675,0);
				self.tooltip_text = self.tooltip.text(10.1475, 22, self.tip);
				self.tooltip_text.attr({
					height: 20,
					width: 81.64
				});
				
			}
			else{
				self.tooltip = Snap(134.025, 31);
				self.tooltip.addClass("svg-tooltip");
				self.tooltip.attr({
					x: 182.987478,
					y: 54
				});
				self.tooltip_rect = self.tooltip.rect(0, 5, 134.025, 26);
				self.tooltip_rect.attr({
					rx: 3,
					ry: 3
				});
				self.tooltip_poly = self.tooltip.polygon(62.0125,5,72.0125,5,67.0125,0);
				self.tooltip_text = self.tooltip.text(10.1475, 22, self.cancelTip);
				self.tooltip_text.attr({
					height: 20,
					width: 113.73
				});
			}

			self.match_snap.append(self.tooltip);
		},
		function(){
			self.tooltip.remove();
		});
	}
}

class Match {

	constructor(match_element, match_id, match_state, match_object){
		this.element = match_element;
		this.object = match_object;
		this.match_id = match_id;
		this.state = match_state;
		this.hover = false;
		this.setOnHover();
	}

	setOnHover(){
		var self = this;
		this.element.hover(function(){
			self.getOnHover($(self), true)();
		},
		function(){
			self.getOnHover($(self), false)();
		});
	}

	getOnHover(match, onHover){
		var self = match.get(0);
		if(onHover){
			return function(){
				var match_snap = Snap(self.element.get(0));
				var extension = match_snap.select(".match-extension");
				var texts = extension.selectAll(".match--fa-icon");
				var background = extension.select(".match--menu-wrapper");
				var state = self.state;
				var id = self.match_id;
				if(!self.hover){
					if(state == "open"){
						var curr_width = eval(background.attr("width"));
						background.attr({width: curr_width + 30});

						texts.forEach( function(text){
							var curr_x = eval(text.attr("x"));
							text.attr({x: curr_x + 30});
						});

						var stream_icon = new StreamIcon(match_snap, extension, id);
					}
					self.hover = true;
				}
				else{
					if(state == "open"){
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

class LabelDictionary {
	constructor(participants_dict, api){
		this.participants = participants_dict;
		this.manager = api;
		this.labels = {
			/*"score":{
				"name": "Score",
				"type": "set_unique",
				"selector": "integer_input",
				"default": 0
		}*/
		};
	}

	restoreLabelsFromCache(cached_dictionary){
		if(cached_dictionary != null){
			this.labels = cached_dictionary;
		}
	}

	createLabel(label_id, label_obj){
		if(!(label_id in this.labels)){
			this.labels[label_id] = label_obj;
			this.participants.createLabel(label_id);
			manager.updateCache({labels: this.labels}, function(){});
			return true;
		}
		else return false;
	}

	deleteLabel(label_id){
		delete this.labels[label_id];
		this.participants.deleteLabel(label_id);
		manager.updateCache({labels: this.labels}, function(){});
	}
}

class ParticipantsDictionary {
	constructor(manager, callback){
		this.manager = manager;
		this.participants_dictionary = {};
		var self = this;
		manager.getParticipants(function(data, textStatus, jqXHR){
			$.each(data, function(index, participant_obj){
				var p = {
					"info": participant_obj.participant,
					"labels": {},
					"defaults": {}
				}
				self.participants_dictionary[participant_obj.participant.id] = p;
			});
			callback();
		},
		function(){
			console.log("fail participants");
		});
	}

	restoreLabelsFromCache(cached_dictionary){
		if(cached_dictionary != null){
			$.each(cached_dictionary, function(key, value) {
				if(key in this.participants_dictionary){
					this.participants_dictionary[key].labels = value.labels;
					this.participants_dictionary[key].defaults = value.defaults;
				}
	    	});
		}
	}

	deleteLabel(label_name){
		$.each(this.participants_dictionary, function(key) {
			delete this.participants_dictionary[key].labels[label_name];
			delete this.participants_dictionary[key].defaults[label_name];
    	});

    	updateParticipantCache();
	}

	createLabel(label_name){
		$.each(this.participants_dictionary, function(key) {
			this.participants_dictionary[key].labels[label_name] = null;
    	});

    	updateParticipantCache();
	}

	resetLabel(participant_id, label_name){
		var p = this.participants_dictionary[participant_id];
		p.labels[label_name] = p.defaults[label_name];

		updateParticipantCache();
	}

	setLabelValue(participant_id, label_name, value){
		var participant = this.participants_dictionary[participant_id];
		participant.labels[label_name] = value;

		updateParticipantCache();
	}

	setLabelDefault(participant_id, label_name, value){
		var participant = this.participants_dictionary[participant_id];
		participant.defaults[label_name] = value;

		updateParticipantCache();
	}

	getParticipant(participant_id){
		return this.participants_dictionary[participant_id];
	}

	updateParticipantCache(){
		manager.updateCache({participants: this.participants_dictionary}, function(){});
	}
}

class MatchDictionary {
	
	constructor(manager, callback){
		this.manager = manager;
		this.match_dictionary = [];
		var self = this;
		manager.getMatches(function(data, textStatus, jqXHR){
			$.each(data, function(index, match_obj){
				var match_id = match_obj.match.id;
				var match_state = match_obj.match.state;
				var match_element = $( "svg[data-match-id='"+match_id+"']" ).first();
				var match = new Match(match_element, match_id, match_state, match_obj.match);
				self.match_dictionary.push(match);
			});
			callback();
		},
		function(){
			console.log("fail matches");
		});
	}

	checkMatchUpdate(callback){
		var match_dictionary = this.match_dictionary;
		var manager = this.manager;

		manager.getMatches(function(data, textStatus, jqXHR){
			var changed = false;
			$.each(data, function(index, match_obj){
				var dict_obj = match_dictionary[index];
				if(dict_obj.state != match_obj.match.state){
					changed = true;
					dict_obj.state = match_obj.match.state;
					dict_obj.object = match_obj.match;
				}
			});

			if(current_match != manager.tournament_cache.current_match
				|| next_match != manager.tournament_cache.next_match){
				changed = true;
				manager.updateCache({current_match: current_match, next_match: next_match}, function(){
					callback(changed);
				});
			}
			else{
				callback(changed);
			}
		},
		function(){
			console.log("get matches failed.");
		});
	}

	getMatch(match_id){
		var return_match = null;
		for(let i=0; i < this.match_dictionary.length; i++){
			if(this.match_dictionary[i].match_id === match_id){
				return_match = this.match_dictionary[i];
				break;
			}
		}
		return return_match;
	}
}

function queueStreamMatch(match_id){
	var match = match_dictionary.getMatch(match_id);
	if(match != null){
		if(current_match == null){
			current_match = match_id;
			match.element.find(".match--wrapper-background").addClass("-live");
		}
		else{
			if(next_match != null){
				unqueueStreamMatch(next_match);
			}
			next_match = match_id;
			match.element.find(".match--wrapper-background").addClass("-livequeue");
		}
	}
}

function unqueueStreamMatch(match_id){
	if(current_match === match_id){
		match_dictionary.getMatch(current_match).element.find(".match--wrapper-background").removeClass("-live -livequeue");
		current_match = null;
		if(next_match != null){
			match_dictionary.getMatch(next_match).element.find(".match--wrapper-background").removeClass("-livequeue");
			queueStreamMatch(next_match);
			next_match = null;
		}
	}
	else if(next_match === match_id){
		match_dictionary.getMatch(next_match).element.find(".match--wrapper-background").removeClass("-live -livequeue");
		next_match = null;
	}
}

function onMatchUpdate(changed){
	UIChanged = changed;
	if(changed){
		console.log("bracket updated.");
	}
}

function init_cache_data(callback){
	console.log("setting cache values");
	queueStreamMatch(api_manager.tournament_cache.current_match);
	queueStreamMatch(api_manager.tournament_cache.next_match);
	participants_dictionary.restoreLabelsFromCache(api_manager.tournament_cache.participants);
	label_dictionary.restoreLabelsFromCache(api_manager.tournament_cache.labels);
	callback();
}

function init_match_dictionary(callback){
	match_dictionary = new MatchDictionary(api_manager, callback);
}

function init_participants(callback){
	participants_dictionary = new ParticipantsDictionary(api_manager, callback);
}

function init_labels(callback){
	label_dictionary = new LabelDictionary(participants_dictionary, api_manager);
	callback();
}

function init_service(callback){
	init_match_dictionary(function(){
		init_participants(function(){
			init_labels(function(){
				init_cache_data(callback);
			});
		});
	});
}

function start_service() {
	var stream_step = new Step();
	var serviceInterval = null;
	api_manager.getTournament(check_state, end_service);

	function check_state(data, textStatus, jqXHR){
		var state = data.tournament.state;
		console.log(state);
		if(state == "pending"){
			stream_step.updateBody("Start the tournament to get started with StreamAssist!");
			stream_step.show();
			end_service();
		}
		else if(state == "complete"){
			stream_step.destroy();
			end_service();
		}
		else{
			serviceInterval = setInterval(service, 1000);
		}
	}

	function service(){
		if(UIChanged){
			if(current_match == null){
				stream_step.updateBody("Welcome to StreamAssist.");
				stream_step.show();
			}
			else{
				var match = match_dictionary.getMatch(current_match).object;
				var p1 = participants_dictionary.getParticipant(match.player1_id);
				var p2 = participants_dictionary.getParticipant(match.player2_id);
				stream_step.updateBody("Now Streaming: " + p1.info.name + " vs. " + p2.info.name);
				stream_step.show();
			}
		}
		update_matches();
	}

	function update_matches(){
		match_dictionary.checkMatchUpdate(onMatchUpdate);
	}

	function end_service(){
		if(serviceInterval != null){
			clearInterval(serviceInterval);
			serviceInterval = null;
		}
	}
}

$(function(){
	var tournament_body = $('.tournaments.tournaments-show');
	if(tournament_body.length > 0){
		api_manager = new APIManager(window.location);
		api_manager.initAuth(function(){
			init_service(start_service);
		});
	}
	else{
		console.log("not a tournament page.");
	}
});