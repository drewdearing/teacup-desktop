const League = require('./league').League
const ModelManager = require('./modelManager').ModelManager

exports.LeagueManager = class LeagueManager extends ModelManager {
	constructor(admin, timeout, timecheck){
		super(League, admin, timeout, timecheck)
	}

	async saveCachedModel(league){
		let leagueDB = await league.leagueDB()
        let playerDB = await league.playerDB()
        let leagueData = await league.data()
        let playerData = await league.players()
        await leagueDB.set(leagueData)
        await playerDB.set(playerData)
        league._dirty = false
	}
}