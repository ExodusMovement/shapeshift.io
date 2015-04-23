var request = require('request')

function get (url, callback) {
  request.get({url: url, json: true}, function (err, resp, data) {
    if (err) return callback(err)
    if (resp.statusCode !== 200) return callback(new Error('HTTP status code: ' + resp.statusCode))
    callback(null, data)
  })
}

function post (url, data, callback) {
  request.post({url: url, json: true, body: data}, function (err, resp, data) {
    if (err) return callback(err)
    if (resp.statusCode !== 200) return callback(new Error('HTTP status code: ' + resp.statusCode))
    callback(null, data)
  })
}

module.exports = {
  get: get,
  post: post
}
