var test = require('ava')
var shapeshift = require('../')

test = test.cb

test('should get status of deposit address with valid address', function (t) {
  t.plan(10)
  var address = '5' // hmm, unfortunately accepts shitty malformed addresses, this is somehow valid too
  shapeshift.status(address, function (err, status, data) {
    t.ifError(err, 'no error')
    t.is(status, 'complete')
    t.is(data.status, 'complete', 'status field should be complete')
    t.is(data.address, address, 'address field should be address passed')
    t.is(data.withdraw, '1H9rH6Na5sTTGbzqohVKYQdQPxEJqcmzy4')
    t.is(data.incomingCoin, 28.922632) // todo, make string
    t.is(data.incomingType, 'STR')
    t.is(data.outgoingCoin, '0.00030000')
    t.is(data.outgoingType, 'BTC')
    t.true('transaction' in data, 'data has transaction field')
    t.end()
  })
})

test('should get status of deposit address with invalid address', function (t) {
  t.plan(4)
  var address = '5-should-not-be-real-address' // hmm, unfortunately accepts shitty malformed addresses, this is somehow valid too
  shapeshift.status(address, function (err, status, data) {
    t.ifError(err, 'no error')
    t.is(status, 'no_deposits', 'status shoudl be "no_deposits"')
    t.true('status' in data, 'data should have status field')
    t.true('address' in data, 'data should have address field')
    t.end()
  })
})
