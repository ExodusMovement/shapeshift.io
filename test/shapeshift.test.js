var assert = require('assert')
var shapeshift = require('../')

/* global describe, it */

describe('shapeshift', function () {
  describe('+ coins', function () {
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
})
