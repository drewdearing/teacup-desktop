const AccessLocker = require('./accessLocker').AccessLocker

exports.Guild = class Guild {

    constructor(guild_id, db){
        this._db = db
        this._guild_id = guild_id
        this._guildDB = db.collection('guilds').doc(guild_id)
        this._members = null
        this._data = null
        this._dirty = false
        this._expired = false
        this._access_locker = new AccessLocker()
        this._access_locker.addLock('data')
        this._access_locker.addLock('members')
    }

    expired(){
        return this._expired
    }

    dirty(){
        return this._dirty
    }

    guild_id(){
        return new Promise((resolve, reject) => {
            resolve(this._guild_id)
        })
    }

    guildDB(){
        return new Promise((resolve, reject) => {
            resolve(this._guildDB)
        })
    }

    async data(){
        await this._access_locker.getWriteAccess('data')
        if(this._data != null){
            this._access_locker.stopWriting('data')
            await this._access_locker.getReadAccess('data')
            return new Promise((resolve, reject) => {
                this._access_locker.stopReading('data')
                resolve(this._data)
            })
        }
        else {
            return new Promise((resolve, reject) => {
                this.guildDB().then((guildDB) => {
                    guildDB.get().then((guildDoc) => {
                        if(guildDoc.exists){
                            this._data = guildDoc.data()
                            this._access_locker.stopWriting('data')
                            resolve(this._data)
                        }
                        else{
                            this._access_locker.stopWriting('data')
                            reject(this._data)
                        }
                    })
                })
            })
        }
    }

    memberDB(){
        return new Promise((resolve, reject) => {
            this.data().then((data) => {
                resolve(this._db.collection('members').doc(data.members))
            })
        })
    }

    async members(){
        await this._access_locker.getWriteAccess('members')
        if(this._members != null){
            this._access_locker.stopWriting('members')
            await this._access_locker.getReadAccess('members')
            return new Promise((resolve, reject) => {
                this._access_locker.stopReading('members')
                resolve(this._members)
            })
        }
        else {
            return new Promise((resolve, reject) => {
                this.memberDB().then((memberDB) => {
                    memberDB.get().then((membersDoc) => {
                        if(membersDoc.exists){
                            this._members = membersDoc.data()
                            this._access_locker.stopWriting('members')
                            resolve(this._members)
                        }
                        else{
                            this._access_locker.stopWriting('members')
                            reject(this._members)
                        }
                    })
                })
            })
        }
    }
}