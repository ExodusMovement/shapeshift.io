var assert = require('assert')
var Blockchain = require('cb-insight')
var CoinKey = require('coinkey')
var Decimal = require('decimal.js')
var ms = require('ms')
var spend = require('spend')
var shapeshift = require('../../')

/* global describe, it */

// is our environment WIF variables set?
var runIT = process.env.SS_BTC_WIF && process.env.SS_LTC_WIF ? it : it.skip
var SS_BTC_WIF = process.env.SS_BTC_WIF
var SS_LTC_WIF = process.env.SS_LTC_WIF

spend.blockchain = new Blockchain('https://insight.bitpay.com')

describe('shapeshift / integration', function () {
  describe('basic shift fixed amount - exchange BTC for LTC', function () {
    runIT('should shift', function (done) {
      var ltcKey = CoinKey.fromWif(SS_LTC_WIF)
      var btcKey = CoinKey.fromWif(SS_BTC_WIF)

      var withdrawalAddress = ltcKey.publicAddress
      var pair = 'btc_ltc'
      var amount = '0.03' // we want 0.03 LTC
      var options = {
        returnAddress: btcKey.publicAddress
      }

      shapeshift.shiftFixed(withdrawalAddress, pair, amount, options, function (err, returnData) {
        assert.ifError(err)
        assert(returnData, 'No return data')

        console.dir(returnData)

        assert('expiration' in returnData)
        assert('quotedRate' in returnData)
        assert('minerFee' in returnData)

        var depositAddress = returnData.deposit
        var shiftAmount = returnData.depositAmount

        // convert to satoshis
        shiftAmount = new Decimal(shiftAmount).times(1e8).toNumber()

        spend(SS_BTC_WIF, depositAddress, shiftAmount, function (err, txId) {
          assert.ifError(err)
          console.log(txId)
          assert(txId)

          // let's wait some time before checking status, may not be necessary
          setTimeout(function () {
            shapeshift.depositStatus(depositAddress, function (err, status, data) {
              assert.ifError(err)
              assert(status === 'received' || status === 'complete', status + ' unexpected status.')

              console.dir(data)

              done()
            })
          }, ms('10s'))
        })
      })
    })
  })
})
