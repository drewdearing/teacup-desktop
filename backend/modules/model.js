const AccessLocker = require('./accessLocker').AccessLocker
const Clone = require('./clone')

exports.Model = class Model {
	constructor(model_id, admin, fbManager, model_ref){
        this._admin = admin
        this._fb = fbManager
        this._db = admin.firestore()
        this._model_ref = model_ref
        this._model_id = model_id
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

    id(){
    	return this._model_id
    }

    ref(){
    	return Promise.resolve(this._model_ref)
    }

    async init(data){
        throw "init not Implemented!"
    }

    async saveCache(){
        let model_ref = await this.ref()
        let data = await this.data()
        //console.log("SAVING:")
        //console.log(data)
        try{
            let hi = await model_ref.set(data)
            //console.log(hi)
        }
        catch(err){
            //console.log(err)
        }
        this._dirty = false
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
                this.ref().then((model_ref) => {
                    model_ref.get().then((modelDoc) => {
                        if(modelDoc.exists){
                            this._data = modelDoc.data()
                            let data = Clone.cloneObject(this._data)
                            this._access_locker.stopWriting('data')
                            resolve(data)
                        }
                        else{
                            this._access_locker.stopWriting('data')
                            reject({err: 'model does not exist!'})
                        }
                    })
                })
            })
        }
    }

    async dataWithWriteAccess(){
        await this._access_locker.getWriteAccess('data')
        if(this._data == null){
            try{
                let model_ref = await this.ref()
                let modelDoc = await model_ref.get()
                if(modelDoc.exists){
                    this._data = modelDoc.data()
                }
                else{
                    this._access_locker.stopWriting('data')
                    return Promise.reject({err: 'model does not exist!'})
                }
            }
            catch(err){
                this._access_locker.stopWriting('data')
                return Promise.reject({err: 'cannot access model!'})
            }
        }
        return Promise.resolve(this._data)
    }

}