var test = require('tape')
var secureRandom = require('secure-random')
var shapeshift = require('../')

test('should get a list of transactions by an API key', function (t) {
  t.plan(3)
  var somePrivKey = secureRandom.randomBuffer(32).toString('hex')
  shapeshift.transactions(somePrivKey, function (err, data) {
    t.ifError(err, 'no error')
    t.true(Array.isArray(data), 'data is an array')
    t.is(data.length, 0, 'no data returned')
    t.end()
  })
})
