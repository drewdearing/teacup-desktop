const ModelManager = require('./modelManager').ModelManager
const User = require('./models/user').User
const League = require('./models/league').League
const LeaguePlayers = require('./models/players').LeaguePlayers
const Guild = require('./models/guild').Guild
const GuildMembers = require('./models/members').GuildMembers
const Scene = require('./models/scene').Scene
const Community = require('./models/community').Community

exports.FirebaseManager = class FirebaseManager {
    
    constructor(admin, timeout, timecheck){
    	this.admin = admin
        this.db = admin.firestore()
        this.users = new ModelManager(User, this, admin, timeout, timecheck)
        this.leagues = new ModelManager(League, this, admin, timeout, timecheck)
        this.league_players = new ModelManager(LeaguePlayers, this, admin, timeout, timecheck)
        this.guilds = new ModelManager(Guild, this, admin, timeout, timecheck)
        this.guild_members = new ModelManager(GuildMembers, this, admin, timeout, timecheck)
        this.scenes = new ModelManager(Scene, this, admin, timeout, timecheck)
        this.communities = new ModelManager(Community, this, admin, timeout, timecheck)
    }

    async close(){
        await this.users.close()
        await this.leagues.close()
        await this.league_players.close()
        await this.guilds.close()
        await this.guild_members.close()
        await this.scenes.close()
        await this.communities.close()
    }

    async createScene(sceneData){
        try{
            let sceneDB = await this.db.collection('scenes').doc()
            let scene = await this.scenes.get(sceneDB.id)
            await scene.init(sceneData)
            return scene
        }
        catch(err){
            console.log(err)
            throw err
        }
    }

    async createUser(email, password){
        try{
            let newUser = await this.admin.auth().createUser({
                email: email,
                password: password
            })
            let user = await this.users.get(newUser.uid)
            await user.init()
            return user
        }
        catch(err){
            console.log(err)
            throw err
        }
    }
}