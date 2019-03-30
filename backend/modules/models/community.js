const Model = require('../model').Model

exports.Community = class Community extends Model {

    constructor(community_id, admin, fb){
        let communityDB = admin.firestore().collection('communities').doc(community_id)
        super(community_id, admin, fb, communityDB)
    }

    async init(communityData){
        await this._access_locker.getWriteAccess('data')
        this._data = {}
        this._data[communityData.owner] = {}
        this._dirty = true
        this._access_locker.stopWriting('data')
    }
    
}