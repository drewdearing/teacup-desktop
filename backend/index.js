require('dotenv').config()

const admin = require('firebase-admin')
const FirebaseManager = require('./modules/firebaseManager').FirebaseManager
const express = require("express")
const app = express()

var bodyParser = require('body-parser');
var serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://teacup-e5fd8.firebaseio.com"
})

var fbManager = new FirebaseManager(admin, 600, 120)

app.use(bodyParser.json())

const server = app.listen(3000, () => {
    console.log("Server running on port 3000");
})

app.post("/users", async (req, res) => {
    let email = req.query.email
    let password = req.query.password
    fbManager.users.create(email, password).then((user) => {
        res.json(user)
    }).catch((error) => {
        res.json(error)
    })
})

app.get("/league/:league_id", async (req, res) => {
    let league_id = req.params.league_id
    let include_players = req.query.players
    include_players = include_players != null && include_players === 'true'
    let league = await fbManager.leagues.get(league_id)
    try{
        let data = await league.data()
        let returnData = {}
        let dataKeys = Object.keys(data).filter(key => key !== 'players')
        for(var i in dataKeys){
            var key = dataKeys[i]
            returnData[key] = data[key]
        }
        if(include_players){
            let players = await league.players()
            returnData['players'] = players
        }
        res.json(returnData)
    }
    catch(data){
        res.json(data.err)
    }
    await fbManager.leagues.finish(league_id)
})

app.put("/league/:league_id", async (req, res) => {
    let league_id = req.params.league_id
    let league = await fbManager.leagues.get(league_id)
    let returnData = {}
    if(req.query.service_type != null && req.query.service_id != null){
        let service_type = req.query.service_type
        let service_id = req.query.service_id
        try{
            let message = await league.setService(service_type, service_id)
            returnData['putService'] = {
                'message': message.message,
                'error': false
            }
        }
        catch(err){
            returnData['putService'] = {
                'message': err.err,
                'error': true
            }
        }
    }
    res.json(returnData)
    await fbManager.leagues.finish(league_id)
})

app.get("/guild/:guild_id", async (req, res, next) => {
    let guild_id = req.params.guild_id
    let include_members = req.query.members
    include_members = include_members != null && include_members === 'true'
    let guild = await fbManager.guilds.get(guild_id)
    try{
        let data = await guild.data()
        let returnData = {}
        let dataKeys = Object.keys(data).filter(key => key !== 'members')
        for(var i in dataKeys){
            var key = dataKeys[i]
            returnData[key] = data[key]
        }
        if(include_members){
            let members = await guild.members()
            returnData['members'] = members
        }
        res.json(returnData)
    }
    catch(data){
        res.json(data.err)
    }
    await fbManager.guilds.finish(guild_id)
})

app.get("/players/:league_id", async (req, res, next) => {
    let league_id = req.params.league_id
    let update = req.query.update
    update = update != null && update === 'true'
    let league = await fbManager.getLeague(league_id)
    let returnData = {}
    try{
        if(update){
            let msg = await league.update()
            returnData.message = msg.message
        }
        returnData.players = await league.players()
        returnData.error = false
        res.json(returnData)
    }
    catch(data){
        returnData.players = null
        returnData.message = data.err
        returnData.error = true
        res.json(returnData)
    }
    await fbManager.leagues.finish(league_id)
})

app.get("/members/:guild_id", async (req, res, next) => {
    let guild_id = req.params.guild_id
    let guild = await fbManager.guilds.get(guild_id)
    try{
        let members = await guild.members()
        res.json(members)
    }
    catch(data){
        res.json(data)
    }
    await fbManager.guilds.finish(guild_id)
})

async function stopServer(){
    server.close(async () => {
        await fbManager.close()
        process.exit(0)
    })
}

process.on('SIGINT', async () => {
  await stopServer()
})

process.on('SIGTERM', async () => {
  await stopServer()
})