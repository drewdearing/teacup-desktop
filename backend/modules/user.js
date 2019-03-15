const AccessLocker = require('./accessLocker').AccessLocker
const request = require('request')

exports.User = class User {

    constructor(user_id, admin, db){
        this._admin = admin
        this._db = admin.firestore()
        this._user_id = user_id
        this._userDB = db.collection('users').doc(user_id)
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