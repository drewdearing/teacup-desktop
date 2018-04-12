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

$(function(){
	var tournament_body = $('.tournaments.tournaments-show');
	if(tournament_body.length > 0){

		var tournament_id = window.location.pathname.replace(/^\/+/g, '');
		var username = "";
		var key = "";

		chrome.storage.sync.get('user', function(data) {
			username = data.user;
		});

		chrome.storage.sync.get('key', function(data) {
			key = data.key;
		});

		console.log(tournament_id);

		var open_matches = $('.match.-open');

		console.log("Number of open matches: "+open_matches.length);

		if(open_matches.length > 0){
			var stream_step = new Step();
			stream_step.show();
		}
		else{
			console.log("tournament has not started, finished, or something is wrong.")
		}
	}
	else{
		console.log("not a tournament page.");
	}
});