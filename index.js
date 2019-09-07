const request = require('request')
const openSocket = require('socket.io-client')
const fs = require("fs-extra")
const path = require('path')
const { default: SlippiGame } = require('slp-parser-js')
const chokidar = require('chokidar')
const _ = require('lodash')

const gameByPath = {}

var settings = null
var currentMatch = null
var bracket = null
var user = null
var key = null
var label_path = null
var slp_path = null
var cwd = null
var instructions = null
var socket = null
var slp_watcher = null
var bracketData = {
    name: '',
    currentMatch: {
        match_id: null
    }
}

if(process.pkg){
    cwd = path.dirname(process.execPath)
}
else{
    cwd = process.cwd()
}

cwd = cwd.replace(/\/?$/, '/')

let settingsFile = cwd + 'settings.json'

fs.readJson(settingsFile, function(err, settingsData) {
    if(!err){
        settings = settingsData
        bracket = settings.bracket_code
        user = settings.username
        key = settings.api_key
        instructions = settings.instructions
        label_path = settings.output_path.replace(/^\/+/g, '')
        label_path = cwd + label_path
        label_path = label_path.replace(/\/?$/, '/')
        fs.ensureDir(label_path, err => {
            if(!err){
                slp_path = settings.slippi_path.replace(/^\/+/g, '')
                slp_path = cwd + slp_path
                slp_path = slp_path.replace(/\/?$/, '/')
                fs.ensureDir(slp_path, err => {
                    if(!err){
                        watcher = chokidar.watch(slp_path, {
                            depth: 0,
                            persistent: true,
                            usePolling: true,
                            ignoreInitial: true,
                        })
                        verifyBracket(bracket, user, key)
                    }
                    else{
                        console.log('could not create path: '+slp_path)
                    }
                })
            }
            else{
                console.log('could not create path: '+label_path)
            }
        })
    }
    else{
        console.log("settings.json not found.")
        let defaultSettings = {
            username: '',
            api_key: '',
            bracket_code: '',
            output_path: 'labels/',
            instructions: {
                name: {
                    nameLabel: {
                        type: 'text'
                    }
                },
                score: {
                    scoreLabel: {
                        type: 'text'
                    }
                }
            }
        }
        let settingsData = JSON.stringify(defaultSettings, null, 2)
        fs.writeFile(settingsFile, settingsData, (err) => {
            if (err) {
                console.log(err)
            }
            else{
                console.log("Successfully wrote to settings.json")
            }
            process.exit()
        })
    }
})

async function init(id, user, key){
    return new Promise((resolve, reject) => {
        var path = 'https://teacup-gg.herokuapp.com/init'
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
        var path = 'https://teacup-gg.herokuapp.com/tournament'
        path = path + '?id='+ id
        request(path, {json: true}, (err, res, body) => {
            resolve(body)
        })
    })
}

async function getCurrentMatch(id){
    return new Promise((resolve, reject) => {
        var path = 'https://teacup-gg.herokuapp.com/currentMatch'
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
            console.log('user is authenticated.')
            let tournamentData = await getTournament(id)
            bracketData.name = tournamentData.tournament.name
            let item_file = label_path + 'tournament_name.txt'
            fs.writeFile(item_file, bracketData.name, (err) => {
                if (err) console.log(err)
                console.log('Successfully wrote to ' + item_file)
            })
            let currentMatch = await getCurrentMatch(id)
            await handleLabelUpdate(currentMatch)
            socket = openSocket('https://teacup-gg.herokuapp.com?id='+id)
            socket.on('current_labels', data => handleLabelUpdate(data))
            watcher.on('change', path => handleSlippiUpdate(path))
        }
        else{
            console.log('you are not authorized to view this bracket.')
        }
    }
    else{
        console.log('could not authenticate')
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

async function handleSlippiUpdate(path){
    const start = Date.now();
    console.log("hi");
    let gameState, settings, stats, frames, latestFrame, gameEnd;
    try {
        let game = _.get(gameByPath, [path, 'game']);
        if (!game) {
            console.log(`New file at: ${path}`);
            game = new SlippiGame(path);
            gameByPath[path] = {
                game: game,
                state: {
                    settings: null,
                    detectedPunishes: {},
                }
            }
        }

        gameState = _.get(gameByPath, [path, 'state']);
        settings = game.getSettings();
        frames = game.getFrames();
        latestFrame = game.getLatestFrame();
        gameEnd = game.getGameEnd();
    } catch (err) {
        console.log(err);
        return;
    }

    if (!gameState.settings && settings) {
        console.log(`[Game Start] New game has started`);
        console.log(settings);
        gameState.settings = settings;
    }

    console.log(`We have ${_.size(frames)} frames.`);
    _.forEach(settings.players, player => {
        const frameData = _.get(latestFrame, ['players', player.playerIndex]);
        if (!frameData) {
            return;
        }

        console.log(
            `[Port ${player.port}] ${frameData.post.percent.toFixed(1)}% | ` +
            `${frameData.post.stocksRemaining} stocks`
            );
    });

    if (gameEnd) {
    // NOTE: These values and the quitter index will not work until 2.0.0 recording code is
    // NOTE: used. This code has not been publicly released yet as it still has issues
    const endTypes = {
        1: "TIME!",
        2: "GAME!",
        7: "No Contest",
    };

    const endMessage = _.get(endTypes, gameEnd.gameEndMethod) || "Unknown";

    const lrasText = gameEnd.gameEndMethod === 7 ? ` | Quitter Index: ${gameEnd.lrasInitiatorIndex}` : "";
    console.log(`[Game Complete] Type: ${endMessage}${lrasText}`);
    }

    console.log(`Read took: ${Date.now() - start} ms`);
}