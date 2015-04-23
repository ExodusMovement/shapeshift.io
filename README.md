shapeshift.io
=============

A JavaScript component for the crypto currency buying and selling shapeshift.io service. Works in
both Node.js and the browser. API documentation here: https://shapeshift.io/api.html


Usage
-----

### Node.js Installation

    npm i --save shapeshift.io


### Browser

You can use this module in the browser. Just grab the file here:
https://github.com/jprichardson/shapeshift.io/tree/master/dist/shapeshift.js and
drop it in a script tag on your page like this:

```html
<script src="./shapeshift.js"></script>
```

The `shapeshift` object is global.



### Methods

- [coins()](#coins)
- [depositLimit()](#depositlimit)
- [depositStatus()](#depositstatus)
- [emailReceipt()](#emailreceipt)
- [exchangeRate()](#exchangeRate)
- [recent()](#recent)
- [shift()](#shift)
- [shiftFix()](#shiftfix)
- [transactions()](#transactions)



#### coins()

Get a map of supported coins.

Reference: https://shapeshift.io/api.html#getcoins

**Example:**

```js
var shapeshift = require('shapeshift.io')

shapeshift.coins(function (err, coinData) {
  console.dir(coinData) // =>
  /*
    { BTC:
     { name: 'Bitcoin',
       symbol: 'BTC',
       image: 'https://shapeshift.io/images/coins/bitcoin.png',
       status: 'available' },

       ...

    VRC:
     { name: 'Vericoin',
       symbol: 'VRC',
       image: 'https://shapeshift.io/images/coins/vericoin.png',
       status: 'available' } }
  */
})
```


#### depositLimit()

Get the deposit limit before you purchase.

Reference: https://shapeshift.io/api.html#deposit-limit

**Example:**

```js
var shapeshift = require('shapeshift.io')

var pair = 'btc_ltc'
shapeshift.depositLimit(pair, function (err, limit) {
  console.dir(limit) // => '4.41101872'
})
```


### depositStatus()

Get the status of most recent deposit transaction to the address.

Reference: https://shapeshift.io/api.html#status-deposit

**Example:**

```js
var shapeshift = require('shapeshift.io')

var address = '1LMd3fBqUqZScPSKkjGscwji4EZecCuS48'
shapeshift.depositStatus(address, function (err, status, data) {
  console.dir(data) // =>

  /*
    {
      status : "complete",
      address: <address>,
      withdraw: <withdrawal address>,
      incomingCoin: <amount deposited>,
      incomingType: <coin type of deposit>,
      outgoingCoin: <amount sent to withdrawal address>,
      outgoingType: <coin type of withdrawal>,
      transaction: <transaction id of coin sent to withdrawal address>
    }
  */
})
```


### emailReceipt()

Email receipt for a transaction. Use the transaction id of the withdrawal
not the transaction id of the transaction.

Reference: https://shapeshift.io/api.html#email-receipt

Method: `emailReceipt(emailAddress, txId, callback)`

**Example:**

```js
var shapeshift = require('shapeshift.io')

var depositAddress = 'YOUR_DEPOSIT_ADDRESS'
shapeshift.deposit(depositAddress, function (err, status, data) {
  // status must be 'complete'
  if (status !== 'completed') return

  var txId = data.transaction
  shapeshift.emailReceipt('YOUR_EMAIL_ADDRESS', txId, function (err, data) {
    if (data.status === 'success') {
      console.log('email sent!')
    }
  })
})
```


#### exchangeRate()

Get the exchange rate. Note, the `rate` is returned as a type of
`string`; this is to ensure precision matches the API exactly.

Reference: https://shapeshift.io/api.html#rate

**Example:**

```js
var shapeshift = require('shapeshift.io')

var pair = 'btc_ltc'
shapeshift.exchangeRate(pair, function (err, rate) {
  console.dir(rate) // => '158.71815287'
})
```


#### recent()

Get a list of recent transactions / purchases.

Reference: https://shapeshift.io/api.html#recent-list

**Example:**

```js
var shapeshift = require('shapeshift.io')

shapeshift.recent(function (err, recent) {
  console.dir(recent) // =>

  /*
  [ { curIn: 'DOGE',
      curOut: 'BTC',
      timestamp: 1428989390,
      amount: 417 },
    { curIn: 'DOGE',
      curOut: 'BTC',
      timestamp: 1428989390,
      amount: 417 },
    ...
  */
})
```


### shift()

Shift the coins. i.e. notify the API of the pair that you want to shift and the
address that you want to receive the new coins at.

Reference: https://shapeshift.io/api.html#shift-conduit

Method: `shift(withdrawalAddress, pair, options, callback)`

**Example:**

```js
// example: converting BTC to LTC

var shapeshift = require('shapeshift.io')

var withdrawalAddress = 'YOUR_LTC_ADDRESS'
var pair = 'btc_ltc'

// if something fails
var options = {
  returnAddress: 'YOUR_BTC_RETURN_ADDRESS'
}

shapeshift.shift(withdrawalAddress, pair, options, function (err, returnData) {

  // ShapeShift owned BTC address that you send your BTC to
  var depositAddress = returnData.deposit

  // you need to actually then send your BTC to ShapeShift
  // you could use module `spend`: https://www.npmjs.com/package/spend
  // spend(SS_BTC_WIF, depositAddress, shiftAmount, function (err, txId) { /.. ../ })

  // later, you can then check the deposit status
  shapeshift.depositStatus(depositAddress, function (err, status, data) {
    console.log(status) // => should be 'received' or 'complete'
  })
})
```

Entire integration test found here: https://github.com/jprichardson/shapeshift.js/blob/master/test/integration/basic-shift.test.js



### shiftFixed()

Convert a fixed amount of coins. Useful for payment services.

Reference: https://shapeshift.io/api.html#sendamount

Method: `shiftFixed(withdrawalAddress, pair, amount, options, callback)`

**Example:**

```js
// example: converting BTC to a Fixed Amount of LTC

var shapeshift = require('shapeshift.io')

var withdrawalAddress = 'YOUR_LTC_ADDRESS'
var pair = 'btc_ltc'
var amount = '0.1' // LTC amount that you want to receive to your LTC address

// if something fails
var options = {
  returnAddress: 'YOUR_BTC_RETURN_ADDRESS'
}

shapeshift.shiftFixed(withdrawalAddress, pair, amount, options, function (err, returnData) {
  // ShapeShift owned BTC address that you send your BTC to
  var depositAddress = returnData.deposit

  // amount to send to ShapeShift (type string)
  var shiftAmount = returnData.depositAmount

  // Time before rate expires (type number, time from epoch in seconds)
  var expiration = new Date(returnData.expiration * 1000)

  // rate of exchange, 1 BTC for ??? LTC (type string)
  var rate = returnData.quotedRate

  // you need to actually then send your BTC to ShapeShift
  // you could use module `spend`: https://www.npmjs.com/package/spend
  // CONVERT AMOUNT TO SATOSHIS IF YOU USED `spend`
  // spend(SS_BTC_WIF, depositAddress, shiftAmountSatoshis, function (err, txId) { /.. ../ })

  // later, you can then check the deposit status
  shapeshift.depositStatus(depositAddress, function (err, status, data) {
    console.log(status) // => should be 'received' or 'complete'
  })
})
```

Entire integration test found here: https://github.com/jprichardson/shapeshift.js/blob/master/test/integration/basic-shift-fixed.test.js


### transactions()

List all of the transactions associated with an API key. Optionally pass the withdrawal
address so that you can see all of the transactions associated with an address.

API keys are generated by ShapeShift. You must request them here: https://shapeshift.io/affiliate.html

References: https://shapeshift.io/api.html#txbyapikey, https://shapeshift.io/api.html#txbyaddress

Method: `transactions(apiKey, [address], callback)`

**Example:**

```js

```



### Intercept HTTP

You can intercept/modify http methods. This may be useful if you want to use an alternative http
library.


#### http.get

**Example:**

```js
var shapeshift = require('shapeshift.io')

var oldGet = shapeshift.http.get
shapeshift.http.get = function (url, callback) {
  // log urls?
  // use another http library?
}
```


### CORS

ShapeShift supports CORS so that you can do cross-domain requests in the browser. See
https://shapeshift.io/api.html#cors for more details.

**Example:**

```js
var shapeshift = require('shapeshift.io')
shapeshift.cors = true
```


License
-------

MIT





