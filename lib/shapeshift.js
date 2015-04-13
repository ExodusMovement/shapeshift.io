var request = require('request')

function coins (callback) {
  var url = 'https://shapeshift.io/getcoins'
  request.get({url: url, json: true}, function (err, resp, body) {
    if (err) return callback(err)
    if (resp.statusCode !== 200) return callback(new Error('HTTP status code: ' + resp.statusCode))
    callback(null, body)
  })
}

module.exports = {
  coins: coins
}
