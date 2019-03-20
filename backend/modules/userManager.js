const User = require('./user').User
const ModelManager = require('./modelManager').ModelManager

exports.UserManager = class UserManager extends ModelManager {
    constructor(admin, timeout, timecheck){
        super(User, admin, timeout, timecheck)
    }

    async saveCachedModel(user){
        let userDB = await user.userDB()
        let userData = await user.data()
        await userDB.set(userData)
        user._dirty = false
    }

    async createUser(email, password){
        try{
            let newUser = await this.admin.auth().createUser({
                email: email,
                password: password
            })
            let user = await this.get(newUser.uid)
            await user.init()
            return user
        }
        catch(err){
            console.log(err)
            throw err
        }
    }
}