const timeoutPromise = require('./timeoutPromise').timeoutPromise

exports.Service = class Service {

	constructor(type, id, league){
		this.type = type
		this.service_id = id
		this.league = league
	}

	update() {
		throw new Error('you must implement this function in a child service!')
	}

}