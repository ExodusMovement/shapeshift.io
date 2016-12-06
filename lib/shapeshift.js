var http = require('./http')
var util = require('./util')
var pkg = require('../package')

exports.coins = function (callback) {
  var url = getBaseUrl() + '/getcoins'
  http.get(url, function (err, data) {
    if (err) return callback(err)
    callback(null, data)
  })
}

exports.depositLimit = function (pair, callback) {
  if (pair.indexOf('_') === -1) return callback(new Error('Invalid currency pair string.'))
  pair = pair.toLowerCase()
  var url = getBaseUrl() + '/limit/' + pair
  http.get(url, function (err, data) {
    if (err) return callback(err)
    callback(null, data.limit)
  })
}

exports.emailReceipt = function (emailAddress, txId, callback) {
  var url = getBaseUrl() + '/mail'
  http.post(url, { email: emailAddress, txid: txId }, function (err, data) {
    if (err) return callback(err)
    if (data.error) return callback(new Error(data.error), data)
    callback(null, data.email)
  })
}

exports.exchangeRate = function (pair, callback) {
  if (pair.indexOf('_') === -1) return callback(new Error('Invalid currency pair string.'))
  pair = pair.toLowerCase()
  var url = getBaseUrl() + '/rate/' + pair
  http.get(url, function (err, data) {
    if (err) return callback(err)
    callback(null, data.rate)
  })
}

exports.isDown = function (callback) {
  marketInfo('btc_ltc', function (err, info) {
    if (err) return callback(err, true)
    else return callback(null, false)
  })
}

exports.marketInfo = marketInfo
function marketInfo (pair, callback) {
  // no pair passed
  if (typeof pair === 'function') {
    callback = pair
    pair = ''
  }

  var url = getBaseUrl() + '/marketinfo/' + pair
  http.get(url, function (err, info) {
    if (err) return callback(err)
    callback(null, info)
  })
}

exports.recent = function (callback) {
  var url = getBaseUrl() + '/recenttx/50'
  http.get(url, function (err, data) {
    if (err) return callback(err)
    callback(null, data)
  })
}

exports.quote = function (pair, options, callback) {
  options = util.clone(options)
  if (!('depositAmount' in options) && !('withdrawalAmount' in options)) {
    throw new Error('quote() expected depositAmount or withdrawalAmount')
  }

  if (options.despositAmount) {
    options.amount = options.depositAmount
    delete options.depositAmount
  }

  sendAmount(pair, options, callback)
}

exports.shift = function (withdrawalAddress, pair, options, callback) {
  if (options.amount) {
    _shiftFixed(withdrawalAddress, pair, options.amount, options, callback)
  } else {
    _shift(withdrawalAddress, pair, options, callback)
  }
}

exports._shift = _shift
function _shift (withdrawalAddress, pair, options, callback) {
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

exports._shiftFixed = _shiftFixed
function _shiftFixed (withdrawalAddress, pair, amount, options, callback) {
  var url = getBaseUrl() + '/sendamount'
  var payload = util.clone(options)
  payload.withdrawal = withdrawalAddress
  payload.pair = pair
  payload.amount = amount
  http.post(url, payload, function (err, data) {
    if (err) return callback(err, data)
    if (data.error) return callback(new Error(data.error), data)
    // shapeshift is inconsistent here, notice in `shift()` there is no success field
    callback(null, data.success)
  })
}

exports.sendAmount = sendAmount
function sendAmount (pair, payload, callback) {
  payload = util.clone(payload)
  payload.pair = pair

  var url = getBaseUrl() + '/sendamount'
  http.post(url, payload, function (err, data) {
    if (err) return callback(err, data)
    if (data.error) return callback(new Error(data.error), data)
    // shapeshift is inconsistent here, notice in `shift()` there is no success field
    callback(null, data.success)
  })
}

exports.status = function (depositAddress, callback) {
  var url = getBaseUrl() + '/txStat/' + depositAddress
  http.get(url, function (err, data) {
    if (err) return callback(err)
    if (data.error) return callback(new Error(data.error), data.status, data)
    callback(null, data.status, data)
  })
}

exports.transactions = function (apiKey, address, callback) {
  if (typeof address === 'function') {
    callback = address
    address = null
  }

  var url
  if (!address) url = getBaseUrl() + '/txbyapikey/' + apiKey
  else url = getBaseUrl() + '/txbyaddress/' + address + '/' + apiKey

  http.get(url, function (err, data) {
    if (err) return callback(err, data)
    if (!Array.isArray(data)) return callback(new Error('Data is not of type array. Possible error?'), data)
    callback(null, data)
  })
}

function getBaseUrl () {
  var endpoint = 'shapeshift.io'
  // https://shapeshift.io/api.html#cors
  return module.exports.cors ? 'https://cors.' + endpoint : 'https://' + endpoint
}

exports.cors = true
exports.http = http
exports.__version = pkg.version
