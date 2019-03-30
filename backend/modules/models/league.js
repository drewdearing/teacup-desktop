const ServiceManager = require('../serviceManager').ServiceManager
const Model = require('../model').Model

exports.League = class League extends Model {

    constructor(league_id, admin, fb){
        let leagueDB = admin.firestore().collection('leagues').doc(league_id)
        super(league_id, admin, fb, leagueDB)
    }

    async init(data){

    }

    async players(){
        let players_id = await this.players_id()
        let players = await this._fb.league_players.get(players_id)
        let players_data = await players.data()
        this._fb.league_players.finish(players_id)
        return players_data
    }

    async update(){
        let service = await this.service()
        let service_id = await this.service_id()
        let players_id = await this.players_id()
        let league_service = ServiceManager.init(service, service_id)
        let players = await this._fb.league_players.get(players_id)
        try{
            let updated_data = await players.update(league_service)
            let message = updated_data.message
            await this.setMaxPoints(updated_data.max_points)
            await this.setTotalPlayers(updated_data.total_players)
            await players.setPlayers(updated_data.players)
            this._fb.league_players.finish(players_id)
            return {message: message}
        }
        catch(data){
            this._fb.league_players.finish(players_id)
            throw data
        }
    }

    async players_id(){
        let data = await this.data()
        return data.players
    }

    async service(){
        let data = await this.data()
        return data.service
    }

    async service_id(){
        let data = await this.data()
        return data.id
    }

    async setMaxPoints(max_points){
        let data = await this.dataWithWriteAccess()
        data.max_points = max_points
        this._data = data
        this._dirty = true
        this._access_locker.stopWriting('data')
    }

    async setTotalPlayers(total_players){
        let data = await this.dataWithWriteAccess()
        data.total_players = total_players
        this._data = data
        this._dirty = true
        this._access_locker.stopWriting('data')
    }

    async setService(type, id){
        try{
            let data = await this.dataWithWriteAccess()
            if(ServiceManager.isType(type)){
                data.service = type
                data.id = id
                this._data = data
                this._dirty = true
                this._access_locker.stopWriting('data')
                return Promise.resolve({message: 'service set!'})
            }
            else{
                this._access_locker.stopWriting('data')
                return Promise.reject({err: 'service not recognized!'})
            }
        }
        catch(err){
            return Promise.reject(err)
        }
    }
}