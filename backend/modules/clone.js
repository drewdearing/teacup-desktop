exports.cloneObject = function cloneObject(obj){
    let newObj = {}
    for(var key in obj){
        newObj[key] = obj[key]
    }
    return newObj
}