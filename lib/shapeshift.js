var request = require('request')

function coins (callback) {
  var url = 'https://shapeshift.io/getcoins'
  request.get({url: url, json: true}, function (err, resp, body) {
    if (err) return callback(err)
    if (resp.statusCode !== 200) return callback(new Error('HTTP status code: ' + resp.statusCode))
    callback(null, body)
  })
}

function rate (pair, callback) {
  if (pair.indexOf('_') === -1) return callback(new Error('Invalid currency pair string.'))
  pair = pair.toLowerCase()
  var url = 'https://shapeshift.io/rate/' + pair
  request.get({url: url, json: true}, function (err, resp, body) {
    if (err) return callback(err)
    if (resp.statusCode !== 200) return callback(new Error('HTTP status code: ' + resp.statusCode))
    callback(null, body.rate)
  })
}

module.exports = {
  coins: coins,
  rate: rate
}
