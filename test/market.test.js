var test = require('ava')
var shapeshift = require('../')

test = test.cb

test('should get the market info data for a pair', function (t) {
  t.plan(6)
  shapeshift.marketInfo('btc_ltc', function (err, marketInfo) {
    t.ifError(err, 'no error')
    t.is(marketInfo.pair, 'btc_ltc') // case is dependent upon what's passed in
    t.true('rate' in marketInfo, 'has rate')
    t.true('minerFee' in marketInfo, 'has minerFee')
    t.true('limit' in marketInfo, 'has limit')
    t.true('minimum' in marketInfo, 'has minimum')
    t.end()
  })
})

test('should get the market info data for a pair', function (t) {
  t.plan(7)
  shapeshift.marketInfo(function (err, marketInfos) {
    t.ifError(err, 'no error')
    t.true(Array.isArray(marketInfos))
    t.true('rate' in marketInfos[0], 'has rate')
    t.true('minerFee' in marketInfos[0], 'has minerFee')
    t.true('limit' in marketInfos[0], 'has limit')
    // damnit... stupid inconsistencies
    t.true('min' in marketInfos[0], 'has minimum')
    t.true('pair' in marketInfos[0])
    t.end()
  })
})
