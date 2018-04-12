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

var match_dictionary = null;

function initMatchDictionary(){
	var matches = $('.match');
	var dict = {
		total_matches: 0,
		num_open_matches: 0,
		match_objects: []
	};
	for(let i = 0; i < matches.length; i++){
		var match = matches.eq(i);
		var match_id = match.attr("data-match-id");
		var match_open = match.hasClass("-open");
		if(match_open){
			dict.num_open_matches += 1;
		}
		dict.total_matches += 1;
		var match_obj = {
			element: match,
			match_id: match_id,
			open: match_open
		}
		dict.match_objects.push(match_obj);
	}

	match_dictionary = dict;
}

function checkMatchUpdate(){
	if(match_dictionary != null){
		var changed = false;
		for(let i = 0; i < match_dictionary.match_objects.length; i++){
			var match_obj = match_dictionary.match_objects[i];
			if(match_obj.open && !match_obj.element.hasClass("-open")){
				changed = true;
				match_obj.open = false;
				match_dictionary.num_open_matches -= 1;
			}
			else if(!match_obj.open && match_obj.element.hasClass("-open")){
				changed = true;
				match_obj.open = true;
				match_dictionary.num_open_matches += 1;
			}
		}
		return changed;
	}
	else{
		console.log("dict is null");
		return false;
	}
}

$(function(){
	var tournament_body = $('.tournaments.tournaments-show');
	if(tournament_body.length > 0){

		var tournament_id = window.location.pathname.replace(/^\/+/g, '');
		console.log("tournament_id: "+tournament_id);
		var username = "";
		var key = "";

		chrome.storage.sync.get('user', function(data) {
			username = data.user;
		});

		chrome.storage.sync.get('key', function(data) {
			key = data.key;
		});

		$( ".match" ).change(function() {
			console.log("changed.")
		});

		initMatchDictionary();

		var stream_step = new Step();
		stream_step.show();
		var refreshUI = setInterval(function() {
			if(checkMatchUpdate()){
				console.log("bracket updated");
			}
		}, 1000);
	}
	else{
		console.log("not a tournament page.");
	}
});