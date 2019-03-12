const events = require('events')

exports.AccessLocker = class AccessLocker{
    constructor(){
        this.locks = {}
        this.emitter = new events.EventEmitter()
        this.emitter.setMaxListeners(0)
    }

    lockExists(name){
        return (name in this.locks)
    }

    addLock(name){
        if(!(name in this.locks)){
            this.locks[name] = {
                readers: 0,
                writers: 0,
                read_listener: (data) => {
                    let lock = this.locks[data.lock_name]
                    if(data.isReading){
                        lock.readers += 1
                    }
                    else{
                        if(lock.readers > 0){
                            lock.readers -= 1
                        }
                        else{
                            lock.readers = 0
                        }
                    }
                },
                write_listener: (data) => {
                    let lock = this.locks[data.lock_name]
                    if(data.isWriting){
                        lock.writers += 1
                    }
                    else{
                        if(lock.writers > 0){
                            lock.writers -= 1
                        }
                        else{
                            lock.writers = 0
                        }
                    }
                }
            }
            this.emitter.on(name+"_read", this.locks[name].read_listener)
            this.emitter.on(name+"_edit", this.locks[name].write_listener)
        }
    }

    addReadListener(name, func){
        this.emitter.addListener(name+"_read", func)
    }

    removeReadListener(name, func){
        this.emitter.removeListener(name+"_read", func)
    }

    addWriteListener(name, func){
        this.emitter.addListener(name+"_edit", func)
    }

    removeWriteListener(name, func){
        this.emitter.removeListener(name+"_edit", func)
    }

    numReaders(name) {
        if(name in this.locks){
            return this.locks[name].readers
        }
        return 0
    }

    numWriters(name) {
        if(name in this.locks){
            return this.locks[name].writers
        }
        return 0
    }

    noWriters(name){
        return new Promise((resolve, reject) => {
            if(this.locks[name].writers > 0){
                let access_listener = (value) => {
                    if(this.locks[name].writers <= 0){
                        this.emitter.removeListener(name+'_edit', access_listener)
                        resolve()
                    }
                }

                this.emitter.addListener(name+'_edit', access_listener)
            }
            else{
                resolve()
            }
        })
    }

    noReaders(name){
        return new Promise((resolve, reject) => {
            if(this.locks[name].readers > 0){
                let access_listener = (value) => {
                    if(this.locks[name].readers <= 0){
                        this.emitter.removeListener(name+'_read', access_listener)
                        resolve()
                    }
                }

                this.emitter.addListener(name+'_read', access_listener)
            }
            else{
                resolve()
            }
        })
    }

    async getReadAccess(name){
        await this.noWriters(name)
        this.emitter.emit(name+'_read', {lock_name: name, isReading: true})
    }

    async getWriteAccess(name){
        await this.noWriters(name)
        this.emitter.emit(name+'_edit', {lock_name: name, isWriting: true})
        await this.noReaders(name)
    }

    stopReading(name){
        this.emitter.emit(name+'_read', {lock_name: name, isReading: false})
    }

    stopWriting(name){
        this.emitter.emit(name+'_edit', {lock_name: name, isWriting: false})
    }


}