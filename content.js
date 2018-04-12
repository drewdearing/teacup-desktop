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

function matchListsNotEqual(list1, list2){
	if(list1.length != list2.length){
		console.log("lists not equal size");
		return true;
	}
	for(let i = 0; i < list1.length; i++){
		var id1 = list1.eq(i).attr("data-match-id");
		var id2 = list1.eq(i).attr("data-match-id");
		if(id1 != id2){
			console.log("ids do not match");
			return true;
		}
	}
	return false;
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

		var open_matches = $('.match.-open');

		if(open_matches.length > 0){
			var stream_step = new Step();
			stream_step.show();
			var refreshUI = setInterval(function() {
				var curr_open = $('.match.-open');
				if (curr_open.length > 0) {
					if(matchListsNotEqual(open_matches, curr_open)){
						open_matches = curr_open;
						console.log("bracket updated");
					}
				}
				else{
					stream_step.hide();
					console.log("tournament over");
					clearInterval(refreshUI)
				}
			}, 1000);
		}
		else{
			console.log("tournament has not started, finished, or something is wrong.")
		}
	}
	else{
		console.log("not a tournament page.");
	}
});