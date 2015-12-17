1.1.0 / 2015-12-17
------------------
- added `marketInfo()` See: https://github.com/jprichardson/shapeshift.io/pull/1
- moved testing from mocha to ava
- added `__version`

1.0.0 / 2015-04-21
------------------
- renamed `depositStatus()` to `status()`
- merged `shift()` and `shiftFixed()` into just `shift()`

0.1.0 / 2015-04-21
------------------
- changed github repo from `jprichardson/shapeshift.js` to `jprichardson/shapeshift.io`
- added `transactions()`
- default to `cors` being `true` i.e. using `cors.shapeshift.io` by default... it may be slower, please test
- built-in browser support

0.0.4 / 2015-04-21
------------------
- remove converting to `Date` in `recent()`
- added `shiftFixed()`
- added `emailReceipt()`

0.0.3 / 2015-04-21
------------------
- added `depositStatus()`
- added `shift()`

0.0.2 / 2015-04-14
------------------
- added `depositLimit()`
- renamed `rate()` to `exchangeRate()`
- added `recent()`
- intercept http methods
- added cors support

0.0.1 / 2015-04-13
------------------
- initial commit
