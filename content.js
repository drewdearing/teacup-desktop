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

class StreamIcon {
	constructor(match_snap, extension){
		this.extension = extension;
		this.match_snap = match_snap;
		this.active = false;
		this.element = extension.text(25, 30, "");
		this.element.addClass("match--fa-icon");
		this.tip = "Play on Stream";
		this.tooltip = null;
		this.element.attr({
			width: 21,
			height: 25,
			"text-anchor":"middle",
			"data-tooltip": this.tip
		});
		this.setOnHover();
	}

	toggle(){
		if(active){
			this.element.attr({text: ''});
			this.active = false;
		}
		else{
			this.element.attr({text: ''});
			this.active = true;
		}
	}

	setOnHover(){
		var self = this;
		this.element.hover(function(){
			self.tooltip = Snap(101.935, 31);
			self.tooltip.addClass("svg-tooltip");
			self.tooltip.attr({
				x: 199.032478,
				y: 54
			});
			var tooltip_rect = self.tooltip.rect(0, 5, 101.935, 26);
			tooltip_rect.attr({
				rx: 3,
				ry: 3
			});
			var tooltip_poly = self.tooltip.polygon(45.9675,5,55.9675,5,50.9675,0);
			var tooltip_text = self.tooltip.text(10.1475, 22, self.tip);
			tooltip_text.attr({
				height: 20,
				width: 81.64
			});
			self.match_snap.append(self.tooltip);
		},
		function(){
			self.tooltip.remove();
		});
	}
}

class Match {

	constructor(match_element, match_id, match_state){
		this.element = match_element;
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

						var stream_icon = new StreamIcon(match_snap, extension);
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

class MatchDictionary {
	
	constructor(manager){
		this.manager = manager;
		this.match_dictionary = [];
		var self = this;
		manager.getMatches(function(data, textStatus, jqXHR){
			$.each(data, function(index, match_obj){
				var match_id = match_obj.match.id;
				var match_state = match_obj.match.state;
				var match_element = $( "svg[data-match-id='"+match_id+"']" ).first();
				var match = new Match(match_element, match_id, match_state);
				self.match_dictionary.push(match);
			});
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
				if(dict_obj.match_id != match_obj.match.id){
				}

				if(dict_obj.state != match_obj.match.state){
					changed = true;
					dict_obj.state = match_obj.match.state;
				}
			});
			callback(changed);
		},
		function(){
			console.log("get matches failed.");
		});
	}
}

function onMatchUpdate(changed){
	if(changed){
		console.log("bracket updated.");
	}
}

function start_service(){
	console.log(api_manager.is_authenticated +" " + api_manager.is_owner);
	match_dictionary = new MatchDictionary(api_manager);
	var stream_step = new Step();
	stream_step.updateBody("Welcome to StreamAssist.");
	stream_step.show();
	var refreshUI = setInterval(function() {
		match_dictionary.checkMatchUpdate(onMatchUpdate);
	}, 1000);
}

$(function(){
	var tournament_body = $('.tournaments.tournaments-show');
	if(tournament_body.length > 0){
		api_manager = new APIManager(window.location);
		api_manager.initAuth(start_service);
		
	}
	else{
		console.log("not a tournament page.");
	}
});