var http = require('./http')
var util = require('./util')

/* eslint-disable no-unused-vars */
// this is so the version gets embedded in the browser version
var pkg = require('../package')
/* eslint-enable no-unused-vars */

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

function emailReceipt (emailAddress, txId, callback) {
  var url = getBaseUrl() + '/mail'
  http.post(url, { email: emailAddress, txid: txId}, function (err, data) {
    if (err) return callback(err)
    if (data.error) return callback(new Error(data.error), data)
    callback(null, data.email)
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
  if (options.amount) {
    _shiftFixed(withdrawalAddress, pair, options.amount, options, callback)
  } else {
    _shift(withdrawalAddress, pair, options, callback)
  }
}

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

function status (depositAddress, callback) {
  var url = getBaseUrl() + '/txStat/' + depositAddress
  http.get(url, function (err, data) {
    if (err) return callback(err)
    if (data.error) return callback(new Error(data.error), data.status, data)
    callback(null, data.status, data)
  })
}

function transactions (apiKey, address, callback) {
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

module.exports = {
  // for cors endpoint
  cors: true,

  // for intercepting http
  http: http,

  // shapeshift api methods
  coins: coins,
  depositLimit: depositLimit,
  emailReceipt: emailReceipt,
  exchangeRate: exchangeRate,
  recent: recent,
  shift: shift,
  _shift: _shift,
  _shiftFixed: _shiftFixed,
  status: status,
  transactions: transactions
}
