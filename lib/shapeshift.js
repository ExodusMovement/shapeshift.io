var http = require('./http')
var util = require('./util')

function coins (callback) {
  var url = getBaseUrl() + '/getcoins'
  http.get(url, function (err, data) {
    if (err) return callback(err)
    callback(null, data)
  })
}

function depositLimit (pair, callback) {
  if (pair.indexOf('_') === -1) return callback(new Error('Invalid currency pair string.'))
  pair = pair.toLowerCase()
  var url = getBaseUrl() + '/limit/' + pair
  http.get(url, function (err, data) {
    if (err) return callback(err)
    callback(null, data.limit)
  })
}

function depositStatus (address, callback) {
  var url = getBaseUrl() + '/txStat/' + address
  http.get(url, function (err, data) {
    if (err) return callback(err)
    if (data.error) return callback(new Error(data.error), data.status, data)
    callback(null, data.status, data)
  })
}

function exchangeRate (pair, callback) {
  if (pair.indexOf('_') === -1) return callback(new Error('Invalid currency pair string.'))
  pair = pair.toLowerCase()
  var url = getBaseUrl() + '/rate/' + pair
  http.get(url, function (err, data) {
    if (err) return callback(err)
    callback(null, data.rate)
  })
}

function recent (callback) {
  var url = getBaseUrl() + '/recenttx/50'
  http.get(url, function (err, data) {
    if (err) return callback(err)
    callback(null, data)
  })
}

function shift (withdrawalAddress, pair, options, callback) {
  var url = getBaseUrl() + '/shift'
  var payload = util.clone(options)
  payload.withdrawal = withdrawalAddress
  payload.pair = pair
  http.post(url, payload, function (err, data) {
    if (err) return callback(err, data)
    if (data.error) return callback(new Error(data.error), data)
    callback(null, data)
  })
}

function getBaseUrl () {
  var endpoint = 'shapeshift.io'
  // https://shapeshift.io/api.html#cors
  return module.exports.cors ? 'https://cors.' + endpoint : 'https://' + endpoint
}

module.exports = {
  // for cors endpoint
  cors: false,

  // for intercepting http
  http: http,

  // shapeshift api methods
  coins: coins,
  depositStatus: depositStatus,
  depositLimit: depositLimit,
  exchangeRate: exchangeRate,
  recent: recent,
  shift: shift
}
