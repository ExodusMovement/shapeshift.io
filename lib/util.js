// poor man's clone
exports.clone = function clone (o) {
  return JSON.parse(JSON.stringify(o))
}
