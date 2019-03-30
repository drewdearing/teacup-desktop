const Model = require('../model').Model

exports.Scene = class Scene extends Model {

    constructor(scene_id, admin, fb){
        let sceneDB = admin.firestore().collection('scenes').doc(scene_id)
        super(scene_id, admin, fb, sceneDB)
    }

    async init(sceneData){
        await this._access_locker.getWriteAccess('data')
        this._data = {}
        this._data['name'] = sceneData.name
        this._data['owner'] = await sceneData.owner.id()
        this._data['community'] = this._db.collection('communities').doc().id
        this._data['labels'] = []
        this._dirty = true
        let community = await this._fb.communities.get(this._data['community'])
        await community.init({owner: this._data['owner']})
        this._fb.communities.finish(this._data['community'])
        let scene_id = await this.id()
        await sceneData.owner.addScene(scene_id)
        this._access_locker.stopWriting('data')
    }

}