import json
import os
import requests
import socketio
#const path = require('path')
#const TeacupUI = require('./ui')

settingsFile = 'settings.json'

settings = None
currentMatch = None
bracket = None
user = None
key = None
label_path = None
instructions = None
socket = None
bracketData = {
    'name': '',
    'currentMatch': {
        'match_id': None
    }
}

# const ui = new TeacupUI()
# ui.setOnLogin((data) => {
#     verifyBracket(data.bracket, data.user, data.key);
#     updateSettings(data);
# });
# ui.start()

def updateSettings(data):
    currentSettings = None
    with open(settingsFile) as sf:
        currentSettings = json.load(sf)
    currentSettings["bracket_code"] = data["bracket"]
    currentSettings["username"] = data["user"]
    currentSettings["api_key"] = data["key"]
    with open(settingsFile, 'w+') as sf:
        json.dump(currentSettings, sf, indent=2)

def startFromFile():
    try:
        sf = open(settingsFile)
        settings = json.load(sf)
        sf.close()
        bracket = settings["bracket_code"]
        user = settings["username"]
        key = settings["api_key"]
        instructions = settings["instructions"]
        label_path = settings["output_path"].replace(r'^\/+', '')
        label_path = label_path.replace(r'\/?$', '/')
        if not os.path.exists(label_path):
            try:
                os.mkdir(label_path)
            except FileExistsError:
                print("Could not create path.")
        # ui.setFormText({
        #     bracket: bracket,
        #     user: user,
        #     key: key
        # });
        verifyBracket(bracket, user, key)
    except FileNotFoundError:
        print("settings.json not found.")
        # ui.setMessage('Thanks for using Teacup!\n' +
        #               'Please login to Challonge to start the OBS manager.');
        defaultSettings = {
            "username": '',
            "api_key": '',
            "bracket_code": '',
            "output_path": 'labels/',
            "instructions": {
                "name": {
                    "nameLabel": {
                        "type": 'text'
                    }
                },
                "score": {
                    "scoreLabel": {
                        "type": 'text'
                    }
                }
            }
        }
        with open(settingsFile, 'w+') as sf:
            settingsData = json.dump(defaultSettings, sf, indent=2)

async function init(id, user, key){
    return new Promise((resolve, reject) => {
        var path = 'https://teacup-challonge.herokuapp.com/init'
        path = path + '?user=' + user
        path = path + '&key=' + key
        if(id && id !== ''){
            path = path + '&id='+ id
        }
        request(path, {json: true}, (err, res, body) => {
            resolve(body)
        })
    })
}

async function getTournament(id){
    return new Promise((resolve, reject) => {
        var path = 'https://teacup-challonge.herokuapp.com/tournament'
        path = path + '?id='+ id
        request(path, {json: true}, (err, res, body) => {
            resolve(body)
        })
    })
}

async function getCurrentMatch(id){
    return new Promise((resolve, reject) => {
        var path = 'https://teacup-challonge.herokuapp.com/currentMatch'
        path = path + '?id='+ id
        request(path, {json: true}, (err, res, body) => {
            resolve(body)
        })
    })
}

async function verifyBracket(id, user, key){
    let data = await init(id, user, key)
    if(data.isAuthenticated){
        if(data.isOwner){
            console.log('user is authenticated.');
            ui.setMessage("Successfully logged in.");
            let tournamentData = await getTournament(id)
            bracketData.name = tournamentData.tournament.name
            let item_file = label_path + 'tournament_name.txt'
            fs.writeFile(item_file, bracketData.name, (err) => {
                if (err) console.log(err)
                console.log('Successfully wrote to ' + item_file)
            })
            let currentMatch = await getCurrentMatch(id)
            await handleLabelUpdate(currentMatch)
            socket = openSocket('https://teacup-challonge.herokuapp.com?id='+id)
            socket.on('current_labels', data => handleLabelUpdate(data));
        }
        else{
            console.log('you are not authorized to view this bracket.')
        }
    }
    else{
        console.log('could not authenticate')
        ui.setMessage("Sorry, login failed. Please check username or API key.");
    }
}

async function handleLabelUpdate(nextMatch){
    bracketData.currentMatch = nextMatch
    if(nextMatch != null && nextMatch.match_id != null){
        let round = nextMatch.round
        let round_file = label_path + 'round.txt'
        let participant1_id = nextMatch.participant1
        let participant2_id = nextMatch.participant2

        let participants = [
            nextMatch.participants[participant1_id],
            nextMatch.participants[participant2_id]
        ]

        fs.writeFile(round_file, round, (err) => {
            if (err) console.log(err)
            console.log('Successfully wrote to ' + round_file)
        })

        Object.keys(instructions).forEach((label) => {
            let instruction = instructions[label]
            for (var i = 0; i < 2; i++) {
                let participant = participants[i]
                if(label in participant){
                    let value = participant[label]
                    handleInstruction(instruction, value, i)
                }
            }
        })
    }
}

async function handleInstruction(instruction, value, participant){
    Object.keys(instruction).forEach((instructionItem) => {
        let item_id = instructionItem+String(participant)
        let item = instruction[instructionItem]
        if(item.type == 'image'){
            if (value in item.options){
                let image = item.options[value]
                let ext = path.extname(image)
                let item_file = label_path + item_id + ext
                try{
                    fs.copySync(image, item_file)
                    console.log("Successfully wrote to "+item_file)
                } catch(err) {
                    console.log("Error writing to "+item_file)
                }
            }
        }
        else if (item.type == 'text'){
            let item_file = label_path + item_id + '.txt'
            fs.writeFile(item_file, value, (err) => {
                if (err) console.log(err)
                console.log("Successfully wrote to "+ item_file)
            })
        }
    })
}

if __name__ == '__main__':
    startFromFile()