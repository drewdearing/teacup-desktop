exports.timeoutPromise = function timoutPromise(ms, callback) {
    return new Promise(function (resolve, reject) {
        let currentTime = (new Date()).getTime()
        callback(resolve, reject, currentTime + ms)

        setTimeout(function () {
            reject(0)
        }, ms)
    })
}

