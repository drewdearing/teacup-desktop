import json
import os
import requests
import socketio

from shutil import copyfile
from teacup_ui import TeacupUI
from threading import Thread

# Global Variables
ui = TeacupUI()
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

# SocketIO config
sio = socketio.Client()

@sio.on('connect')
def on_connect():
    print("SocketIO connection established")

@sio.on('current_labels')
def on_labels(data):
    handleLabelUpdate(data)

# Helper functions
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
    global label_path
    global settings
    global bracket
    global user
    global key
    global instructions
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
        ui.setFormText({
            "bracket": bracket,
            "user": user,
            "key": key
        })
        verifyBracket(bracket, user, key)
    except FileNotFoundError:
        print("settings.json not found.")
        ui.setMessage('Thanks for using Teacup!\nPlease login to Challonge to start the OBS manager.')
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
        print("wrote default settings file")

def get_data(url, name=None):
    if name is None:
        name = url
    try:
        response = requests.get(url)
        response.raise_for_status()
        return json.loads(response.content)
    except HTTPError as h_err:
        print(f'HTTP error occured for "{name}": {h_err}')
    except Exception as err:
        print(f'Error occured for "{name}" request: {err}')

def init(id, user, key):
    path = f'https://teacup-challonge.herokuapp.com/init?user={user}&key={key}'
    if id and id != '':
        path = f'{path}&id={id}'
    return get_data(path, 'init')

def getTournament(id):
        path = f'https://teacup-challonge.herokuapp.com/tournament?id={id}'
        return get_data(path, 'tournament')

def getCurrentMatch(id):
    path = f'https://teacup-challonge.herokuapp.com/currentMatch?id={id}'
    return get_data(path, 'currentMatch')

def verifyBracket(id, user, key):
    data = init(id, user, key)
    if data["isAuthenticated"]:
        if data["isOwner"]:
            print('user is authenticated.')
            ui.setMessage("Successfully logged in.\nServing Teacup data to OBS...")
            tournamentData = getTournament(id)
            bracketData["name"] = tournamentData["tournament"]["name"]
            item_file = label_path + 'tournament_name.txt'
            with open(item_file, 'w+') as itf:
                itf.write(bracketData["name"])
            currentMatch = getCurrentMatch(id)
            handleLabelUpdate(currentMatch)
            socketUrl = f'https://teacup-challonge.herokuapp.com?id={id}'
            sio.connect(socketUrl)
        else:
            print("not allowed")
            ui.setMessage('You are not authorized to view this bracket.')
    else:
        print('could not authenticate')
        ui.setMessage("Sorry, login failed.\nPlease check username or API key.")

def handleLabelUpdate(nextMatch):
    bracketData["currentMatch"] = nextMatch
    if nextMatch is not None and nextMatch["match_id"] is not None:
        round = nextMatch["round"]
        round_file = f'{label_path}round.txt'
        participant1_id = nextMatch["participant1"]
        participant2_id = nextMatch["participant2"]
        participants = [
            nextMatch["participants"][participant1_id],
            nextMatch["participants"][participant2_id]
        ]
        with open(round_file, 'w+') as rf:
            rf.write(round)
        for label in instructions.keys():
            instruction = instructions[label]
            for i in range(2):
                participant = participants[i]
                if label in participant:
                    value = participant[label]
                    handleInstruction(instruction, value, i)

def handleInstruction(instruction, value, participant):
    for instructionItem in instruction.keys():
        item_id = f'{instructionItem}{str(participant)}'
        item = instruction[instructionItem]
        if item["type"] == 'image':
            if value in item["options"]:
                image = item["options"][value]
                file_name, ext = os.path.splitext(image)
                item_file = f'{label_path}{item_id}{ext}'
                try:
                    copyfile(image, item_file)
                    print("Successfully wrote to " + item_file)
                except:
                    print("Error writing to " + item_file)
        elif item["type"] == 'text':
            item_file = f'{label_path}{item_id}.txt'
            with open(item_file, 'w+') as itf:
                itf.write(str(value))

# UI setup
def onLogin(entries):
    ui.setMessage("Authenticating...")
    data = {
        "user": entries["Challonge Username"].get(),
        "key": entries["API Key"].get(),
        "bracket": entries["Bracket Code"].get()
    }
    verifyBracket(data["bracket"], data["user"], data["key"])
    updateSettings(data)
ui.setOnLogin(onLogin)


if __name__ == '__main__':
    thread = Thread(target=startFromFile)
    thread.start()
    ui.start()