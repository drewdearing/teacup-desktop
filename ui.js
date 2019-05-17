const libui = require('libui-node');

class TeacupUI {

    constructor() {
        this.win  = libui.UiWindow('Teacup - OBS Manager', 600, 400, false);
        this.setupWindow();
        this.data = {};
    }

    enableLogin() {
        if (this.username.text && this.apiKey.text && this.bracketCode.text) {
            this.loginButton.setEnabled(true);
        }
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
        this.messageLabel = libui.UiLabel();
        const form = new libui.UiForm();
        form.padded = true;
        form.append('Challonge Username', this.username, false);
        form.append('API Key', this.apiKey, false);
        form.append('Bracket Code', this.bracketCode, false);
        this.username.onChanged(() => {
            this.data["user"] = this.username.text;
            this.enableLogin();
        });
        this.apiKey.onChanged(() => {
            this.data["key"] = this.apiKey.text;
            this.enableLogin();
        });
        this.bracketCode.onChanged(() => {
            this.data["bracket"] = this.bracketCode.text;
            this.enableLogin();
        });
        this.loginButton = new libui.UiButton();
        this.loginButton.text = 'Login';
        this.loginButton.enabled = false;
        hBox.append(form, true);
        vBox.append(hBox, true);
        vBox.append(this.messageLabel, true);
        vBox.append(this.loginButton, false);
        this.win.setChild(vBox);
    }

    start() {
        this.win.show();
        libui.startLoop();
    }

    setOnLogin(fn) {
        this.loginButton.onClicked(() => {
            fn(this.data);
        });
    }

    setFormText(data) {
        this.username.text = data.user;
        this.apiKey.text = data.key;
        this.bracketCode.text = data.bracket;
    }

    setMessage(msg) {
        this.messageLabel.text = msg;
    }

}

module.exports = TeacupUI;