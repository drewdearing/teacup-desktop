const LeagueManager = require('./leagueManager').LeagueManager
const GuildManager = require('./guildManager').GuildManager
const UserManager = require('./userManager').UserManager
const SceneManager = require('./sceneManager').SceneManager

exports.FirebaseManager = class FirebaseManager {
    
    constructor(admin, timeout, timecheck){
    	this.admin = admin
        this.leagues = new LeagueManager(admin, timeout, timecheck)
        this.guilds = new LeagueManager(admin, timeout, timecheck)
        this.users = new UserManager(admin, timeout, timecheck)
        this.scenes = new SceneManager(admin, timeout, timecheck)
    }

    async close(){
        await this.leagues.close()
        await this.guilds.close()
        await this.users.close()
        await this.scenes.close()
    }
}