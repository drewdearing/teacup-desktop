const ServiceManager = require('./serviceManager').ServiceManager

const AccessLocker = require('./accessLocker').AccessLocker

const Clone = require('./clone')

exports.League = class League {

    constructor(league_id, db){
        this._db = db
        this._league_id = league_id
        this._leagueDB = db.collection('leagues').doc(league_id)
        this._players = null
        this._data = null
        this._dirty = false
        this._expired = false
        this._access_locker = new AccessLocker()
        this._access_locker.addLock('data')
        this._access_locker.addLock('players')
    }

    dirty(){
        return this._dirty
    }

    expired(){
        return this._expired
    }

    league_id(){
        return new Promise((resolve, reject) => {
            resolve(this._league_id)
        })
    }

    leagueDB(){
        return new Promise((resolve, reject) => {
            resolve(this._leagueDB)
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
                this.leagueDB().then((leagueDB) => {
                    leagueDB.get().then((leagueDoc) => {
                        if(leagueDoc.exists){
                            this._data = leagueDoc.data()
                            let data = Clone.cloneObject(this._data)
                            this._access_locker.stopWriting('data')
                            resolve(data)
                        }
                        else{
                            this._access_locker.stopWriting('data')
                            reject({err: 'league does not exist!'})
                        }
                    })
                })
            })
        }
    }

    playerDB(){
        return new Promise((resolve, reject) => {
            this.data().then((data) => {
                resolve(this._db.collection('players').doc(data.players))
            }).catch((data) => {
                reject(data)
            })
        })
    }

    async players(){
        await this._access_locker.getWriteAccess('players')
        if(this._players != null){
            this._access_locker.stopWriting('players')
            await this._access_locker.getReadAccess('players')
            return new Promise((resolve, reject) => {
                let players = Clone.cloneObject(this._players)
                this._access_locker.stopReading('players')
                resolve(players)
            })
        }
        else {
            return new Promise((resolve, reject) => {
                this.playerDB().then((playerDB) => {
                    playerDB.get().then((playersDoc) => {
                        if(playersDoc.exists){
                            this._players = playersDoc.data()
                            let players = Clone.cloneObject(this._players)
                            this._access_locker.stopWriting('players')
                            resolve(players)
                        }
                        else{
                            this._access_locker.stopWriting('players')
                            reject({err: 'player data cannot be accessed.'})
                        }
                    })
                }).catch((data) => {
                    this._access_locker.stopWriting('players')
                    reject(data)
                })
            })
        }
    }

    service(){
        return new Promise((resolve, reject) => {
            if(this._data != null){
                resolve(this._data.service)
            }
            else{
                this.data().then((data) => {
                    this._data = data
                    resolve(this._data.service)
                }).catch((data) =>{
                    reject(data)
                })
            }
        })
    }

    service_id(){
        return new Promise((resolve, reject) => {
            if(this._data != null){
                resolve(this._data.id)
            }
            else{
                this.data().then((data) => {
                    this._data = data
                    resolve(this._data.id)
                }).catch((data) =>{
                    reject(data)
                })
            }
        })
    }

    async update() {
        let service = await this.service()
        let service_id = await this.service_id()
        let league_service = ServiceManager.init(service, service_id)
        if(league_service != null){
            return new Promise((resolve, reject) => {
                league_service.update().then( async (data) =>{
                    if(data.all_updated){
                        await this._access_locker.getWriteAccess('data')
                        await this._access_locker.getWriteAccess('players')
                        this.data.max_points = data.max_points,
                        this.data.total_players = data.total_players
                        this._players = data.players
                        this._dirty = true
                        this._access_locker.stopWriting('players')
                        this._access_locker.stopWriting('data')
                        resolve({message:'data updated'})
                    }
                    else{
                        reject({err:'unable to update data'})
                    }
                })
            })
        }
        else{
            return new Promise((resolve, reject) => {resolve('service does not exist.')})
        }
    }

    async dataWithWriteAccess(){
        await this._access_locker.getWriteAccess('data')
        if(this._data == null){
            try{
                let leagueDB = await this.leagueDB()
                let leagueDoc = await leagueDB.get()
                if(leagueDoc.exists){
                    this._data = leagueDoc.data()
                }
                else{
                    this._access_locker.stopWriting('data')
                    return Promise.reject({err: 'league does not exist!'})
                }
            }
            catch(err){
                this._access_locker.stopWriting('data')
                return Promise.reject({err: 'cannot access league!'})
            }
        }
        return Promise.resolve(this._data)
    }

    async setService(type, id){
        try{
            let data = await this.dataWithWriteAccess()
            if(ServiceManager.isType(type)){
                data.service = type
                data.id = id
                this._data = data
                this._dirty = true
                this._access_locker.stopWriting('data')
                return Promise.resolve({message: 'service set!'})
            }
            else{
                this._access_locker.stopWriting('data')
                return Promise.reject({err: 'service not recognized!'})
            }
        }
        catch(err){
            return Promise.reject(err)
        }
    }
}