const AccessLocker = require('./accessLocker').AccessLocker
const Clone = require('./clone')

exports.Scene = class Scene {

    constructor(scene_id, admin){
        this._admin = admin
        this._db = admin.firestore()
        this._scene_id = scene_id
        this._sceneDB = this._db.collection('scenes').doc(scene_id)
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

    scene_id(){
        return Promise.resolve(this._scene_id)
    }

    sceneDB(){
        return Promise.resolve(this._sceneDB)
    }

    async init(sceneData){
        await this._access_locker.getWriteAccess('data')
        this._data = {}
        this._data['name'] = sceneData.name
        this._data['owner'] = await sceneData.owner.user_id()
        this._data['players'] = []
        this._data['labels'] = []
        this._dirty = true
        let scene_id = await this.scene_id()
        await sceneData.owner.addScene(scene_id)
        this._access_locker.stopWriting('data')
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
                this.sceneDB().then((sceneDB) => {
                    sceneDB.get().then((sceneDoc) => {
                        if(sceneDoc.exists){
                            this._data = sceneDoc.data()
                            let data = Clone.cloneObject(this._data)
                            this._access_locker.stopWriting('data')
                            resolve(data)
                        }
                        else{
                            this._access_locker.stopWriting('data')
                            reject({err: 'scene does not exist!'})
                        }
                    })
                })
            })
        }
    }

}