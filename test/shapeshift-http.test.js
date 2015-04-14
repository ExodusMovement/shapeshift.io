var assert = require('assert')
var shapeshift = require('../')

/* global describe, it */

describe('shapeshift', function () {
  describe('> when intercepting http get', function () {
    it('should call external http get', function (done) {
      var interceptCalled = false

      var oldGet = shapeshift.http.get
      shapeshift.http.get = function (url, callback) {
        interceptCalled = true
        oldGet(url, callback)
      }

      shapeshift.coins(function (err, coinData) {
        assert.ifError(err)
        assert(interceptCalled)
        assert(coinData.BTC)

        // restore
        shapeshift.http.get = oldGet

        done()
      })
    })
  })
})
