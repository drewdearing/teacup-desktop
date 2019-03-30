const Model = require('../model').Model

exports.Guild = class Guild extends Model {

    constructor(guild_id, admin, fb){
        let guildDB = admin.firestore().collection('guilds').doc(guild_id)
        super(guild_id, admin, fb, guildDB)
    }

    async init(data){

    }

    async members(){
        let data = await this.data()
        let members_id = data.members
        let members = await this._fb.guild_members.get(members_id)
        let members_data = await members.data()
        this._fb.guild_members.finish(members_id)
        return members_data
    }
    
}