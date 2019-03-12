const BraacketService = require('./braacketService').BraacketService

exports.ServiceManager = class ServiceManager {

	static init(type, id){
		if(type === 'braacket'){
			return new BraacketService(id)
		}
		else{
			return null
		}
	}

	static isType(type){
		if(type === 'braacket'){
			return true
		}
		else{
			return false
		}
	}

}