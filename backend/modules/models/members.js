const Model = require('../model').Model

exports.GuildMembers = class GuildMembers extends Model {

    constructor(members_id, admin, fb, ){
        let membersDB = admin.firestore().collection('members').doc(members_id)
        super(members_id, admin, fb, membersDB)
    }

    async init(data){

    }

}