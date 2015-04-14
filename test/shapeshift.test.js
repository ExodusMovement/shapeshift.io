var assert = require('assert')
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
        assert(parseFloat(limit) > 1)
        done()
      })
    })
  })

  describe('+ rate()', function () {
    it('should get the current rate', function (done) {
      var pair = 'btc_ltc'
      shapeshift.rate(pair, function (err, rate) {
        assert.ifError(err)

        // we keep string to maintain precision
        assert.equal(typeof rate, 'string')

        // if this fails, LTC has gotten valuable
        assert(parseFloat(rate) > 10)

        done()
      })
    })
  })
})
