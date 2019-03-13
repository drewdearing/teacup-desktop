const League = require('./league').League
const Guild = require('./guild').Guild
const NodeCache = require( "node-cache" )
const AccessLocker = require('./accessLocker').AccessLocker

exports.FirebaseManager = class FirebaseManager {
    
    constructor(db, timeout, timecheck){
        this.db = db
        this.cache_timer = timeout
        this.checkperiod = timecheck
        this.league_cache = new NodeCache({
            deleteOnExpire: false,
            useClones: false,
            checkperiod: this.checkperiod
        })
        this.guild_cache = new NodeCache({
            deleteOnExpire: false,
            useClones: false,
            checkperiod: this.checkperiod
        })
        this.league_locker = new AccessLocker()
        this.guild_locker = new AccessLocker()
        this.league_cache.on("expired", this.onLeagueExpire.bind(this))
        this.guild_cache.on("expired", this.onGuildExpire.bind(this))
    }

    async createLeagueEntry(league_id){
        if(!this.league_locker.lockExists(league_id)){
            this.league_locker.addLock(league_id)
        }
        await this.league_locker.getWriteAccess(league_id)
        let league = this.league_cache.get(league_id)
        if(league == undefined){
            league = new League(league_id, this.db)
            this.league_cache.set(league_id, league)
        }
        this.league_locker.stopWriting(league_id)
        return league
    }

    async createGuildEntry(guild_id){
        if(!this.guild_locker.lockExists(guild_id)){
            this.guild_locker.addLock(guild_id)
        }
        await this.guild_locker.getWriteAccess(guild_id)
        let guild = this.guild_cache.get(guild_id)
        if(guild == undefined){
            guild = new Guild(guild_id, this.db)
            this.guild_cache.set(guild_id, guild)
        }
        this.guild_locker.stopWriting(guild_id)
        return guild
    }

    async getGuild(guild_id){
        let guild = this.guild_cache.get(guild_id)
        if (guild == undefined){
            guild = await this.createGuildEntry(guild_id)
        }
        await this.guild_locker.getReadAccess(guild_id)
        this.guild_cache.ttl(guild_id, this.cache_timer)
        return guild
    }

    async getLeague(league_id){
        let league = this.league_cache.get(league_id)
        if (league == undefined){
            league = await this.createLeagueEntry(league_id)
        }
        await this.league_locker.getReadAccess(league_id)
        this.league_cache.ttl(league_id, this.cache_timer)
        return league
    }

    async deleteGuild(guild){
        let guild_id = await guild.guild_id()
        await this.guild_locker.getWriteAccess(guild_id)
        if(guild.dirty()){
            let guildDB = await guild.guildDB()
            let memberDB = await guild.memberDB()
            let guildData = await guild.data()
            let memberData = await guild.members()
            await guildDB.set(guildData)
            await memberDB.set(memberData)
            guild._dirty = false
        }
        this.guild_cache.del(guild_id)
        this.guild_locker.stopWriting(guild_id)
    }

    async deleteLeague(league){
        let league_id = await league.league_id()
        await this.league_locker.getWriteAccess(league_id)
        if(league.dirty()){
            let leagueDB = await league.leagueDB()
            let playerDB = await league.playerDB()
            let leagueData = await league.data()
            let playerData = await league.players()
            await leagueDB.set(leagueData)
            await playerDB.set(playerData)
            league._dirty = false
        }
        this.league_cache.del(league_id)
        this.league_locker.stopWriting(league_id)
    }

    async onGuildExpire(guild_id, guild){
        if(this.guild_locker.numReaders(guild_id) <= 0){
            await this.deleteGuild(guild)
        }
        else{
            if(!guild.expired()){
                let listener = async (data) => {
                    if(!data.isReading){
                        let currentReaders = this.guild_locker.numReaders(guild_id)
                        if(currentReaders <= 0){
                            await this.deleteGuild(guild)
                            this.guild_locker.removeReadListener(guild_id, listener)
                            
                        }
                    }
                    else{
                        guild._expired = false
                        this.guild_locker.removeReadListener(guild_id, listener)
                    }
                    
                }
                guild._expired = true
                this.guild_locker.addReadListener(guild_id, listener)
            }
        }
    }

    async onLeagueExpire(league_id, league){
        if(this.league_locker.numReaders(league_id) <= 0){
            await this.deleteLeague(league)
        }
        else{
            if(!league.expired()){
                let listener = async (data) => {          
                    if(!data.isReading){                       
                        let currentReaders = this.league_locker.numReaders(league_id)
                        if(currentReaders <= 0){
                            await this.deleteLeague(league)
                            this.league_locker.removeReadListener(league_id, listener)
                        }
                    }
                    else{
                        league._expired = false
                        this.league_locker.removeReadListener(league_id, listener)
                    }
                }
                league._expired = true
                this.league_locker.addReadListener(league_id, listener)
            }
        }
    }

    async close(){
        let leagueIDs = this.league_cache.keys()
        let guildIDs = this.guild_cache.keys()
        for(var i in leagueIDs){
            let league_id = leagueIDs[i]
            let league = this.league_cache.get(league_id)
            await this.deleteLeague(league)
        }

        for(var i in guildIDs){
            let guild_id = guildIDs[i]
            let guild = this.guild_cache.get(guild_id)
            await this.deleteGuild(guild)
        }

        this.league_cache.flushAll()
        this.guild_cache.flushAll()
        this.league_cache.close()
        this.guild_cache.close()
    }

    closeGuild(guild_id){
        if(this.guild_locker.lockExists(guild_id)){
            this.guild_locker.stopReading(guild_id)
        }
    }

    closeLeague(league_id){
        if(this.league_locker.lockExists(league_id)){
            this.league_locker.stopReading(league_id)
        }
    }
}