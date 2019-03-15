const NodeCache = require( "node-cache" )
const AccessLocker = require('./accessLocker').AccessLocker

exports.ModelManager = class ModelManager {
	constructor(Model, admin, timeout, timecheck){
		this.admin = admin
		this.Model = Model
		this.cache_timer = timeout
        this.checkperiod = timecheck
        this.cache = new NodeCache({
            deleteOnExpire: false,
            useClones: false,
            checkperiod: this.checkperiod
        })
        this.locker = new AccessLocker()
        this.cache.on("expired", this.onExpire.bind(this))
	}

	async create(model_id){
        if(!this.locker.lockExists(model_id)){
            this.locker.addLock(model_id)
        }
        await this.locker.getWriteAccess(model_id)
        let model = this.cache.get(model_id)
        if(model == undefined){
            model = new this.Model(model_id, this.admin)
            this.cache.set(model_id, model)
        }
        this.locker.stopWriting(model_id)
        return model
    }

    async get(model_id){
        let model = this.cache.get(model_id)
        if (model == undefined){
            model = await this.create(model_id)
        }
        await this.locker.getReadAccess(model_id)
        this.cache.ttl(model_id, this.cache_timer)
        return model
    }

    async delete(model_id){
        await this.locker.getWriteAccess(model_id)
        let model = this.cache.get(model_id)
        if(model.dirty()){
            await this.saveCachedModel(model)
        }
        this.cache.del(model_id)
        this.locker.stopWriting(model_id)
    }

    async saveCachedModel(model){
        throw "saveCachedModel not Implemented!"
    }

    async onExpire(model_id, model){
        if(this.locker.numReaders(model_id) <= 0){
            await this.delete(model_id)
        }
        else{
            if(!model.expired()){
                let listener = async (data) => {
                    if(!data.isReading){
                        let currentReaders = this.locker.numReaders(model_id)
                        if(currentReaders <= 0){
                            await this.delete(model_id)
                            this.locker.removeReadListener(model_id, listener)
                        }
                    }
                    else{
                        model._expired = false
                        this.locker.removeReadListener(model_id, listener)
                    }
                }
                model._expired = true
                this.locker.addReadListener(model_id, listener)
            }
        }
    }

    finish(model_id){
        if(this.locker.lockExists(model_id)){
            this.locker.stopReading(model_id)
        }
    }

    async close(){
        let allKeys = this.cache.keys()
        for(var i in allKeys){
            let model_id = allKeys[i]
            await this.delete(model_id)
        }
        this.cache.flushAll()
        this.cache.close()
    }

}