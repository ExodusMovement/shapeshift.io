if (!process.browser) {
  module.exports = require('./http' + '-node')
} else {
  module.exports = require('./http-browser')
}
