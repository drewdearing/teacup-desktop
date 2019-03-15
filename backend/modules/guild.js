const AccessLocker = require('./accessLocker').AccessLocker
const Clone = require('./clone')

exports.Guild = class Guild {

    constructor(guild_id, admin){
        this._db = admin.firestore()
        this._guild_id = guild_id
        this._guildDB = this._db.collection('guilds').doc(guild_id)
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
                let data = Clone.cloneObject(this._data)
                this._access_locker.stopReading('data')
                resolve(data)
            })
        }
        else {
            return new Promise((resolve, reject) => {
                this.guildDB().then((guildDB) => {
                    guildDB.get().then((guildDoc) => {
                        if(guildDoc.exists){
                            this._data = guildDoc.data()
                            let data = Clone.cloneObject(this._data)
                            this._access_locker.stopWriting('data')
                            resolve(data)
                        }
                        else{
                            this._access_locker.stopWriting('data')
                            reject({err: 'guild does not exist!'})
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
            }).catch((data) => {
                reject(data)
            })
        })
    }

    async members(){
        await this._access_locker.getWriteAccess('members')
        if(this._members != null){
            this._access_locker.stopWriting('members')
            await this._access_locker.getReadAccess('members')
            return new Promise((resolve, reject) => {
                let members = Clone.cloneObject(this._members)
                this._access_locker.stopReading('members')
                resolve(members)
            })
        }
        else {
            return new Promise((resolve, reject) => {
                this.memberDB().then((memberDB) => {
                    memberDB.get().then((membersDoc) => {
                        if(membersDoc.exists){
                            this._members = membersDoc.data()
                            let members = Clone.cloneObject(this._members)
                            this._access_locker.stopWriting('members')
                            resolve(members)
                        }
                        else{
                            this._access_locker.stopWriting('members')
                            reject({err: 'member data cannot be accessed.'})
                        }
                    })
                }).catch((data) => {
                    this._access_locker.stopWriting('members')
                    reject(data)
                })
            })
        }
    }
}