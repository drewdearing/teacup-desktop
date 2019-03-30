const Model = require('../model').Model

exports.LeaguePlayers = class LeaguePlayers extends Model {

    constructor(players_id, admin, fb){
        let playersDB = admin.firestore().collection('players').doc(players_id)
        super(players_id, admin, fb, playersDB)
    }

    async init(data){

    }

    async setPlayers(players){
        await this._access_locker.getWriteAccess('data')
        this._data = players
        this._dirty = true
        this._access_locker.stopWriting('data')
    }

    async update(league_service) {
        if(league_service != null){
            return new Promise((resolve, reject) => {
                league_service.update().then( async (data) => {
                    if(data.all_updated){
                        resolve({
                            message:'data updated',
                            max_points: data.max_points,
                            total_players: data.total_players,
                            players: data.players
                        })
                    }
                    else{
                        reject({err:'unable to update data'})
                    }
                })
            })
        }
        else{
            return new Promise((resolve, reject) => {reject({err:'service does not exist'})})
        }
    }

}