shapeshift.io
=============

[![NPM Package](https://img.shields.io/npm/v/shapeshift.io.svg?style=flat-square)](https://www.npmjs.org/package/shapeshift.io)
[![Build Status](https://img.shields.io/travis/ExodusMovement/shapeshift.io.svg?branch=master&style=flat-square)](https://travis-ci.org/ExodusMovement/shapeshift.io)
[![JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

A JavaScript component for the crypto currency buying and selling [ShapesShift.io](https://shapeshift.io/) service.

You can use [ShapeShift.io](https://shapeshift.io/) to instantly exchange Bitcoin for Litecoin and other
crypto currencies with no signup/account needed. Use [Exodus](http://www.exodus.io/) to manage your
crypto currency portfolios and easily exchange currencies with ShapeShift.

Works in both Node.js and the browser. API documentation here: https://shapeshift.io/api.html


Usage
-----

### Node.js / [Browserify](https://github.com/substack/node-browserify) Installation

    npm i --save shapeshift.io


### Browser

You can use this module in the browser. Just grab the file here:
https://github.com/jprichardson/shapeshift.io/tree/master/dist/shapeshift.js and
drop it in a script tag on your page like this:

```html
<script src="./shapeshift.js"></script>
```

The `shapeshift` object is global.


### ShapeShift API

First, a note about the REST API provided by ShapeShift. Be aware that there are some inconsistencies that will no doubt be fixed in
later versions. The following lists these consistencies:

In returned data, `curIn`, `curOut`, `incomingType`, `outgoingType`, `inputCurrency`, `outputCurrency` all
mean the same thing (obviously not input/output), namely a currency abbreviation. Just take note that
`cur`, `type`, and `currency` usually mean the same thing.



### Methods

- [coins()](#coins)
- [depositLimit()](#depositlimit)
- [emailReceipt()](#emailreceipt)
- [exchangeRate()](#exchangerate)
- [isDown()](#isdown)
- [marketInfo()](#marketinfo)
- [recent()](#recent)
- [shift()](#shift)
- [status()](#status)
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
  if (status !== 'complete') return

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


### isDown()

Check if ShapeShift is down or in maintenance.

**Example:**

```js
var shapeshift = require('shapeshift.io')

shapeshift.isDown(function (err, isDown) {
  console.log(isDown) // => true or false
})
```


### marketInfo()

Get the market information.

Reference: https://shapeshift.io/api#api-103

**Example:**

```js
var shapeshift = require('shapeshift.io')

var pair = 'btc_ltc' // pair is optional
shapeshift.marketInfo(pair, function (err, marketInfo) {
  console.dir(marketInfo)
  /* =>
    {
      "rate": "121.25912408",
      "limit": 2.24854014,
      "pair": "btc_ltc",
      "minimum": 0.0000492,
      "minerFee": 0.003
    }
  */
})
```

**Note:** When `pair` is not passed, the field in the info changes from `minimum` to `min`.


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
address that you want to receive the new coins at. Can also shift a fixed amount.

References: https://shapeshift.io/api.html#shift-conduit, https://shapeshift.io/api.html#sendamount

Method: `shift(withdrawalAddress, pair, options, callback)`

**Example (normal shift):**

```js
// example: converting BTC to LTC in any amount

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
  shapeshift.status(depositAddress, function (err, status, data) {
    console.log(status) // => should be 'received' or 'complete'
  })
})
```


**Example (fixed amount):**

```js
// example: converting BTC to a Fixed Amount of LTC

var shapeshift = require('shapeshift.io')

var withdrawalAddress = 'YOUR_LTC_ADDRESS'
var pair = 'btc_ltc'
var amount = '0.1' // LTC amount that you want to receive to your LTC address

// if something fails
var options = {
  returnAddress: 'YOUR_BTC_RETURN_ADDRESS',
  amount: amount // <---- must set amount here
}

shapeshift.shift(withdrawalAddress, pair, options, function (err, returnData) {
  // ShapeShift owned BTC address that you send your BTC to
  var depositAddress = returnData.deposit

  // NOTE: `depositAmount`, `expiration`, and `quotedRate` are only returned if
  // you set `options.amount`

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
  shapeshift.status(depositAddress, function (err, status, data) {
    console.log(status) // => should be 'received' or 'complete'
  })
})
```
Entire integration tests found here: https://github.com/jprichardson/shapeshift.js/blob/master/test/integration/basic-shift.test.js
and https://github.com/jprichardson/shapeshift.js/blob/master/test/integration/basic-shift-fixed.test.js



### status()

Get the status of most recent deposit transaction to the address.

Reference: https://shapeshift.io/api.html#status-deposit

Method: `status(depositAddress, callback)`

**Example:**

```js
var shapeshift = require('shapeshift.io')

// you get this from the result of shift()
var address = 'DEPOSIT_ADDRESS'
shapeshift.status(address, function (err, status, data) {
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


### transactions()

List all of the transactions associated with an API key. Optionally pass the withdrawal
address so that you can see all of the transactions associated with an address.

API keys are generated by ShapeShift. You must request them here: https://shapeshift.io/affiliate.html

References: https://shapeshift.io/api.html#txbyapikey, https://shapeshift.io/api.html#txbyaddress

Method: `transactions(apiKey, [address], callback)`

**Example:**

```js
var somePrivKey = 'YOUR_PRIVATE_KEY'
shapeshift.transactions(somePrivKey, function (err, transactions) {
  if (err) return console.error(err)
  transactions.forEach(function (tx) {
    console.dir(tx)
  })
})
```

### __version

Get the version number of this module. Useful in `<script/>` tag browser development.


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


#### http.post

**Example:**

```js
var shapeshift = require('shapeshift.io')

var oldPost = shapeshift.http.post
shapeshift.http.post = function (url, data, callback) {
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


### Promises

Prefer a promise based API? No problem, [Bluebird](https://github.com/petkaantonov/bluebird) has you covered.

Just use [`promisifyAll()`](https://github.com/petkaantonov/bluebird/blob/master/API.md#promisepromisifyallobject-target--object-options---object):

```js
var Promise = require('bluebird')
var shapeshift = Promise.promisifyAll(require('shapeshift.io'))
```

That simple.


Wanna Hack on shapeshift.io package?
------------------------------------

Awesome. First, this package uses [JavaScript Standard Style](https://github.com/feross/standard).

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)

You'll want to setup two private keys (WIF) so that you can actually test the shifting. Set these as environment
variables. Make one for Bitcoin (BTC) and the other for Litecoin (LTC). You'll be using real funds. But don't worry,
it's small amounts (a few pennies).

    # shapeshift API testing
    export SS_BTC_WIF=K....
    export SS_LTC_WIF=T....

Then run the tests:

    npm test


License
-------

MIT

Copyright (c) 2015 [JP Richardson](https://github.com/jprichardson)
