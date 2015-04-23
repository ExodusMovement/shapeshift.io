var assert = require('assert')
var secureRandom = require('secure-random')
var shapeshift = require('../')

/* global describe, it */

describe('shapeshift', function () {
  describe('+ coins()', function () {
    it('should get a list of supported coins', function (done) {
      shapeshift.coins(function (err, coinData) {
        assert.ifError(err)

        assert(coinData.BTC)
        assert.equal(coinData.BTC.name, 'Bitcoin')
        assert.equal(coinData.BTC.symbol, 'BTC')
        assert('status' in coinData.BTC)
        assert('image' in coinData.BTC)

        done()
      })
    })
  })

  describe('+ depositLimit()', function () {
    it('should get the deposit limit', function (done) {
      var pair = 'btc_ltc'
      shapeshift.depositLimit(pair, function (err, limit) {
        assert.ifError(err)
        assert.equal(typeof limit, 'string')
        done()
      })
    })
  })

  describe('+ exchangeRate()', function () {
    it('should get the current rate', function (done) {
      var pair = 'btc_ltc'
      shapeshift.exchangeRate(pair, function (err, rate) {
        assert.ifError(err)

        // we keep string to maintain precision
        assert.equal(typeof rate, 'string')

        // if this fails, LTC has gotten valuable
        assert(parseFloat(rate) > 10)

        done()
      })
    })
  })

  describe('+ recent()', function () {
    it('should get a list of recent transactions', function (done) {
      shapeshift.recent(function (err, recent) {
        assert.ifError(err)
        assert.equal(recent.length, 50)
        assert('curIn' in recent[0])
        assert('curOut' in recent[0])
        assert('timestamp' in recent[0])
        assert('amount' in recent[0])
        done()
      })
    })
  })

  describe('+ status()', function () {
    it('should get status of deposit address', function () {
      var address = '5' // hmm, unfortunately accepts shitty malformed addresses
      shapeshift.status(address, function (err, status, data) {
        assert.ifError(err)
        assert.equal(status, 'no_deposits')
        assert('status' in data)
        assert('address' in data)
      })
    })
  })

  describe('+ transactions()', function () {
    it('should get a list of transactions by an API key', function (done) {
      var somePrivKey = secureRandom.randomBuffer(32).toString('hex')
      shapeshift.transactions(somePrivKey, function (err, data) {
        assert.ifError(err)
        assert(Array.isArray(data))
        assert.equal(data.length, 0)
        done()
      })
    })
  })
})
