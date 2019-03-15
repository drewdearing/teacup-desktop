const User = require('./user').User
const ModelManager = require('./modelManager').ModelManager

exports.UserManager = class UserManager extends ModelManager {
    constructor(admin, timeout, timecheck){
        super(User, admin, timeout, timecheck)
    }

    async saveCachedModel(guild){
        //TODO
        console.log("TODO")
    }

    async create(email, password){
        return new Promise((resolve, reject) => {
            this.admin.auth().createUser({
                email: email,
                password: password
            }).then((user) => {
                resolve(user)
            }).catch((error) => {
                reject(error)
            })
        })
    }
}