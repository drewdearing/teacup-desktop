const Guild = require('./guild').Guild
const ModelManager = require('./modelManager').ModelManager

exports.GuildManager = class GuildManager extends ModelManager {
	constructor(admin, timeout, timecheck){
		super(Guild, admin, timeout, timecheck)
	}

	async saveCachedModel(guild){
		let guildDB = await guild.guildDB()
        let memberDB = await guild.memberDB()
        let guildData = await guild.data()
        let memberData = await guild.members()
        await guildDB.set(guildData)
        await memberDB.set(memberData)
        guild._dirty = false
	}
}