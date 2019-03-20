const Scene = require('./scene').Scene
const ModelManager = require('./modelManager').ModelManager

exports.SceneManager = class SceneManager extends ModelManager {
    constructor(admin, timeout, timecheck){
        super(Scene, admin, timeout, timecheck)
    }

    async saveCachedModel(scene){
        let sceneDB = await scene.sceneDB()
        let sceneData = await scene.data()
        await sceneDB.set(sceneData)
        scene._dirty = false
    }

    async createScene(sceneData){
        try{
            let sceneDB = await this.db.collection('scenes').doc()
            let scene = await this.get(sceneDB.id)
            await scene.init(sceneData)
            return scene
        }
        catch(err){
            console.log(err)
            throw err
        }
    }
}