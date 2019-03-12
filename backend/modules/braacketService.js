const timeoutPromise = require('./timeoutPromise').timeoutPromise
const Service = require('./service').Service
const request = require('request')
const cheerio = require('cheerio')

exports.BraacketService = class BraacketService extends Service {

    constructor(id){
        super('braacket', id)
    }

    update() {
        return new Promise((resolve, reject) => {
            this.updatePlayers(300000, null, null, null, (all_updated) => {
                resolve(all_updated)
            })
        })
    }

    updateBraacketPlayer(player) {
        return new Promise((resolve, reject) => {
            if (!player.updated) {          
                request(player.url, {
                    json: false
                }, (err, res, body) => {
                    if (!err) {
                        const $ = cheerio.load(body)
                        let dashboard_values = $("div.panel-body").find("div.my-dashboard-values-sub")
                        let dashboard_rankings = $("div.panel-body").find("div.my-dashboard-values-main:contains('out of')")
                        if (dashboard_values.length > 0 && dashboard_rankings.length > 0) {
                            player.rank = parseInt(dashboard_rankings.text().trim().match(new RegExp('[0-9]+'))[0])
                            dashboard_values.each(function (i, elem) {
                                if ($(this).find("div:contains('Points')").length > 0) {
                                    player.points = parseInt($(this).children('div').eq(1).text().trim())
                                }
                                if ($(this).find("div:contains('Activity requirement')").length > 0) {
                                    player.active = $(this).find("span").length <= 0
                                }
                            })
                            player.updated = true
                            resolve(player)
                        }
                        else{
                            reject(player)
                        }
                    }
                    else{
                        reject(player)
                    }
                })
            } else {
                resolve(player)
            }
        }).catch(function(p_err){
            return p_err
        })
    }

    updatePlayerData(timeout, temp_players, callback) {
        timeoutPromise(timeout, (resolve, reject, endTime) => {
            Promise.all(Object.values(temp_players).map(this.updateBraacketPlayer)).then((values) => {
                if(values.filter(p => !p.updated).length > 0){
                    reject(endTime - (new Date()).getTime())
                }
                else{
                    resolve()
                }
            }).catch((err) => {
                reject(endTime - (new Date()).getTime())
            })
        }).then(() => {
            let max_points = 0

            for (var p in temp_players) {
                if (temp_players[p].points > max_points) {
                    max_points = temp_players[p].points
                }
            }

            callback({
                max_points: max_points,
                total_players: Object.keys(temp_players).length,
                players: temp_players,
                all_updated: true
            })

        }).catch((remainingTime) => {
            if (remainingTime > 0) {
                this.updatePlayerData(remainingTime, temp_players, callback)
            } else {
                callback({
                    max_points: 0,
                    total_players: 0,
                    players: null,
                    all_updated: false
                })
            }
        })
    }

    braacketGetPlayers(params) {
        return new Promise((resolve, reject) => {
            request('https://braacket.com/league/' + this.service_id + '/player?rows=' + params.rows + '&page=' + params.page, {
                json: false
            }, (err, res, body) => {
                const $ = cheerio.load(body)
                let player_fields = $('table.table.table-hover.my-table-checkbox')
                if (err || player_fields.length <= 0) {
                    reject({})
                } else {
                    let values = {}
                    player_fields.find('tbody').find('a:not(.badge)').each(function (i, elem) {
                        let id = $(this).text().trim().toLowerCase()
                        if(!(id in values)){
                            values[id] = {
                                "id": id,
                                "name": $(this).text().trim(),
                                "points": undefined,
                                "rank": undefined,
                                "active": false,
                                "url": "https://braacket.com" + $(this).attr('href'),
                                "updated": false
                            }
                        }
                    })

                    resolve(values)
                }
            })
        }).catch((err) => {
            return err;
        })
    }

    braacketGetPages(current_pages, rows) {
        return new Promise((resolve, reject) => {
            if(current_pages != null){
                resolve({pages:current_pages})
            } else{
                request('https://braacket.com/league/' + this.service_id + '/player?rows=' + rows, { json: false }, (err, res, body) => {
                    const $ = cheerio.load(body)
                    let displaying_field = $("div.input-group-addon.my-input-group-addon:contains('Rows')")
                    if (err || displaying_field.length <= 0) {
                        if(err){
                            reject({pages:0})
                        }
                        else{
                            reject({pages:-1})
                        }
                    } else {
                        let total = parseInt(displaying_field.text().match(new RegExp('of [0-9]+'))[0].split(" ")[1])
                        let pages = Math.ceil(total / rows)
                        resolve({
                            pages:pages
                        })
                    }
                })
            }
        })
    }

    updatePlayers(timeout, current_updated, current_players, current_pages, callback) {
        timeoutPromise(timeout, (resolve, reject, endTime) => {
            this.braacketGetPages(current_pages, 500).then((values) => {
                let pages = values.pages
                let params = []
                for (let i = 1; i <= pages; i++) {
                    if (current_updated == null || !current_updated.includes(i)) {
                        params.push({
                            page: i,
                            rows: 500
                        })
                    }
                }
                
                Promise.all(params.map(this.braacketGetPlayers.bind(this))).then((values) => {
                    let temp_players = {}
                    let updated = []
                    let all_updated = true
                    for (let v = 0; v < values.length; v++) {
                        let page = values[v]
                        if (Object.keys(page).length <= 0) {
                            all_updated = false
                        } else {
                            updated.push(v)
                            Object.keys(page).forEach(function(key) {
                                temp_players[key] = page[key]
                            })
                        }
                    }

                    if (all_updated) {
                        resolve({
                            pages: pages,
                            updated: updated,
                            temp_players: temp_players,
                            remainingTime: endTime - (new Date()).getTime()
                        })
                    } else {
                        reject({
                            pages: pages,
                            updated: updated,
                            temp_players: temp_players,
                            remainingTime: endTime - (new Date()).getTime()
                        })
                    }

                }).catch((err) => {
                    reject({
                        pages: pages,
                        updated: null,
                        temp_players: null,
                        remainingTime: endTime - (new Date()).getTime()
                    })
                })

            }).catch((err) => {
                if (err.pages >= 0) {
                    reject({
                        pages: null,
                        updated: null,
                        temp_players: null,
                        remainingTime: endTime - (new Date()).getTime()
                    })
                } else {
                    reject({
                        pages: null,
                        updated: null,
                        temp_players: null,
                        remainingTime: 0
                    })
                }
            })
        }).then((values) => {
            if (current_players != null) {
                for (var p in values.temp_players) {
                    current_players[p] = values.temp_players[p]
                }
            } else {
                current_players = values.temp_players
            }
            this.updatePlayerData(values.remainingTime, current_players, callback)
        }).catch((err) => {
            if (err.temp_players != null && err.remainingTime > 0) {
                if (current_players != null) {
                    for (var p in err.temp_players) {
                        current_players[p] = err.temp_players[p]
                    }
                } else {
                    current_players = err.temp_players
                }
                if (current_updated != null) {
                    for (var p in err.updated) {
                        current_updated.push(err.updated[p])
                    }
                } else {
                    current_updated = err.updated
                }
                this.updatePlayers(err.remainingTime, current_updated, current_players, err.pages, callback)
            } else if (err.remainingTime > 0) {
                this.updatePlayers(err.remainingTime, current_updated, current_players, err.pages, callback)
            } else {
                callback({
                    max_points: 0,
                    total_players: 0,
                    players: null,
                    all_updated: false
                })
            }

        })
    }
}