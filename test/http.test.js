var test = require('ava')
var shapeshift = require('../')

test = test.cb

test('> when intercepting http get, should call external http get', function (t) {
  t.plan(3)
  var interceptCalled = false

  var oldGet = shapeshift.http.get
  shapeshift.http.get = function (url, callback) {
    interceptCalled = true
    oldGet(url, callback)
  }

  shapeshift.coins(function (err, coinData) {
    t.ifError(err, 'no error on coins()')
    t.true(interceptCalled, 'intercept called')
    t.ok(coinData.BTC, 'BTC returned in coinData')

    // restore
    shapeshift.http.get = oldGet

    t.end()
  })
})
