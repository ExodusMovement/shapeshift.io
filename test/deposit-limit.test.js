var test = require('ava')
var shapeshift = require('../')

test = test.cb

test('should get the deposit limit', function (t) {
  t.plan(2)

  var pair = 'btc_ltc'
  shapeshift.depositLimit(pair, function (err, limit) {
    t.ifError(err, 'no error')
    t.is(typeof limit, 'string')
    t.end()
  })
})
