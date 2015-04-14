var http = require('./http')

function coins (callback) {
  var url = 'https://shapeshift.io/getcoins'
  http.get(url, function (err, data) {
    if (err) return callback(err)
    callback(null, data)
  })
}

function depositLimit (pair, callback) {
  if (pair.indexOf('_') === -1) return callback(new Error('Invalid currency pair string.'))
  pair = pair.toLowerCase()
  var url = 'https://shapeshift.io/limit/' + pair
  http.get(url, function (err, data) {
    if (err) return callback(err)
    callback(null, data.limit)
  })
}

function exchangeRate (pair, callback) {
  if (pair.indexOf('_') === -1) return callback(new Error('Invalid currency pair string.'))
  pair = pair.toLowerCase()
  var url = 'https://shapeshift.io/rate/' + pair
  http.get(url, function (err, data) {
    if (err) return callback(err)
    callback(null, data.rate)
  })
}

function recent (callback) {
  var url = 'https://shapeshift.io/recenttx/50'
  http.get(url, function (err, data) {
    if (err) return callback(err)
    data.forEach(function (tx) {
      tx.timestamp = new Date(tx.timestamp * 1000)
    })

    callback(null, data)
  })
}

module.exports = {
  // for intercepting http
  http: http,

  // shapeshift api methods
  coins: coins,
  depositLimit: depositLimit,
  exchangeRate: exchangeRate,
  recent: recent
}
