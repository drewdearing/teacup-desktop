const AccessLocker = require('./accessLocker').AccessLocker
const Clone = require('./clone')

exports.User = class User {

    constructor(user_id, admin){
        this._admin = admin
        this._db = admin.firestore()
        this._user_id = user_id
        this._userDB = this._db.collection('users').doc(user_id)
        this._data = null
        this._dirty = false
        this._expired = false
        this._access_locker = new AccessLocker()
        this._access_locker.addLock('data')
    }

    expired(){
        return this._expired
    }

    dirty(){
        return this._dirty
    }

    user_id(){
        return Promise.resolve(this._user_id)
    }

    userDB(){
        return Promise.resolve(this._userDB)
    }

    async init(){
        await this._access_locker.getWriteAccess('data')
        this._data = {}
        this._data['displayName'] = ''
        this._data['scenes'] = []
        this._dirty = true
        this._access_locker.stopWriting('data')
    }

    async addScene(scene_id){
        try{
            let data = await this.dataWithWriteAccess()
            if(!data.scenes.includes(scene_id)){
                data.scenes.push(scene_id)
                this._dirty = true
            }
            this._access_locker.stopWriting('data')
        }
        catch(error){
            return Promise.reject(error)
        }
    }

    async dataWithWriteAccess(){
        await this._access_locker.getWriteAccess('data')
        if(this._data == null){
            try{
                let userDB = await this.userDB()
                let userDoc = await userDB.get()
                if(userDoc.exists){
                    this._data = userDoc.data()
                }
                else{
                    this._access_locker.stopWriting('data')
                    return Promise.reject({err: 'user does not exist!'})
                }
            }
            catch(err){
                this._access_locker.stopWriting('data')
                return Promise.reject({err: 'cannot access user!'})
            }
        }
        return Promise.resolve(this._data)
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
                this.userDB().then((userDB) => {
                    userDB.get().then((userDoc) => {
                        if(userDoc.exists){
                            this._data = userDoc.data()
                            let data = Clone.cloneObject(this._data)
                            this._access_locker.stopWriting('data')
                            resolve(data)
                        }
                        else{
                            this._access_locker.stopWriting('data')
                            reject({err: 'user does not exist!'})
                        }
                    })
                })
            })
        }
    }

}