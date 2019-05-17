const libui = require('libui-node');
const { button } = require('./ui-utils')

class TeacupUI {

    constructor() {
        this.win  = libui.UiWindow('Teacup - OBS Manager', 600, 300, false);
        this.setupWindow();
        this.data = {};
    }

    setupWindow() {
        this.win.margined = 1;
        this.win.onClosing(() => libui.stopLoop());
        const hBox = new libui.UiHorizontalBox();
        const vBox = new libui.UiVerticalBox();
        hBox.padded = true;
        this.username = new libui.UiEntry();
        this.apiKey = new libui.UiEntry();
        this.bracketCode = new libui.UiEntry();
        this.data = new libui.UiMultilineEntry();
        const form = new libui.UiForm();
        form.padded = true;
        form.append('Challonge Username', this.username, 0);
        form.append('API Key', this.apiKey, 0);
        form.append('Bracket Code', this.bracketCode, 0);
        this.username.onChanged(() => this.data["username"] = this.username.text);
        this.apiKey.onChanged(() => this.data["key"] = this.apiKey.text);
        this.bracketCode.onChanged(() => this.data["bracket"] = this.bracketCode.text);
        const loginButton = button({
            text: 'Login',
            onClicked: (()=>  console.log('wwww'))
        });
        hBox.append(form, 1);
        vBox.append(hBox, 1);
        vBox.append(loginButton, 1);
        this.win.setChild(vBox);
    }

    start() {
        this.win.show();
        libui.startLoop();
    }

}

module.exports = TeacupUI;