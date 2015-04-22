// poor man's clone
function clone (o) {
  return JSON.parse(JSON.stringify(o))
}

module.exports = {
  clone: clone
}
