class Step {
	constructor(icon = "fa-play-circle", body_text = "Card"){
		this.hidden = true;
		this.element = document.createElement("div");
		this.element.className = "hide";
		this.icon = icon;
		this.body = body_text;
		this.element.innerHTML = "<div class=\"step-contents\">"
		+"<i class=\"fa "+ this.icon +"\"></i>"
		+"<div class=\"step-body\">"+ this.body +"</div>"
		+"<div class=\"step-footer\">"
			+"<div class=\"progress progress-success\">"
				+"<div class=\"progress-bar progress-bar-success\" id=\"tournament-progress\" style=\"width: 1%\">"
				+"</div>"
			+"</div>"
		+"</div>"
		+"</div>";
		var next_steps = document.getElementsByClassName("next-steps")[0];
		var clear_steps = next_steps.getElementsByClassName("clear-steps")[0];
		next_steps.insertBefore(this.element, clear_steps)
	}

	hide(){
		this.element.className = "hide";
	}

	show(){
		this.element.className = "step";
	}

}

var stream_step = new Step();
stream_step.show();
