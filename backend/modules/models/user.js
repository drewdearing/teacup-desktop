const Model = require('../model').Model

exports.User = class User extends Model {

    constructor(user_id, admin, fb){
        let userDB = admin.firestore().collection('users').doc(user_id)
        super(user_id, admin, fb, userDB)
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

}