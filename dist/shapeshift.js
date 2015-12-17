(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.shapeshift = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var xhr = require('xhr')

function get (url, callback) {
  xhr({ method: 'GET', url: url, json: true, timeout: 30000 }, function (err, resp, body) {
    if (err) return callback(err)
    if (resp.statusCode !== 200) return callback(new Error('HTTP status code: ' + resp.statusCode))
    callback(null, body)
  })
}

function post (url, data, callback) {
  xhr({ method: 'GET', url: url, json: true, timeout: 30000, data: data }, function (err, resp, body) {
    if (err) return callback(err)
    if (resp.statusCode !== 200) return callback(new Error('HTTP status code: ' + resp.statusCode))
    callback(null, body)
  })
}

module.exports = {
  get: get,
  post: post
}

},{"xhr":5}],2:[function(require,module,exports){
(function (process){
if (!process.browser) {
  module.exports = require('./http' + '-node')
} else {
  module.exports = require('./http-browser')
}

}).call(this,require('_process'))
},{"./http-browser":1,"_process":4}],3:[function(require,module,exports){
// poor man's clone
function clone (o) {
  return JSON.parse(JSON.stringify(o))
}

module.exports = {
  clone: clone
}

},{}],4:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],5:[function(require,module,exports){
"use strict";
var window = require("global/window")
var once = require("once")
var isFunction = require("is-function")
var parseHeaders = require("parse-headers")
var xtend = require("xtend")

module.exports = createXHR
createXHR.XMLHttpRequest = window.XMLHttpRequest || noop
createXHR.XDomainRequest = "withCredentials" in (new createXHR.XMLHttpRequest()) ? createXHR.XMLHttpRequest : window.XDomainRequest

forEachArray(["get", "put", "post", "patch", "head", "delete"], function(method) {
    createXHR[method === "delete" ? "del" : method] = function(uri, options, callback) {
        options = initParams(uri, options, callback)
        options.method = method.toUpperCase()
        return _createXHR(options)
    }
})

function forEachArray(array, iterator) {
    for (var i = 0; i < array.length; i++) {
        iterator(array[i])
    }
}

function isEmpty(obj){
    for(var i in obj){
        if(obj.hasOwnProperty(i)) return false
    }
    return true
}

function initParams(uri, options, callback) {
    var params = uri

    if (isFunction(options)) {
        callback = options
        if (typeof uri === "string") {
            params = {uri:uri}
        }
    } else {
        params = xtend(options, {uri: uri})
    }

    params.callback = callback
    return params
}

function createXHR(uri, options, callback) {
    options = initParams(uri, options, callback)
    return _createXHR(options)
}

function _createXHR(options) {
    var callback = options.callback
    if(typeof callback === "undefined"){
        throw new Error("callback argument missing")
    }
    callback = once(callback)

    function readystatechange() {
        if (xhr.readyState === 4) {
            loadFunc()
        }
    }

    function getBody() {
        // Chrome with requestType=blob throws errors arround when even testing access to responseText
        var body = undefined

        if (xhr.response) {
            body = xhr.response
        } else if (xhr.responseType === "text" || !xhr.responseType) {
            body = xhr.responseText || xhr.responseXML
        }

        if (isJson) {
            try {
                body = JSON.parse(body)
            } catch (e) {}
        }

        return body
    }

    var failureResponse = {
                body: undefined,
                headers: {},
                statusCode: 0,
                method: method,
                url: uri,
                rawRequest: xhr
            }

    function errorFunc(evt) {
        clearTimeout(timeoutTimer)
        if(!(evt instanceof Error)){
            evt = new Error("" + (evt || "Unknown XMLHttpRequest Error") )
        }
        evt.statusCode = 0
        callback(evt, failureResponse)
    }

    // will load the data & process the response in a special response object
    function loadFunc() {
        if (aborted) return
        var status
        clearTimeout(timeoutTimer)
        if(options.useXDR && xhr.status===undefined) {
            //IE8 CORS GET successful response doesn't have a status field, but body is fine
            status = 200
        } else {
            status = (xhr.status === 1223 ? 204 : xhr.status)
        }
        var response = failureResponse
        var err = null

        if (status !== 0){
            response = {
                body: getBody(),
                statusCode: status,
                method: method,
                headers: {},
                url: uri,
                rawRequest: xhr
            }
            if(xhr.getAllResponseHeaders){ //remember xhr can in fact be XDR for CORS in IE
                response.headers = parseHeaders(xhr.getAllResponseHeaders())
            }
        } else {
            err = new Error("Internal XMLHttpRequest Error")
        }
        callback(err, response, response.body)

    }

    var xhr = options.xhr || null

    if (!xhr) {
        if (options.cors || options.useXDR) {
            xhr = new createXHR.XDomainRequest()
        }else{
            xhr = new createXHR.XMLHttpRequest()
        }
    }

    var key
    var aborted
    var uri = xhr.url = options.uri || options.url
    var method = xhr.method = options.method || "GET"
    var body = options.body || options.data || null
    var headers = xhr.headers = options.headers || {}
    var sync = !!options.sync
    var isJson = false
    var timeoutTimer

    if ("json" in options) {
        isJson = true
        headers["accept"] || headers["Accept"] || (headers["Accept"] = "application/json") //Don't override existing accept header declared by user
        if (method !== "GET" && method !== "HEAD") {
            headers["content-type"] || headers["Content-Type"] || (headers["Content-Type"] = "application/json") //Don't override existing accept header declared by user
            body = JSON.stringify(options.json)
        }
    }

    xhr.onreadystatechange = readystatechange
    xhr.onload = loadFunc
    xhr.onerror = errorFunc
    // IE9 must have onprogress be set to a unique function.
    xhr.onprogress = function () {
        // IE must die
    }
    xhr.ontimeout = errorFunc
    xhr.open(method, uri, !sync, options.username, options.password)
    //has to be after open
    if(!sync) {
        xhr.withCredentials = !!options.withCredentials
    }
    // Cannot set timeout with sync request
    // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
    // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
    if (!sync && options.timeout > 0 ) {
        timeoutTimer = setTimeout(function(){
            aborted=true//IE9 may still call readystatechange
            xhr.abort("timeout")
            var e = new Error("XMLHttpRequest timeout")
            e.code = "ETIMEDOUT"
            errorFunc(e)
        }, options.timeout )
    }

    if (xhr.setRequestHeader) {
        for(key in headers){
            if(headers.hasOwnProperty(key)){
                xhr.setRequestHeader(key, headers[key])
            }
        }
    } else if (options.headers && !isEmpty(options.headers)) {
        throw new Error("Headers cannot be set on an XDomainRequest object")
    }

    if ("responseType" in options) {
        xhr.responseType = options.responseType
    }

    if ("beforeSend" in options &&
        typeof options.beforeSend === "function"
    ) {
        options.beforeSend(xhr)
    }

    xhr.send(body)

    return xhr


}

function noop() {}

},{"global/window":6,"is-function":7,"once":8,"parse-headers":11,"xtend":12}],6:[function(require,module,exports){
(function (global){
if (typeof window !== "undefined") {
    module.exports = window;
} else if (typeof global !== "undefined") {
    module.exports = global;
} else if (typeof self !== "undefined"){
    module.exports = self;
} else {
    module.exports = {};
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],7:[function(require,module,exports){
module.exports = isFunction

var toString = Object.prototype.toString

function isFunction (fn) {
  var string = toString.call(fn)
  return string === '[object Function]' ||
    (typeof fn === 'function' && string !== '[object RegExp]') ||
    (typeof window !== 'undefined' &&
     // IE8 and below
     (fn === window.setTimeout ||
      fn === window.alert ||
      fn === window.confirm ||
      fn === window.prompt))
};

},{}],8:[function(require,module,exports){
module.exports = once

once.proto = once(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once(this)
    },
    configurable: true
  })
})

function once (fn) {
  var called = false
  return function () {
    if (called) return
    called = true
    return fn.apply(this, arguments)
  }
}

},{}],9:[function(require,module,exports){
var isFunction = require('is-function')

module.exports = forEach

var toString = Object.prototype.toString
var hasOwnProperty = Object.prototype.hasOwnProperty

function forEach(list, iterator, context) {
    if (!isFunction(iterator)) {
        throw new TypeError('iterator must be a function')
    }

    if (arguments.length < 3) {
        context = this
    }
    
    if (toString.call(list) === '[object Array]')
        forEachArray(list, iterator, context)
    else if (typeof list === 'string')
        forEachString(list, iterator, context)
    else
        forEachObject(list, iterator, context)
}

function forEachArray(array, iterator, context) {
    for (var i = 0, len = array.length; i < len; i++) {
        if (hasOwnProperty.call(array, i)) {
            iterator.call(context, array[i], i, array)
        }
    }
}

function forEachString(string, iterator, context) {
    for (var i = 0, len = string.length; i < len; i++) {
        // no such thing as a sparse string.
        iterator.call(context, string.charAt(i), i, string)
    }
}

function forEachObject(object, iterator, context) {
    for (var k in object) {
        if (hasOwnProperty.call(object, k)) {
            iterator.call(context, object[k], k, object)
        }
    }
}

},{"is-function":7}],10:[function(require,module,exports){

exports = module.exports = trim;

function trim(str){
  return str.replace(/^\s*|\s*$/g, '');
}

exports.left = function(str){
  return str.replace(/^\s*/, '');
};

exports.right = function(str){
  return str.replace(/\s*$/, '');
};

},{}],11:[function(require,module,exports){
var trim = require('trim')
  , forEach = require('for-each')
  , isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    }

module.exports = function (headers) {
  if (!headers)
    return {}

  var result = {}

  forEach(
      trim(headers).split('\n')
    , function (row) {
        var index = row.indexOf(':')
          , key = trim(row.slice(0, index)).toLowerCase()
          , value = trim(row.slice(index + 1))

        if (typeof(result[key]) === 'undefined') {
          result[key] = value
        } else if (isArray(result[key])) {
          result[key].push(value)
        } else {
          result[key] = [ result[key], value ]
        }
      }
  )

  return result
}
},{"for-each":9,"trim":10}],12:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}],13:[function(require,module,exports){
module.exports={
  "name": "shapeshift.io",
  "version": "1.1.0",
  "description": "A component for shapeshift.io crypto currency API.",
  "main": "lib/shapeshift.js",
  "scripts": {
    "build-browser": "browserify ./ -s shapeshift -o dist/shapeshift.js",
    "standard": "standard",
    "test": "standard && ava test/*.test.js"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/jprichardson/shapeshift.io"
  },
  "keywords": [
    "crypto",
    "crypto",
    "currency",
    "currency",
    "shapeshift",
    "bitcoin",
    "litecoin",
    "dogecoin",
    "dash",
    "monero",
    "counterparty",
    "blackcoin"
  ],
  "author": "JP Richardson",
  "license": "MIT",
  "bugs": {
    "url": "https://github.com/jprichardson/shapeshift.io/issues"
  },
  "homepage": "https://github.com/jprichardson/shapeshift.io",
  "devDependencies": {
    "ava": "^0.8.0",
    "browserify": "^9.0.8",
    "cb-insight": "^0.1.0",
    "coininfo": "^0.4.0",
    "coinkey": "^1.4.0",
    "decimal.js": "^4.0.2",
    "ms": "^0.7.1",
    "nock": "^1.6.0",
    "proxyquire": "^1.4.0",
    "secure-random": "^1.1.1",
    "spend": "0.0.1",
    "standard": "^5.3.1"
  },
  "dependencies": {
    "request": "^2.55.0",
    "xhr": "^2.0.1"
  },
  "standard": {
    "ignore": [
      "dist/shapeshift.js"
    ]
  }
}

},{}],14:[function(require,module,exports){
var http = require('./http')
var util = require('./util')

/* eslint-disable no-unused-vars */
// this is so the version gets embedded in the browser version
var pkg = require('../package')
/* eslint-enable no-unused-vars */

function coins (callback) {
  var url = getBaseUrl() + '/getcoins'
  http.get(url, function (err, data) {
    if (err) return callback(err)
    callback(null, data)
  })
}

function depositLimit (pair, callback) {
  if (pair.indexOf('_') === -1) return callback(new Error('Invalid currency pair string.'))
  pair = pair.toLowerCase()
  var url = getBaseUrl() + '/limit/' + pair
  http.get(url, function (err, data) {
    if (err) return callback(err)
    callback(null, data.limit)
  })
}

function emailReceipt (emailAddress, txId, callback) {
  var url = getBaseUrl() + '/mail'
  http.post(url, { email: emailAddress, txid: txId }, function (err, data) {
    if (err) return callback(err)
    if (data.error) return callback(new Error(data.error), data)
    callback(null, data.email)
  })
}

function exchangeRate (pair, callback) {
  if (pair.indexOf('_') === -1) return callback(new Error('Invalid currency pair string.'))
  pair = pair.toLowerCase()
  var url = getBaseUrl() + '/rate/' + pair
  http.get(url, function (err, data) {
    if (err) return callback(err)
    callback(null, data.rate)
  })
}

function marketInfo (pair, callback) {
  // no pair passed
  if (typeof pair === 'function') {
    callback = pair
    pair = ''
  }

  var url = getBaseUrl() + '/marketinfo/' + pair
  http.get(url, function (err, info) {
    if (err) return callback(err)
    callback(null, info)
  })
}

function recent (callback) {
  var url = getBaseUrl() + '/recenttx/50'
  http.get(url, function (err, data) {
    if (err) return callback(err)
    callback(null, data)
  })
}

function shift (withdrawalAddress, pair, options, callback) {
  if (options.amount) {
    _shiftFixed(withdrawalAddress, pair, options.amount, options, callback)
  } else {
    _shift(withdrawalAddress, pair, options, callback)
  }
}

function _shift (withdrawalAddress, pair, options, callback) {
  var url = getBaseUrl() + '/shift'
  var payload = util.clone(options)
  payload.withdrawal = withdrawalAddress
  payload.pair = pair
  http.post(url, payload, function (err, data) {
    if (err) return callback(err, data)
    if (data.error) return callback(new Error(data.error), data)
    callback(null, data)
  })
}

function _shiftFixed (withdrawalAddress, pair, amount, options, callback) {
  var url = getBaseUrl() + '/sendamount'
  var payload = util.clone(options)
  payload.withdrawal = withdrawalAddress
  payload.pair = pair
  payload.amount = amount
  http.post(url, payload, function (err, data) {
    if (err) return callback(err, data)
    if (data.error) return callback(new Error(data.error), data)
    // shapeshift is inconsistent here, notice in `shift()` there is no success field
    callback(null, data.success)
  })
}

function status (depositAddress, callback) {
  var url = getBaseUrl() + '/txStat/' + depositAddress
  http.get(url, function (err, data) {
    if (err) return callback(err)
    if (data.error) return callback(new Error(data.error), data.status, data)
    callback(null, data.status, data)
  })
}

function transactions (apiKey, address, callback) {
  if (typeof address === 'function') {
    callback = address
    address = null
  }

  var url
  if (!address) url = getBaseUrl() + '/txbyapikey/' + apiKey
  else url = getBaseUrl() + '/txbyaddress/' + address + '/' + apiKey

  http.get(url, function (err, data) {
    if (err) return callback(err, data)
    if (!Array.isArray(data)) return callback(new Error('Data is not of type array. Possible error?'), data)
    callback(null, data)
  })
}

function getBaseUrl () {
  var endpoint = 'shapeshift.io'
  // https://shapeshift.io/api.html#cors
  return module.exports.cors ? 'https://cors.' + endpoint : 'https://' + endpoint
}

module.exports = {
  // for cors endpoint
  cors: true,

  // for intercepting http
  http: http,

  // shapeshift api methods
  coins: coins,
  depositLimit: depositLimit,
  emailReceipt: emailReceipt,
  exchangeRate: exchangeRate,
  marketInfo: marketInfo,
  recent: recent,
  shift: shift,
  _shift: _shift,
  _shiftFixed: _shiftFixed,
  status: status,
  transactions: transactions,
  __version: pkg.version
}

},{"../package":13,"./http":2,"./util":3}]},{},[14])(14)
});