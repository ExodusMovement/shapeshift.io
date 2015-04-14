var request = require('request')

function coins (callback) {
  var url = 'https://shapeshift.io/getcoins'
  request.get({url: url, json: true}, function (err, resp, body) {
    if (err) return callback(err)
    if (resp.statusCode !== 200) return callback(new Error('HTTP status code: ' + resp.statusCode))
    callback(null, body)
  })
}

function depositLimit (pair, callback) {
  if (pair.indexOf('_') === -1) return callback(new Error('Invalid currency pair string.'))
  pair = pair.toLowerCase()
  var url = 'https://shapeshift.io/limit/' + pair
  request.get({url: url, json: true}, function (err, resp, body) {
    if (err) return callback(err)
    if (resp.statusCode !== 200) return callback(new Error('HTTP status code: ' + resp.statusCode))
    callback(null, body.limit)
  })
}

function exchangeRate (pair, callback) {
  if (pair.indexOf('_') === -1) return callback(new Error('Invalid currency pair string.'))
  pair = pair.toLowerCase()
  var url = 'https://shapeshift.io/rate/' + pair
  request.get({url: url, json: true}, function (err, resp, body) {
    if (err) return callback(err)
    if (resp.statusCode !== 200) return callback(new Error('HTTP status code: ' + resp.statusCode))
    callback(null, body.rate)
  })
}

function recent (callback) {
  var url = 'https://shapeshift.io/recenttx/50'
  request.get({url: url, json: true}, function (err, resp, body) {
    if (err) return callback(err)
    if (resp.statusCode !== 200) return callback(new Error('HTTP status code: ' + resp.statusCode))
    body.forEach(function (tx) {
      tx.timestamp = new Date(tx.timestamp * 1000)
    })

    callback(null, body)
  })
}

module.exports = {
  coins: coins,
  depositLimit: depositLimit,
  exchangeRate: exchangeRate,
  recent: recent
}
